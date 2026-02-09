import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("seelo", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (partial: Record<string, unknown>) => ipcRenderer.invoke("settings:update", partial),
  pauseCapture: () => ipcRenderer.invoke("capture:pause"),
  resumeCapture: () => ipcRenderer.invoke("capture:resume"),
  getContext: () => ipcRenderer.invoke("context:get"),
  onContextUpdate: (handler: (context: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, context: unknown) => handler(context);
    ipcRenderer.on("context:update", listener);
    return () => ipcRenderer.removeListener("context:update", listener);
  },
  askSeelo: (question: string) => ipcRenderer.invoke("memory:ask", { question })
});
