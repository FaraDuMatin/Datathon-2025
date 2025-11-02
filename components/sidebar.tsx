'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SidebarProps {
  selectedLaw: number;
  onSelectLaw: (lawId: number) => void;
}

// const laws = [
//   { id: 1, name: 'Law 1', description: 'Generally positive impact' },
//   { id: 2, name: 'Law 2', description: 'Mixed/small negative' },
//   { id: 3, name: 'Law 3', description: 'Small positive impact' },
//   { id: 4, name: 'Law 4', description: 'Negative impact' },
//   { id: 5, name: 'Law 5', description: 'Wide variability' },
// ];

const laws: any[] = [];



export function Sidebar({ selectedLaw, onSelectLaw }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-background p-4">
      <h2 className="mb-4 text-lg font-semibold">Laws</h2>
      <div className="space-y-2">
        {laws.map((law) => (
          <Card
            key={law.id}
            className={`cursor-pointer p-3 transition-colors hover:bg-accent ${
              selectedLaw === law.id ? 'border-primary bg-accent' : ''
            }`}
            onClick={() => onSelectLaw(law.id)}
          >
            <div className="font-medium">{law.name}</div>
            <div className="text-xs text-muted-foreground">{law.description}</div>
          </Card>
        ))}
      </div>
    </aside>
  );
}
