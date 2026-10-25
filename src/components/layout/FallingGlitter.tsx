'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthContext';

/**
 * Falling glitter — tiny gold pixels, diamonds and four-point sparks drifting down the page
 * in three depth layers. One fixed canvas, pre-rendered sprites, no per-frame filters.
 *
 *  - pauses when the tab is hidden, and fades out while a game is running (html[data-playing])
 *  - scrolling gives the glitter a little extra downward wind
 *  - respects prefers-reduced-motion and the "animation intensity" setting
 */

type Shape = 'pixel' | 'diamond' | 'spark';

interface Particle {
  x: number;
  y: number;
  size: number;      // css px
  speed: number;     // css px / second
  sway: number;      // horizontal amplitude, px
  swaySpeed: number; // radians / second
  phase: number;
  rot: number;
  rotSpeed: number;
  alpha: number;
  twinkle: number;   // 0 = steady
  sprite: HTMLCanvasElement;
}

const PALETTE = ['#f3dba4', '#e9cb8b', '#fff4dc', '#f28ba8', '#b7a0f5'];
const SHAPES: Shape[] = ['pixel', 'diamond', 'spark', 'diamond', 'pixel'];
const SPRITE = 48;

function makeSprite(shape: Shape, color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE;
  const g = c.getContext('2d')!;
  const m = SPRITE / 2;

  // soft halo
  const halo = g.createRadialGradient(m, m, 0, m, m, m);
  halo.addColorStop(0, color + 'aa');
  halo.addColorStop(0.35, color + '33');
  halo.addColorStop(1, color + '00');
  g.fillStyle = halo;
  g.fillRect(0, 0, SPRITE, SPRITE);

  g.fillStyle = color;
  g.translate(m, m);
  if (shape === 'pixel') {
    g.fillRect(-5, -5, 10, 10);
  } else if (shape === 'diamond') {
    g.rotate(Math.PI / 4);
    g.fillRect(-5.5, -5.5, 11, 11);
  } else {
    // four-point spark
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 14 : 3;
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
  }
  return c;
}

export function FallingGlitter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { preferences } = useAuth();
  const intensity = preferences?.animation_intensity ?? 'full';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || intensity === 'minimal') return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const sprites: HTMLCanvasElement[] = [];
    PALETTE.forEach((color, ci) => {
      sprites.push(makeSprite(SHAPES[ci % SHAPES.length], color));
      sprites.push(makeSprite(SHAPES[(ci + 2) % SHAPES.length], color));
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let timer = 0;
    let last = performance.now();
    let wind = 0; // extra downward speed from scrolling
    let lastScrollY = window.scrollY;

    const spawn = (initial: boolean): Particle => {
      const depth = Math.random(); // 0 far … 1 near
      const size = 3 + depth * 9;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -size * 2,
        size,
        speed: 14 + depth * 46,
        sway: 6 + depth * 22,
        swaySpeed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * (0.6 + depth),
        alpha: 0.22 + depth * 0.6,
        twinkle: Math.random() < 0.4 ? 1.2 + Math.random() * 2 : 0,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
      };
    };

    const targetCount = () => {
      let n = Math.round((w * h) / 24000);
      n = Math.max(22, Math.min(64, n));
      if (intensity === 'reduced') n = Math.round(n * 0.45);
      if (saveData) n = Math.round(n * 0.5);
      return n;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = targetCount();
      if (particles.length > n) particles.length = n;
      while (particles.length < n) particles.push(spawn(true));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const sx = p.x + Math.sin(t * p.swaySpeed + p.phase) * p.sway;
        let a = p.alpha;
        if (p.twinkle) a *= 0.55 + 0.45 * Math.sin(t * p.twinkle + p.phase);
        ctx.globalAlpha = a;
        ctx.save();
        ctx.translate(sx, p.y);
        ctx.rotate(p.rot);
        const s = p.size * (SPRITE / 14);
        ctx.drawImage(p.sprite, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const isPaused = () => document.hidden || document.documentElement.dataset.playing === 'true';

    const frame = (now: number) => {
      if (isPaused()) {
        // idle cheaply; resume when the tab or the game state changes
        timer = window.setTimeout(() => {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }, 400);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      wind *= Math.pow(0.04, dt); // decay
      const t = now / 1000;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (p.speed + wind * (0.4 + p.size / 12)) * dt;
        p.rot += p.rotSpeed * dt;
        if (p.y > h + p.size * 2) particles[i] = spawn(false);
      }
      draw(t);
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      wind = Math.max(-120, Math.min(260, wind + dy * 1.6));
    };

    resize();
    window.addEventListener('resize', resize);

    if (reduced) {
      // a still, tasteful scatter — no motion at all
      draw(0);
      return () => window.removeEventListener('resize', resize);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [intensity]);

  if (intensity === 'minimal') return null;
  return <canvas ref={canvasRef} className="glitter" aria-hidden="true" />;
}
