import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AcademicTab } from '@/data/mock-kelas';

export type NewClassData = { name: string; level: string; waliKelas: string; studentCount: string };

interface AddKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AcademicTab;
  newClassData: NewClassData;
  setNewClassData: (data: NewClassData) => void;
  onSubmit: (e: FormEvent) => void;
}

const inputClass = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors";

export function AddKelasModal({ isOpen, onClose, activeTab, newClassData, setNewClassData, onSubmit }: AddKelasModalProps) {
  if (!isOpen) return null;

  const tabLabel = activeTab === 'formal' ? 'Formal' : activeTab === 'diniyah' ? 'Diniyah' : "Qur'an";
  const isFormalTab = activeTab === 'formal';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Requires tailwindcss-animate plugin */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-kelas-modal-title"
        className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div>
            <h2 id="add-kelas-modal-title" className="text-lg font-bold text-foreground">
              Tambah Kelas {tabLabel}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Isi formulir untuk membuat entitas kelas baru.</p>
          </div>
          <button
            type="button"
            aria-label="Tutup modal"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="kelas-nama" className="text-sm font-semibold text-foreground">Nama Kelas</label>
            <input
              id="kelas-nama"
              required
              type="text"
              placeholder={isFormalTab ? "Contoh: 10 IPA 2" : "Contoh: Tamhid C"}
              className={inputClass}
              value={newClassData.name}
              onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="kelas-level" className="text-sm font-semibold text-foreground">
                {isFormalTab ? 'Tingkat Kelas (Angka)' : 'Level Global'}
              </label>
              <input
                id="kelas-level"
                required
                type={isFormalTab ? 'number' : 'text'}
                placeholder={isFormalTab ? "10" : "Kelas 4 Ibtida'i"}
                className={inputClass}
                value={newClassData.level}
                onChange={e => setNewClassData({ ...newClassData, level: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="kelas-kapasitas" className="text-sm font-semibold text-foreground">Kapasitas Maks.</label>
              <input
                id="kelas-kapasitas"
                required
                type="number"
                min="1"
                placeholder="30"
                className={inputClass}
                value={newClassData.studentCount}
                onChange={e => setNewClassData({ ...newClassData, studentCount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="kelas-wali" className="text-sm font-semibold text-foreground">Wali Kelas (Opsional)</label>
            <input
              id="kelas-wali"
              type="text"
              placeholder="Ketik nama ustadz..."
              className={inputClass}
              value={newClassData.waliKelas}
              onChange={e => setNewClassData({ ...newClassData, waliKelas: e.target.value })}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">
              Simpan Kelas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
