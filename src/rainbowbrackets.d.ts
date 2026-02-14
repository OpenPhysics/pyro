// biome-ignore lint/nursery/noUnresolvedImports: type declaration for package without built-in types
declare module "rainbowbrackets" {
  import type { Extension } from "@codemirror/state";
  export default function rainbowBrackets(): Extension;
}
