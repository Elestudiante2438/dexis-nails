import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar comisiones pendientes
export async function GET() {
  try {
    const comisiones = await db.comision.findMany({
      where: { estado: 'PENDIENTE' },
      orderBy: { fecha: 'desc' },
      include: {
        profesional: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comisiones);
  } catch (error) {
    console.error('Error obteniendo comisiones:', error);
    return NextResponse.json(
      { error: 'Error obteniendo comisiones' },
      { status: 500 }
    );
  }
}
