import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

export async function GET() {
  const data = query('SELECT * FROM csv_data');
  return json(data.length > 0 ? JSON.parse(data[0].data) : []);
}