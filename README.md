# Seelo AI MVP

Seelo AI is an ambient AI desktop assistant for Sales/CS teams. It captures on-screen context, runs local OCR, summarizes and embeds redacted text with OpenAI, and stores a rolling 90-day memory in SQLite for retrieval.

## Features (Phase 1)
- Screen capture ➜ OCR ➜ summarize ➜ embed ➜ store locally.
- Local SQLite memory with embeddings + cosine similarity search.
- Current Context panel and “Ask Seelo AI…” retrieval flow.
- Settings: capture interval, retention, allowlist/denylist, store raw text, pause capture, OCR enable, vision stub toggle.
- Privacy-first: no screenshots stored, redaction before OpenAI.

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configure OpenAI
```bash
export OPENAI_API_KEY=your_key_here
```

### 3) Run in development
```bash
npm run dev
```

This runs the Vite dev server, compiles Electron main/preload in watch mode, and launches Electron once `dist/electron/main.js` is available.

### 4) Build for production
```bash
npm run build
npm start
```

## Notes
- OCR uses `tesseract.js` locally. Disable OCR in settings if performance is an issue.
- OpenAI model names are defined in `electron/config.ts` for easy customization.
- Phase 2 Call Assist views are placeholders for now.
