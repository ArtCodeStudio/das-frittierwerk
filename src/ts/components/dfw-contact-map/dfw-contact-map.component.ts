import { Component } from "@ribajs/core";
import { debounceCb } from "@ribajs/utils/src/control.js";
import { hasChildNodesTrim, scrollToPosition } from "@ribajs/utils/src/dom.js";

export interface DfwContactMapScope {
  scrollWrapperEl: HTMLDivElement | null;
  center: () => void;
}

export class DfwContactMapComponent extends Component {
  public static tagName = "dfw-contact-map";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope: DfwContactMapScope = {
    scrollWrapperEl: null,
    center: this.center.bind(this),
  };

  private boundCenter = debounceCb(this.center.bind(this), 100);

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwContactMapComponent.observedAttributes);
    // If the component is already bound, center it immediately
    if(this.bound) {
      this.center();
    }
  }

  protected async afterBind() {
    await super.afterBind();
    this.center();
    window.addEventListener("resize", this.boundCenter, { passive: true });
  }

  protected disconnectedCallback() {
    window.removeEventListener("resize", this.boundCenter);
    super.disconnectedCallback();
  }

  public center(): void {
    const wrapper = this.scope.scrollWrapperEl;
    if (wrapper) {
      scrollToPosition(wrapper, "center", "both", "auto");
    }
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected template(): string | null {
    if (hasChildNodesTrim(this)) {
      return null;
    }
    return `<p>Missing child template</p>`;
  }
}
