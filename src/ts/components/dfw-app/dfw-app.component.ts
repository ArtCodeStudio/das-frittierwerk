import { Component } from "@ribajs/core";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import templateHtml from "./dfw-app.component.html?raw";
import type { MarkdownContent } from "../../types/index.js";
import * as aboutContent from "../../../content/about.md";
import * as qualityContent from "../../../content/quality.md";
import * as impressumContent from "../../../content/impressum.md";
import galleryData from "../../../content/gallery.yml";
import contactData from "../../../content/contact.yml";
import gear1Url from "../../../assets/gears/gear_01.svg?url";
import gear2Url from "../../../assets/gears/gear_02.svg?url";
import gear3Url from "../../../assets/gears/gear_03.svg?url";
import gear4Url from "../../../assets/gears/gear_04.svg?url";
import gear5Url from "../../../assets/gears/gear_05.svg?url";

interface GalleryYaml {
  images?: unknown[];
}

interface ContactYaml {
  phone?: string;
  address?: string;
  hours?: string;
  email?: string;
  website?: string;
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
    impressum: {
      title: (impressumContent as MarkdownContent).attributes?.title || "Impressum",
      html: (impressumContent as MarkdownContent).html || "",
    },
    currentYear: new Date().getFullYear(),
    contact: (contactData as unknown) as ContactYaml,
    hasAbout: hasContent((aboutContent as MarkdownContent).html),
    hasQuality: hasContent((qualityContent as MarkdownContent).html),
    hasGallery: hasGalleryImages(galleryData as GalleryYaml),
    hasImpressum: true,
    backgroundGears: [
      { src: gear1Url, speed: 0.22, class: "bg-gear--1", maskStyle: { "--gear-mask": `url("${gear1Url}")` } },
      { src: gear2Url, speed: -0.28, class: "bg-gear--2", maskStyle: { "--gear-mask": `url("${gear2Url}")` } },
      { src: gear3Url, speed: 0.26, class: "bg-gear--3", maskStyle: { "--gear-mask": `url("${gear3Url}")` } },
      { src: gear4Url, speed: -0.2, class: "bg-gear--4", maskStyle: { "--gear-mask": `url("${gear4Url}")` } },
      { src: gear5Url, speed: 0.32, class: "bg-gear--5", maskStyle: { "--gear-mask": `url("${gear5Url}")` } },
    ],
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
