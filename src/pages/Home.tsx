import React from "react";
import CurrentContext from "../components/CurrentContext";
import AskSeelo from "../components/AskSeelo";

const Home: React.FC = () => {
  return (
    <div className="page">
      <div className="header-row">
        <div className="status-pill">AI Active</div>
        <div className="status-pill secondary">Screen Ready</div>
      </div>

      <div className="grid">
        <section className="card">
          <h3>Today&apos;s Schedule</h3>
          <div className="placeholder">
            <p>09:30 AM - Renewal check-in</p>
            <p>11:00 AM - Demo follow-up</p>
            <p>02:15 PM - Escalation review</p>
          </div>
        </section>
        <section className="card">
          <h3>Key Insights</h3>
          <div className="placeholder">
            <p>• Pipeline churn risk detected in Acme account.</p>
            <p>• Support ticket volume trending up.</p>
            <p>• Pending renewal pricing approval.</p>
          </div>
        </section>
        <section className="card">
          <h3>Recent Discoveries</h3>
          <div className="placeholder">
            <p>• CTO mentioned expansion timelines.</p>
            <p>• Marketing asked for onboarding deck.</p>
            <p>• SLA review scheduled for next week.</p>
          </div>
        </section>
        <CurrentContext />
      </div>
      <AskSeelo />
    </div>
  );
};

export default Home;
