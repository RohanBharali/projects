import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="grid">
        <section className="card">
          <h3>Action Items</h3>
          <ul className="placeholder-list">
            <li>Draft renewal plan for Contoso</li>
            <li>Send Q3 adoption report</li>
            <li>Follow up on onboarding metrics</li>
          </ul>
        </section>
        <section className="card">
          <h3>Communications Hub</h3>
          <p className="placeholder">Unified inbox placeholder.</p>
        </section>
        <section className="card">
          <h3>Integrations</h3>
          <ul className="placeholder-list">
            <li>Salesforce (not connected)</li>
            <li>Slack (not connected)</li>
            <li>Zendesk (not connected)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
