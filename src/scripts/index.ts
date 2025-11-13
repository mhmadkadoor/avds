import '../style.css'
import '../styles/chat.css'
import chatHtml from '../chat.html?raw';
import assistantPromptRaw from '../assistantPrompt.txt?raw';
import type { ChatMessage } from './ollama';
import { ChatAgent } from './chatService';

const app = document.querySelector<HTMLDivElement>('#app')!;

// Insert externalized markup
app.insertAdjacentHTML('beforeend', chatHtml);

let messagesEl = document.getElementById('messages') as HTMLDivElement | null;
let form = document.getElementById('chat-form') as HTMLFormElement | null;
let input = document.getElementById('prompt') as HTMLInputElement | null;
let popup = document.getElementById('chat-popup') as HTMLElement | null;
let fab = document.getElementById('chat-fab') as HTMLButtonElement | null;
let closeBtn = document.getElementById('chat-close') as HTMLButtonElement | null;

// Basic sanity check and fallback re-query if needed
if (!messagesEl || !form || !input || !popup || !fab || !closeBtn) {
  console.warn('[chat] Some nodes not found on first query. Re-querying after microtask...');
}
// In case the framework rehydrates later, do a microtask re-query
queueMicrotask(() => {
  messagesEl = (messagesEl ?? document.getElementById('messages')) as HTMLDivElement;
  form = (form ?? document.getElementById('chat-form')) as HTMLFormElement;
  input = (input ?? document.getElementById('prompt')) as HTMLInputElement;
  popup = (popup ?? document.getElementById('chat-popup')) as HTMLElement;
  fab = (fab ?? document.getElementById('chat-fab')) as HTMLButtonElement;
  closeBtn = (closeBtn ?? document.getElementById('chat-close')) as HTMLButtonElement;
});
const MODEL = 'gpt-oss:20b-cloud';

const agent = new ChatAgent({ model: MODEL, systemPrompt: assistantPromptRaw });
let streaming = false;
let opened = false;

function addMessage(role: ChatMessage['role'], content: string) {
  if (!messagesEl) return document.createElement('span') as HTMLSpanElement;
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;
  div.innerHTML = `<strong>${role === 'user' ? 'You' : role === 'assistant' ? 'AI' : 'System'}:</strong> <span class="content"></span>`;
  (div.querySelector('.content') as HTMLSpanElement).textContent = content;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div.querySelector('.content') as HTMLSpanElement;
}

async function openChat() {
  if (opened) return;
  opened = true;
  if (!popup) return;
  popup.classList.add('open');
  popup.setAttribute('aria-hidden', 'false');
  // Ensure visibility even if CSS didn't load for some reason
  popup.style.display = 'grid';
  fab?.setAttribute('aria-expanded', 'true');
  // Initial greeting from AI using system prompt (only once)
  if (agent.getMessages().every(m => m.role !== 'assistant' && m.role !== 'user')) {
    const placeholder = addMessage('assistant', '...');
    try {
      await agent.initialAssistantMessage((_d, soFar) => {
        placeholder.textContent = soFar;
      });
    } catch (e:any) {
      placeholder.textContent = 'Failed to load assistant greeting: ' + (e?.message || e);
      placeholder.parentElement?.classList.add('msg-error');
    }
  }
  setTimeout(() => input?.focus(), 0);
}

function closeChat() {
  if (!opened) return;
  opened = false;
  if (!popup) return;
  popup.classList.remove('open');
  popup.setAttribute('aria-hidden', 'true');
  popup.style.display = 'none';
  fab?.setAttribute('aria-expanded', 'false');
  fab?.focus();
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  if (streaming) return;
  if (!input) return;
  const prompt = input.value.trim();
  if (!prompt) return;
  input.value = '';
  addMessage('user', prompt);
  const assistantSpan = addMessage('assistant', '');
  streaming = true;
  form?.classList.add('loading');
  try {
    await agent.sendUserMessage(prompt, (_delta, soFar) => {
      assistantSpan.textContent = soFar;
    });
  } catch (err:any) {
    assistantSpan.textContent = 'Error: ' + (err?.message || err);
    assistantSpan.parentElement?.classList.add('msg-error');
    if (/connect/i.test(err?.message)) {
      const tip = document.createElement('div');
      tip.className = 'msg msg-system';
      tip.textContent = 'Tip: Start Ollama (e.g. run "ollama run" or pull a model). For cloud models run "ollama signin" first.';
  messagesEl?.appendChild(tip);
    }
  } finally {
    streaming = false;
  form?.classList.remove('loading');
  }
}

function toggleChat() {
  if (opened) closeChat();
  else openChat();
}

fab?.addEventListener('click', toggleChat);
closeBtn?.addEventListener('click', closeChat);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeChat();
});
form?.addEventListener('submit', handleSubmit);

// Optional: Auto-open for quick testing via URL param ?chat=1 or hash #chat
const params = new URLSearchParams(location.search);
if (params.get('chat') === '1' || location.hash === '#chat') {
  openChat();
}
