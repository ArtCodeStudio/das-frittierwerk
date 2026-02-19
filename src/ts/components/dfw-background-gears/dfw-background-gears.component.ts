import { Component } from "@ribajs/core";
import { EventDispatcher } from "@ribajs/events";
import { debounceCb, debounceF } from "@ribajs/utils/src/control.js";
import { hasChildNodesTrim } from "@ribajs/utils/src/dom.js";

import templateHtml from "./dfw-background-gears.component.html?raw";
import gear1Url from "../../../assets/gears/gear_01.svg?url";
import gear2Url from "../../../assets/gears/gear_02.svg?url";

const ROUTER_VIEW_ID = "main";

/** Min/max gear size (px). Kept so gears stay partially off-screen at edges. */
const GEAR_SIZE_MIN = 140;
const GEAR_SIZE_MAX = 400;
/** Portion of gear that stays off-screen (e.g. 0.45 = 45% visible). */
const VISIBLE_PORTION_MIN = 0.35;
const VISIBLE_PORTION_MAX = 0.55;
/** Top % bands (base) with jitter range ±%. */
const TOP_BANDS: [number, number][] = [[10, 6], [30, 6], [50, 6], [70, 6], [90, 6]];

interface GearDef {
  src: string;
  speed: number;
  class: string;
  maskStyle: Record<string, string>;
  style: Record<string, string>;
}

