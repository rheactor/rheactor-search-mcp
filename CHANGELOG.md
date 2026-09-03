# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-03

### Added

- MCP stdio server exposing the `web_search` tool backed by the OpenAI Responses API.
- Search instructions externalized into `public/PROMPT.md` with mirrored multilingual queries,
  source filtering, and citation preservation.
- `SearchContextSize` option (`low` | `medium` | `high`) controlling search and answer depth.
- Response persistence (`store: true`) and Markdown prompt bundling as text.

### Fixed

- Throw `No response data` instead of failing when the API returns a response without output
  content.
