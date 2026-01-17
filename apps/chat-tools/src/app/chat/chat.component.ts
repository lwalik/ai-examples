import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";

@Component({selector: 'app-chat', templateUrl: './chat.component.html', imports: [CommonModule]})
export class ChatComponent {
  protected readonly isChatOpen = signal(false);

  // Chat conversation data
  protected readonly chatMessages = signal([
    { text: 'Hello! How can I help you with your logs today?', sender: 'bot', timestamp: '10:15 AM' },
    { text: 'Hi, I noticed there are some errors in the recent logs. Can you help me investigate?', sender: 'user', timestamp: '10:16 AM' },
    { text: 'Of course! I can see there are 234 errors in the system. Would you like me to show you the details of the most recent errors?', sender: 'bot', timestamp: '10:16 AM' },
    { text: 'Yes, please show me the error details.', sender: 'user', timestamp: '10:17 AM' },
    { text: 'I\'ve identified the main issues: Redis connection failures and invalid request payloads. The Redis cluster connection issue started at 14:30:18. Would you like me to generate a detailed report?', sender: 'bot', timestamp: '10:18 AM' },
  ]);
  toggleChat() {
    this.isChatOpen.update(open => !open);
  }
}