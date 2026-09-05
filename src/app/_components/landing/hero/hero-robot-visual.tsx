"use client";

import dynamic from "next/dynamic";

const LandingHeroRobotScene = dynamic(() => import("./hero-robot-scene").then((mod) => mod.LandingHeroRobotScene), {
  ssr: false,
});

export function LandingHeroRobotVisual() {
  return (
    <div className="absolute inset-0 block touch-none" aria-hidden="true">
      <LandingHeroRobotScene />
    </div>
  );
}
