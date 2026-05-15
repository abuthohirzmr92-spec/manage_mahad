// ========================================
// Dual-Layer Progression Display System
// ========================================
// progressionIndex  → internal system key (unchanged)
// tingkatLabel      → user-facing academic label
//
// Relationship logic ALWAYS uses progressionIndex.
// Display/UI ALWAYS uses tingkatLabel.
// ========================================

import type { MasterTingkat } from '@/types';

/**
 * Resolve the human-readable academic label for a given (jenjang, tingkat)
 * combination using a hardcoded fallback map. Prefer getTingkatLabelResolved()
 * when masterTingkat data is available.
 */
export function getTingkatLabel(jenjang: string, tingkat: number): string {
  const key = `${jenjang}::${tingkat}`;
  return LEGACY_LABEL_MAP[key] ?? `Tingkat ${tingkat}`;
}

/**
 * Resolve the human-readable label from masterTingkat data by matching
 * progressionIndex. Returns null when no matching entry exists.
 */
export function getTingkatLabelResolved(
  tingkatList: MasterTingkat[],
  progressionIndex: number,
): string | null {
  const t = tingkatList.find(
    (t) => t.progressionIndex === progressionIndex && t.status === 'active',
  );
  return t?.tingkatLabel ?? null;
}

/**
 * Build a fast lookup Map<progressionIndex, tingkatLabel> from masterTingkat.
 */
export function buildTingkatLabelMap(
  tingkatList: MasterTingkat[],
): Map<number, string> {
  const map = new Map<number, string>();
  for (const t of tingkatList) {
    if (t.status === 'active') map.set(t.progressionIndex, t.tingkatLabel);
  }
  return map;
}

// ── Legacy canonical label mapping (fallback when master data unavailable) ──

const LEGACY_LABEL_MAP: Record<string, string> = {
  // ── Diniyah ──────────────────────────────────────────────────────────
  'Tamhidi::1':         'Tamhidi',

  "Ibtida'i::1":        'Kelas 1',
  "Ibtida'i::2":        'Kelas 2',
  "Ibtida'i::3":        'Kelas 3',

  'Tsanawiyah::1':      '1 Tsanawiyah',
  'Tsanawiyah::2':      '2 Tsanawiyah',
  'Tsanawiyah::3':      '3 Tsanawiyah',

  // ── Formal ───────────────────────────────────────────────────────────
  'MTs::1':             'Kelas 7',
  'MTs::2':             'Kelas 8',
  'MTs::3':             'Kelas 9',

  'MA::1':              'Kelas 10',
  'MA::2':              'Kelas 11',
  'MA::3':              'Kelas 12',

  // ── Quran ────────────────────────────────────────────────────────────
  'Tahsin::1':          'Tahsin Dasar',
  'Tahsin::2':          'Tahsin Lanjutan',

  'Tahfidz::1':         'Tahfidz 1',
  'Tahfidz::2':         'Tahfidz 2',
  'Tahfidz::3':         'Tahfidz 3',
};
