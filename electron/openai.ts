import { openAiConfig } from "./config";

const getApiKey = () => process.env.OPENAI_API_KEY;

const request = async (path: string, body: Record<string, unknown>) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const response = await fetch(`${openAiConfig.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const summarizeText = async (text: string, contextMeta: Record<string, string>) => {
  const system = "You summarize screen context for a sales/CS assistant. Return JSON only.";
  const prompt = {
    type: "object",
    properties: {
      summary: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      entities: { type: "array", items: { type: "string" } }
    },
    required: ["summary", "tags", "entities"]
  };

  const data = await request("/chat/completions", {
    model: openAiConfig.models.summarization,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Context metadata: ${JSON.stringify(contextMeta)}\nText: ${text}`
      }
    ],
    response_format: { type: "json_schema", json_schema: { name: "summary", schema: prompt } },
    temperature: 0.2
  });

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No summary content returned");
  }

  return JSON.parse(content) as { summary: string; tags: string[]; entities: string[] };
};

export const embedText = async (text: string) => {
  const data = await request("/embeddings", {
    model: openAiConfig.models.embeddings,
    input: text
  });

  const vector = data.data?.[0]?.embedding;
  if (!vector) {
    throw new Error("No embedding returned");
  }
  return vector as number[];
};

export const generateInsight = async (
  currentContext: string,
  topMemories: Array<{ summary: string; timestamp: number; entities: string[] }>
) => {
  const system = "You are Seelo AI. Provide key insights and a suggested reply. Return JSON only.";
  const prompt = {
    type: "object",
    properties: {
      insights: { type: "array", items: { type: "string" } },
      suggestedReply: { type: "string" }
    },
    required: ["insights", "suggestedReply"]
  };

  const data = await request("/chat/completions", {
    model: openAiConfig.models.insights,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Current context: ${currentContext}\nTop memories: ${JSON.stringify(topMemories)}`
      }
    ],
    response_format: { type: "json_schema", json_schema: { name: "insights", schema: prompt } },
    temperature: 0.3
  });

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No insight content returned");
  }

  return JSON.parse(content) as { insights: string[]; suggestedReply: string };
};
