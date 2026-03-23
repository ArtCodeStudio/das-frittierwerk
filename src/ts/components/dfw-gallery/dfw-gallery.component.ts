import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";
import type { GalleryImage, GalleryData } from "../../types/index.js";

import templateHtml from "./dfw-gallery.component.html?raw";
import _gallery from "../../../content/gallery.yml";

const gallery = _gallery as unknown as GalleryData;

interface DfwGalleryScope {
  images: GalleryImage[];
  lightboxSrc: string;
  lightboxAlt: string;
  lightboxCaption: string;
  lightboxOpen: boolean;
  openLightbox: (event: Event) => void;
  closeLightbox: () => void;
}

export class DfwGalleryComponent extends Component {
  public static tagName = "dfw-gallery";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope: DfwGalleryScope = {
    images: gallery.images ?? [],
    lightboxSrc: "",
    lightboxAlt: "",
    lightboxCaption: "",
    lightboxOpen: false,
    openLightbox: this.openLightbox.bind(this),
    closeLightbox: this.closeLightbox.bind(this),
  };

  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  public openLightbox(event: Event) {
    // For keyboard events, only trigger on Enter or Space
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") {
      return;
    }
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }
    const target = event.currentTarget as HTMLElement;
    this.scope.lightboxSrc = target.dataset.src ?? "";
    this.scope.lightboxAlt = target.dataset.alt ?? "";
    this.scope.lightboxCaption = target.dataset.caption ?? "";
    this.scope.lightboxOpen = true;
  }

  public closeLightbox() {
    this.scope.lightboxOpen = false;
  }

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwGalleryComponent.observedAttributes);

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.scope.lightboxOpen) {
        this.closeLightbox();
      }
    };
    document.addEventListener("keydown", this.keydownHandler);
  }

  protected disconnectedCallback() {
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
    super.disconnectedCallback();
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
