import { app } from "electron";
import fs from "fs";
import path from "path";
import { appConfig } from "./config";

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

const settingsPath = () => path.join(app.getPath("userData"), "settings.json");

const defaultSettings: Settings = {
  captureIntervalMs: appConfig.defaultCaptureIntervalMs,
  retentionDays: appConfig.defaultRetentionDays,
  allowlist: [],
  denylist: [],
  storeRawText: false,
  pauseCapture: false,
  sendScreenshotsToVision: false,
  ocrEnabled: true
};

export const loadSettings = (): Settings => {
  try {
    const raw = fs.readFileSync(settingsPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
  }
};

export const saveSettings = (settings: Settings) => {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
};

export const updateSettings = (partial: Partial<Settings>) => {
  const current = loadSettings();
  const next = { ...current, ...partial };
  saveSettings(next);
  return next;
};
