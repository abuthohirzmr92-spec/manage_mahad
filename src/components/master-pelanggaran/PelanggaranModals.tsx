import { X } from 'lucide-react';
import type { MasterPelanggaran } from '@/types';

interface AddEditProps {
  initialData?: MasterPelanggaran;
  onClose: () => void;
  onSave: (data: Partial<MasterPelanggaran>) => void;
}

export function AddPelanggaranModal({ onClose, onSave }: AddEditProps) {
  return <PelanggaranFormModal title="Tambah Pelanggaran" onClose={onClose} onSave={onSave} />;
}

export function EditPelanggaranModal({ initialData, onClose, onSave }: AddEditProps) {
  return <PelanggaranFormModal title="Edit Pelanggaran" initialData={initialData} onClose={onClose} onSave={onSave} />;
}

function PelanggaranFormModal({ title, initialData, onClose, onSave }: AddEditProps & { title: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawPoints = Number(fd.get('points'));

    onSave({
      code:          fd.get('code') as string,
      ranahInstansi: fd.get('ranahInstansi') as MasterPelanggaran['ranahInstansi'],
      kategori:      fd.get('kategori') as string,
      name:          fd.get('name') as string,
      severity:      fd.get('severity') as MasterPelanggaran['severity'],
      points:        Math.max(1, isNaN(rawPoints) ? 1 : rawPoints),
      description:   (fd.get('description') as string) || undefined,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background z-10">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Tutup" className="p-1.5 text-muted-foreground hover:bg-muted rounded-md">
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Row 1: Kode */}
            <div className="space-y-1.5">
              <label htmlFor="modal-code" className="text-sm font-medium">Kode</label>
              <input
                id="modal-code"
                required
                name="code"
                defaultValue={initialData?.code}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Contoh: PL-001"
              />
            </div>

            {/* Row 2: Ranah Instansi + Kategori */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="modal-ranah" className="text-sm font-medium">Ranah Instansi</label>
                <select
                  id="modal-ranah"
                  name="ranahInstansi"
                  defaultValue={initialData?.ranahInstansi || 'pesantren'}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="pesantren">Pesantren</option>
                  <option value="madin">Madin</option>
                  <option value="depag">Depag</option>
                  <option value="madqurur">Madqurur</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="modal-kategori" className="text-sm font-medium">Kategori</label>
                <input
                  id="modal-kategori"
                  required
                  name="kategori"
                  defaultValue={initialData?.kategori}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Kelas, Asrama, Ibadah…"
                />
              </div>
            </div>

            {/* Row 3: Nama Pelanggaran */}
            <div className="space-y-1.5">
              <label htmlFor="modal-name" className="text-sm font-medium">Jenis / Nama Pelanggaran</label>
              <input
                id="modal-name"
                required
                name="name"
                defaultValue={initialData?.name}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Contoh: Tidak membawa buku"
              />
            </div>

            {/* Row 4: Tingkat + Poin */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="modal-severity" className="text-sm font-medium">Tingkat Pelanggaran</label>
                <select
                  id="modal-severity"
                  name="severity"
                  defaultValue={initialData?.severity || 'ringan'}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="ringan">Ringan</option>
                  <option value="sedang">Sedang</option>
                  <option value="berat">Berat</option>
                  <option value="sangat_berat">Sangat Berat</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="modal-points" className="text-sm font-medium">Poin</label>
                <input
                  id="modal-points"
                  required
                  type="number"
                  name="points"
                  min="1"
                  defaultValue={initialData?.points || 5}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Row 5: Deskripsi */}
            <div className="space-y-1.5">
              <label htmlFor="modal-description" className="text-sm font-medium">
                Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span>
              </label>
              <textarea
                id="modal-description"
                name="description"
                defaultValue={initialData?.description}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={2}
                placeholder="Penjelasan singkat tentang pelanggaran ini…"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Batal
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Prop `id` tidak digunakan — interface tetap clean
interface DeleteProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePelanggaranDialog({ onClose, onConfirm }: DeleteProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-sm pointer-events-auto p-5 text-center">
          <h2 className="font-bold text-lg mb-2">Hapus Pelanggaran?</h2>
          <p className="text-sm text-muted-foreground mb-6">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Batal</button>
            <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Hapus</button>
          </div>
        </div>
      </div>
    </>
  );
}
