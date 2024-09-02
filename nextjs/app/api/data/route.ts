import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
  try {
    const data = db.prepare('SELECT * FROM data').all();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { id, column, value } = await req.json();

  try {
    // Start a transaction
    db.prepare('BEGIN').run();

    // Update the data
    const updateStmt = db.prepare(`UPDATE data SET ${column} = ? WHERE id = ?`);
    const result = updateStmt.run(value, id);

    if (result.changes === 0) {
      // If no rows were updated, rollback and return an error
      db.prepare('ROLLBACK').run();
      return NextResponse.json({ error: 'No rows updated' }, { status: 404 });
    }

    // Commit the transaction
    db.prepare('COMMIT').run();

    return NextResponse.json({ message: 'Data updated successfully' });
  } catch (error) {
    // Rollback the transaction in case of an error
    db.prepare('ROLLBACK').run();
    console.error('Error updating data:', error);
    return NextResponse.json({ error: 'Error updating data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    db.prepare('DELETE FROM data WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Row deleted successfully' });
  } catch (error) {
    console.error('Error deleting row:', error);
    return NextResponse.json({ error: 'Error deleting row' }, { status: 500 });
  }
}