import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { singleton } from "@rheactor/rheactor-core";
import z from "zod";

import { search } from "#/services/SearchService";
import { searchContextSize as searchContextSizeOptions } from "#/types/SearchContextSize";

export const getServer = singleton(() =>
  serveStdio(() => {
    const server = new McpServer({ name: "rheactor-search-mcp", version: "1.0.0" });

    server.registerTool(
      "web_search",
      {
        inputSchema: z.object({
          query: z
            .string()
            .min(1)
            .describe(
              "Search query to execute. Build it by rephrasing and expanding the user's question with clarifying keywords for best results.",
            ),
          userLocation: z
            .object({
              city: z.string().optional(),
              country: z.string().optional(),
            })
            .optional()
            .describe(
              "User's location, only when the answer depends on it. Ask the user for it when relevant and not yet known; otherwise infer it from context when possible.",
            ),
          searchContextSize: z
            .enum(searchContextSizeOptions)
            .optional()
            .describe(
              "Desired depth of the search and answer. low: quick summary for simple questions; medium: balanced answer (default); high: comprehensive answer with more sources for complex questions.",
            ),
        }),
        description: [
          "Performs a web search to find current, factual information relevant to the user's question. Returns a synthesized answer with inline citations, the sources consulted, and the exact queries executed. Use this tool as the primary source for factual, time-sensitive, or external information.",
          "You can also use it to find useful URLs related to the content and delve deeper into them using other tools.",
          "Set timeout to 150s.",
          "Output shape:",
          JSON.stringify({
            text: "<answer with inline citations>",
            sources: [{ title: "<page title>", url: "<page url>" }],
            queries: ["<search queries actually executed>"],
          }),
        ].join("\n\n"),
      },
      async ({ query, userLocation, searchContextSize }) => {
        try {
          const result = await search(query, userLocation, searchContextSize);

          return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
        } catch (error) {
          if (error instanceof Error) {
            return { content: [{ type: "text" as const, text: error.message }], isError: true };
          }

          throw error;
        }
      },
    );

    return server;
  }),
);
