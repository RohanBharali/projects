import React, { useState } from "react";
import { askSeelo } from "../lib/memory";

const AskSeelo: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [reply, setReply] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await askSeelo(question);
      setInsights(response.insights.insights);
      setReply(response.insights.suggestedReply);
    } catch (error) {
      setInsights(["Seelo AI could not fetch insights right now."]);
      setReply("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h3>Ask Seelo AI…</h3>
      <div className="ask-row">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about the current customer context"
        />
        <button onClick={handleAsk} disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>
      <div className="insight-block">
        <h4>Key Insights</h4>
        {insights.length === 0 ? (
          <p>No insights yet.</p>
        ) : (
          <ul>
            {insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <h4>Suggested Reply</h4>
        <p>{reply || "—"}</p>
      </div>
    </section>
  );
};

export default AskSeelo;
