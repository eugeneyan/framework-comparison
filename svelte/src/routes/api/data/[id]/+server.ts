import { json } from '@sveltejs/kit';
import { query, run } from '$lib/db';

export async function PUT({ params, request }) {
  const { id } = params;
  const updatedRow = await request.json();
  
  const columns = Object.keys(updatedRow);
  const values = Object.values(updatedRow);
  
  const setClause = columns.map(col => `${col} = ?`).join(', ');
  const sql = `UPDATE csv_data SET ${setClause} WHERE id = ?`;
  
  run(sql, [...values, id]);

  return json({ success: true });
}

export async function DELETE({ params }) {
  const { id } = params;
  
  run('DELETE FROM csv_data WHERE id = ?', [id]);

  return json({ success: true });
}