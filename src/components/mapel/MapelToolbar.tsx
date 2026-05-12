import { LayoutGrid, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function MapelToolbar({ viewMode, onViewModeChange }: Props) {
  return (
    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
      <div className="flex bg-muted p-1 rounded-lg border border-border shrink-0">
        <button 
          onClick={() => onViewModeChange('grid')}
          title="Tampilan Grid"
          className={`p-1.5 rounded-md transition-all ${
            viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onViewModeChange('list')}
          title="Tampilan List"
          className={`p-1.5 rounded-md transition-all ${
            viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
      <Button className="gap-2 flex-1 sm:flex-none">
        <Plus className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Tambah Mapel</span><span className="sm:hidden">Tambah</span>
      </Button>
    </div>
  );
}
