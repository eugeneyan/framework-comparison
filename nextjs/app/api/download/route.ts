import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { stringify } from 'csv-stringify/sync';

export async function GET() {
  try {
    const data = db.prepare('SELECT * FROM csv_data').all();
    const csv = stringify(data, { header: true });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=data.csv',
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json({ error: 'Error generating CSV' }, { status: 500 });
  }
}