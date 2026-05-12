'use client';

import { useState } from 'react';
import { PageHeader, PageCard } from '@/components/shared/page-header';
import { MapelTabs } from '@/components/mapel/MapelTabs';
import { MapelToolbar } from '@/components/mapel/MapelToolbar';
import { MapelClusterSection } from '@/components/mapel/MapelClusterSection';
import { MapelGridView } from '@/components/mapel/MapelGridView';
import { MapelListView } from '@/components/mapel/MapelListView';
import { 
  AcademicTab, 
  mockMapelFormal, mockMapelDiniyah, mockMapelQuran,
  mockKelasFormal, mockKelasDiniyah, mockKelasQuran,
  formalLevels, diniyahLevels, quranLevels, Subject
} from '@/data/mock-mapel';

export default function MataPelajaranPage() {
  const [activeTab, setActiveTab] = useState<AcademicTab>('formal');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // State for Drag & Drop Reordering
  const [mapelFormal, setMapelFormal] = useState<Subject[]>(mockMapelFormal);
  const [mapelDiniyah, setMapelDiniyah] = useState<Subject[]>(mockMapelDiniyah);
  const [mapelQuran, setMapelQuran] = useState<Subject[]>(mockMapelQuran);
  const [draggedSubject, setDraggedSubject] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSubject(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSubject || draggedSubject === targetId) return;

    const reorder = (data: Subject[], setData: React.Dispatch<React.SetStateAction<Subject[]>>) => {
      const list = [...data];
      const draggedIndex = list.findIndex(s => s.id === draggedSubject);
      const targetIndex = list.findIndex(s => s.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;
      if (list[draggedIndex].level !== list[targetIndex].level) return;

      const [removed] = list.splice(draggedIndex, 1);
      list.splice(targetIndex, 0, removed);
      setData(list);
    };

    if (activeTab === 'formal') reorder(mapelFormal, setMapelFormal);
    if (activeTab === 'diniyah') reorder(mapelDiniyah, setMapelDiniyah);
    if (activeTab === 'quran') reorder(mapelQuran, setMapelQuran);

    setDraggedSubject(null);
  };

  // Helper function to group and sort data based on active tab
  const getGroupedData = () => {
    let data: Subject[] = [];
    let levels: (string | number)[] = [];
    let classData: { level: string | number; name: string }[] = [];

    if (activeTab === 'formal') { data = mapelFormal; levels = formalLevels; classData = mockKelasFormal; }
    if (activeTab === 'diniyah') { data = mapelDiniyah; levels = diniyahLevels; classData = mockKelasDiniyah; }
    if (activeTab === 'quran') { data = mapelQuran; levels = quranLevels; classData = mockKelasQuran; }

    const grouped = levels.map(level => {
      const classNames = classData.filter(c => c.level === level).map(c => c.name).join('; ');
      return {
        level,
        classNames,
        subjects: data.filter(s => s.level === level)
      };
    }).filter(g => g.subjects.length > 0);

    return grouped;
  };

  const groupedData = getGroupedData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Mata Pelajaran"
        description="Pusat kurikulum dan distribusi mata pelajaran lintas instansi"
        action={<MapelToolbar viewMode={viewMode} onViewModeChange={setViewMode} />}
      />

      <MapelTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <PageCard>
        <div className="space-y-12 py-2">
          {groupedData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Belum ada data mata pelajaran untuk instansi ini.
            </div>
          )}

          {groupedData.map((group, index) => (
            <div 
              key={group.level} 
              className="animate-in fade-in slide-in-from-bottom-4" 
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <MapelClusterSection 
                level={group.level} 
                classNames={group.classNames} 
                activeTab={activeTab}
              >
                {viewMode === 'grid' ? (
                  <MapelGridView subjects={group.subjects} />
                ) : (
                  <MapelListView 
                    subjects={group.subjects}
                    draggedSubject={draggedSubject}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                )}
              </MapelClusterSection>
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}
