import { gsap } from "gsap";

export function animateSlide(container) {
  if (!container) return;

  const blocks = container.querySelectorAll("[data-block]");
  gsap.killTweensOf(blocks);
  gsap.set(blocks, { clearProps: "transform,opacity,clipPath" });

  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  blocks.forEach((block, index) => {
    const preset = block.dataset.animation;
    const delay = index * 0.07;

    if (preset === "heroReveal") {
      timeline.from(block, { y: 42, opacity: 0, duration: 0.72 }, delay);
    } else if (preset === "scaleIn") {
      timeline.from(block, { scale: 0.86, opacity: 0, duration: 0.56 }, delay);
    } else if (preset === "lineSweep") {
      timeline.from(block, { clipPath: "inset(0 100% 0 0)", opacity: 0.5, duration: 0.74 }, delay);
    } else if (preset === "parallax") {
      timeline.from(block, { x: 34, scale: 1.04, opacity: 0, duration: 0.75 }, delay);
    } else if (preset === "stagger") {
      timeline.from(block, { y: 22, opacity: 0, duration: 0.58 }, delay);
      timeline.from(block.querySelectorAll("li, .timeline-item, .bar"), { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, delay + 0.12);
    } else {
      timeline.from(block, { y: 20, opacity: 0, duration: 0.5 }, delay);
    }
  });
}
