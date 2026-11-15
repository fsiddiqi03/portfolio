"use client";

import { useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function Scene() {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Scrolling down pans the camera one screen to the left. The pan eases toward
  // the scroll position so it glides instead of tracking the wheel step for step.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let shown = -1;

    const target = () => {
      const t = track.current;
      if (!t) return 0;
      const span = t.offsetHeight - window.innerHeight;
      return span > 0 ? clamp(-t.getBoundingClientRect().top / span) : 0;
    };
    const tick = () => {
      frame = 0;
      const goal = target();
      const gap = goal - shown;
      shown = reduce.matches || shown < 0 || Math.abs(gap) < 0.0005 ? goal : shown + gap * 0.09;
      stage.current?.style.setProperty("--p", shown.toFixed(4));
      if (shown !== goal) frame = requestAnimationFrame(tick);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <main ref={track} className="track">
      <div ref={stage} className="stage">
        <div className="camera">
          <img className="plate left" src="/scene/background-left.webp" alt="" />
          <img className="plate right" src="/scene/background.webp" alt="" fetchPriority="high" />
          <img className="plate right glow" src="/scene/glow.webp" alt="" />
        </div>

        <div className="screen">
          <div className="astro">
            <div className="astro-x">
              <div className="astro-y">
                <img src="/scene/astronaut.webp" alt="" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="name">
          <span className="word faris">
            <img src="/scene/faris.webp" alt="Faris" />
          </span>
          <span className="word siddiqi">
            <img src="/scene/siddiqi.webp" alt="Siddiqi" />
          </span>
        </h1>
      </div>
    </main>
  );
}
