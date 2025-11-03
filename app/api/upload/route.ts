import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data (multipart/form-data)
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file content as text
    const fileContent = await file.text();

    // Parse CSV to JSON
    const parseResult = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'CSV parsing failed', 
          details: parseResult.errors 
        },
        { status: 400 }
      );
    }

    const csvData = parseResult.data as Array<{ company_name: string; score: number }>;
    const columns = parseResult.meta.fields || [];

    return NextResponse.json(
      { 
        message: 'File uploaded and processed successfully',
        filename: file.name,
        columns: columns,
        rowCount: csvData.length,
        data: csvData,
        preview: csvData.slice(0, 5), // First 5 rows for preview
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: String(error) },
      { status: 500 }
    );
  }
}
