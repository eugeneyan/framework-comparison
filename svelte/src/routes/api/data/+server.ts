import { json } from '@sveltejs/kit';
import { query } from '$lib/db';

export async function GET() {
  try {
    const data = query('SELECT * FROM csv_data');
    return json(data);
  } catch (error) {
    // If the table doesn't exist yet, return an empty array
    if (error.message.includes('no such table')) {
      return json([]);
    }
    throw error;
  }
}