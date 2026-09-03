import { request } from "@rheactor/rheactor-core";
import type {
  Response,
  ResponseCreateParams,
  WebSearchTool,
} from "openai/resources/responses/responses";

import type { SearchContextSize } from "#/types/SearchContextSize";
import PROMPT from "#public/PROMPT.md";

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
      model: "gpt-5.6-terra",
      instructions: PROMPT,
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
      store: true,
    } satisfies ResponseCreateParams,
  });

  if (!response.data?.output) {
    throw new Error("No response data");
  }

  return response.data.output
    .find((item) => item.type === "message")!
    .content.find((item) => item.type === "output_text")!.text;
}
