import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SystemMessage {
  readonly role: 'system';
  readonly content: string;
}

export interface UserMessage {
  readonly role: 'user';
  readonly content: string;
}

interface ToolCall {
  readonly id: string;
  readonly function: {
    readonly name: string;
    readonly arguments: Record<string, string>;
    readonly index: number
  }
}

export interface AssistantMessage {
  readonly role: 'assistant';
  readonly content: string;
  readonly tool_calls?: ToolCall[];
}

export interface ToolMessage {
  readonly role: 'tool';
  readonly name: string;
  readonly content: string;
  readonly tool_call_id: string;
}

export type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

export interface OllamaTool {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly description: string;
    readonly parameters: {
      readonly type: string;
      readonly properties: Record<string, { readonly type: string; readonly description: string; readonly enum?: string[] }>;
      readonly required: string[];
    };
  }
}

interface OllamaChatResponse {
  readonly message: AssistantMessage;
}

@Injectable({
  providedIn: 'root',
})
export class OllamaService {
  private readonly http = inject(HttpClient);
  private readonly ollamaUrl = 'http://localhost:11434/api';

  chatWithTools(model: string, messages: Message[], tools: OllamaTool[] = [], options: { temperature: number } = { temperature: 0 }): Observable<OllamaChatResponse> {
    return this.http.post<OllamaChatResponse>(this.ollamaUrl + '/chat', {
      model,
      messages,
      tools,
      stream: false,
      options,
    })
  }
}
