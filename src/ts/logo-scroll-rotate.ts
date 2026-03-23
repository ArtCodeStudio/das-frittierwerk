import { debounceF } from "@ribajs/utils/src/control.js";
import { getScrollY } from "./utils/index.js";
import { SCROLL_ROTATE_SPEED_DEFAULT } from "./constants.js";

/**
 * Applies scroll-based rotation to static elements with data-scroll-rotate (e.g. .logo-gear).
 * Same behavior as ScrollRotateBinder; used for static Pug-rendered logo so no Riba component is needed.
 */
function applyRotation(el: HTMLElement, speed: number) {
  const degrees = getScrollY() * speed;
  el.style.transform = `rotate(${degrees}deg)`;
}

function updateAll() {
  document.querySelectorAll<HTMLElement>("[data-scroll-rotate]").forEach((el) => {
    const raw = el.getAttribute("data-scroll-rotate");
    const speed = raw ? Number(raw) : SCROLL_ROTATE_SPEED_DEFAULT;
    if (Number.isFinite(speed)) applyRotation(el, speed);
  });
}

export function initLogoScrollRotate(): void {
  const onScroll = debounceF(updateAll);

  updateAll();
  window.addEventListener("scroll", () => onScroll(), { passive: true });
}
