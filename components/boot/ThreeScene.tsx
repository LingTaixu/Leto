"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** neubrutalism 配色：黄 / 珊瑚粉 / 天蓝硬色，accent 为点缀黄 */
const PARTICLE_COLORS = ["#FFD23F", "#FF6B6B", "#74B9FF"];
const ACCENT = "#FFD23F";

const MODE_CONFIG = {
  splash: { count: 3000, cycleSec: 2 },
  loading: { count: 1500, cycleSec: 1 },
} as const;

export interface ThreeSceneProps {
  mode: "splash" | "loading";
}

/** 生成 "Leto" 文字贴图：黑字 + 黄描边 + 8px 硬阴影（Space Mono 800） */
function createLetoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  // next/font 自托管的 family 名（哈希名）挂在 CSS 变量上，canvas 直接读取
  const monoFamily =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-spacemono")
      .trim() || "monospace";
  ctx.clearRect(0, 0, 512, 256);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 96px ${monoFamily}`;
  // 硬阴影：8px 偏移、零模糊（spec: 阴影从模糊光晕改为硬阴影）
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  ctx.shadowBlur = 0;
  // 黑字（纯黑底上由黄描边勾勒轮廓）
  ctx.fillStyle = "#000000";
  ctx.fillText("Leto", 256, 128);
  // 黄描边，无阴影
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "#FFD23F";
  ctx.lineWidth = 6;
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
      size: 0.05,
      vertexColors: true,
      // 硬朗风格：实心方块粒子（PointsMaterial 默认方形），无发光叠加
      blending: THREE.NormalBlending,
      depthWrite: true,
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
      // 硬朗风格：普通混合，不发光
      blending: THREE.NormalBlending,
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