function randomIn(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class DfwBackgroundGearsComponent extends Component {
  public static tagName = "dfw-background-gears";

  protected autobind = true;

  private resizeObserver: ResizeObserver | null = null;
  private static readonly RESIZE_DEBOUNCE_MS = 450;
  private routerUnsubscribe: (() => void) | null = null;
  private debouncedShineFromScroll!: () => void;
  private debouncedShineFromPointer!: (e: MouseEvent) => void;
  private readonly boundUpdateShineFromScroll = () => this.debouncedShineFromScroll();
  private readonly boundUpdateShineFromPointer = (e: MouseEvent) =>
    this.debouncedShineFromPointer(e);
  private readonly boundOnResize = () => this.onResize();
  private debouncedResizeDone!: () => void;
  private readonly boundOnTransitionCompleted = () => this.onTransitionCompleted();
  private readonly boundOnInitStateChange = (
    _viewId: string,
    _newStatus: unknown,
    oldStatus: unknown,
  ) => this.onInitStateChange(Boolean(oldStatus));
  private shineX = "10%";
  private shineY = "50%";

  /** Five gears using only gear_01 and gear_02 assets (gears 3–5 no longer exist). */
  private static readonly GEAR_BASE = [
    { src: gear1Url, speed: 0.22, class: "bg-gear--1", maskStyle: { "--gear-mask": `url("${gear1Url}")` } },
    { src: gear1Url, speed: -0.28, class: "bg-gear--2", maskStyle: { "--gear-mask": `url("${gear1Url}")` } },
    { src: gear1Url, speed: 0.26, class: "bg-gear--3", maskStyle: { "--gear-mask": `url("${gear1Url}")` } },
    { src: gear2Url, speed: -0.2, class: "bg-gear--4", maskStyle: { "--gear-mask": `url("${gear2Url}")` } },
    { src: gear2Url, speed: 0.32, class: "bg-gear--5", maskStyle: { "--gear-mask": `url("${gear2Url}")` } },
  ] as const;

  /** Hide gears and schedule debounced repositioning when viewport size changes. */
  private onResize(): void {
    (this as unknown as HTMLElement).classList.add("dfw-background-gears--resizing");
    this.debouncedResizeDone();
  }

  /** Set gears container height to content height so gear positions (top: X%) distribute along the page.
   * Height is read while gears container is collapsed to avoid the gears contributing to document height. */
  private updateHeightToPage(): void {
    const container = this.parentElement as HTMLElement | null;
    const self = this as unknown as HTMLElement;

    if (container?.classList.contains("background-gears")) {
      container.style.height = "0";
    }
    self.style.height = "0";

    const h = document.documentElement.scrollHeight;
    const px = `${h}px`;

    if (container?.classList.contains("background-gears")) {
      container.style.height = px;
    }
    self.style.height = px;
  }

  /** Collapse gears container and remove gear nodes so document height is not preserved on page change. */
  private collapseGears(): void {
    const container = this.parentElement;
    if (container?.classList.contains("background-gears")) {
      (container as HTMLElement).style.height = "0";
    }
    (this as unknown as HTMLElement).style.height = "0";
    this.scope.backgroundGears = [];
    this.view?.update(this.scope);
  }

  /** Build gear list with random size/position; well distributed and only partially visible at edges. */
  private buildGearsWithRandomLayout(): GearDef[] {
    return DfwBackgroundGearsComponent.GEAR_BASE.map((base, i) => {
      const size = Math.round(randomIn(GEAR_SIZE_MIN, GEAR_SIZE_MAX));
      const visible = randomIn(VISIBLE_PORTION_MIN, VISIBLE_PORTION_MAX);
      const offset = Math.round(size * (1 - visible));
      const [bandBase, jitter] = TOP_BANDS[i];
      const top = Math.max(2, Math.min(98, bandBase + randomIn(-jitter, jitter)));
      const onLeft = i % 2 === 0;
      const positionStyle: Record<string, string> = {
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        ...(onLeft ? { left: `-${offset}px` } : { right: `-${offset}px` }),
      };
      return {
        ...base,
        style: { ...base.maskStyle, ...positionStyle },
      } as GearDef;
    });
  }

  private onInitStateChange(isNavigation: boolean): void {
    if (isNavigation) {
      this.collapseGears();
    }
  }

  private onTransitionCompleted(): void {
    this.updateHeightToPage();
    this.scope.backgroundGears = this.buildGearsWithRandomLayout();
    this.view?.update(this.scope);
  }

  static get observedAttributes(): string[] {
    return [];
  }

  public scope: { backgroundGears: GearDef[] } = {
    backgroundGears: [],
  };

  private setShine(x: string, y: string): void {
    this.shineX = x;
    this.shineY = y;
    document.documentElement.style.setProperty("--shine-x", x);
    document.documentElement.style.setProperty("--shine-y", y);
  }

  private doUpdateShineFromScroll(): void {
    if (!this.isConnected) return;
    const scrollY = window.scrollY ?? document.documentElement.scrollTop;
    const innerHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, scrollHeight - innerHeight);
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    const cycles = 3;
    const phase = (progress * cycles) % 1;
    const yPercent =
      phase <= 0.5 ? phase * 200 : (1 - phase) * 200;
    this.setShine(this.shineX, `${Math.min(100, Math.max(0, yPercent))}%`);
  }

  private doUpdateShineFromPointer(e: MouseEvent): void {
    if (!this.isConnected) return;
    const xPercent = (e.clientX / window.innerWidth) * 100;
    this.setShine(`${xPercent}%`, this.shineY);
  }

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwBackgroundGearsComponent.observedAttributes);

    this.debouncedResizeDone = debounceCb(() => {
      if (!this.isConnected) return;
      (this as unknown as HTMLElement).classList.remove("dfw-background-gears--resizing");
      this.updateHeightToPage();
      this.scope.backgroundGears = this.buildGearsWithRandomLayout();
      this.view?.update(this.scope);
    }, DfwBackgroundGearsComponent.RESIZE_DEBOUNCE_MS);

    this.debouncedShineFromScroll = debounceF(() => this.doUpdateShineFromScroll());
    this.debouncedShineFromPointer = debounceF((e: MouseEvent) => this.doUpdateShineFromPointer(e));

    this.scope.backgroundGears = this.buildGearsWithRandomLayout();
    this.updateHeightToPage();
    this.debouncedShineFromScroll();

    const dispatcher = EventDispatcher.getInstance(ROUTER_VIEW_ID);
    dispatcher.on("initStateChange", this.boundOnInitStateChange);
    dispatcher.on("transitionCompleted", this.boundOnTransitionCompleted);
    this.routerUnsubscribe = () => {
      dispatcher.off("initStateChange", this.boundOnInitStateChange);
      dispatcher.off("transitionCompleted", this.boundOnTransitionCompleted);
    };

    window.addEventListener("scroll", this.boundUpdateShineFromScroll, {
      passive: true,
    });
    window.addEventListener("resize", this.boundUpdateShineFromScroll);
    window.addEventListener("resize", this.boundOnResize);
    this.resizeObserver = new ResizeObserver(this.boundOnResize);
    this.resizeObserver.observe(document.body);
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", this.boundUpdateShineFromPointer);
    }
  }

  protected disconnectedCallback(): void {
    this.routerUnsubscribe?.();
    this.routerUnsubscribe = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener("scroll", this.boundUpdateShineFromScroll);
    window.removeEventListener("resize", this.boundUpdateShineFromScroll);
    window.removeEventListener("resize", this.boundOnResize);
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
