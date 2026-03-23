import { Binder } from "@ribajs/core";
import { Collapse } from "bootstrap";
import { NAVBAR_COLLAPSE_ID } from "../constants.js";

/**
 * Closes the Bootstrap navbar collapse when a nav link inside this element is clicked (e.g. on mobile).
 * Usage: add rv-close-nav-on-link to the nav element.
 * Without JS the navbar still works (toggle + links); with this binder the menu auto-closes on link click.
 */
export class CloseNavOnLinkBinder extends Binder<string, HTMLElement> {
  static key = "close-nav-on-link";

  private clickHandler: ((e: Event) => void) | null = null;

  private closeCollapseIfShown(): void {
    const collapseEl = this.el.querySelector(`#${NAVBAR_COLLAPSE_ID}`);
    if (!collapseEl) return;
    const collapse = Collapse.getInstance(collapseEl) ?? new Collapse(collapseEl, { toggle: false });
    if (collapseEl.classList.contains("show")) {
      collapse.hide();
    }
  }

  routine() {
    // No-op: binder has no dynamic value to apply
  }

  bind(_el: HTMLElement) {
    this.clickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".nav-link")) return;
      this.closeCollapseIfShown();
    };
    this.el.addEventListener("click", this.clickHandler);
  }

  unbind() {
    if (this.clickHandler) {
      this.el.removeEventListener("click", this.clickHandler);
      this.clickHandler = null;
    }
  }
}
