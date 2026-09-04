/** Hero landing tokens — values from Landing Page.dc.html mockup. */

export type HeroRobotColors = {
  bodyTop: string;
  bodyMid: string;
  bodyBottom: string;
  face: string;
  faceStroke: string;
  antenna: string;
  antennaTip: string;
  ring: string;
  particle: string;
  lightSky: string;
  lightGround: string;
  lightRim: string;
};

export const HERO_ROBOT_COLOR_DEFAULTS: HeroRobotColors = {
  bodyTop: "#5EC8F2",
  bodyMid: "#6E8FE0",
  bodyBottom: "#A987E8",
  face: "#1B2340",
  faceStroke: "#ffffff",
  antenna: "#6E8FE0",
  antennaTip: "#5EC8F2",
  ring: "#9B87E8",
  particle: "#C7D2FE",
  lightSky: "#CBD5FF",
  lightGround: "#0B0B14",
  lightRim: "#9B87E8",
};

const ROBOT_COLOR_VARS: Record<keyof HeroRobotColors, string> = {
  bodyTop: "--hero-robot-body-top",
  bodyMid: "--hero-robot-body-mid",
  bodyBottom: "--hero-robot-body-bottom",
  face: "--hero-robot-face",
  faceStroke: "--hero-robot-face-stroke",
  antenna: "--hero-robot-antenna",
  antennaTip: "--hero-robot-antenna-tip",
  ring: "--hero-robot-ring",
  particle: "--hero-robot-particle",
  lightSky: "--hero-robot-light-sky",
  lightGround: "--hero-robot-light-ground",
  lightRim: "--hero-robot-light-rim",
};

export function readHeroRobotColors(
  root: HTMLElement | null = typeof document !== "undefined" ? document.documentElement : null,
): HeroRobotColors {
  if (!root) return HERO_ROBOT_COLOR_DEFAULTS;

  const styles = getComputedStyle(root);
  const read = (key: keyof HeroRobotColors) =>
    styles.getPropertyValue(ROBOT_COLOR_VARS[key]).trim() || HERO_ROBOT_COLOR_DEFAULTS[key];

  return {
    bodyTop: read("bodyTop"),
    bodyMid: read("bodyMid"),
    bodyBottom: read("bodyBottom"),
    face: read("face"),
    faceStroke: read("faceStroke"),
    antenna: read("antenna"),
    antennaTip: read("antennaTip"),
    ring: read("ring"),
    particle: read("particle"),
    lightSky: read("lightSky"),
    lightGround: read("lightGround"),
    lightRim: read("lightRim"),
  };
}
