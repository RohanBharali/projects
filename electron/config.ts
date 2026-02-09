export const openAiConfig = {
  baseUrl: "https://api.openai.com/v1",
  models: {
    summarization: "gpt-4o-mini",
    embeddings: "text-embedding-3-small",
    insights: "gpt-4o-mini"
  }
};

export const appConfig = {
  defaultCaptureIntervalMs: 3000,
  defaultRetentionDays: 90,
  memoryLookbackDays: 90,
  maxInsightMemories: 8
};
