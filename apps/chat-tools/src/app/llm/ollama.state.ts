import { effect, inject, Injectable, signal } from "@angular/core";
import { take } from "rxjs";
import { ToolRegistry } from "../tools/tool.registry";
import { Message, OllamaService, ToolMessage } from "./ollama.service";

@Injectable({
  providedIn: 'root',
})
export class OllamaState {
  private readonly conversation = signal<Message[]>([]);
  private readonly service = inject(OllamaService);
  private readonly model = 'functiongemma:270m';
  private readonly options = { temperature: 0 };
  private readonly tools = inject(ToolRegistry);

  readonly messages = this.conversation.asReadonly();

  constructor() {
    effect(() => {
      const conversation = this.conversation();
      const lastMessage = conversation[conversation.length - 1];
      
      // Trigger when user message is added OR when tool result is added
      if (lastMessage && (lastMessage.role === 'user' || lastMessage.role === 'tool')) {
        this.service.chatWithTools(this.model, this.conversation(), this.tools.getAll(), this.options)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.conversation.update(messages => [...messages, response.message]);
            
            // If assistant wants to call a tool, execute it
            if (response.message.tool_calls !== undefined && response.message.tool_calls.length > 0) {
              const toolCall = response.message.tool_calls[0];
              const toolContext = this.tools.getByName(toolCall.function.name);
              
              if (toolContext === undefined) {
                // Handle bad tool name - add error tool message
                const errorToolMessage: ToolMessage = {
                  role: 'tool',
                  name: toolCall.function.name,
                  content: `Error: Tool ${toolCall.function.name} not found`,
                  tool_call_id: toolCall.id,
                };
                this.conversation.update(messages => [...messages, errorToolMessage]);
                return;
              }
              
              try {
                const result = toolContext.execute(toolCall.function.arguments);
                const toolMessage: ToolMessage = {
                  role: 'tool',
                  name: toolCall.function.name,
                  content: result ?? '',
                  tool_call_id: toolCall.id,
                };
                this.conversation.update(messages => [...messages, toolMessage]);
                // Effect will trigger again because we added a tool message
              } catch (error) {
                const errorToolMessage: ToolMessage = {
                  role: 'tool',
                  name: toolCall.function.name,
                  content: `Error: ${error}`,
                  tool_call_id: toolCall.id,
                };
                this.conversation.update(messages => [...messages, errorToolMessage]);
              }
            }
            // If no tool_calls, assistant gave final response - effect won't trigger again
          },
          error: (error) => {
            console.error('Error chatting with Ollama:', error);
          }
        });
      }
    });
  }

  say(content: string) {
    this.conversation.update(messages => [...messages, { role: 'user', content }]);
  }
}