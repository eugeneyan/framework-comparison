import { json } from '@sveltejs/kit';
import { run } from '$lib/db';

export async function PUT({ params, request }) {
  const { id } = params;
  const updatedRow = await request.json();
  
  const setClause = Object.keys(updatedRow).map(col => `${col} = ?`).join(', ');
  const sql = `UPDATE csv_data SET ${setClause} WHERE id = ?`;
  
  run(sql, [...Object.values(updatedRow), id]);
  return json({ success: true });
}

export async function DELETE({ params }) {
  run('DELETE FROM csv_data WHERE id = ?', [params.id]);
  return json({ success: true });
}