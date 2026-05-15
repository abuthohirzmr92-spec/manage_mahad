// ========================================
// Centralized Academic Structure Lookup
// ========================================
// All academic hierarchy queries derive from MasterJenjang + MasterTingkat.
// No hardcoded jenjang/tingkat mappings — single source of truth.
// ========================================

import type { MasterJenjang, MasterTingkat, Instansi } from '@/types';
import { INSTANSI_ORDER } from '@/types';

/** Active jenjang names ordered by instansi → progression for a given instansi. */
export function getJenjangByInstansi(
  jenjangList: MasterJenjang[],
  instansi: Instansi,
): string[] {
  return jenjangList
    .filter((j) => j.instansi === instansi && j.status === 'active')
    .sort((a, b) => a.progressionIndexes[0] - b.progressionIndexes[0])
    .map((j) => j.namaJenjang);
}

/** All jenjang names across all instansi (ordered by INSTANSI_ORDER). */
export function getAllJenjangNames(jenjangList: MasterJenjang[]): string[] {
  const active = jenjangList.filter((j) => j.status === 'active');
  return INSTANSI_ORDER.flatMap((instansi) =>
    active
      .filter((j) => j.instansi === instansi)
      .sort((a, b) => a.progressionIndexes[0] - b.progressionIndexes[0])
      .map((j) => j.namaJenjang),
  );
}

/** Map a jenjang name back to its instansi. */
export function jenjangToInstansi(
  jenjangList: MasterJenjang[],
  namaJenjang: string,
): Instansi | null {
  const found = jenjangList.find(
    (j) => j.namaJenjang === namaJenjang && j.status === 'active',
  );
  return found?.instansi ?? null;
}

/** Active tingkat entries for a given jenjang (ordered by progressionIndex). */
export function getTingkatByJenjang(
  tingkatList: MasterTingkat[],
  jenjang: MasterJenjang | null,
): MasterTingkat[] {
  if (!jenjang) return [];
  const set = new Set(jenjang.progressionIndexes);
  return tingkatList
    .filter((t) => set.has(t.progressionIndex) && t.status === 'active')
    .sort((a, b) => a.progressionIndex - b.progressionIndex);
}

/** Get the tingkatLabel for a progressionIndex from master data. */
export function getTingkatLabelFromMaster(
  tingkatList: MasterTingkat[],
  progressionIndex: number,
): string | null {
  const t = tingkatList.find(
    (t) => t.progressionIndex === progressionIndex && t.status === 'active',
  );
  return t?.tingkatLabel ?? null;
}

/** Build a Map<progressionIndex, tingkatLabel> for fast lookup. */
export function buildTingkatLabelMap(
  tingkatList: MasterTingkat[],
): Map<number, string> {
  const map = new Map<number, string>();
  for (const t of tingkatList) {
    if (t.status === 'active') map.set(t.progressionIndex, t.tingkatLabel);
  }
  return map;
}

/** Build instansi → ordered jenjang names lookup. */
export function buildInstansiJenjangMap(
  jenjangList: MasterJenjang[],
): Record<Instansi, string[]> {
  const map: Record<Instansi, string[]> = { madin: [], madqur: [], depag: [] };
  for (const instansi of INSTANSI_ORDER) {
    map[instansi] = getJenjangByInstansi(jenjangList, instansi);
  }
  return map;
}
