import { Component } from "@ribajs/core";
import { EventDispatcher } from "@ribajs/events";
import { ModalNotification } from "@ribajs/bs5";
import type { DirectionsService, ContactData } from "../../types/index.js";
import { ROUTER_VIEW_ID } from "../../constants.js";
import _contact from "../../../content/contact.yml";

export interface DfwDirectionsSelectorScope {
  services: DirectionsService[];
  openModal: (event: CustomEvent) => void;
}

const contact = _contact as unknown as ContactData;

export class DfwDirectionsSelectorComponent extends Component {
  public static tagName = "dfw-directions-selector";

  protected autobind = true;

  static get observedAttributes(): string[] {
    return [];
  }

  public scope: DfwDirectionsSelectorScope = {
    services: contact.directions_services ?? [],
    openModal: this.openModal.bind(this),
  };

  private triggerClickHandlers: Array<{ el: HTMLElement; handler: (e: Event) => void }> = [];
  private routerUnsubscribe: (() => void) | null = null;

  protected connectedCallback() {
    super.connectedCallback();
    this.init(DfwDirectionsSelectorComponent.observedAttributes);
  }

  protected async afterBind() {
    await super.afterBind();
    this.initTriggers();

    // Re-bind triggers after router page transitions (new DOM content may contain triggers)
    const dispatcher = EventDispatcher.getInstance(ROUTER_VIEW_ID);
    const onTransition = () => this.initTriggers();
    dispatcher.on("transitionCompleted", onTransition);
    this.routerUnsubscribe = () => dispatcher.off("transitionCompleted", onTransition);
  }

  protected disconnectedCallback() {
    this.clearTriggers();
    this.routerUnsubscribe?.();
    this.routerUnsubscribe = null;
    super.disconnectedCallback();
  }

  private clearTriggers() {
    for (const { el, handler } of this.triggerClickHandlers) {
      el.removeEventListener("click", handler);
    }
    this.triggerClickHandlers = [];
  }

  private initTriggers() {
    this.clearTriggers();
    const triggers = document.querySelectorAll<HTMLElement>("[data-directions-trigger]");
    triggers.forEach((trigger) => {
      const handler = (event: Event) => {
        event.preventDefault();
        this.openModal(event as CustomEvent);
      };
      trigger.addEventListener("click", handler);
      this.triggerClickHandlers.push({ el: trigger, handler });
    });
  }

  /** Build modal body using DOM API instead of inline HTML/onclick. */
  private buildModalBody(): string {
    const services = this.scope.services;
    const text = contact.label_directions_modal_text ?? "Wählen Sie einen Routenplaner:";

    const container = document.createElement("div");

    const paragraph = document.createElement("p");
    paragraph.className = "mb-3";
    paragraph.textContent = text;
    container.appendChild(paragraph);

    const grid = document.createElement("div");
    grid.className = "d-grid gap-2";

    for (const service of services) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary directions-service-btn";
      btn.textContent = service.name;
      btn.dataset.url = service.url;
      grid.appendChild(btn);
    }

    container.appendChild(grid);
    return container.innerHTML;
  }

  public openModal(event: CustomEvent): void {
    if (this.scope.services.length === 0) return;

    const title = contact.label_directions_modal_title ?? "Anfahrt berechnen";
    const message = this.buildModalBody();

    const notificationDispatcher = new EventDispatcher("directions");
    const modal: ModalNotification = new ModalNotification({
      title,
      message,
      contextualClass: "primary",
      buttons: [],
      $event: event,
      $context: this.scope,
    });
    notificationDispatcher.trigger("show-notification", modal);

    // Attach click handlers via event delegation after modal is shown
    requestAnimationFrame(() => {
      const modalEl = document.querySelector(".modal-primary");
      modalEl?.addEventListener("click", (e) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>(".directions-service-btn");
        if (!target?.dataset.url) return;
        window.open(target.dataset.url, "_blank", "noopener,noreferrer");
        modalEl.querySelector<HTMLElement>(".btn-close")?.click();
      });
    });
  }

  protected requiredAttributes(): string[] {
    return [];
  }

  protected template(): string | null {
    return null;
  }
}
