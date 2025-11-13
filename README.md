# Avds
AI-powered vehicle search platform with smart filtering, user tracking, and recommendation system based on 350K+ dataset.

## Ollama Chat Integration

This repo now includes a lightweight chat interface powered by a local Ollama instance.

### Prerequisites

- Install Ollama: https://ollama.com
- Pull at least one model:

```powershell
ollama pull llama3.1:8b
```

To use the cloud model you requested (`gpt-oss:20b-cloud`), sign in first so the local Ollama can authenticate cloud requests:

```powershell
ollama signin
```

Then select `gpt-oss:20b-cloud` from the model dropdown in the UI.

### Development

Start Vite dev server:

```powershell
npm run dev
```

Open the URL shown (e.g. http://localhost:5173) and use the chat box. Messages stream token-by-token.

### Production Build

```powershell
npm run build
```

### How It Works

 `src/scripts/index.ts` – wiring + behavior (no inline markup)
 `src/chat.html` – chat markup (FAB button + popup panel)
 `src/styles/chat.css` – chat-specific styles
 `src/style.css` – global styles and variables
 `src/assistantPrompt.txt` – system prompt used to generate the initial AI greeting dynamically.

1. Click the round chat button bottom-right.
2. The popup opens and streams the first AI greeting generated from `assistantPrompt.txt`.
3. Type a message and press Enter.
4. Press Esc or the × button to close.

### Model

Chat is fixed to cloud model `gpt-oss:20b-cloud`. Change via `MODEL` constant in `src/scripts/index.ts`.

### Customizing the initial greeting

- Edit the system instructions in `src/assistantPrompt.txt`.
- The file is imported as raw text and sent as a `system` role message for the first model call when the chat opens.
- If the AI call fails, a fallback error message appears in the popup.
### Cloud / Auth

Local calls require no auth. For cloud models:

- Recommended: run `ollama signin` once; the local Ollama will handle auth automatically for cloud endpoints.
- Alternative: set `OLLAMA_API_KEY` and call ollama.com APIs directly (not needed for this local UI setup).

### Notes

- Errors show inline in the assistant message bubble.
- Streaming can be extended to show a typing indicator or cancel in-flight requests (add an AbortController if needed).
- Conversation state is kept in memory; refresh clears it. Persist to `localStorage` if desired.

