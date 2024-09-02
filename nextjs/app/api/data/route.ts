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
    db.prepare(`UPDATE data SET ${column} = ? WHERE id = ?`).run(value, id);
    return NextResponse.json({ message: 'Data updated successfully' });
  } catch (error) {
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