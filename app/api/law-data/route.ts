import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lawId = searchParams.get('law');

  if (!lawId || !['1', '2', '3', '4', '5'].includes(lawId)) {
    return NextResponse.json({ error: 'Invalid law ID. Must be 1-5.' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', `law_${lawId}.csv`);
    const csvData = fs.readFileSync(filePath, 'utf-8');

    const parsed = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    return NextResponse.json({
      lawId,
      data: parsed.data,
      meta: {
        totalCompanies: parsed.data.length,
      },
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return NextResponse.json({ error: 'Failed to read CSV file' }, { status: 500 });
  }
}
