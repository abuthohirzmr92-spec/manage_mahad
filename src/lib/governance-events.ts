// ========================================
// GOVERNANCE EVENT BRIDGE
// Mandor-defined integration contract.
// ALL agents MUST use this — no direct cross-domain calls.
// ========================================

import type { PelanggaranSeverity } from '@/types';

// ── Event Types ────────────────────────────────────────────────────────────

export type GovernanceEventType =
  | 'pelanggaran:created'
  | 'pelanggaran:confirmed'
  | 'pelanggaran:rejected'
  | 'hukuman:executed'
  | 'hukuman:completed'
  | 'hukuman:cancelled'
  | 'quest:completed'
  | 'quest:approved'
  | 'quest:rejected'
  | 'tolerance:exceeded'
  | 'sp:escalated'
  | 'reward:granted';

export interface GovernanceEvent {
  type: GovernanceEventType;
  santriId: string;
  santriName: string;
  payload: Record<string, unknown>;
  timestamp: string; // ISO
}

// ── Event Factory (single source of truth for event shape) ──────────────────

export function createGovernanceEvent(
  type: GovernanceEventType,
  santriId: string,
  santriName: string,
  payload: Record<string, unknown> = {},
): GovernanceEvent {
  return {
    type,
    santriId,
    santriName,
    payload,
    timestamp: new Date().toISOString(),
  };
}

// ── Notification Payload Contracts ──────────────────────────────────────────
// Agent 2 (Punishment) produces these.
// Agent 3 (Notification) consumes these — but NEVER modifies them.

export interface PelanggaranCreatedPayload {
  pelanggaranId: string;
  pelanggaranName: string;
  severity: PelanggaranSeverity;
  points: number;
  reportedBy: string;
}

export interface HukumanExecutedPayload {
  hukumanId: string;
  hukumanName: string;
  executorId: string;
  startDate: string;
  endDate: string;
}

export interface HukumanCompletedPayload {
  hukumanId: string;
  hukumanName: string;
}

export interface ToleranceExceededPayload {
  severity: PelanggaranSeverity;
  violationCount: number;
  toleranceLimit: number;
}

export interface SpEscalatedPayload {
  previousSP: string;
  newSP: string;
  totalPoints: number;
}

// ── Reward Payload Contracts ────────────────────────────────────────────────

export interface QuestCompletedPayload {
  questId: string;
  questTitle: string;
  pointsReward: number;
}

export interface RewardGrantedPayload {
  rewardType: string;
  points: number;
  grantedBy: string;
}

// ── Notification Factory ────────────────────────────────────────────────────
// Agent 3 uses this to create notifications from governance events.
// Other agents NEVER call notificationsService directly.

export interface NotificationTemplate {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetRole?: string;
  targetSantriId?: string;
  targetAsramaId?: string;
  targetKelas?: string;
}

/**
 * Maps every governance event type to the appropriate notification template.
 * Agent 3 OWNS this mapping. Other agents just emit events.
 */
export function getNotificationTemplate(
  event: GovernanceEvent,
): NotificationTemplate | null {
  switch (event.type) {
    case 'pelanggaran:created': {
      const p = event.payload as unknown as PelanggaranCreatedPayload;
      return {
        title: 'Pelanggaran Baru Dicatat',
        message: `${event.santriName} tercatat melanggar: ${p.pelanggaranName} (${p.severity}, ${p.points} poin)`,
        type: 'warning',
        targetSantriId: event.santriId,
      };
    }
    case 'pelanggaran:confirmed': {
      const p = event.payload as unknown as PelanggaranCreatedPayload;
      return {
        title: 'Pelanggaran Dikonfirmasi',
        message: `Pelanggaran "${p.pelanggaranName}" untuk ${event.santriName} telah dikonfirmasi.`,
        type: 'warning',
        targetSantriId: event.santriId,
      };
    }
    case 'pelanggaran:rejected': {
      const p = event.payload as unknown as PelanggaranCreatedPayload;
      return {
        title: 'Pelanggaran Ditolak',
        message: `Pelanggaran "${p.pelanggaranName}" untuk ${event.santriName} telah ditolak.`,
        type: 'info',
        targetSantriId: event.santriId,
      };
    }
    case 'hukuman:executed': {
      const p = event.payload as unknown as HukumanExecutedPayload;
      return {
        title: 'Hukuman Mulai Dijalankan',
        message: `${event.santriName} menjalani hukuman: ${p.hukumanName} (${p.startDate} s/d ${p.endDate})`,
        type: 'info',
        targetSantriId: event.santriId,
      };
    }
    case 'hukuman:completed': {
      const p = event.payload as unknown as HukumanCompletedPayload;
      return {
        title: 'Hukuman Selesai',
        message: `${event.santriName} telah menyelesaikan hukuman: ${p.hukumanName}`,
        type: 'success',
        targetSantriId: event.santriId,
      };
    }
    case 'quest:completed': {
      const p = event.payload as unknown as QuestCompletedPayload;
      return {
        title: 'Quest Selesai',
        message: `${event.santriName} menyelesaikan quest "${p.questTitle}" dan mendapat ${p.pointsReward} poin prestasi`,
        type: 'success',
        targetSantriId: event.santriId,
      };
    }
    case 'quest:approved': {
      const p = event.payload as unknown as QuestCompletedPayload;
      return {
        title: 'Quest Disetujui',
        message: `Quest "${p.questTitle}" untuk ${event.santriName} telah disetujui.`,
        type: 'success',
        targetSantriId: event.santriId,
      };
    }
    case 'tolerance:exceeded': {
      const p = event.payload as unknown as ToleranceExceededPayload;
      return {
        title: 'Batas Toleransi Terlampaui',
        message: `${event.santriName} telah melampaui batas ${p.severity} (${p.violationCount}/${p.toleranceLimit})`,
        type: 'error',
        targetSantriId: event.santriId,
      };
    }
    case 'sp:escalated': {
      const p = event.payload as unknown as SpEscalatedPayload;
      return {
        title: 'Status SP Meningkat',
        message: `${event.santriName}: SP naik dari ${p.previousSP} ke ${p.newSP} (total ${p.totalPoints} poin pelanggaran)`,
        type: 'error',
        targetSantriId: event.santriId,
      };
    }
    default:
      return null;
  }
}
