import { Settings, ShieldAlert } from 'lucide-react';
import type { GlobalTolerancePolicy, SeverityLimits } from '@/types';
import { ALL_SEVERITIES } from '@/types';
import { SEVERITY_COLORS } from '@/components/pelanggaran/constants';
import { cn } from '@/lib/utils';

interface Props {
  policy: GlobalTolerancePolicy;
  onUpdate: (data: { isActive: boolean; limits: SeverityLimits }) => void;
}

export function GlobalPolicyCard({ policy, onUpdate }: Props) {
  const toggleActive = () => onUpdate({ isActive: !policy.isActive, limits: policy.limits });

  const setLimit = (severity: keyof SeverityLimits, value: number) => {
    onUpdate({
      isActive: policy.isActive,
      limits: { ...policy.limits, [severity]: Math.max(0, Math.round(value)) },
    });
  };

  return (
    <div className="border border-border rounded-xl bg-card p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Global Default Policy</h3>
            <p className="text-xs text-muted-foreground">
              Batas toleransi default untuk seluruh jenjang. Override jenjang akan diprioritaskan jika ada.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleActive}
          role="switch"
          aria-checked={policy.isActive}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors',
            policy.isActive ? 'bg-primary' : 'bg-muted-foreground/30',
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              policy.isActive ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {policy.isActive ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
          {ALL_SEVERITIES.map((sev) => (
            <div key={sev} className="space-y-1.5">
              <label className={cn('text-xs font-medium capitalize', SEVERITY_COLORS[sev]?.replace(/bg-|text-|\s.*/g, '') || '')}>
                <span className={cn('inline-block w-2 h-2 rounded-full mr-1.5 align-middle', SEVERITY_COLORS[sev]?.match(/bg-\S+/)?.[0] || 'bg-slate-400')} />
                {sev.replaceAll('_', ' ')}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={policy.limits[sev]}
                  onChange={(e) => setLimit(sev, Number(e.target.value))}
                  className="w-16 px-2.5 py-1.5 text-sm border border-border/60 rounded-lg bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <span className="text-xs text-muted-foreground">x</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg flex gap-3 text-amber-800 dark:text-amber-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-sm">
            Toleransi nonaktif. Setiap pelanggaran akan langsung dikenakan poin tanpa peringatan.
          </p>
        </div>
      )}
    </div>
  );
}
