import { getRecentMemoryItems } from "./db";
import { appConfig } from "./config";

export type ScoredMemory = {
  id: number;
  timestamp: number;
  summary: string;
  entities: string[];
  score: number;
};

const cosineSimilarity = (a: number[], b: number[]) => {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const findTopMemories = (queryEmbedding: number[]) => {
  const since = Date.now() - appConfig.memoryLookbackDays * 24 * 60 * 60 * 1000;
  const rows = getRecentMemoryItems(since) as Array<Record<string, unknown>>;
  const now = Date.now();
  const scored: ScoredMemory[] = rows.map((row) => {
    const embedding = JSON.parse(String(row.embedding_json || "[]")) as number[];
    const summary = String(row.summary || "");
    const entities = JSON.parse(String(row.entities_json || "[]")) as string[];
    const timestamp = Number(row.timestamp || 0);
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    const ageMs = Math.max(now - timestamp, 1);
    const recencyBoost = 1 - Math.min(ageMs / (appConfig.memoryLookbackDays * 24 * 60 * 60 * 1000), 1);
    const score = similarity + recencyBoost * 0.15;
    return {
      id: Number(row.id),
      timestamp,
      summary,
      entities,
      score
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, appConfig.maxInsightMemories);
};
