'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  const [selectedLaw, setSelectedLaw] = useState(1);
  const [data, setData] = useState<Array<{ company_name: string; score: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/law-data?law=${selectedLaw}`);
        const result = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedLaw]);

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedLaw={selectedLaw} onSelectLaw={setSelectedLaw} />
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <Dashboard lawId={selectedLaw} data={data} />
          )}
        </main>
      </div>
    </div>
  );
}
