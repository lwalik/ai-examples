import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollToBottomOnContentChange]',
  standalone: true
})
export class ScrollToBottomOnContentChangeDirective implements OnInit, OnDestroy {
  
  private mutationObserver?: MutationObserver;
  private readonly element: HTMLElement;

  constructor(private el: ElementRef<HTMLElement>) {
    this.element = this.el.nativeElement;
  }

  ngOnInit(): void {
    this.setupObserver();
    // Initial scroll
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  private setupObserver(): void {
    this.disconnectObserver();

    this.mutationObserver = new MutationObserver(() => {
      this.scrollToBottom();
    });

    // Watch for DOM changes
    this.mutationObserver.observe(this.element, {
      childList: true,        // Watch for added/removed children
      subtree: true,          // Watch all descendants
      characterData: true,    // Watch for text content changes
      attributes: false       // Don't watch attribute changes (performance)
    });
  }

  private disconnectObserver(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
  }

  private scrollToBottom(): void {
    // Use requestAnimationFrame to ensure DOM has fully updated
    requestAnimationFrame(() => {
      this.element.scrollTop = this.element.scrollHeight;
    });
  }
}