import { Binder } from "@ribajs/core";
import { debounceF } from "@ribajs/utils/src/control.js";

/**
 * Rotates an element based on the window scroll position.
 * Usage: rv-scroll-rotate="speed"
 * The speed value controls how fast the element rotates relative to scroll (default: 0.15).
 */
export class ScrollRotateBinder extends Binder<number, HTMLElement> {
  static key = "scroll-rotate";

  private scrollHandler: (() => void) | null = null;
  private speed = 0.15;

  private applyRotation() {
    if (!this.el.isConnected) return;
    const scrollY = window.scrollY || window.pageYOffset;
    const degrees = scrollY * this.speed;
    this.el.style.transform = `rotate(${degrees}deg)`;
  }

  routine(el: HTMLElement, value: number) {
    if (value && typeof value === 'number') {
      this.speed = value;
    }
    this.applyRotation();
  }

  bind(el: HTMLElement) {
    const debouncedApply = debounceF(() => this.applyRotation());
    this.scrollHandler = () => debouncedApply();

    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Apply initial rotation
    this.applyRotation();
  }

  unbind() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  }
}
