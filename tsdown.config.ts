import { defineConfig } from "tsdown";

// oxlint-disable-next-line import/no-anonymous-default-export
export default defineConfig({
  minify: true,
  banner: "#!/usr/bin/env bun",
  entry: "./src/index.ts",
  loader: { ".md": "text" },
  deps: { neverBundle: true },
});
