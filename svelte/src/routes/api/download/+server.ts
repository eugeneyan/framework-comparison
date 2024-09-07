import { query } from '$lib/db';
import { stringify } from 'csv-stringify/sync';

export async function GET() {
  try {
    const csv = stringify(query('SELECT * FROM csv_data'), { header: true });
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="table_data.csv"'
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('no such table')) {
      return new Response('', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="table_data.csv"'
        }
      });
    }
    throw error;
  }
}