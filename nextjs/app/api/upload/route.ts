import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { db } from '../../../lib/db';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString();

  try {
    const records = parse(content, { columns: true, skip_empty_lines: true });

    // Create table if it doesn't exist
    const columns = Object.keys(records[0]).map((col) => `${col} TEXT`).join(', ');
    await db.exec(`CREATE TABLE IF NOT EXISTS csv_data (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns})`);

    // Insert data
    const stmt = db.prepare(`INSERT INTO csv_data (${Object.keys(records[0]).join(', ')}) VALUES (${Object.keys(records[0]).map(() => '?').join(', ')})`);
    records.forEach((record: any) => {
      stmt.run(Object.values(record));
    });

    return NextResponse.json({ message: 'File uploaded and processed successfully' });
  } catch (error) {
    console.error('Error processing CSV:', error);
    return NextResponse.json({ error: 'Error processing CSV' }, { status: 500 });
  }
}