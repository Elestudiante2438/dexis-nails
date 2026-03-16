import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener caja actual (abierta)
export async function GET() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const caja = await db.caja.findFirst({
      where: {
        fecha: { gte: hoy },
        estado: 'ABIERTA',
      },
      include: {
        movimientos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(caja || null);
  } catch (error) {
    console.error('Error obteniendo caja:', error);
    return NextResponse.json(
      { error: 'Error obteniendo caja' },
      { status: 500 }
    );
  }
}
