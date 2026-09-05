"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/client";
import {
  DEFAULT_HERO_ROBOT_LAYOUT,
  getHeroRobotLayout,
  HERO_ROBOT_MOBILE_HEAD_ROTATION_RANGE,
  type HeroRobotLayout,
} from "./hero-robot-layout";

const LandingHeroRobotScene = dynamic(() => import("./hero-robot-scene").then((mod) => mod.LandingHeroRobotScene), {
  ssr: false,
});

type LandingHeroRobotVisualProps = {
  className?: string;
};

type DragState = {
  active: boolean;
  startX: number;
  startRotation: number;
};

function clampHeadRotation(value: number) {
  return Math.max(-HERO_ROBOT_MOBILE_HEAD_ROTATION_RANGE, Math.min(HERO_ROBOT_MOBILE_HEAD_ROTATION_RANGE, value));
}

export function LandingHeroRobotVisual({ className }: LandingHeroRobotVisualProps) {
  const t = useTranslations().landing.hero.new;
  const [layout, setLayout] = useState<HeroRobotLayout>(DEFAULT_HERO_ROBOT_LAYOUT);
  const [headRotationY, setHeadRotationY] = useState(0);
  const [isDraggable, setIsDraggable] = useState(false);
  const dragRef = useRef<DragState>({ active: false, startX: 0, startRotation: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const floatOffsetRef = useRef(0);

  useEffect(() => {
    const updateLayout = () => {
      const draggable = window.innerWidth < 1024;
      setLayout(getHeroRobotLayout(window.innerWidth));
      setIsDraggable(draggable);
      if (!draggable) {
        setHeadRotationY(0);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggable) return;

      dragRef.current = {
        active: true,
        startX: event.clientX,
        startRotation: headRotationY,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [headRotationY, isDraggable],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.active || !isDraggable) return;

      const ratio = (event.clientX - dragRef.current.startX) / event.currentTarget.clientWidth;
      const nextRotation = dragRef.current.startRotation + ratio * HERO_ROBOT_MOBILE_HEAD_ROTATION_RANGE * 2.2;
      setHeadRotationY(clampHeadRotation(nextRotation));
    },
    [isDraggable],
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  useEffect(() => {
    let frame = requestAnimationFrame(function tick() {
      const bubble = bubbleRef.current;
      if (bubble) {
        bubble.style.transform = `translate3d(0, ${-floatOffsetRef.current}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn("relative size-full touch-none", isDraggable && "cursor-grab active:cursor-grabbing", className)}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <LandingHeroRobotScene
        layout={layout}
        headRotationY={headRotationY}
        enablePointerTilt={!isDraggable}
        floatOffsetRef={floatOffsetRef}
      />

      <div
        ref={bubbleRef}
        className="pointer-events-none absolute right-2 top-3 max-w-[150px] select-none will-change-transform sm:right-6 sm:top-6 sm:max-w-[176px] lg:right-4 lg:top-[16%]"
      >
        <div className="relative rounded-[18px] bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(11,11,20,0.28)] sm:px-4 sm:py-3">
          <p className="text-[11.5px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#1B2340] sm:text-[13px]">
            {t.speechBubble}
          </p>
          <span
            aria-hidden="true"
            className="absolute -bottom-[6px] left-6 size-3.5 rotate-45 rounded-[3px] bg-white"
          />
        </div>
      </div>
    </div>
  );
}
