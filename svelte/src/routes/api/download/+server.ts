import { query } from '$lib/db';
import { stringify } from 'csv-stringify/sync';

export async function GET() {
  const data = query('SELECT data FROM csv_data');
  const records = data.length > 0 ? JSON.parse(data[0].data) : [];
  const csv = stringify(records, { header: true });

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="table_data.csv"'
    }
  });
}