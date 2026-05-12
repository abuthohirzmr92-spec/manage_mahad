import { Subject } from '@/data/mock-mapel';
import { MapelCard } from './MapelCard';

interface Props {
  subjects: Subject[];
}

export function MapelGridView({ subjects }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <MapelCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
}
