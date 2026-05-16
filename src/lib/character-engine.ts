// ========================================
// CHARACTER ENGINE — Agent 4 (Reward)
// Quest approval rules, pemutihan logic, character scoring
// ========================================

import type { Santri } from '@/types';

// ── Constants ──────────────────────────────────────────────────────────────

export const CHARACTER_TIERS = {
  BAIK: 'Baik',
  PERLU_PERHATIAN: 'Perlu Perhatian',
  PERINGATAN: 'Peringatan',
} as const;

// ── Pemutihan Eligibility ──────────────────────────────────────────────────

/**
 * A santri can only redeem points (pemutihan) if they have active violations.
 * Returns true when totalPoinPelanggaran > 0.
 */
export function canRedeem(
  santri: Pick<Santri, 'totalPoinPelanggaran'>,
): boolean {
  return santri.totalPoinPelanggaran > 0;
}

// ── Character Progress ─────────────────────────────────────────────────────

/**
 * Calculate new prestasi total after completing a quest, and derive an
 * achievement tier from the cumulative prestasi score.
 */
export function computeCharacterProgress(
  currentPrestasi: number,
  newPoints: number,
): { totalPrestasi: number; tier: string } {
  const totalPrestasi = currentPrestasi + newPoints;
  let tier: string;
  if (totalPrestasi >= 100) {
    tier = 'Juara';
  } else if (totalPrestasi >= 50) {
    tier = 'Madya';
  } else if (totalPrestasi >= 20) {
    tier = 'Pemula';
  } else {
    tier = 'Baru';
  }
  return { totalPrestasi, tier };
}

// ── Quest Approval Rules ───────────────────────────────────────────────────

/**
 * Returns true when the creator's role allows auto-approving a quest.
 * Admin and Kepala Kesiswaan are trusted to create quests that go live
 * immediately. All other roles require manager approval.
 */
export function shouldAutoApprove(creatorRole: string): boolean {
  return ['admin', 'kepala_kesiswaan'].includes(creatorRole);
}

// ── Quest Validation ───────────────────────────────────────────────────────

/**
 * Validates quest creation input. Returns an error message string when
 * validation fails, or null when the input is valid.
 */
export function validateQuestCreation(data: {
  title: string;
  pointsReward: number;
  deadline: string;
}): string | null {
  if (!data.title || data.title.trim().length === 0) {
    return 'Judul quest tidak boleh kosong.';
  }
  if (!data.pointsReward || data.pointsReward <= 0) {
    return 'Poin reward harus lebih dari 0.';
  }
  if (!data.deadline) {
    return 'Deadline harus diisi.';
  }
  const deadlineDate = new Date(data.deadline);
  if (isNaN(deadlineDate.getTime())) {
    return 'Format deadline tidak valid.';
  }
  if (deadlineDate <= new Date()) {
    return 'Deadline harus di masa depan.';
  }
  return null;
}
