import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Scrolls the map wrapper so the image is centered (like mm-map in markus-morische-rechtsanwalt-website).
 */
function scrollToCenter(wrapper: HTMLElement): void {
  wrapper.scrollLeft = (wrapper.scrollWidth - wrapper.clientWidth) / 2;
  wrapper.scrollTop = (wrapper.scrollHeight - wrapper.clientHeight) / 2;
}

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

  private boundCenter = debounce(this.center.bind(this), 100);

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
      scrollToCenter(wrapper);
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
