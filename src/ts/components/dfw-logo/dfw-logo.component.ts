import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import logoBase from "../../../assets/dasfrittierwerk_logo-animation.png?url";
import logoGear from "../../../assets/dasfrittierwerk_logo-animation2.png?url";

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

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-logo.component.pug"
      );
      return template(this.scope);
    }
  }
}
