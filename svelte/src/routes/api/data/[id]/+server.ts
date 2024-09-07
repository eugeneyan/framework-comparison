import { json } from '@sveltejs/kit';
import { query, run } from '$lib/db';

export async function PUT({ params, request }) {
  const { id } = params;
  const updatedRow = await request.json();
  
  const data = query('SELECT data FROM csv_data');
  if (data.length === 0) {
    return json({ error: 'No data found' }, { status: 404 });
  }

  const records = JSON.parse(data[0].data);
  const index = records.findIndex((row: any) => row.id.toString() === id);
  
  if (index === -1) {
    return json({ error: 'Row not found' }, { status: 404 });
  }

  records[index] = { ...records[index], ...updatedRow };
  run('UPDATE csv_data SET data = ?', [JSON.stringify(records)]);

  return json({ success: true });
}

export async function DELETE({ params }) {
  const { id } = params;
  
  const data = query('SELECT data FROM csv_data');
  if (data.length === 0) {
    return json({ error: 'No data found' }, { status: 404 });
  }

  const records = JSON.parse(data[0].data);
  const filteredRecords = records.filter((row: any) => row.id.toString() !== id);

  if (filteredRecords.length === records.length) {
    return json({ error: 'Row not found' }, { status: 404 });
  }

  run('UPDATE csv_data SET data = ?', [JSON.stringify(filteredRecords)]);

  return json({ success: true });
}