"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** 设计令牌取色（暗色 gemini + accent） */
const PARTICLE_COLORS = ["#00f2fe", "#4facfe", "#e94057"];
const ACCENT = "#60a5fa";

const MODE_CONFIG = {
  splash: { count: 3000, cycleSec: 2 },
  loading: { count: 1500, cycleSec: 1 },
} as const;

export interface ThreeSceneProps {
  mode: "splash" | "loading";
}

/** 生成 "Leto" 文字贴图（带发光） */
function createLetoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 256);
  ctx.font = "700 120px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = ACCENT;
  ctx.shadowBlur = 48;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText("Leto", 256, 128);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 3;
  ctx.strokeText("Leto", 256, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function ThreeScene({ mode }: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { count, cycleSec } = MODE_CONFIG[mode];
    const parent = canvas.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    // ---- 粒子星云 ----
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 3.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      color.set(PARTICLE_COLORS[i % PARTICLE_COLORS.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const pointsMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    scene.add(points);

    // ---- 中心光核：Leto 文字 sprite ----
    const letTexture = createLetoTexture();
    const letMat = new THREE.SpriteMaterial({
      map: letTexture,
      transparent: true,
    });
    const letSprite = new THREE.Sprite(letMat);
    const baseScale = mode === "splash" ? 3.4 : 2.8;
    letSprite.scale.set(baseScale, baseScale / 2, 1);
    scene.add(letSprite);

    // ---- 扩散光波 ring ----
    const ringGeo = new THREE.RingGeometry(1, 1.04, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    // ---- 动画循环 ----
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const phase = (t % cycleSec) / cycleSec; // 0..1 周期（loading 约 1s）

      // 粒子自转 + 轻微呼吸
      points.rotation.y = t * 0.12;
      points.rotation.x = Math.sin(t * 0.4) * 0.12;
      const breath = 1 + Math.sin(phase * Math.PI * 2) * 0.05;
      points.scale.setScalar(breath);

      // 光波从中心扩散并淡出
      const ringScale = phase * 4.5;
      ring.scale.set(ringScale, ringScale, 1);
      ringMat.opacity = (1 - phase) * 0.55;

      // Leto 光核脉动
      const pulse = 1 + Math.sin(phase * Math.PI * 2) * 0.07;
      letSprite.scale.set(baseScale * pulse, (baseScale / 2) * pulse, 1);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // ---- resize ----
    const onResize = () => {
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      pointsGeo.dispose();
      pointsMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      letTexture.dispose();
      letMat.dispose();
      renderer.dispose();
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
