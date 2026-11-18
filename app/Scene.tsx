"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { asset } from "./asset";
import {
  ART,
  CHEST_IMAGE,
  END_ANGLE,
  FOCUS,
  SCREEN,
  SCREEN_IMAGE,
  computeView,
  frameAt,
  imageLayers,
  type View,
} from "./sceneMath";
import Terminal from "./terminal/Terminal";

type ImageName = "small" | "mid" | "chest" | "screen";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function Scene() {
  const track = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const painting = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;

    const images: Partial<Record<ImageName, HTMLImageElement>> = {};
    let view: View | null = null;
    let frame = 0;
    let shown = -1;
    let began = false;
    let alive = true;
    let dpr = 1;

    // Decode ahead of time so the first draw of a big image doesn't stutter the zoom.
    const load = async (key: ImageName, file: string) => {
      const image = new Image();
      image.src = asset(`/scene/${file}`);
      try {
        await image.decode();
      } catch {
        return;
      }
      if (!alive) return;
      images[key] = image;
      request();
    };

    const measure = () => {
      const c = canvas.current;
      const p = painting.current;
      if (!c || !p) return;
      const width = c.clientWidth;
      const height = c.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(width * dpr);
      c.height = Math.round(height * dpr);
      view = computeView(
        { left: p.offsetLeft, top: p.offsetTop, width: p.offsetWidth, height: p.offsetHeight },
        width,
        height,
      );
      // The terminal and its light are exactly the size of the painted screen.
      for (const layer of [rig.current, light.current]) {
        layer?.style.setProperty("--tw", `${SCREEN.width * view.endScale}px`);
        layer?.style.setProperty("--th", `${SCREEN.height * view.endScale}px`);
      }
    };

    const target = () => {
      const t = track.current;
      if (!t) return 0;
      const span = t.offsetHeight - window.innerHeight;
      return span > 0 ? clamp((-t.getBoundingClientRect().top / span) * 1.01) : 0;
    };

    const draw = (now: number) => {
      if (!view) return;
      const f = frameAt(view, shown, now / 1000, reduce.matches);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, view.width, view.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.translate(f.x + f.floatX, f.y + f.floatY);
      ctx.rotate(f.angle);
      ctx.scale(f.scale, f.scale);
      ctx.translate(-FOCUS.x, -FOCUS.y);

      const layers = imageLayers(f.scale, dpr);
      const base =
        layers.base === "small" ? images.small ?? images.mid : images.mid ?? images.small;
      if (base) ctx.drawImage(base, 0, 0, ART.width, ART.height);
      for (const [image, place, alpha] of [
        [images.chest, CHEST_IMAGE, layers.chest],
        [images.screen, SCREEN_IMAGE, layers.screen],
      ] as const) {
        if (!image || alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.drawImage(image, place.x, place.y, place.size, place.size);
        ctx.globalAlpha = 1;
      }

      if (world.current) {
        const { x, y } = view.startPoint;
        world.current.style.transformOrigin = `${x}px ${y}px`;
        world.current.style.transform = `translate3d(${f.x - x}px, ${f.y - y}px, 0) scale(${f.backScale})`;
      }
      if (name.current) name.current.style.opacity = String(f.nameOpacity);
      if (dim.current) dim.current.style.opacity = String(f.dimOpacity);

      // The screen is attached to the chest and powers on as it comes close. At the
      // end it has no scale or rotation, so its text is perfectly sharp.
      const place =
        shown >= 1
          ? `translate(${f.x}px, ${f.y}px)`
          : `translate(${f.x}px, ${f.y}px) rotate(${f.angle - END_ANGLE}rad) scale(${f.scale / view.endScale})`;
      for (const layer of [rig.current, light.current]) {
        if (!layer) continue;
        layer.style.visibility = f.power > 0 ? "visible" : "hidden";
        layer.style.opacity = String(f.power);
        layer.style.transform = place;
      }
      if (rig.current) rig.current.inert = !f.interactive;

      if (!began && f.arrived) {
        began = true;
        setStarted(true);
      }
    };

    // Scrolling drives the zoom. It eases toward the scroll position so it glides
    // instead of tracking the wheel step for step.
    const tick = (now: number) => {
      frame = 0;
      const goal = target();
      const gap = goal - shown;
      shown = reduce.matches || shown < 0 || Math.abs(gap) < 0.0005 ? goal : shown + gap * 0.09;
      draw(now);
      // Keep animating while he floats or the camera is still catching up.
      if (shown !== goal || (shown < 1 && !reduce.matches)) frame = requestAnimationFrame(tick);
    };
    function request() {
      if (!frame) frame = requestAnimationFrame(tick);
    }
    const resize = () => {
      measure();
      request();
    };

    measure();
    request();
    load("small", "astronaut-small.webp").finally(() => {
      load("mid", "astronaut-mid.webp");
      load("chest", "astronaut-chest.webp");
      load("screen", "astronaut-screen.webp");
    });
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main ref={track} className="track">
      <div
        className="stage"
        style={{ "--sky-image": `url("${asset("/scene/sky.webp")}")` } as CSSProperties}
      >
        <div ref={world} className="world">
          <div className="camera">
            <img className="plate" src={asset("/scene/background.webp")} alt="" fetchPriority="high" />
            <img className="plate glow" src={asset("/scene/glow.webp")} alt="" />
          </div>
          <div ref={painting} className="screen" />
          <h1 ref={name} className="name">
            <span className="word faris">
              <img src={asset("/scene/faris.webp")} alt="Faris" />
            </span>
            <span className="word siddiqi">
              <img src={asset("/scene/siddiqi.webp")} alt="Siddiqi" />
            </span>
          </h1>
        </div>
        <div ref={dim} className="dim" />
        <canvas ref={canvas} className="astronaut" aria-hidden="true" />
        <div ref={light} className="rig terminal-light" aria-hidden="true">
          <div className="terminal-glow" />
        </div>
        <div ref={rig} className="rig">
          <div className="terminal">
            <Terminal start={started} />
          </div>
        </div>
      </div>
    </main>
  );
}
