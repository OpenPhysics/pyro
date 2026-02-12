import type { IframeMessage } from "./types";

const GS_VERSION = "3.2";

let currentIframe: HTMLIFrameElement | null = null;
let isRunning = false;

export function getIsRunning(): boolean {
  return isRunning;
}

/** Remove the current iframe and reset execution state. */
export function stopExecution(): void {
  if (currentIframe) {
    currentIframe.remove();
    currentIframe = null;
  }
  isRunning = false;
}

/** Build iframe srcdoc HTML for the given VPython source. */
function buildIframeContent(glowCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            overflow: hidden;
        }
        #glowscript {
            width: 100%;
            height: 100%;
        }
        canvas {
            display: block !important;
        }
        .error-output {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(40, 0, 0, 0.95);
            color: #ff6b6b;
            font-family: 'Consolas', monospace;
            font-size: 13px;
            padding: 12px;
            border-top: 2px solid #ff6b6b;
            max-height: 40%;
            overflow: auto;
            z-index: 1000;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js"></script>
    <script src="https://glowscript.org/package/glow.${GS_VERSION}.min.js"></script>
    <script src="https://glowscript.org/package/RSrun.${GS_VERSION}.min.js"></script>
</head>
<body>
    <div id="glowscript"></div>
    <script type="text/javascript">
        window.onerror = function(msg, url, line) {
            showError(msg + (line ? ' at line ' + line : ''));
            parent.postMessage({ type: 'glowscript-error', message: msg }, '*');
            return true;
        };

        function showError(msg) {
            var existing = document.querySelector('.error-output');
            if (existing) existing.remove();
            var errorDiv = document.createElement('div');
            errorDiv.className = 'error-output';
            errorDiv.textContent = 'Error: ' + msg;
            document.body.appendChild(errorDiv);
        }

        (function() {
            var origLog = console.log;
            console.log = function() {
                origLog.apply(console, arguments);
                var message = Array.prototype.slice.call(arguments).map(function(a) {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                }).join(' ');
                parent.postMessage({ type: 'console-log', message: message }, '*');
            };
        })();

        async function loadAndRun() {
            try {
                console.log('Loading GlowScript compiler...');
                await new Promise(function(resolve, reject) {
                    var script = document.createElement('script');
                    script.src = 'https://glowscript.org/package/RScompiler.${GS_VERSION}.min.js';
                    script.onload = function() {
                        console.log('Compiler loaded');
                        resolve();
                    };
                    script.onerror = function() {
                        reject(new Error('Failed to load compiler'));
                    };
                    document.head.appendChild(script);
                });

                var maxWait = 50;
                while (typeof window.glowscript_compile !== 'function' && maxWait-- > 0) {
                    await new Promise(function(r) { setTimeout(r, 100); });
                }

                if (typeof window.glowscript_compile !== 'function') {
                    throw new Error('GlowScript compiler not available');
                }

                var code = ${JSON.stringify(glowCode)};
                var container = document.getElementById('glowscript');

                var program = window.glowscript_compile(code, {
                    lang: 'vpython',
                    version: '${GS_VERSION}'
                });

                console.log('Executing program...');

                window.__context = {
                    glowscript_container: $(container).removeAttr('id')
                };

                eval(program);

                if (typeof __main__ === 'function') {
                    await __main__();
                }

                parent.postMessage({ type: 'glowscript-ready' }, '*');
            } catch (e) {
                showError(e.message || String(e));
                parent.postMessage({ type: 'glowscript-error', message: e.message || String(e) }, '*');
            }
        }

        $(document).ready(loadAndRun);
    </script>
</body>
</html>`;
}

/** Execute VPython code inside a sandboxed iframe. */
export async function executeInIframe(
  code: string,
  outputDiv: HTMLElement,
  callbacks: {
    onError: (message: string) => void;
    onConsoleLog: (message: string) => void;
    onReady: () => void;
  },
): Promise<void> {
  outputDiv.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "width:100%;height:100%;border:none;background:#1a1a1a;";
  currentIframe = iframe;
  outputDiv.appendChild(iframe);

  let glowCode = code.trim();
  glowCode = glowCode.replace(/^(GlowScript|Web VPython).*\n?/i, "");
  glowCode = `GlowScript ${GS_VERSION} VPython\n` + glowCode;

  iframe.srcdoc = buildIframeContent(glowCode);

  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
    }, 20000);

    const messageHandler = (event: MessageEvent<IframeMessage>) => {
      if (!currentIframe || event.source !== currentIframe.contentWindow) return;

      if (event.data) {
        if (event.data.type === "glowscript-error") {
          callbacks.onError(event.data.message ?? "Unknown error");
          isRunning = false;
          callbacks.onReady();
        } else if (event.data.type === "glowscript-ready") {
          clearTimeout(timeout);
          callbacks.onReady();
          resolve();
        } else if (event.data.type === "console-log") {
          callbacks.onConsoleLog(event.data.message ?? "");
        }
      }
    };

    window.addEventListener("message", messageHandler);
  });
}

/** Run the current code, managing execution state. */
export async function runCode(
  getCode: () => string,
  outputDiv: HTMLElement,
  callbacks: {
    onError: (message: string) => void;
    onConsoleLog: (message: string) => void;
    hideError: () => void;
    clearConsole: () => void;
    onRunStateChange: (running: boolean) => void;
  },
): Promise<void> {
  if (isRunning) return;

  const code = getCode();

  callbacks.hideError();
  callbacks.clearConsole();
  stopExecution();

  outputDiv.innerHTML = '<div class="loading">Initializing GlowScript...</div>';

  isRunning = true;
  callbacks.onRunStateChange(true);

  try {
    await executeInIframe(code, outputDiv, {
      onError: callbacks.onError,
      onConsoleLog: callbacks.onConsoleLog,
      onReady: () => {
        callbacks.onRunStateChange(false);
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    callbacks.onError(`Error: ${msg}`);
  }
}
