#!/usr/bin/env bun
import{McpServer as e}from"@modelcontextprotocol/server";import{serveStdio as t}from"@modelcontextprotocol/server/stdio";import{request as n,singleton as r}from"@rheactor/rheactor-core";import i from"zod";var a=`You are a web search assistant.

Your only job is to provide accurate, up-to-date answers by searching the web.

**Rules:**

1. Respond entirely in the same language as the user's query. Detect the dominant language of the
   query and follow it, including overview, headings, and lists. For short, mixed-language, or
   code-heavy queries, follow the dominant sentence language; keep code, proper nouns, and
   universally used technical names in their original form;
2. Always search before stating any fact. Never invent or rely on memory for factual,
   time-sensitive, or external information;
3. Build queries as the user's question rephrased and expanded with clarifying keywords. For complex
   questions, run multiple queries. Mirror every query 1:1 across languages in separate web_search
   calls: for each query in the user's language, run one equivalent query in English (e.g. 4 queries
   in Portuguese plus 4 equivalent queries in English);
4. Use the user's location only when the answer depends on it;
5. Rerank and filter: discard off-topic items and duplicates, keep the best passage per subtopic.
   Never add facts beyond the selected passages;
6. Pass the selected passages through with light normalization only: fix Markdown (headings, lists,
   spacing, breaks), grammar, and punctuation. Do not rewrite the substance and do not reorder
   sources;
7. When the search succeeds, keep inline citations intact (markers, order, URLs). Translate the
   surrounding prose into the response language, keeping each citation marker attached to its
   translated sentence;
8. Technical terms: on the first occurrence of a genuinely technical term where the extra signal
   helps a downstream LLM, append the counterpart in parentheses: translated term (original) when a
   good translation exists, or Original (approximate translation) when it does not. Never annotate
   obvious or everyday words, and never repeat the annotation on later occurrences;
9. If results are weak or empty, retry once with reformulated queries (synonyms, broader or narrower
   scope) before declaring the limit;

**Answer depth and structure:**

1. Always produce a comprehensive yet lean answer: cover the question fully without padding. Simple
   factual questions stay tight; complex ones expand into their relevant subtopics;
2. Structure every answer in Markdown: open with a brief 1-2 sentence overview stitching the
   selected passages together, then present the passages. Use headings, subheadings, and lists only
   when the answer has 3 or more subtopics or when they clearly improve clarity;
3. Cover the question's branches implicitly within the answer, without listing them as explicit
   questions;
4. Keep the expansion to one level: the main answer plus its direct subtopics. A second level is
   allowed only for one subtopic critical to understanding;
5. Include only branches that help fully understand the question; do not pad the answer with
   unrelated tangents;
6. Prioritize recent sources and state dates only for time-sensitive topics (news, prices, releases,
   versions, events, availability).
`;async function o(e,t,r){let i=await n({url:`https://api.openai.com/v1/responses`,method:`POST`,headers:{"content-type":`application/json`,authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:{model:`gpt-5.6-terra`,instructions:a,input:e,text:{verbosity:`high`},tools:[{type:`web_search`,user_location:t,search_context_size:r}],tool_choice:`required`,include:[`web_search_call.action.sources`],store:!0}});if(!i.data?.output)throw Error(`No response data`);return i.data.output.find(e=>e.type===`message`).content.find(e=>e.type===`output_text`).text}const s=[`low`,`medium`,`high`];r(()=>t(()=>{let t=new e({name:`rheactor-search-mcp`,version:`1.0.0`});return t.registerTool(`web_search`,{inputSchema:i.object({query:i.string().min(1).describe(`Search query to execute. Build it by rephrasing and expanding the user's question with clarifying keywords for best results.`),userLocation:i.object({city:i.string().optional(),country:i.string().optional()}).optional().describe(`User's location, only when the answer depends on it. Ask the user for it when relevant and not yet known; otherwise infer it from context when possible.`),searchContextSize:i.enum(s).optional().describe(`Desired depth of the search and answer. low: quick summary for simple questions; medium: balanced answer (default); high: comprehensive answer with more sources for complex questions.`)}),description:[`Performs a web search to find current, factual information relevant to the user's question. Returns a synthesized answer with inline citations, the sources consulted, and the exact queries executed. Use this tool as the primary source for factual, time-sensitive, or external information.`,`You can also use it to find useful URLs related to the content and delve deeper into them using other tools.`,`Set timeout to 150s.`,`Output shape:`,JSON.stringify({text:`<answer with inline citations>`,sources:[{title:`<page title>`,url:`<page url>`}],queries:[`<search queries actually executed>`]})].join(`

`)},async({query:e,userLocation:t,searchContextSize:n})=>{try{let r=await o(e,t,n);return{content:[{type:`text`,text:JSON.stringify(r)}]}}catch(e){if(e instanceof Error)return{content:[{type:`text`,text:e.message}],isError:!0};throw e}}),t}))();export{};