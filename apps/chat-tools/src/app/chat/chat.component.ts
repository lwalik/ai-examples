import { CommonModule } from "@angular/common";
import { Component, computed, inject, Signal, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { OllamaState } from "../llm/ollama.state";
import { ScrollToBottomOnContentChangeDirective } from "./scroll.directive";

export interface ChatMessage {
  readonly type: 'user' | 'tool';
  readonly content: string;
  readonly timestamp: string;
  readonly status: 'success' | 'error';
}


@Component({
  selector: 'app-chat', 
  templateUrl: './chat.component.html', 
  imports: [CommonModule, ReactiveFormsModule, ScrollToBottomOnContentChangeDirective]
})
export class ChatComponent {
  
  private readonly fb = inject(FormBuilder);
  private readonly ollamaState = inject(OllamaState);

  protected readonly chatMessages: Signal<ChatMessage[]> = computed(() => this.ollamaState.messages().reduce((acc, message) => {
    if (['user', 'tool'].includes(message.role)) {
      const chatMessage: ChatMessage = {
        type: message.role as 'user' | 'tool',
        content: message.content,
        timestamp: new Date().toLocaleTimeString(),
        status: message.role === 'tool' && message.content.startsWith('Error:') ? 'error' : 'success'
      };
      return [...acc, chatMessage];
    }
    return acc;
  }, [] as ChatMessage[]));

  protected readonly canSend = computed(() =>  {
    const messages = this.ollamaState.messages();
    return messages.length === 0 || messages.at(-1)?.role === 'assistant';
  });
  
  protected readonly isChatOpen = signal(false);
  
  protected readonly chatForm: FormGroup = this.fb.group({
    message: ['', Validators.required]
  });

  
  toggleChat() {
    this.isChatOpen.update(open => !open);
  }

  onSubmit() {
    if (this.chatForm.valid) {
      const messageText = this.chatForm.get('message')?.value;
      
      if (messageText && messageText.trim()) {
        this.ollamaState.say(messageText);
        this.chatForm.reset();
      }
    }
  }
}