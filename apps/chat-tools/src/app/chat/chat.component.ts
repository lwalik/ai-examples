import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { take } from "rxjs";
import { Message, OllamaChatResponse, OllamaService, OllamaTool } from "../llm/ollama.service";
import { ToolRegistry } from "../tools/tool.registry";
import { ScrollToBottomOnContentChangeDirective } from "./scroll.directive";

export interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status: 'loading' | 'success' | 'error';
}


@Component({
  selector: 'app-chat', 
  templateUrl: './chat.component.html', 
  imports: [CommonModule, ReactiveFormsModule, ScrollToBottomOnContentChangeDirective]
})
export class ChatComponent {
  
  private readonly fb = inject(FormBuilder);
  private readonly ollamaService = inject(OllamaService);
  private readonly toolRegistry = inject(ToolRegistry);
  
  protected readonly isChatOpen = signal(false);
  protected readonly chatForm: FormGroup = this.fb.group({
    message: ['', Validators.required]
  });

  // Chat messages signal - starts empty
  protected readonly chatMessages = signal<ChatMessage[]>([]);
  
  // Track if we're currently processing a message to avoid duplicate calls
  private isProcessing = false;

  
  
  toggleChat() {
    this.isChatOpen.update(open => !open);
  }


  formatParameters(params: Record<string, unknown>): string {
    return JSON.stringify(params, null, 2);
  }

  onSubmit() {
    if (this.chatForm.valid && !this.isProcessing) {
      const messageText = this.chatForm.get('message')?.value;
      
      if (messageText && messageText.trim()) {
        // Add user message to signal
        const userMessage: ChatMessage = {
          type: 'user',
          content: messageText,
          timestamp: new Date().toLocaleTimeString(),
          status: 'success'
        };

        const messages = [...this.chatMessages(), userMessage];
        const ollamaMessages = messages.map(message => ({ role: message.type, content: message.content }));
        
        this.chatMessages.set([...messages, { type: 'assistant', content: '...', timestamp: new Date().toLocaleTimeString(), status: 'loading' }]);
        this.chatForm.reset();

        this.callOllama(ollamaMessages, this.toolRegistry.getAll(), (content: string, isSuccess: boolean) => {
          this.chatMessages.update(messages => {
            messages[messages.length - 1].content = content;
            messages[messages.length - 1].status = isSuccess ? 'success' : 'error';
            return messages;
          });
        });
      }
    }
  }

  private callOllama(messages: Message[] = [], tools: OllamaTool[] = [], callback: (content: string, isSuccess: boolean) => void) {
    const model = 'functiongemma:270m';
    
    this.ollamaService.chatWithTools(model, messages, tools).pipe(take(1)).subscribe({
      next: (response) => {
        const functionCall = this.resolveFunctionCall(response);
        
        if (functionCall) {
          const result = `Called ${functionCall.name}`;
          try {
            const toolContext = this.toolRegistry.getByName(functionCall.name);
            if (toolContext) {
              const fnResult = toolContext.execute(functionCall.parameters);
              callback(fnResult ?? result, true);
              return;
            }
          } catch (error) {
            callback(`Tool ${functionCall.name} Error: ${error}`, false);
            return;
          }
        }
        callback('Tool not found', false);
      },
      error: (error) => {    
        callback('Error processing request', false);
      }
    });
  }

  private resolveFunctionCall(response: OllamaChatResponse): { name: string; parameters: Record<string, unknown>;} | undefined {
    // Check if tool_calls exists
    if (response.message.tool_calls?.length) {
      const tool = response.message.tool_calls[0].function;
      return {
        name: tool.name,
        parameters: tool.arguments as Record<string, unknown>,
      };
    } else if (response.message.content) {
      // Try to parse JSON from content
      try {
        const parsed = JSON.parse(response.message.content) as { name: string; parameters?: Record<string, unknown>; arguments?: Record<string, unknown> };
        // FunctionGemma uses 'arguments', but interface expects 'parameters' - normalize it
        const params = parsed.arguments || parsed.parameters || {};
        return {
          name: parsed.name,
          parameters: params as Record<string, unknown>,
        };
      } catch {
        // Not a tool call, just regular content - ignore for command-based system
        console.log('Regular content response (ignored):', response.message.content);
      }
    }
    return undefined;
  }
}