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

  // Get the column names from the first record
  const columns = Object.keys(records[0]);

  // Create a new table with the CSV column names
  const createTableSQL = `CREATE TABLE IF NOT EXISTS csv_data (
    ${columns.map(col => `${col} TEXT`).join(', ')}
  )`;
  run(createTableSQL);

  // Clear existing data
  run('DELETE FROM csv_data');

  // Insert new data
  const insertSQL = `INSERT INTO csv_data (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
  const stmt = db.prepare(insertSQL);

  const insertMany = db.transaction((records) => {
    for (const record of records) {
      stmt.run(columns.map(col => record[col]));
    }
  });

  insertMany(records);

  return json({ success: true });
}