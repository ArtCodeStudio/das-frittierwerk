import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import templateHtml from "./dfw-navbar.component.html?raw";

export class DfwNavbarComponent extends Component {
  public static tagName = "dfw-navbar";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return ["has-about", "has-quality", "has-gallery", "has-impressum"];
  }

  public scope = {
    scrollToSection: this.scrollToSection,
    mobileMenuOpen: false,
    toggleMobileMenu: this.toggleMobileMenu,
    hasAbout: false,
    hasQuality: false,
    hasGallery: false,
    hasImpressum: false,
  };

  constructor() {
    super();
    this.scope.scrollToSection = this.scrollToSection.bind(this);
    this.scope.toggleMobileMenu = this.toggleMobileMenu.bind(this);
  }

  public scrollToSection(event: Event) {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        const navbarHeight = this.clientHeight || 60;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - navbarHeight,
          behavior: 'smooth'
        });
        this.scope.mobileMenuOpen = false;
      }
    }
  }

  public toggleMobileMenu() {
    this.scope.mobileMenuOpen = !this.scope.mobileMenuOpen;
  }

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwNavbarComponent.observedAttributes);
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
