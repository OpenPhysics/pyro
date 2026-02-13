/**
 * Application entry point.
 * This file only handles bootstrap - all initialization logic is in init.ts.
 */

import "katex/dist/katex.min.css";
import "./styles/main.css";
import { init } from "./init";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
