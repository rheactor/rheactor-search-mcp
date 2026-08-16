export const searchContextSize = ["low", "medium", "high"] as const;

export type SearchContextSize = (typeof searchContextSize)[number];
