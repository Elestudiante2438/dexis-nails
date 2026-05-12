import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Eliminar bloqueo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.bloqueoAgenda.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando bloqueo:', error);
    return NextResponse.json(
      { error: 'Error eliminando bloqueo' },
      { status: 500 }
    );
  }
}
