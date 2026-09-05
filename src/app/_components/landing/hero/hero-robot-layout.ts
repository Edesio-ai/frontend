export const HERO_ROBOT_MOBILE_HEAD_ROTATION_RANGE = 0.65;

export type HeroRobotLayout = {
  offsetX: number;
  offsetY: number;
  cameraZ: number;
  scale: number;
};

export function getHeroRobotLayout(width: number): HeroRobotLayout {
  if (width < 640) {
    return { offsetX: 0, offsetY: 0, cameraZ: 10, scale: 1.14 };
  }
  if (width < 1024) {
    return { offsetX: 0, offsetY: 0, cameraZ: 10.4, scale: 1.1 };
  }

  return { offsetX: 0, offsetY: 0, cameraZ: 8.9, scale: 1.12 };
}

export const DEFAULT_HERO_ROBOT_LAYOUT = getHeroRobotLayout(1280);
