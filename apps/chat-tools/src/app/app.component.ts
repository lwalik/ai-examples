import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LogsComponent } from './logs/logs.component';
import { ThemeSwitcherComponent } from './theme/theme-switcher.component';

@Component({
  imports: [RouterModule, CommonModule, ThemeSwitcherComponent, ChatComponent, LogsComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  
}
