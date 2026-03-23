import { Component } from "@ribajs/core";
import { debounceF } from "@ribajs/utils/src/control.js";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";
import { getMaxScroll } from "../../utils/index.js";
import { HIDE_SCROLL_THRESHOLD } from "../../constants.js";

/**
 * Fixed call button component that shows the button at the top of the page
 * and hides it only when the user scrolls to the bottom (last 10%).
 */
export class DfwFixedCallButtonComponent extends Component {
  public static tagName = "dfw-fixed-call-button";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope: Record<string, never> = {};

  private debouncedUpdateVisibility!: () => void;
  private readonly boundUpdateVisibility = () => this.debouncedUpdateVisibility();

  protected connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-visible", "true");
    this.init(DfwFixedCallButtonComponent.observedAttributes);

    this.debouncedUpdateVisibility = debounceF(() => {
      if (!this.isConnected) return;
      const maxScroll = getMaxScroll();
      const visible = maxScroll <= 0 || window.scrollY <= maxScroll * HIDE_SCROLL_THRESHOLD;
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
    return `<p>Provide child content for the fixed call button.</p>`;
  }
}
