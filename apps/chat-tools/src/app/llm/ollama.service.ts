import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

interface OllamaGenerateRequest {
  readonly model: string;
  readonly prompt: string;
  readonly stream: boolean;
  readonly format: string;
  readonly options: {
    readonly temperature: number;
  };
}

interface OllamaGenerateResponse<T> {
  readonly response: T;
  readonly done: boolean;
}

export interface Message {
  readonly role: string;
  readonly content: string;
  readonly tool_calls?: ToolCall[];
  readonly name?: string;
}

export interface ToolCall {
  readonly function: { readonly name: string; readonly arguments: Record<string, string> }
}

export interface AssistantMessage extends Message {
  readonly tool_calls?: ToolCall[];
}

export interface OllamaChatResponse {
  readonly message: AssistantMessage;
}

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

@Injectable({
  providedIn: 'root',
})
export class OllamaService {
  private readonly http = inject(HttpClient);
  private readonly ollamaUrl = 'http://localhost:11434/api';

  generate<T>(prompt: string, modelName: string, options: { temperature: number } = { temperature: 0 }): Observable<Partial<T>> {;

    const request: OllamaGenerateRequest = {
      model: modelName,
      prompt,
      stream: false,
      format: 'json',
      options
    };

    return this.http.post<OllamaGenerateResponse<string>>(this.ollamaUrl + '/generate', request).pipe(
      map((response) => {
        try {
          // With format: 'json', Ollama returns valid JSON in the response field
          // Parse it directly since it's guaranteed to be valid JSON
          const parsed = JSON.parse(response.response) as Partial<T>;
          return parsed;
        } catch (error) {
          throw new Error(`Failed to parse Ollama JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
      catchError((error) => {
        return throwError(() => 
          new Error(error.error?.error || error.message || 'Failed to generate filters from Ollama')
        );
      })
    );
  }

  chatWithTools(model: string, messages: Message[], tools: any[], options: { temperature: number } = { temperature: 0 }): Observable<OllamaChatResponse> {
    return this.http.post<OllamaChatResponse>(this.ollamaUrl + '/chat', {
      model,
      messages,
      tools,
      stream: false,
      options,
    })
  }
}
