import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import * as aboutContent from "../../../content/about.md";
import * as qualityContent from "../../../content/quality.md";

export class DfwAppComponent extends Component {
  public static tagName = "dfw-app";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    about: {
      title: (aboutContent as any).attributes?.title || "Über uns",
      html: (aboutContent as any).html || "",
    },
    quality: {
      title: (qualityContent as any).attributes?.title || "Qualität",
      html: (qualityContent as any).html || "",
    },
    currentYear: new Date().getFullYear(),
  };

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwAppComponent.observedAttributes);
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-app.component.pug"
      );
      return template(this.scope);
    }
  }
}
