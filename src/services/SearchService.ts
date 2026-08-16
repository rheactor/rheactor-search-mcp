import { request } from "@rheactor/rheactor-core";
import type {
  Response,
  ResponseCreateParams,
  WebSearchTool,
} from "openai/resources/responses/responses";

import type { SearchContextSize } from "#/types/SearchContextSize";

export async function search(
  query: string,
  userLocation?: WebSearchTool.UserLocation,
  searchContextSize?: SearchContextSize,
) {
  const response = await request<Response>({
    url: "https://api.openai.com/v1/responses",
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: {
      model: "gpt-5.6-luna",
      instructions: [
        "You are a web search assistant.",
        "Your only job is to provide accurate, up-to-date answers by searching the web.",
        "",
        "**Rules:**",
        "",
        "1. Always respond in English;",
        "2. Always search before stating any fact. Never invent or rely on memory for factual, time-sensitive, or external information;",
        "3. Build queries as the user's question rephrased and expanded with clarifying keywords. For complex questions, run multiple queries;",
        "4. Use the user's location only when the answer depends on it;",
        "5. When the search succeeds, pass the returned text through unchanged, keeping inline citations intact.",
        "   Pass sources through unchanged; do not filter, reorder, or reformat them.",
        "",
        "**Answer depth and structure:**",
        "",
        "1. Always produce a comprehensive answer, no matter how simple the question is. Never settle for a short, direct, or minimal reply;",
        "2. Structure every answer in Markdown: open with a brief overview, then branch the topic into its relevant subtopics, contexts, and nuances using headings, subheadings, and lists;",
        "3. Cover the question's branches implicitly within the answer, without listing them as explicit questions;",
        "4. The main body must be detailed, roughly 3 to 10+ paragraphs. Each subtopic stays more direct, roughly 1 to 3 paragraphs;",
        "5. Keep the expansion to one level: the main answer plus its direct subtopics, without cascading into deeper nesting;",
        "6. Include only branches that help fully understand the question; do not pad the answer with unrelated tangents.",
      ].join("\n"),
      input: query,
      text: { verbosity: "high" },
      tools: [
        {
          type: "web_search",
          user_location: userLocation,
          search_context_size: searchContextSize,
        },
      ],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
    } satisfies ResponseCreateParams,
  });

  if (!response.data) {
    throw new Error("No response data");
  }

  return response.data.output
    .find((item) => item.type === "message")!
    .content.find((item) => item.type === "output_text")!.text;
}
