// The geometry of the zoom into the astronaut's chest. Art positions are in pixels of
// the astronaut crop taken from layers/astronaut.png (left 1089, top 176).

export const ART = { width: 4200, height: 2754 };
export const ART_CENTER = { x: 2100, y: 1377 };

/** The centre of the painted grid screen, where the camera ends up. */
export const FOCUS = { x: 1217, y: 1302 };
/** The painted grid screen, measured with the art rotated to END_ANGLE. */
export const SCREEN = { width: 215, height: 225 };

/** Where the two close-up images sit on the art. */
export const CHEST_IMAGE = { x: 29, y: -129, size: 2800 };
export const SCREEN_IMAGE = { x: 519, y: 603, size: 1400 };

export const START_ANGLE = (29.362 * Math.PI) / 180;
/** This angle levels the chest unit. */
export const END_ANGLE = (-34.6 * Math.PI) / 180;

export type Box = { left: number; top: number; width: number; height: number };
type Point = { x: number; y: number };

export type View = {
  width: number;
  height: number;
  artWidth: number;
  artHeight: number;
  startScale: number;
  endScale: number;
  startPoint: Point;
  endPoint: Point;
};

export type Frame = {
  scale: number;
  angle: number;
  x: number;
  y: number;
  floatX: number;
  floatY: number;
  backScale: number;
  nameOpacity: number;
  dimOpacity: number;
  power: number;
  interactive: boolean;
  arrived: boolean;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const turn = (x: number, y: number, angle: number): Point => ({
  x: x * Math.cos(angle) - y * Math.sin(angle),
  y: x * Math.sin(angle) + y * Math.cos(angle),
});

/**
 * `painting` is the on-screen box of one painting screen. It places the astronaut
 * exactly where the landing page's composition puts him, on any window shape.
 */
export function computeView(painting: Box, width: number, height: number): View {
  const artWidth = painting.width * 0.03632;
  const artHeight = painting.height * 0.04233;
  const centerX = painting.left + painting.width * 0.54879 + artWidth / 2;
  const centerY = painting.top + painting.height * 0.61067 + artHeight / 2;
  const startScale = artWidth / ART.width;
  const offset = turn(
    (FOCUS.x - ART_CENTER.x) * startScale,
    (FOCUS.y - ART_CENTER.y) * startScale,
    START_ANGLE,
  );

  // Close enough to read, far enough that the rest of the chest unit stays in view.
  const portrait = width / height <= 1;
  const endScale = portrait
    ? Math.min((width * 0.9) / SCREEN.width, (height * 0.5) / SCREEN.height)
    : Math.min((width * 0.46) / SCREEN.width, (height * 0.56) / SCREEN.height);

  return {
    width,
    height,
    artWidth,
    artHeight,
    startScale,
    endScale,
    startPoint: { x: centerX + offset.x, y: centerY + offset.y },
    endPoint: portrait
      ? { x: width * 0.5, y: height * 0.62 }
      : { x: width * 0.42, y: height * 0.6 },
  };
}

export function frameAt(
  view: View,
  progress: number,
  seconds: number,
  reducedMotion: boolean,
): Frame {
  const zoom = smooth(progress);
  const scale = view.startScale * Math.pow(view.endScale / view.startScale, zoom);
  const angle = mix(START_ANGLE, END_ANGLE, zoom);

  // The same gentle float as the rest of the page, settling as the camera arrives.
  const calm = reducedMotion ? 0 : 1 - smooth(progress / 0.45);
  const float = turn(
    -Math.cos((seconds * Math.PI * 2) / 12) * 0.06 * view.artWidth * calm,
    -Math.cos((seconds * Math.PI * 2) / 6) * 0.08 * view.artHeight * calm,
    angle,
  );

  return {
    scale,
    angle,
    x: mix(view.startPoint.x, view.endPoint.x, zoom),
    y: mix(view.startPoint.y, view.endPoint.y, zoom),
    floatX: float.x,
    floatY: float.y,
    // The painting moves more slowly than the astronaut, so he feels closer.
    backScale: Math.pow(scale / view.startScale, 0.42),
    nameOpacity: 1 - smooth((progress - 0.03) / 0.22),
    dimOpacity: smooth((progress - 0.2) / 0.35),
    power: smooth((progress - 0.72) / 0.16),
    interactive: progress >= 0.9,
    arrived: progress >= 0.97,
  };
}

/** Which astronaut images to draw at this size, and how strongly. */
export function imageLayers(scale: number, dpr: number) {
  const sharpness = scale * dpr;
  return {
    base: sharpness < 0.14 ? ("small" as const) : ("mid" as const),
    chest: clamp((sharpness - 0.5) / 0.3),
    screen: clamp((sharpness - 1.1) / 0.4),
  };
}
