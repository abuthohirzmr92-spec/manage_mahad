import { Subject } from '@/data/mock-mapel';
import { MapelCard } from './MapelCard';

interface Props {
  subjects: Subject[];
  teacherSummaryMap?: Record<string, string>;
  onAssign?: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export function MapelGridView({ subjects, teacherSummaryMap, onAssign, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <MapelCard
          key={subject.id}
          subject={subject}
          teacherSummary={teacherSummaryMap?.[subject.id]}
          onAssign={onAssign}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
