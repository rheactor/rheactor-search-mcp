# @rheactor/rheactor-search-mcp

Rheactor Search MCP.

## Installation

```sh
bun install
```

Copy `.env.example` to `.env` and fill in the required key.

## Quick start

```sh
bun run build
bun ./dist/index.mjs
```

For interactive debugging with the MCP Inspector:

```sh
bun run dev
```

Minimal MCP client configuration:

```json
{
  "mcpServers": {
    "rheactor-search": {
      "command": "bun",
      "args": ["./dist/index.mjs"],
      "env": { "OPENAI_API_KEY": "<your-key>" }
    }
  }
}
```

## Stack

| Layer     | Technology                                                             |
| --------- | ---------------------------------------------------------------------- |
| Runtime   | Bun (`bun.lock`)                                                       |
| Language  | TypeScript, strict mode (`ESNext` target, `Bundler` module resolution) |
| MCP       | `@modelcontextprotocol/server`                                         |
| Core      | `@rheactor/rheactor-core` (`singleton`, `request`)                     |
| Schemas   | `zod`                                                                  |
| API types | `openai` (types only, for the Responses API shapes)                    |
| Build     | `tsdown`                                                               |
| Lint      | `oxlint` + `oxfmt` via `@rheactor/rheactor-oxc-config`                 |
| Types     | `tsc --noEmit`                                                         |

The `web_search` tool is backed by the OpenAI Responses API (`gpt-5.6-terra` model with a required
`web_search` tool).

## Folder structure

```text
src/
  index.ts                 # Process entry, starts the server
  server.ts                # MCP server definition and web_search registration
  services/SearchService.ts # search(), POSTs to https://api.openai.com/v1/responses
  types/SearchContextSize.ts # searchContextSize tuple plus union type
public/
  PROMPT.md                # Search system instructions, bundled as text
dist/
  index.mjs                # Build output, rheactor-search-mcp bin entry
```

## Tools

### web_search

Performs a web search to find current, factual information relevant to the user's question. Returns
a synthesized answer with inline citations, the sources consulted, and the exact queries executed.
Set timeout to 150s.

| Input               | Type                          | Required | Description                                              |
| ------------------- | ----------------------------- | -------- | -------------------------------------------------------- |
| `query`             | `string` (min 1)              | Yes      | Search query to execute                                  |
| `userLocation`      | `{ city?, country? }`         | No       | User's location, only when the answer needs it           |
| `searchContextSize` | `"low" \| "medium" \| "high"` | No       | Depth of the search and answer (default depth: `medium`) |

Output shape:

```json
{
  "text": "<answer with inline citations>",
  "sources": [{ "title": "<page title>", "url": "<page url>" }],
  "queries": ["<search queries actually executed>"]
}
```

On failure the tool returns the error message with `isError: true`.

## Environment variables

| Name             | Required | Example  |
| ---------------- | -------- | -------- |
| `OPENAI_API_KEY` | Yes      | `sk-...` |

## Scripts & commands

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
