// biome-ignore lint/correctness/noUnresolvedImports: ambient module for package without types
declare module "rainbowbrackets" {
  import type { Extension } from "@codemirror/state";
  export default function rainbowBrackets(): Extension;
}
