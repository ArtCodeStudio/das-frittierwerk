import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import _menu from "../../../content/menu.yml";

interface MenuItem {
  name: string;
  description?: string;
  price: number | string;
  info?: string;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface MenuData {
  categories: MenuCategory[];
}

export class DfwMenuComponent extends Component {
  public static tagName = "dfw-menu";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    categories: ((_menu as unknown) as MenuData).categories || [],
    formatPrice: this.formatPrice,
  };

  constructor() {
    super();
    this.scope.formatPrice = this.formatPrice.bind(this);
  }

  public formatPrice(price: number | string): string {
    if (typeof price === 'string') {
      return price;
    }
    // Format price: show decimals only if needed
    if (Number.isInteger(price)) {
      return `${price}`;
    }
    return price.toFixed(2).replace('.', ',');
  }

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwMenuComponent.observedAttributes);
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-menu.component.pug"
      );
      return template(this.scope);
    }
  }
}
