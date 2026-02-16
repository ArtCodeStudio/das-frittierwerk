import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import _gallery from "../../../content/gallery.yml";

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryData {
  images: GalleryImage[];
}

export class DfwGalleryComponent extends Component {
  public static tagName = "dfw-gallery";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    images: ((_gallery as unknown) as GalleryData).images || [],
    lightboxSrc: "",
    lightboxAlt: "",
    lightboxCaption: "",
    lightboxOpen: false,
    openLightbox: this.openLightbox,
    closeLightbox: this.closeLightbox,
  };

  constructor() {
    super();
    this.scope.openLightbox = this.openLightbox.bind(this);
    this.scope.closeLightbox = this.closeLightbox.bind(this);
  }

  public openLightbox(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const src = target.getAttribute('data-src') || '';
    const alt = target.getAttribute('data-alt') || '';
    const caption = target.getAttribute('data-caption') || '';
    this.scope.lightboxSrc = src;
    this.scope.lightboxAlt = alt;
    this.scope.lightboxCaption = caption;
    this.scope.lightboxOpen = true;
  }

  public closeLightbox() {
    this.scope.lightboxOpen = false;
  }

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwGalleryComponent.observedAttributes);
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected async template() {
    if (hasChildNodesTrim(this)) {
      return null;
    } else {
      const { default: template } = await import(
        "./dfw-gallery.component.pug"
      );
      return template(this.scope);
    }
  }
}
