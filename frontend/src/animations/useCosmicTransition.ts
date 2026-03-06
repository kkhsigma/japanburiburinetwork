// ─── Cosmic Transition Phase Timing ─────────────────────
// Each phase has a start/end time in seconds from Canvas mount.
// Phases overlap for smooth blending.

export const PHASE = {
  void:          { start: 0.15, end: 1.2 },
  singularity:   { start: 0.7,  end: 1.8 },
  accretion:     { start: 1.4,  end: 2.5 },
  formation:     { start: 2.1,  end: 3.5 },
  stabilization: { start: 3.2,  end: 4.0 },
  approach:      { start: 3.6,  end: 4.5 },
  ready:         { start: 4.5,  end: Infinity },
} as const;

export type CosmicPhase = keyof typeof PHASE;

/** Returns 0→1 progress for a given phase at elapsed time t */
export function progress(t: number, phase: CosmicPhase): number {
  const { start, end } = PHASE[phase];
  if (t <= start) return 0;
  if (t >= end) return 1;
  return (t - start) / (end - start);
}

// ─── Easing helpers ─────────────────────────────────────

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(t: number): number {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(Math.max(v, min), max);
}
