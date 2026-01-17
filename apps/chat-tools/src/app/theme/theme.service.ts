import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkMode = signal(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }
  }

  toggleTheme() {
    this.isDarkMode.update(mode => !mode);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}