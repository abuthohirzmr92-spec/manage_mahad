'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { dashboardStats } from '@/data/mock';

import { 
  AcademicTab, 
  Kelas, 
  GroupedKelas,
  mockKelasFormal, 
  mockKelasDiniyah, 
  mockKelasQuran,
  formalLevelsInitial,
  diniyahLevelsInitial,
  quranLevelsInitial
} from '@/data/mock-kelas';

import { KelasTabs } from '@/components/kelas/KelasTabs';
import { KelasClusterSection } from '@/components/kelas/KelasClusterSection';
import { UnassignedAlert } from '@/components/kelas/UnassignedAlert';
import { AddKelasModal, NewClassData } from '@/components/kelas/AddKelasModal';
import { AssignSantriModal } from '@/components/kelas/AssignSantriModal';

export default function MasterKelasPage() {
  const [activeTab, setActiveTab] = useState<AcademicTab>('formal');
  
  // State for class data
  const [kelasFormal, setKelasFormal] = useState<Kelas[]>(mockKelasFormal);
  const [kelasDiniyah, setKelasDiniyah] = useState<Kelas[]>(mockKelasDiniyah);
  const [kelasQuran, setKelasQuran] = useState<Kelas[]>(mockKelasQuran);

  // State for levels
  const [formalLevels, setFormalLevels] = useState<number[]>(formalLevelsInitial);
  const [diniyahLevels, setDiniyahLevels] = useState<string[]>(diniyahLevelsInitial);
  const [quranLevels, setQuranLevels] = useState<string[]>(quranLevelsInitial);

  // State for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClassData, setNewClassData] = useState<NewClassData>({ name: '', level: '', waliKelas: '', studentCount: '' });

  // State for Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Tab-aware config: maps each tab to its class data and setter
  const tabConfig = {
    formal:  { data: kelasFormal,  setData: setKelasFormal },
    diniyah: { data: kelasDiniyah, setData: setKelasDiniyah },
    quran:   { data: kelasQuran,   setData: setKelasQuran },
  };

  const handleAddClass = (e: FormEvent) => {
    e.preventDefault();

    const parsedLevel = activeTab === 'formal'
      ? parseInt(newClassData.level) || 7
      : newClassData.level;

    const newClass: Kelas = {
      id: `kelas-${Date.now()}`,
      name: newClassData.name,
      level: parsedLevel,
      waliKelas: newClassData.waliKelas || 'Belum Diatur',
      studentCount: parseInt(newClassData.studentCount) || 0,
      status: 'aktif',
    };

    const { data, setData } = tabConfig[activeTab];
    setData([...data, newClass]);

    // Level update — explicit per tab for clarity and type safety
    if (activeTab === 'formal') {
      const lvl = parsedLevel as number;
      if (!formalLevels.includes(lvl)) setFormalLevels([...formalLevels, lvl].sort((a, b) => a - b));
    } else if (activeTab === 'diniyah') {
      const lvl = parsedLevel as string;
      if (!diniyahLevels.includes(lvl)) setDiniyahLevels([...diniyahLevels, lvl]);
    } else {
      const lvl = parsedLevel as string;
      if (!quranLevels.includes(lvl)) setQuranLevels([...quranLevels, lvl]);
    }

    setIsAddModalOpen(false);
    setNewClassData({ name: '', level: '', waliKelas: '', studentCount: '' });
  };

  // Derive active data and levels for the current tab
  const { data: activeData } = tabConfig[activeTab];
  const activeLevels: (string | number)[] =
    activeTab === 'formal'  ? formalLevels  :
    activeTab === 'diniyah' ? diniyahLevels :
    quranLevels;

  const groupedData: GroupedKelas[] = activeLevels
    .map(level => ({ level, classes: activeData.filter(c => c.level === level) }))
    .filter(g => g.classes.length > 0);

  const totalSantri     = dashboardStats.santriAktif;
  const assignedCount   = activeData.reduce((sum, cls) => sum + cls.studentCount, 0);
  const unassignedCount = Math.max(0, totalSantri - assignedCount);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manajemen Master Kelas" 
        description="Kelola pengelompokan kelas, plotting wali kelas, dan kuota santri"
        action={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Buat Kelas Baru
          </Button>
        }
      />

      <KelasTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <UnassignedAlert 
        unassignedCount={unassignedCount} 
        assignedCount={assignedCount} 
        totalSantri={totalSantri} 
        activeTab={activeTab} 
        onAssignClick={() => setIsAssignModalOpen(true)} 
      />

      <PageCard>
        <div className="space-y-12 py-2">
          <KelasClusterSection groupedData={groupedData} activeTab={activeTab} />
        </div>
      </PageCard>

      <AddKelasModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        activeTab={activeTab} 
        newClassData={newClassData} 
        setNewClassData={setNewClassData} 
        onSubmit={handleAddClass} 
      />

      <AssignSantriModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        activeTab={activeTab} 
        unassignedCount={unassignedCount} 
        groupedData={groupedData} 
      />
    </div>
  );
}
