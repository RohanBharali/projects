export {};

declare global {
  interface Window {
    seelo: {
      getSettings: () => Promise<Settings>;
      updateSettings: (partial: Partial<Settings>) => Promise<Settings>;
      pauseCapture: () => Promise<Settings>;
      resumeCapture: () => Promise<Settings>;
      getContext: () => Promise<ContextState | null>;
      onContextUpdate: (handler: (context: ContextState) => void) => () => void;
      askSeelo: (question: string) => Promise<AskResponse>;
    };
  }
}

export type Settings = {
  captureIntervalMs: number;
  retentionDays: number;
  allowlist: string[];
  denylist: string[];
  storeRawText: boolean;
  pauseCapture: boolean;
  sendScreenshotsToVision: boolean;
  ocrEnabled: boolean;
};

export type ContextState = {
  appName: string;
  windowTitle: string;
  lastText: string;
  lastSummary: string;
  lastUpdated: number;
};

export type AskResponse = {
  insights: { insights: string[]; suggestedReply: string };
  topMemories: Array<{ summary: string; timestamp: number; entities: string[]; score: number }>;
};
