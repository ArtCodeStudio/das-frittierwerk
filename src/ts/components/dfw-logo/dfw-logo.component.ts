import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import templateHtml from "./dfw-logo.component.html?raw";
import logoBase from "../../../assets/dasfrittierwerk_logo-animation.avif?url";
import logoGear from "../../../assets/dasfrittierwerk_logo-animation2.avif?url";

export class DfwLogoComponent extends Component {
  public static tagName = "dfw-logo";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    logoBase,
    logoGear,
  };

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwLogoComponent.observedAttributes);
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected template(): string | null {
    if (hasChildNodesTrim(this)) {
      return null;
    }
    return templateHtml;
  }
}
