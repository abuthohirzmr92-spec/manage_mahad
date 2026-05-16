// ========================================
// POINT ENGINE — Shared by Agent 2 (Punishment) & Agent 4 (Reward)
// Mandor-defined. DO NOT modify without Mandor approval.
// Both agents call these functions — never touch Santri counters directly.
// ========================================

import type { Santri } from '@/types';

// ── Threshold Config ───────────────────────────────────────────────────────

export const SP_THRESHOLDS = {
  SP1: 30,
  SP2: 50,
  SP3: 80,
} as const;

export const KARAKTER_THRESHOLDS = {
  BAIK: 20,
  PERHATIAN: 50,
  PERINGATAN: 80,
} as const;

// ── Pure Calculation Functions ──────────────────────────────────────────────

/** Determine SP status from total violation points. */
export function calculateStatusSP(
  totalPoinPelanggaran: number,
  currentSP: string,
): string {
  if (totalPoinPelanggaran >= SP_THRESHOLDS.SP3) return 'SP3';
  if (totalPoinPelanggaran >= SP_THRESHOLDS.SP2) return 'SP2';
  if (totalPoinPelanggaran >= SP_THRESHOLDS.SP1) return 'SP1';
  return 'Tidak Ada';
}

/** Determine character status from total violation points. */
export function calculateStatusKarakter(totalPoinPelanggaran: number): string {
  if (totalPoinPelanggaran >= KARAKTER_THRESHOLDS.PERINGATAN) return 'Peringatan';
  if (totalPoinPelanggaran >= KARAKTER_THRESHOLDS.PERHATIAN) return 'Perlu Perhatian';
  return 'Baik';
}

// ── Santri Update Helpers ────────────────────────────────────────────────────
// These return the fields to update on Santri document.
// Agents call these to compute the new values, then update via santriService.

export interface SantriPointUpdate {
  totalPoinPelanggaran: number;
  statusKarakter: string;
  statusSP: string;
}

/**
 * Calculate new Santri point state after adding violation points.
 * Called by Agent 2 when a Pelanggaran is confirmed.
 */
export function computeAfterViolation(
  currentSantri: Pick<Santri, 'totalPoinPelanggaran' | 'statusSP'>,
  newPoints: number,
): SantriPointUpdate {
  const totalPoinPelanggaran = currentSantri.totalPoinPelanggaran + newPoints;
  const currentSP = currentSantri.statusSP ?? 'Tidak Ada';
  return {
    totalPoinPelanggaran,
    statusKarakter: calculateStatusKarakter(totalPoinPelanggaran),
    statusSP: calculateStatusSP(totalPoinPelanggaran, currentSP),
  };
}

/**
 * Calculate new Santri point state after subtracting points (pemutihan / reward).
 * Called by Agent 4 when a Quest is completed or reward is granted.
 */
export function computeAfterRedemption(
  currentSantri: Pick<Santri, 'totalPoinPelanggaran' | 'statusSP'>,
  redeemPoints: number,
): SantriPointUpdate {
  const totalPoinPelanggaran = Math.max(0, currentSantri.totalPoinPelanggaran - redeemPoints);
  const currentSP = currentSantri.statusSP ?? 'Tidak Ada';
  return {
    totalPoinPelanggaran,
    statusKarakter: calculateStatusKarakter(totalPoinPelanggaran),
    statusSP: calculateStatusSP(totalPoinPelanggaran, currentSP),
  };
}

/**
 * Calculate new Santri totalPrestasi after quest completion.
 */
export function computePrestasiUpdate(
  currentPrestasi: number,
  newPrestasiPoints: number,
): number {
  return currentPrestasi + newPrestasiPoints;
}
