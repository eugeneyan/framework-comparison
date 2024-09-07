import { json } from '@sveltejs/kit';
import { run, db } from '$lib/db';
import { parse } from 'csv-parse/sync';

export async function POST({ request }) {
  const data = await request.formData();
  const file = data.get('csv') as File;
  
  if (!file) {
    return json({ error: 'No file uploaded' }, { status: 400 });
  }

  const content = await file.text();
  const records = parse(content, { columns: true });

  if (records.length === 0) {
    return json({ error: 'Empty CSV file' }, { status: 400 });
  }

  run('DELETE FROM csv_data');
  run('INSERT INTO csv_data (data) VALUES (?)', [JSON.stringify(records)]);

  return json({ success: true });
}