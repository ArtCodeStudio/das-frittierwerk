/**
 * Applies scroll-based rotation to static elements with data-scroll-rotate (e.g. .logo-gear).
 * Same behavior as ScrollRotateBinder; used for static Pug-rendered logo so no Riba component is needed.
 */
const SPEED_DEFAULT = 0.15;

function applyRotation(el: HTMLElement, speed: number) {
  const scrollY = window.scrollY ?? document.documentElement.scrollTop;
  const degrees = scrollY * speed;
  el.style.transform = `rotate(${degrees}deg)`;
}

function updateAll() {
  document.querySelectorAll<HTMLElement>("[data-scroll-rotate]").forEach((el) => {
    const raw = el.getAttribute("data-scroll-rotate");
    const speed = raw ? Number(raw) : SPEED_DEFAULT;
    if (Number.isFinite(speed)) applyRotation(el, speed);
  });
}

let rafId: number | null = null;
function onScroll() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    updateAll();
  });
}

export function initLogoScrollRotate(): void {
  updateAll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
