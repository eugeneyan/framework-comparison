import { query } from '$lib/db';
import { stringify } from 'csv-stringify/sync';

export async function GET() {
  try {
    const data = query('SELECT * FROM csv_data');
    const csv = stringify(data, { header: true });

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="table_data.csv"'
      }
    });
  } catch (error) {
    // If the table doesn't exist yet, return an empty CSV
    if (error.message.includes('no such table')) {
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