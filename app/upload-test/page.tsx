'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UploadTestPage() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [listening, setListening] = useState(false);

  // Poll for new uploads (simple approach)
  useEffect(() => {
    if (!listening) return;

    const interval = setInterval(async () => {
      // In a real implementation, you'd use WebSockets or Server-Sent Events
      // For now, this is just a placeholder
    }, 2000);

    return () => clearInterval(interval);
  }, [listening]);

  // For demo: manually trigger with data from Python response
  const simulateUpload = () => {
    // This will be populated when Python sends data
    // For now, just toggle listening state
    setListening(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      {!uploadResult ? (
        <Button 
          onClick={simulateUpload}
          size="lg"
          className="text-lg px-8 py-6"
        >
          {listening ? 'Waiting for Upload...' : 'Start Listening for Uploads'}
        </Button>
      ) : (
        <Card className="w-full max-w-4xl border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="text-2xl">Upload Received!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Filename</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {uploadResult.filename}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold">Row Count</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {uploadResult.rowCount}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-3">Columns</p>
              <div className="flex gap-2 flex-wrap">
                {uploadResult.columns?.map((col: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-semibold mb-3">
                Preview (First 5 rows)
              </p>
              <div className="overflow-x-auto rounded-lg border-2 border-blue-300">
                <table className="w-full">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      {uploadResult.columns?.map((col: string, idx: number) => (
                        <th key={idx} className="px-4 py-3 text-left font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {uploadResult.preview?.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-blue-200">
                        {uploadResult.columns?.map((col: string, colIdx: number) => (
                          <td key={colIdx} className="px-4 py-3">
                            {typeof row[col] === 'number' 
                              ? row[col].toFixed(4) 
                              : row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button 
              onClick={() => {
                setUploadResult(null);
                setListening(false);
              }}
              variant="outline"
              className="w-full"
            >
              Clear and Wait for New Upload
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
