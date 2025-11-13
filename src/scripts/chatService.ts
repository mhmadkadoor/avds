import { createChatCompletion } from './ollama';
import type { ChatMessage } from './ollama';

export interface ChatAgentOptions {
  model: string;
  systemPrompt?: string;
  stream?: boolean;
}

export class ChatAgent {
  private model: string;
  private conversation: ChatMessage[] = [];
  private systemPrompt?: string;
  constructor(opts: ChatAgentOptions) {
    this.model = opts.model;
    this.systemPrompt = opts.systemPrompt?.trim();
    if (this.systemPrompt) {
      this.conversation.push({ role: 'system', content: this.systemPrompt });
    }
  }

  getMessages(): ChatMessage[] { return [...this.conversation]; }

  async initialAssistantMessage(onToken?: (delta: string, full: string) => void): Promise<string> {
    // Only fetch if no assistant/user messages yet.
    const hasAssistant = this.conversation.some(m => m.role === 'assistant');
    const hasUser = this.conversation.some(m => m.role === 'user');
    if (hasAssistant || hasUser) return '';
    const full = await createChatCompletion({
      model: this.model,
      messages: this.conversation,
      stream: true
    }, onToken);
    this.conversation.push({ role: 'assistant', content: full });
    return full;
  }

  async sendUserMessage(prompt: string, onToken?: (delta: string, full: string) => void): Promise<string> {
    const userMsg: ChatMessage = { role: 'user', content: prompt };
    this.conversation.push(userMsg);
    const full = await createChatCompletion({
      model: this.model,
      messages: this.conversation,
      stream: true
    }, onToken);
    this.conversation.push({ role: 'assistant', content: full });
    return full;
  }
}
