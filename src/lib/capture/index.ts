export type ContextState = {
  appName: string;
  windowTitle: string;
  lastText: string;
  lastSummary: string;
  lastUpdated: number;
};

export const getContext = () => window.seelo.getContext() as Promise<ContextState | null>;

export const onContextUpdate = (handler: (context: ContextState) => void) => {
  return window.seelo.onContextUpdate(handler);
};
