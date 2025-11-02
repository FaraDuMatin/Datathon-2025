'use client';

import { Scale } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6" />
          <h1 className="text-xl font-bold">Law Impact Analyzer</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">S&P 500 Companies</span>
        </div>
      </div>
    </nav>
  );
}
