import { Component } from "@ribajs/core";
import { debounceF } from "@ribajs/utils/src/control.js";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

const VISIBLE_SCROLL_START = 0.1; // show after 10% from top
const VISIBLE_SCROLL_END = 0.9;   // hide again in last 10%

/**
 * Wrapper component that shows its child content only when the page is scrolled
 * in the "middle" 80% (between 10% and 90% of scroll range). Use for fixed
 * elements like a call button that should be hidden near the top and bottom.
 * Pass the content as child nodes (like dfw-contact-map).
 */
export class DfwScrollVisibilityComponent extends Component {
  public static tagName = "dfw-scroll-visibility";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  private debouncedUpdateVisibility!: () => void;
  private readonly boundUpdateVisibility = () => this.debouncedUpdateVisibility();

  protected connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-visible", "false");
    this.init(DfwScrollVisibilityComponent.observedAttributes);

    this.debouncedUpdateVisibility = debounceF(() => {
      if (!this.isConnected) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const visible =
        maxScroll <= 0 ||
        (window.scrollY >= maxScroll * VISIBLE_SCROLL_START &&
         window.scrollY <= maxScroll * VISIBLE_SCROLL_END);
      this.setAttribute("data-visible", visible ? "true" : "false");
    });
  }

  protected async afterBind() {
    await super.afterBind();
    this.debouncedUpdateVisibility();
    window.addEventListener("scroll", this.boundUpdateVisibility, { passive: true });
  }

  protected disconnectedCallback() {
    window.removeEventListener("scroll", this.boundUpdateVisibility);
    super.disconnectedCallback();
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected template(): string | null {
    if (hasChildNodesTrim(this)) {
      return null;
    }
    return `<p>Provide child content to show in the middle 80% scroll range.</p>`;
  }
}
