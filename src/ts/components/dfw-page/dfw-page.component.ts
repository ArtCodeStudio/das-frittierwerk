import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

export class DfwPageComponent extends Component {
  public static tagName = "dfw-page";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return ["title", "html"];
  }

  public scope = {
    title: "",
    html: "",
  };

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwPageComponent.observedAttributes);
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-page.component.pug"
      );
      return template(this.scope);
    }
  }
}
