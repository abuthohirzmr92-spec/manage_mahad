import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTab, GroupedKelas } from '@/data/mock-kelas';

interface AssignSantriModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AcademicTab;
  unassignedCount: number;
  groupedData: GroupedKelas[];
}

export function AssignSantriModal({ isOpen, onClose, activeTab, unassignedCount, groupedData }: AssignSantriModalProps) {
  if (!isOpen) return null;

  const tabLabel = activeTab === 'formal' ? 'Formal' : activeTab === 'diniyah' ? 'Diniyah' : "Qur'an";
  const selectClass = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors";

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-santri-modal-title"
    >
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div>
            <h2 id="assign-santri-modal-title" className="text-lg font-bold text-foreground">Plotting Santri Belum Terplotting</h2>
            <p className="text-xs text-muted-foreground mt-1">Simulasi alur distribusi santri ke dalam kelas {tabLabel}.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Daftar Santri (Dummy)</label>
            <div className="border border-border rounded-lg max-h-[180px] overflow-y-auto divide-y divide-border bg-background">
              {Array.from({ length: Math.min(5, unassignedCount) }).map((_, i) => (
                <div key={`dummy-santri-${i}`} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-border" defaultChecked />
                    <div>
                      <p className="text-sm font-medium">Santri Dummy {i + 1}</p>
                      <p className="text-xs text-muted-foreground">NIS: 100{i} • Angkatan 2024</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md font-medium">Belum Plotting</span>
                </div>
              ))}
              <div className="p-3 text-center text-xs text-muted-foreground bg-muted/10">
                + {unassignedCount - 5 > 0 ? unassignedCount - 5 : 0} santri lainnya...
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kelas-tujuan" className="text-sm font-semibold text-foreground">Pilih Kelas Tujuan</label>
            <select 
              id="kelas-tujuan" 
              className={selectClass}
            >
              <option value="">-- Pilih Kelas --</option>
              {groupedData.flatMap(g => g.classes).map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.studentCount} santri saat ini)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-5 border-t border-border bg-muted/10 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            *Tampilan frontend sementara
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={onClose}>
              Tugaskan Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
