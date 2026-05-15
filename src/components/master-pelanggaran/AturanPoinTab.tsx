import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import type { MasterPelanggaran, PelanggaranSeverity, SeverityLimits, GlobalTolerancePolicy, JenjangToleranceOverride } from '@/types';
import { SEVERITY_COLORS } from '@/components/pelanggaran/constants';
import { resolveToleranceLimit } from '@/lib/policy-engine';
import { GlobalPolicyCard } from './GlobalPolicyCard';
import { JenjangOverrideCard } from './JenjangOverrideCard';
import { JenjangOverrideModal } from './JenjangOverrideModal';
import { cn } from '@/lib/utils';

interface Props {
  masterData: MasterPelanggaran[];
  globalPolicy: GlobalTolerancePolicy;
  overrides: JenjangToleranceOverride[];
  onUpdateGlobal: (data: { isActive: boolean; limits: SeverityLimits }) => void;
  onCreateOverride: (data: { jenjang: string; isActive: boolean; limits: SeverityLimits }) => void;
  onUpdateOverride: (id: string, data: Partial<JenjangToleranceOverride>) => void;
  onDeleteOverride: (id: string) => void;
}

export function AturanPoinTab({
  masterData,
  globalPolicy,
  overrides,
  onUpdateGlobal,
  onCreateOverride,
  onUpdateOverride,
  onDeleteOverride,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<JenjangToleranceOverride | null>(null);

  const existingJenjang = overrides
    .filter((o) => editingOverride === null || o.id !== editingOverride.id)
    .map((o) => o.jenjang);

  const handleSave = (data: { jenjang: string; isActive: boolean; limits: SeverityLimits }) => {
    if (editingOverride) {
      onUpdateOverride(editingOverride.id, data);
      setEditingOverride(null);
    } else {
      onCreateOverride(data);
      setModalOpen(false);
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    onUpdateOverride(id, { isActive } as Partial<JenjangToleranceOverride>);
  };

  // ── Preview table: show all master items with resolved tolerance ──────────
  // Group by (jenjang, severity) to show resolved limits
  const semuaJenjang = overrides.map((o) => o.jenjang);
  const previewGroups = new Map<string, { jenjang: string; severity: PelanggaranSeverity; limit: number; items: MasterPelanggaran[] }>();

  for (const mp of masterData) {
    // Find jenjang that relates to this pelanggaran (simplified: use ranahInstansi)
    const relatedJenjang = mp.ranahInstansi === 'depag' ? ['MTs', 'MA'] :
      mp.ranahInstansi === 'madin' ? ["Ibtida'i", 'Tsanawiyah', 'Tamhidi'] :
      mp.ranahInstansi === 'madqurur' ? ['Tahsin', 'Tahfidz'] :
      ['MTs', 'MA', "Ibtida'i", 'Tsanawiyah', 'Tamhidi', 'Tahsin', 'Tahfidz'];

    for (const j of relatedJenjang) {
      const limit = resolveToleranceLimit(j, mp.severity, globalPolicy, overrides);
      const key = `${j}|${mp.severity}`;
      if (!previewGroups.has(key)) {
        previewGroups.set(key, { jenjang: j, severity: mp.severity, limit, items: [] });
      }
      previewGroups.get(key)!.items.push(mp);
    }
  }

  const sortedPreview = [...previewGroups.values()].sort((a, b) => {
    if (a.jenjang !== b.jenjang) return a.jenjang.localeCompare(b.jenjang);
    return a.severity.localeCompare(b.severity);
  });

  return (
    <div className="space-y-6">
      {/* Section 1: Global Default Policy */}
      <GlobalPolicyCard policy={globalPolicy} onUpdate={onUpdateGlobal} />

      {/* Section 2: Jenjang Override Policy */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Jenjang Override Policy</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Override opsional per jenjang — ambil alih global default untuk jenjang tertentu.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingOverride(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Override
          </button>
        </div>

        {overrides.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
            <p className="text-sm text-muted-foreground">Belum ada override jenjang.</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Semua jenjang mengikuti global default. Tambahkan override untuk kebijakan khusus per jenjang.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {overrides.map((ov) => (
              <JenjangOverrideCard
                key={ov.id}
                override={ov}
                onEdit={(data) => { setEditingOverride(data); setModalOpen(true); }}
                onDelete={onDeleteOverride}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview: Resolved tolerance per jenjang + severity */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Preview Resolusi Kebijakan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Menampilkan batas toleransi yang berlaku berdasarkan jenjang dan tingkat keparahan
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Info aria-hidden="true" className="w-4 h-4 text-primary" />
            Override jenjang diprioritaskan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Jenjang</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Tingkat</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Sumber Aturan</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Batas Toleransi</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Pelanggaran Terkait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedPreview.map((group) => {
                const isOverride = overrides.some((o) => o.jenjang === group.jenjang && o.isActive);
                const isGlobal = globalPolicy.isActive && !isOverride;
                const limitLabel = group.limit > 0 ? `${group.limit}x pelanggaran` : 'Tanpa Toleransi';

                return (
                  <tr key={`${group.jenjang}-${group.severity}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{group.jenjang}</td>
                    <td className="px-5 py-3">
                      <span className={cn('capitalize text-xs font-medium px-2 py-0.5 rounded-full', SEVERITY_COLORS[group.severity])}>
                        {group.severity.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isOverride ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Jenjang Override
                        </span>
                      ) : isGlobal ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Global Default
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('font-semibold', isOverride ? 'text-primary' : group.limit > 0 ? 'text-foreground' : 'text-amber-600')}>
                        {limitLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {group.items.map((mp) => mp.name).join(', ')}
                    </td>
                  </tr>
                );
              })}
              {sortedPreview.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    Belum ada data pelanggaran untuk ditampilkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <JenjangOverrideModal
        open={modalOpen}
        override={editingOverride}
        existingJenjang={existingJenjang}
        onClose={() => { setModalOpen(false); setEditingOverride(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
