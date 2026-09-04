"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";
import { HERO_ROBOT_COLOR_DEFAULTS, readHeroRobotColors, type HeroRobotColors } from "@/lib/theme/hero-theme";
import type { Group, Mesh, MeshStandardMaterial, Points } from "three";

const PARTICLE_COUNT = 40;

function createParticlePositions(count: number) {
  const values = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.4 + Math.random() * 1.4;
    values[i * 3] = Math.cos(angle) * radius;
    values[i * 3 + 1] = (Math.random() - 0.5) * 3.2;
    values[i * 3 + 2] = Math.sin(angle) * radius;
  }
  return values;
}

const PARTICLE_POSITIONS = createParticlePositions(PARTICLE_COUNT);

function useHeroRobotColors() {
  const [colors, setColors] = useState<HeroRobotColors>(HERO_ROBOT_COLOR_DEFAULTS);

  useEffect(() => {
    setColors(readHeroRobotColors());
  }, []);

  return colors;
}

function useRobotOffsetX() {
  const width = useThree((state) => state.size.width);
  if (width < 768) return 0;
  if (width < 1024) return 1.7;
  return 3.1;
}

function useBodyTexture(colors: HeroRobotColors) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, colors.bodyTop);
    gradient.addColorStop(0.55, colors.bodyMid);
    gradient.addColorStop(1, colors.bodyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 256);

    return new CanvasTexture(canvas);
  }, [colors.bodyTop, colors.bodyMid, colors.bodyBottom]);
}

function useFaceTexture(colors: HeroRobotColors) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 320);

    const x = 8;
    const y = 8;
    const width = 496;
    const height = 304;
    const radius = 140;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fillStyle = colors.face;
    ctx.fill();

    ctx.strokeStyle = colors.faceStroke;
    ctx.lineCap = "round";

    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(180, 150, 46, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(332, 150, 46, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();

    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(256, 205, 52, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [colors.face, colors.faceStroke]);
}

function usePointerTilt() {
  const domElement = useThree((state) => state.gl.domElement);
  const tilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const rect = domElement.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      const fx = inside ? (event.clientX - rect.left) / rect.width : 0.5;
      tilt.current.y = (fx - 0.5) * 1.5;
      tilt.current.x = inside ? ((event.clientY - rect.top) / rect.height - 0.5) * 0.3 : 0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [domElement]);

  return tilt;
}

function Robot({ colors }: { colors: HeroRobotColors }) {
  const botRef = useRef<Group>(null);
  const antennaTipRef = useRef<Mesh>(null);
  const bodyTexture = useBodyTexture(colors);
  const faceTexture = useFaceTexture(colors);
  const tilt = usePointerTilt();
  const offsetX = useRobotOffsetX();

  useFrame((state) => {
    const bot = botRef.current;
    if (!bot) return;

    const clock = state.clock.elapsedTime;
    bot.rotation.y += (tilt.current.y - bot.rotation.y) * 0.06;
    bot.rotation.x += (tilt.current.x - bot.rotation.x) * 0.06;
    bot.position.y = Math.sin(clock * 1.1) * 0.12;

    const tipMaterial = antennaTipRef.current?.material as MeshStandardMaterial | undefined;
    if (tipMaterial) {
      tipMaterial.emissiveIntensity = 1.1 + Math.sin(clock * 3) * 0.5;
    }
  });

  return (
    <group ref={botRef} position={[offsetX, 0, 0]}>
      <mesh scale={[0.95, 0.7, 0.65]}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial map={bodyTexture} roughness={0.45} metalness={0.05} />
      </mesh>

      <mesh position={[0, -0.05, 1.12]}>
        <planeGeometry args={[1.72, 1.05]} />
        <meshBasicMaterial map={faceTexture} transparent />
      </mesh>

      <mesh position={[0, 0.97, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.55, 12]} />
        <meshStandardMaterial color={colors.antenna} roughness={0.4} />
      </mesh>

      <mesh ref={antennaTipRef} position={[0, 1.24, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial
          color={colors.antennaTip}
          emissive={colors.antennaTip}
          emissiveIntensity={1.4}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, -1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.035, 12, 60]} />
        <meshBasicMaterial color={colors.ring} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Particles({ color }: { color: string }) {
  const pointsRef = useRef<Points>(null);

  useFrame(() => {
    if (pointsRef.current) pointsRef.current.rotation.y += 0.0012;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[PARTICLE_POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.045} transparent opacity={0.55} />
    </points>
  );
}

function HeroRobotSceneContent() {
  const colors = useHeroRobotColors();

  return (
    <>
      <hemisphereLight args={[colors.lightSky, colors.lightGround, 1]} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <pointLight position={[-3, 1, 3]} args={[colors.lightRim, 1.8, 14]} />

      <Particles color={colors.particle} />
      <Robot colors={colors} />
    </>
  );
}

export function LandingHeroRobotScene() {
  return (
    <Canvas
      className="size-full"
      camera={{ fov: 32, position: [0, 0, 11.5], near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      flat
      aria-hidden="true"
    >
      <HeroRobotSceneContent />
    </Canvas>
  );
}
