'use client';

import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

// Deterministic PRNG for stable star positions across SSR/CSR
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(count: number): Star[] {
  // Fixed seed so SSR and CSR produce identical markup (no hydration mismatch)
  const rng = mulberry32(20260804);
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
    size: rng() * 2 + 0.5,
    delay: rng() * 3,
    duration: rng() * 3 + 2,
    opacity: rng() * 0.5 + 0.3,
  }));
}

export function Starfield({ count = 80 }: { count?: number }) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {stars.map((s) => (
        <div
          key={s.id}
          className="starfield-dot absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: `oklch(0.96 0.02 80 / ${s.opacity})`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: `0 0 ${s.size * 2}px oklch(0.96 0.02 80 / ${s.opacity * 0.6})`,
          }}
        />
      ))}
    </div>
  );
}
