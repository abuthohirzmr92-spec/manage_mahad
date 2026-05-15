import type { PelanggaranSeverity, SeverityLimits, GlobalTolerancePolicy, JenjangToleranceOverride } from '@/types';

/**
 * Resolve the tolerance limit for a given jenjang + severity.
 * Hierarchy: Jenjang Override → Global Default
 *
 * Returns 0 if tolerance is disabled (all violations count immediately).
 */
export function resolveToleranceLimit(
  jenjang: string,
  severity: PelanggaranSeverity,
  globalPolicy: GlobalTolerancePolicy | null,
  overrides: JenjangToleranceOverride[],
): number {
  // Check jenjang override first (must be active)
  const override = overrides.find((o) => o.jenjang === jenjang && o.isActive);
  if (override) {
    return override.limits[severity];
  }

  // Fall back to global default
  if (globalPolicy && globalPolicy.isActive) {
    return globalPolicy.limits[severity];
  }

  // No tolerance — every violation counts
  return 0;
}

/**
 * Given a santri's jenjang + violation count for a severity,
 * determine whether they are within tolerance or should receive points.
 */
export function isWithinTolerance(
  jenjang: string,
  severity: PelanggaranSeverity,
  violationCount: number,
  globalPolicy: GlobalTolerancePolicy | null,
  overrides: JenjangToleranceOverride[],
): boolean {
  const limit = resolveToleranceLimit(jenjang, severity, globalPolicy, overrides);
  return violationCount <= limit;
}

/** Create default limits object with all severities set to 0. */
export function createEmptyLimits(): SeverityLimits {
  return { ringan: 0, sedang: 0, berat: 0, sangat_berat: 0 };
}
