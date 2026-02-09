import React, { useEffect, useState } from "react";
import { getContext, onContextUpdate } from "../lib/capture";

export type ContextState = {
  appName: string;
  windowTitle: string;
  lastText: string;
  lastSummary: string;
  lastUpdated: number;
};

const CurrentContext: React.FC = () => {
  const [context, setContext] = useState<ContextState | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    getContext().then((data) => {
      if (data) setContext(data);
    });
    unsubscribe = onContextUpdate((data) => {
      setContext(data);
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <section className="card">
      <h3>Current Context</h3>
      <div className="context-row">
        <span>App</span>
        <strong>{context?.appName || "—"}</strong>
      </div>
      <div className="context-row">
        <span>Window</span>
        <strong>{context?.windowTitle || "—"}</strong>
      </div>
      <div className="context-row">
        <span>Last OCR</span>
        <p>{context?.lastText || "Awaiting capture..."}</p>
      </div>
      <div className="context-row">
        <span>Summary</span>
        <p>{context?.lastSummary || "No summary yet."}</p>
      </div>
    </section>
  );
};

export default CurrentContext;
