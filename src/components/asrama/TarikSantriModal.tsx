'use client';

import { useState } from 'react';
import { X, Search, UserPlus, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import type { Kamar, Santri } from '@/types';

interface Props {
  santriList: Santri[];
  currentKamar: Kamar;
  onClose: () => void;
  onTarik: (santriId: string, kamarId: string) => void;
}

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('');

export function TarikSantriModal({ santriList, currentKamar, onClose, onTarik }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmSantriId, setConfirmSantriId] = useState<string | null>(null);

  // Filter out santri that are ALREADY in the current kamar
  const availableSantri = santriList.filter((s) => s.kamarId !== currentKamar.id);

  // Search filter
  const filteredSantri = availableSantri.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.kelas.toLowerCase().includes(q)
    );
  });

  const confirmSantri = santriList.find((s) => s.id === confirmSantriId);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tarik-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div>
              <h2 id="tarik-modal-title" className="font-bold text-foreground text-base">
                Tarik Santri ke Kamar {currentKamar.name}
              </h2>
              <p className="text-xs text-muted-foreground">Cari dan pilih santri untuk ditempatkan di kamar ini.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          {/* Confirm State */}
          {confirmSantri ? (
            <div className="p-5 flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Konfirmasi Pemindahan</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  <span className="font-semibold text-foreground">{confirmSantri.name}</span> saat ini sudah ditempatkan di kamar <span className="font-semibold text-foreground">{confirmSantri.kamar}</span>.
                  Apakah Anda yakin ingin memindahkannya ke <span className="font-semibold text-foreground">{currentKamar.name}</span>?
                </p>
              </div>
              <div className="flex gap-3 mt-4 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setConfirmSantriId(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTarik(confirmSantri.id, currentKamar.id);
                    setConfirmSantriId(null);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Pindahkan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="px-5 py-3 border-b border-border bg-muted/20 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIS, atau kelas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredSantri.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    Tidak ada santri yang cocok dengan pencarian.
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {filteredSantri.map((s) => {
                      const isAssigned = !!s.kamarId;
                      return (
                        <li key={s.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{s.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{s.kelas}</span>
                                {isAssigned ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">· di {s.kamar}</span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">· Belum terplotting</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAssigned) {
                                setConfirmSantriId(s.id);
                              } else {
                                onTarik(s.id, currentKamar.id);
                                onClose();
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                              isAssigned
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                          >
                            {isAssigned ? (
                              <>
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                Pindahkan
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                Tarik
                              </>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
