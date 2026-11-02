// Animation helpers built on Motion (motion.dev), the plain-JS version of Framer Motion.
// Every helper quietly does nothing if Motion didn't load or the user prefers reduced motion,
// so the app always works without animations.
const FX = (() => {
  const M = window.Motion;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = !!(M && M.animate) && !reduce;
  const ease = [0.22, 1, 0.36, 1]; // smooth "ease-out-quint"
  const spring = { type: "spring", stiffness: 300, damping: 22 };

  const list = (els) => {
    if (!els) return [];
    if (typeof els === "string") return [...document.querySelectorAll(els)];
    if (els instanceof Element) return [els];
    return [...els].filter(Boolean);
  };

  return {
    enabled: on,

    // Fade + slide a screen or card in.
    enter(els, { y = 24, x = 0, scale = 1, delay = 0, duration = 0.5 } = {}) {
      const n = list(els);
      if (!on || !n.length) return;
      M.animate(n, { opacity: [0, 1], y: [y, 0], x: [x, 0], scale: [scale, 1] }, { duration, delay, ease });
    },

    // Bring a group of items in one after another.
    stagger(els, { y = 16, x = 0, gap = 0.05, delay = 0, duration = 0.45 } = {}) {
      const n = list(els);
      if (!on || !n.length) return;
      M.animate(n, { opacity: [0, 1], y: [y, 0], x: [x, 0] },
        { duration, ease, delay: M.stagger(gap, { startDelay: delay }) });
    },

    // Reveal items the first time they scroll into view.
    reveal(els, { y = 28, gap = 0.06 } = {}) {
      const n = list(els);
      if (!on || !n.length) return;
      n.forEach((el, i) => {
        el.style.opacity = "0";
        M.inView(el, () => {
          M.animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: 0.55, ease, delay: (i % 3) * gap });
        }, { amount: 0.15 });
      });
    },

    // Springy "pop" for badges and confirmations.
    pop(el) {
      if (!on || !el) return;
      M.animate(el, { scale: [0.4, 1], opacity: [0, 1] }, spring);
    },

    // Small bounce to acknowledge a click.
    bump(el) {
      if (!on || !el) return;
      M.animate(el, { scale: [1, 1.1, 1] }, { duration: 0.35, ease });
    },

    // Shake side to side, for errors.
    shake(el) {
      if (!on || !el) return;
      M.animate(el, { x: [0, -10, 10, -7, 7, -3, 3, 0] }, { duration: 0.45 });
    },

    // Count a number up from 0.
    countUp(el, to, decimals = 0) {
      if (!el) return;
      if (!on) { el.textContent = to.toFixed(decimals); return; }
      M.animate(0, to, { duration: 1.1, ease, onUpdate: (v) => { el.textContent = v.toFixed(decimals); } });
    },

    // Grow bars from the left (e.g. the BMI gauge).
    growX(els, { gap = 0.08, delay = 0 } = {}) {
      const n = list(els);
      if (!on || !n.length) return;
      n.forEach((el) => { el.style.transformOrigin = "left center"; });
      M.animate(n, { scaleX: [0, 1] }, { duration: 0.5, ease, delay: M.stagger(gap, { startDelay: delay }) });
    },

    // Slide an absolutely positioned element to a new `left` with a spring.
    slideLeft(el, to, { delay = 0 } = {}) {
      if (!el) return;
      if (!on) { el.style.left = to; return; }
      M.animate(el, { left: ["0%", to] }, { ...spring, stiffness: 120, damping: 16, delay });
    },

    // Draw an SVG line from start to end.
    draw(path, { duration = 1 } = {}) {
      if (!on || !path || !path.getTotalLength) return;
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      M.animate(path, { strokeDashoffset: [len, 0] }, { duration, ease });
    },

    // Scale a dialog / modal in.
    dialogIn(el) {
      if (!on || !el) return;
      M.animate(el, { opacity: [0, 1], scale: [0.9, 1], y: [20, 0] }, spring);
    },

    spin(el) {
      if (!on || !el) return;
      M.animate(el, { rotate: [0, 360] }, { duration: 0.6, ease });
    },
  };
})();
