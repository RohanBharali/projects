import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./Home";
import CallAssist from "./CallAssist";
import Dashboard from "./Dashboard";
import SettingsPanel from "../components/SettingsPanel";

const App: React.FC = () => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">Seelo AI</div>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/call-assist">Call Assist</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/call-assist" element={<CallAssist />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <aside className="right-panel">
        <SettingsPanel />
      </aside>
    </div>
  );
};

export default App;
