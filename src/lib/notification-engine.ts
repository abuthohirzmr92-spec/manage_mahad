// ========================================
// NOTIFICATION ENGINE — Dispatch & Routing
// Agent 3: Consumes governance events,
// converts to Firestore notifications,
// and determines user eligibility.
// ========================================

import {
  getNotificationTemplate,
  type GovernanceEvent,
} from '@/lib/governance-events';
import type { FirestoreNotification } from '@/types/firestore';
import type { UserRole } from '@/types';

export const notificationEngine = {
  /**
   * Takes a governance event and returns a FirestoreNotification input
   * (without createdAt — the service layer adds the Timestamp).
   * Returns null if the event type has no matching template.
   */
  dispatchFromEvent(
    event: GovernanceEvent,
  ): Omit<FirestoreNotification, 'createdAt'> | null {
    const template = getNotificationTemplate(event);
    if (!template) return null;

    return {
      title: template.title,
      message: template.message,
      type: template.type,
      read: false,
      targetRole: template.targetRole as UserRole | undefined,
      targetSantriId: template.targetSantriId,
      targetAsramaId: template.targetAsramaId,
      targetKelas: template.targetKelas,
      targetAngkatan: undefined,
    };
  },

  /**
   * Determines whether a given user should receive this notification
   * based on their role and optional santri ID.
   */
  shouldNotifyUser(
    event: GovernanceEvent,
    userRole: UserRole,
    userSantriId?: string,
  ): boolean {
    const template = getNotificationTemplate(event);
    if (!template) return false;

    // Admin and kepala_kesiswaan see everything
    if (userRole === 'admin' || userRole === 'kepala_kesiswaan') return true;

    // Musyrif sees all notifications (they manage all santri)
    if (userRole === 'musyrif') return true;

    // Wali only sees notifications about their child
    if (userRole === 'wali') {
      if (!userSantriId) return false;
      return template.targetSantriId === userSantriId;
    }

    // Santri only sees notifications about themselves
    if (userRole === 'santri') {
      return template.targetSantriId === userSantriId;
    }

    // Guru, staff, wali_kelas — see all relevant notifications
    return true;
  },
};
