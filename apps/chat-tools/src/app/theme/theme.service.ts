import { DOCUMENT } from "@angular/common";
import { inject, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkMode = signal(false);
  readonly document = inject(DOCUMENT);

  constructor() {
    if (this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkMode.set(true);
      this.document.documentElement.classList.add('dark');
    }
  }

  changeTheme(theme: 'light' | 'dark') {
    this.isDarkMode.set(theme === 'dark');
    this.document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  toggleTheme() {
    this.isDarkMode.update(mode => !mode);
    if (this.isDarkMode()) {
      this.document.documentElement.classList.add('dark');
    } else {
      this.document.documentElement.classList.remove('dark');
    }
  }
}