export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  options?: Record<string, unknown>;
}

export interface OllamaChatStreamChunk {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

// Use direct /api path (proxied in dev by Vite). In production fall back to full host.
const baseURL = import.meta.env.DEV ? '' : 'http://localhost:11434';

export async function createChatCompletion(
  request: OllamaChatRequest,
  onToken?: (delta: string, fullSoFar: string) => void
): Promise<string> {
  const url = `${baseURL}/api/chat`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
  } catch (e) {
    throw new Error('Failed to connect to Ollama at ' + url + '. Is the server running?');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama responded with ${res.status}: ${text}`);
  }

  if (!request.stream) {
    const data = await res.json();
    return data.message?.content ?? '';
  }

  if (!res.body) {
    throw new Error('No response body for streaming request');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunkText = decoder.decode(value, { stream: true });
    const lines = chunkText.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        const json: OllamaChatStreamChunk = JSON.parse(line);
        if (json.message?.content) {
          full += json.message.content;
          onToken?.(json.message.content, full);
        }
        if (json.done) {
          return full;
        }
      } catch (e) {
        // Ignore JSON parse errors for partial lines
        continue;
      }
    }
  }
  return full;
}
