declare module "../build/server/index.js" {
  import type { ServerBuild } from "react-router";
  const build: ServerBuild;
  export default build;
}

declare module "../build/server/index" {
  import type { ServerBuild } from "react-router";
  const build: ServerBuild;
  export default build;
}
