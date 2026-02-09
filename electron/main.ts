import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { CaptureService } from "./capture";
import { loadSettings, updateSettings } from "./settings";
import { embedText, generateInsight } from "./openai";
import { findTopMemories } from "./memory";

let mainWindow: BrowserWindow | null = null;
let captureService: CaptureService | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#0b0e14",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};

app.whenReady().then(() => {
  createWindow();

  captureService = new CaptureService((context) => {
    mainWindow?.webContents.send("context:update", context);
  });

  const settings = loadSettings();
  captureService.start(settings);

  ipcMain.handle("settings:get", () => loadSettings());
  ipcMain.handle("settings:update", (_event, partial) => {
    const next = updateSettings(partial);
    captureService?.start(next);
    return next;
  });

  ipcMain.handle("capture:pause", () => {
    const next = updateSettings({ pauseCapture: true });
    captureService?.start(next);
    return next;
  });

  ipcMain.handle("capture:resume", () => {
    const next = updateSettings({ pauseCapture: false });
    captureService?.start(next);
    return next;
  });

  ipcMain.handle("context:get", () => captureService?.getContext());

  ipcMain.handle("memory:ask", async (_event, payload) => {
    const context = captureService?.getContext();
    const question = String(payload?.question || "");
    const currentSummary = context?.lastSummary || "";
    const queryText = `Current context: ${currentSummary}\nQuestion: ${question}`;

    const queryEmbedding = await embedText(queryText);
    const topMemories = findTopMemories(queryEmbedding);
    const insights = await generateInsight(queryText, topMemories.map((mem) => ({
      summary: mem.summary,
      timestamp: mem.timestamp,
      entities: mem.entities
    })));

    return { insights, topMemories };
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
