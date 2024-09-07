import { json } from '@sveltejs/kit';
import { run, db } from '$lib/db';
import { parse } from 'csv-parse/sync';

export async function POST({ request }) {
  const file = await request.formData().then(data => data.get('csv') as File);
  
  if (!file) return json({ error: 'No file uploaded' }, { status: 400 });

  const records = parse(await file.text(), { columns: true });
  if (records.length === 0) return json({ error: 'Empty CSV file' }, { status: 400 });

  const columns = Object.keys(records[0]);
  run(`CREATE TABLE IF NOT EXISTS csv_data (${columns.map(col => `${col} TEXT`).join(', ')})`);
  run('DELETE FROM csv_data');

  const insertSQL = `INSERT INTO csv_data (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
  const stmt = db.prepare(insertSQL);

  db.transaction((records: any[]) => {
    for (const record of records) {
      stmt.run(columns.map(col => record[col]));
    }
  })(records);

  return json({ success: true });
}