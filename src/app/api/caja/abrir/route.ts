import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Abrir caja
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.montoApertura || data.montoApertura < 0) {
      return NextResponse.json(
        { error: 'El monto de apertura es requerido y debe ser positivo' },
        { status: 400 }
      );
    }

    // Verificar si ya hay una caja abierta
    const cajaAbierta = await db.caja.findFirst({
      where: { estado: 'ABIERTA' },
    });

    if (cajaAbierta) {
      return NextResponse.json(
        { error: 'Ya hay una caja abierta' },
        { status: 400 }
      );
    }

    const caja = await db.caja.create({
      data: {
        montoApertura: data.montoApertura,
        horaApertura: new Date(),
        abiertaPor: data.usuarioId || null,
        estado: 'ABIERTA',
      },
    });

    return NextResponse.json(caja);
  } catch (error) {
    console.error('Error abriendo caja:', error);
    return NextResponse.json(
      { error: 'Error abriendo caja' },
      { status: 500 }
    );
  }
}
