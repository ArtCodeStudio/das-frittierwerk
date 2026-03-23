import { Binder } from "@ribajs/core";
import { debounceF } from "@ribajs/utils/src/control.js";
import { getScrollY } from "../utils/index.js";
import { SCROLL_ROTATE_SPEED_DEFAULT } from "../constants.js";

/**
 * Rotates an element based on the window scroll position.
 * Usage: rv-scroll-rotate="speed"
 * The speed value controls how fast the element rotates relative to scroll.
 */
export class ScrollRotateBinder extends Binder<number, HTMLElement> {
  static key = "scroll-rotate";

  private scrollHandler: (() => void) | null = null;
  private speed = SCROLL_ROTATE_SPEED_DEFAULT;

  private applyRotation() {
    if (!this.el.isConnected) return;
    const degrees = getScrollY() * this.speed;
    this.el.style.transform = `rotate(${degrees}deg)`;
  }

  routine(_el: HTMLElement, value: number) {
    if (value && typeof value === "number") {
      this.speed = value;
    }
    this.applyRotation();
  }

  bind(_el: HTMLElement) {
    const debouncedApply = debounceF(() => this.applyRotation());
    this.scrollHandler = () => debouncedApply();
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    this.applyRotation();
  }

  unbind() {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
  }
}
