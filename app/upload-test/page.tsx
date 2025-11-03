'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UploadTestPage() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>CSV Upload Test</CardTitle>
          <CardDescription>
            Test the upload API endpoint - uploads are processed and returned as JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">API Endpoint:</h3>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                POST /api/upload
              </code>
            </div>

            {uploadResult && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Upload Result:</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Filename:</p>
                      <p className="font-medium">{uploadResult.filename}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Row Count:</p>
                      <p className="font-medium">{uploadResult.rowCount}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Columns:</p>
                    <div className="flex gap-2 flex-wrap">
                      {uploadResult.columns?.map((col: string, idx: number) => (
                        <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {uploadResult.preview && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Preview (First 5 rows):</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead className="bg-muted">
                            <tr>
                              {uploadResult.columns?.map((col: string, idx: number) => (
                                <th key={idx} className="border px-2 py-1 text-left">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResult.preview.map((row: any, idx: number) => (
                              <tr key={idx}>
                                {uploadResult.columns?.map((col: string, colIdx: number) => (
                                  <td key={colIdx} className="border px-2 py-1">
                                    {row[col]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Full JSON Response</summary>
                  <pre className="mt-2 bg-background p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(uploadResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Waiting for upload from Python script...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Run your Python script to send the CSV file
                </p>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Python Script Example:</h3>
              <pre className="text-xs bg-background p-3 rounded overflow-auto">
{`import requests

url = "https://master.d2rynnsyq00u45.amplifyapp.com/api/upload"
files = {"file": open("law_7.csv", "rb")}
response = requests.post(url, files=files)

print(response.status_code)
print(response.json())`}
              </pre>
            </div>

            <Button 
              onClick={() => {
                setLoading(true);
                setUploadResult(null);
              }}
              disabled={loading}
            >
              {loading ? 'Waiting for Upload...' : 'Wait for Upload'}
            </Button>

            {loading && (
              <Button 
                variant="outline"
                onClick={() => setLoading(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
