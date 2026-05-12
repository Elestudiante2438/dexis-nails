import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Pagar múltiples comisiones
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.comisionIds || !Array.isArray(data.comisionIds) || data.comisionIds.length === 0) {
      return NextResponse.json(
        { error: 'Lista de comisiones requerida' },
        { status: 400 }
      );
    }

    // Actualizar todas las comisiones a PAGADA
    const resultado = await db.comision.updateMany({
      where: {
        id: { in: data.comisionIds },
        estado: 'PENDIENTE'
      },
      data: {
        estado: 'PAGADA',
        fechaPago: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      actualizadas: resultado.count,
      mensaje: `Se pagaron ${resultado.count} comisiones`
    });
  } catch (error) {
    console.error('Error pagando comisiones:', error);
    return NextResponse.json(
      { error: 'Error pagando comisiones' },
      { status: 500 }
    );
  }
}
