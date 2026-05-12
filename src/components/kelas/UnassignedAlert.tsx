import { AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTab } from '@/data/mock-kelas';

interface UnassignedAlertProps {
  unassignedCount: number;
  assignedCount: number;
  totalSantri: number;
  activeTab: AcademicTab;
  onAssignClick: () => void;
}

export function UnassignedAlert({ unassignedCount, assignedCount, totalSantri, activeTab, onAssignClick }: UnassignedAlertProps) {
  const tabLabel = activeTab === 'formal' ? 'Formal' : activeTab === 'diniyah' ? 'Diniyah' : "Qur'an";

  if (unassignedCount > 0) {
    // Requires tailwindcss-animate plugin
    return (
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in fade-in slide-in-from-top-2"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">
              Perhatian: {unassignedCount} Santri Belum Terplotting
            </h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-0.5">
              Dari {totalSantri} santri aktif, baru {assignedCount} yang masuk kelas {tabLabel}.
            </p>
          </div>
        </div>
        <Button 
          type="button"
          variant="outline" 
          onClick={onAssignClick}
          className="shrink-0 border-amber-500/30 text-amber-700 hover:bg-amber-500/20 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
        >
          Tugaskan Santri
        </Button>
      </div>
    );
  }

  // Requires tailwindcss-animate plugin
  return (
    <div 
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-top-2"
      role="status"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
            Plotting Kelas Sempurna
          </h4>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80 mt-0.5">
            Seluruh {totalSantri} santri telah terdaftar ke dalam kelas {tabLabel}.
          </p>
        </div>
      </div>
    </div>
  );
}
