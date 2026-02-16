import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

export class DfwNavbarComponent extends Component {
  public static tagName = "dfw-navbar";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    scrollToSection: this.scrollToSection,
    mobileMenuOpen: false,
    toggleMobileMenu: this.toggleMobileMenu,
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

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-navbar.component.pug"
      );
      return template(this.scope);
    }
  }
}
