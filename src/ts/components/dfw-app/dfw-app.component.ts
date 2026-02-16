import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import templateHtml from "./dfw-app.component.html?raw";
import type { MarkdownContent } from "../../types/index.js";
import * as aboutContent from "../../../content/about.md";
import * as qualityContent from "../../../content/quality.md";
import galleryData from "../../../content/gallery.yml";

interface GalleryYaml {
  images?: unknown[];
}

function hasContent(html: string | undefined): boolean {
  return typeof html === "string" && html.trim().length > 0;
}

function hasGalleryImages(data: GalleryYaml): boolean {
  return Array.isArray(data?.images) && data.images.length > 0;
}

export class DfwAppComponent extends Component {
  public static tagName = "dfw-app";

  protected autobind = true;

  private shineRafId: number | null = null;
  private readonly boundUpdateShineFromScroll = () => this.updateShineFromScroll();
  private readonly boundUpdateShineFromPointer = (e: MouseEvent) =>
    this.updateShineFromPointer(e);
  private shineX = "10%";
  private shineY = "50%";

  static get observedAttributes(): string[] {
    return [];
  }

  public scope = {
    about: {
      title: (aboutContent as MarkdownContent).attributes?.title || "Über uns",
      html: (aboutContent as MarkdownContent).html || "",
    },
    quality: {
      title: (qualityContent as MarkdownContent).attributes?.title || "Qualität",
      html: (qualityContent as MarkdownContent).html || "",
    },
    currentYear: new Date().getFullYear(),
    hasAbout: hasContent((aboutContent as MarkdownContent).html),
    hasQuality: hasContent((qualityContent as MarkdownContent).html),
    hasGallery: hasGalleryImages(galleryData as GalleryYaml),
  };

  private setShine(x: string, y: string): void {
    this.shineX = x;
    this.shineY = y;
    document.documentElement.style.setProperty("--shine-x", x);
    document.documentElement.style.setProperty("--shine-y", y);
  }

  private updateShineFromScroll(): void {
    if (this.shineRafId !== null) return;
    this.shineRafId = requestAnimationFrame(() => {
      this.shineRafId = null;
      const scrollY = window.scrollY ?? document.documentElement.scrollTop;
      const innerHeight = window.innerHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      const maxScroll = Math.max(0, scrollHeight - innerHeight);
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      // Multiple cycles over the page: triangle wave 0% → 100% → 0%
      const cycles = 3;
      const phase = (progress * cycles) % 1;
      const yPercent =
        phase <= 0.5 ? phase * 200 : (1 - phase) * 200;
      this.setShine(this.shineX, `${Math.min(100, Math.max(0, yPercent))}%`);
    });
  }

  private updateShineFromPointer(e: MouseEvent): void {
    if (this.shineRafId !== null) return;
    this.shineRafId = requestAnimationFrame(() => {
      this.shineRafId = null;
      const xPercent = (e.clientX / window.innerWidth) * 100;
      this.setShine(`${xPercent}%`, this.shineY);
    });
  }

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwAppComponent.observedAttributes);

    this.updateShineFromScroll();
    window.addEventListener("scroll", this.boundUpdateShineFromScroll, {
      passive: true,
    });
    window.addEventListener("resize", this.boundUpdateShineFromScroll);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", this.boundUpdateShineFromPointer);
    }
  }

  protected disconnectedCallback(): void {
    if (this.shineRafId !== null) {
      cancelAnimationFrame(this.shineRafId);
      this.shineRafId = null;
    }
    window.removeEventListener("scroll", this.boundUpdateShineFromScroll);
    window.removeEventListener("resize", this.boundUpdateShineFromScroll);
    window.removeEventListener("mousemove", this.boundUpdateShineFromPointer);
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
