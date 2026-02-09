import { desktopCapturer, screen } from "electron";
import activeWin from "active-win";
import { summarizeText, embedText } from "./openai";
import { insertMemoryItem, purgeOldMemoryItems } from "./db";
import { redactSensitive } from "./redact";
import { appConfig } from "./config";
import { Settings } from "./settings";

export type CaptureContext = {
  appName: string;
  windowTitle: string;
  lastText: string;
  lastSummary: string;
  lastUpdated: number;
};

const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

const hashImage = (image: Electron.NativeImage) => {
  const resized = image.resize({ width: 16, height: 16 });
  const bitmap = resized.toBitmap();
  let total = 0;
  const values: number[] = [];
  for (let i = 0; i < bitmap.length; i += 4) {
    const r = bitmap[i];
    const g = bitmap[i + 1];
    const b = bitmap[i + 2];
    const gray = Math.round((r + g + b) / 3);
    values.push(gray);
    total += gray;
  }
  const avg = total / values.length;
  return values.map((v) => (v >= avg ? 1 : 0)).join("");
};

const hammingDistance = (a: string, b: string) => {
  let dist = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) dist += 1;
  }
  return dist;
};

const shouldProcess = (lastHash: string | null, nextHash: string) => {
  if (!lastHash) return true;
  return hammingDistance(lastHash, nextHash) > 5;
};

let workerPromise: Promise<import("tesseract.js").Worker> | null = null;

const getWorker = async () => {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      return worker;
    })();
  }
  return workerPromise;
};

export class CaptureService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastHash: string | null = null;
  private context: CaptureContext = {
    appName: "",
    windowTitle: "",
    lastText: "",
    lastSummary: "",
    lastUpdated: 0
  };

  constructor(private onUpdate: (context: CaptureContext) => void) {}

  getContext() {
    return this.context;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  start(settings: Settings) {
    this.stop();
    if (settings.pauseCapture) return;
    this.intervalId = setInterval(() => {
      void this.captureOnce(settings);
    }, settings.captureIntervalMs);
  }

  async captureOnce(settings: Settings) {
    if (settings.pauseCapture) return;
    try {
      const active = await activeWin();
      const appName = active?.owner?.name ?? "Unknown";
      const windowTitle = active?.title ?? "Unknown";

      if (settings.allowlist.length && !settings.allowlist.includes(appName)) {
        return;
      }
      if (settings.denylist.includes(appName)) {
        return;
      }

      const primary = screen.getPrimaryDisplay();
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: primary.size.width, height: primary.size.height }
      });

      const source = sources[0];
      if (!source) return;
      const image = source.thumbnail;
      const nextHash = hashImage(image);
      if (!shouldProcess(this.lastHash, nextHash)) {
        return;
      }
      this.lastHash = nextHash;

      let rawText = "";
      let redactedText = "";
      let summary = "";
      let tags: string[] = [];
      let entities: string[] = [];
      let embedding: number[] = [];
      let status = "ok";

      try {
        if (!settings.ocrEnabled) {
          rawText = "(OCR disabled)";
        } else {
          const worker = await getWorker();
          const { data } = await worker.recognize(image.toDataURL());
          rawText = data.text ?? "";
        }
      } catch (error) {
        status = "ocr_failed";
        rawText = "(OCR failed)";
      }

      const cleaned = cleanText(rawText);
      redactedText = redactSensitive(cleaned);

      try {
        const summaryResult = await summarizeText(redactedText, { appName, windowTitle });
        summary = summaryResult.summary;
        tags = summaryResult.tags;
        entities = summaryResult.entities;
      } catch (error) {
        status = status === "ok" ? "openai_failed" : status;
        summary = "(Summary unavailable)";
      }

      try {
        const embedSource = summary.length > 5 ? summary : redactedText;
        embedding = await embedText(embedSource);
      } catch (error) {
        status = status === "ok" ? "openai_failed" : status;
        embedding = [];
      }

      const timestamp = Date.now();
      insertMemoryItem({
        timestamp,
        appName,
        windowTitle,
        textRedacted: redactedText,
        summary,
        tagsJson: JSON.stringify(tags),
        entitiesJson: JSON.stringify(entities),
        embeddingJson: JSON.stringify(embedding),
        status,
        rawText: settings.storeRawText ? cleaned : null
      });

      const retentionMs = settings.retentionDays * 24 * 60 * 60 * 1000;
      purgeOldMemoryItems(Date.now() - retentionMs);

      this.context = {
        appName,
        windowTitle,
        lastText: redactedText.slice(0, 240),
        lastSummary: summary,
        lastUpdated: timestamp
      };
      this.onUpdate(this.context);
    } catch (error) {
      // swallow to keep capture loop alive
    }
  }
}
