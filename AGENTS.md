# AGENTS.md - @rheactor/rheactor-search-mcp

## 1. Project overview

- **Stack:** Bun runtime (`bun.lock`), TypeScript in strict mode (`ESNext` target, `Bundler` module
  resolution), `tsdown` for builds, `oxlint` + `oxfmt` (via `@rheactor/rheactor-oxc-config`) for
  lint and format, `tsc --noEmit` for typechecking.
- **Runtime dependencies:** `@modelcontextprotocol/server` (MCP stdio server),
  `@rheactor/rheactor-core` (`singleton`, `request`), `zod` (tool input schemas). `openai` is a
  dev-only types import for the Responses API shapes.
- **Purpose:** stdio MCP server exposing a single `web_search` tool backed by the OpenAI Responses
  API (`gpt-5.6-terra` model with a required `web_search` tool).
- **Entry points:** `src/index.ts` calls `getServer()` from `src/server.ts`, which is a
  `singleton()` wrapping `serveStdio()`.
- **Folder structure:**
  - `src/index.ts`: process entry, starts the server.
  - `src/server.ts`: MCP server definition and `web_search` tool registration.
  - `src/services/SearchService.ts`: `search()` function, POSTs to
    `https://api.openai.com/v1/responses`.
  - `src/types/SearchContextSize.ts`: `searchContextSize` const tuple plus derived union type.
  - `public/PROMPT.md`: search system instructions, bundled as text via the tsdown `.md` loader.
  - `dist/`: build output. `bin` entry `rheactor-search-mcp` points to `./dist/index.mjs`.
  - `.env.d.ts`: `process.env` typings. `.markdown.d.ts`: `*.md` module declaration.

## 2. Mandatory rules

- **Path aliases:** `#/*` maps to `./src/*` and `#public/*` maps to `./public/*` (declared in both
  `package.json` `imports` and `tsconfig.json` `paths`). Always import through `#/` and `#public/`
  (e.g. `#/services/SearchService`, `#/types/SearchContextSize`, `#public/PROMPT.md`). Never use
  relative paths that escape `src`.
- **File naming:** lowercase for wiring files (`index.ts`, `server.ts`); `PascalCase` for service
  and type modules (`SearchService.ts`, `SearchContextSize.ts`).
- **Identifier naming:** `camelCase` for functions and const tuples (`search`, `getServer`,
  `searchContextSize`); `PascalCase` for types (`SearchContextSize`).
- **Types layout:** shared enums live in `src/types/` as a `const` tuple plus a derived union
  (`export type SearchContextSize = (typeof searchContextSize)[number]`). Follow this exact pattern
  for new option sets.
- **Services layout:** external I/O lives in `src/services/` as exported async functions. The OpenAI
  call uses `request<Response>` from `@rheactor/rheactor-core` with a body typed via
  `satisfies ResponseCreateParams`.
- **Tool boundary:** every tool input is a `zod` object schema with `.describe()` on each field; the
  handler returns `{ content: [{ type: "text" as const, text }] }`, maps `Error` instances to
  `{ ..., isError: true }`, and rethrows anything else.
- **Server construction:** the server is built with `singleton(() => serveStdio(...))` from
  `@rheactor/rheactor-core`. `McpServer` name is `"rheactor-search-mcp"` and its `version` mirrors
  the `package.json` `version` by hand. Keep both in sync on release.
- **Response guard:** after the API call,
  `if (!response.data?.output) throw new Error("No response data")`. Keep this guard before
  extracting message output.
- **Static assets:** Markdown prompts live in `public/` and are imported as text
  (`import PROMPT from "#public/PROMPT.md"`), enabled by the tsdown `loader: { ".md": "text" }` and
  the `.markdown.d.ts` declaration. New text assets follow the same route.
- **Secrets:** read keys only via `process.env` (typed in `.env.d.ts`, exemplified in
  `.env.example`). Never hardcode credentials.
- **Documentation ownership:** `AGENTS.md`, `README.md`, and `CHANGELOG.md` are maintained by the
  `/create-agents` skill. Do not restructure them by hand; the skill audits them against the code on
  every run.

## 3. Testing policy

- **Framework:** none detected. There is no `test` script in `package.json` and no `*.test.ts` or
  `*.spec.ts` files in the repo.
- **Location and naming:** not established. If `vitest` is adopted, document the chosen layout here.
- **Minimum coverage:** no threshold is enforceable today.
- **Regression rule:** every fixed bug must gain a regression test once a test runner exists.

## 4. Documentation format

This repo is an application, so `README.md` follows the self-hosted application template, in this
order:

1. `H1` with the `package.json` `name` verbatim, followed by the `description` verbatim as tagline.
2. `## Installation`: the real install command for this repo.
3. `## Quick start`: a minimal copyable setup and run sequence.
4. `## Stack`: frameworks and versions read from `package.json` and configs.
5. `## Folder structure`: condensed tree with one purpose line per entry.
6. `## Tools`: one `### <tool-name>` block per registered MCP tool, each with its input schema table
   and output shape.
7. `## Environment variables`: table with columns `Name`, `Required`, `Example`. Never real values.
8. `## Scripts & commands`: table of every `package.json` script with its exact command.

`CHANGELOG.md` follows Keep a Changelog: one `## [x.y.z] - yyyy-mm-dd` heading per version, only the
non-empty categories among `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, no
compare-link footer.

## 5. Extras

- **Dependencies policy:** `bun` with `bun.lock` is the canonical manager. Zero new dependencies
  without justification. `openai` stays a types-only dev dependency because `tsdown.config.ts` sets
  `deps: { neverBundle: true }`, so all runtime deps are external.
- **Environment variables:** `OPENAI_API_KEY` is the only variable, documented in `.env.example` and
  typed as optional in `.env.d.ts`. Add new variables to both files plus the README table.
- **Build and publication:** the package is `private: true` and is never published to a registry.
  `files` ships only `dist`. `tsdown` emits minified `dist/index.mjs` with a `#!/usr/bin/env bun`
  banner so the `rheactor-search-mcp` bin runs directly. `build` always runs the full `lint` gate
  before bundling.

## 6. Quality gates

- Run gates only through `bun run <script>`, never by calling the underlying binary directly.
- Reference pattern confirmed in this repo: `build` via `tsdown`, `lint` =
  `bun run typecheck && bun run oxlint && bun run oxfmt`, `typecheck` via `tsc --noEmit`. There is
  no `test` script (no `vitest --run` yet).
- Scripts as declared in `package.json`:

| Script       | Command                                                           |
| ------------ | ----------------------------------------------------------------- |
| `build`      | `bun run lint && tsdown`                                          |
| `dev`        | `tsdown && bunx @modelcontextprotocol/inspector bun src/index.ts` |
| `lint`       | `bun run typecheck && bun run oxlint && bun run oxfmt`            |
| `lint:fix`   | `bun run typecheck && bun run oxlint:fix && bun run oxfmt:fix`    |
| `oxfmt`      | `oxfmt --check ./src`                                             |
| `oxfmt:fix`  | `oxfmt --write ./src`                                             |
| `oxlint`     | `oxlint ./src`                                                    |
| `oxlint:fix` | `oxlint --fix ./src`                                              |
| `typecheck`  | `tsc --noEmit`                                                    |
