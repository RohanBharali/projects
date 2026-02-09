import React, { useEffect, useState } from "react";
import { Settings } from "../types";

const defaultSettings: Settings = {
  captureIntervalMs: 3000,
  retentionDays: 90,
  allowlist: [],
  denylist: [],
  storeRawText: false,
  pauseCapture: false,
  sendScreenshotsToVision: false,
  ocrEnabled: true
};

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [allowlistText, setAllowlistText] = useState("");
  const [denylistText, setDenylistText] = useState("");

  useEffect(() => {
    window.seelo.getSettings().then((data) => {
      setSettings(data);
      setAllowlistText(data.allowlist.join(", "));
      setDenylistText(data.denylist.join(", "));
    });
  }, []);

  const update = async (partial: Partial<Settings>) => {
    const next = await window.seelo.updateSettings(partial);
    setSettings(next);
  };

  const handleListChange = (value: string, type: "allowlist" | "denylist") => {
    const list = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (type === "allowlist") {
      setAllowlistText(value);
      void update({ allowlist: list });
    } else {
      setDenylistText(value);
      void update({ denylist: list });
    }
  };

  return (
    <section className="settings">
      <h3>Settings</h3>
      <div className="setting-row">
        <label>Capture interval (ms)</label>
        <input
          type="number"
          value={settings.captureIntervalMs}
          min={1000}
          step={500}
          onChange={(event) => update({ captureIntervalMs: Number(event.target.value) })}
        />
      </div>
      <div className="setting-row">
        <label>Retention days</label>
        <input
          type="number"
          value={settings.retentionDays}
          min={1}
          onChange={(event) => update({ retentionDays: Number(event.target.value) })}
        />
      </div>
      <div className="setting-row">
        <label>Allowlist apps</label>
        <input
          type="text"
          placeholder="e.g. Slack, Chrome"
          value={allowlistText}
          onChange={(event) => handleListChange(event.target.value, "allowlist")}
        />
      </div>
      <div className="setting-row">
        <label>Denylist apps</label>
        <input
          type="text"
          placeholder="e.g. 1Password"
          value={denylistText}
          onChange={(event) => handleListChange(event.target.value, "denylist")}
        />
      </div>
      <div className="setting-row toggle">
        <label>Store raw text</label>
        <input
          type="checkbox"
          checked={settings.storeRawText}
          onChange={(event) => update({ storeRawText: event.target.checked })}
        />
      </div>
      <div className="setting-row toggle">
        <label>OCR enabled</label>
        <input
          type="checkbox"
          checked={settings.ocrEnabled}
          onChange={(event) => update({ ocrEnabled: event.target.checked })}
        />
      </div>
      <div className="setting-row toggle">
        <label>Pause capture</label>
        <input
          type="checkbox"
          checked={settings.pauseCapture}
          onChange={(event) => update({ pauseCapture: event.target.checked })}
        />
      </div>
      <div className="setting-row toggle">
        <label>Send screenshots to vision model</label>
        <input
          type="checkbox"
          checked={settings.sendScreenshotsToVision}
          onChange={(event) => update({ sendScreenshotsToVision: event.target.checked })}
        />
      </div>
      <p className="settings-note">
        Screenshots are stored locally only for OCR. Vision model support is stubbed and off by default.
      </p>
    </section>
  );
};

export default SettingsPanel;
