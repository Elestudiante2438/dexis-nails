import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Cerrar caja
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Buscar caja abierta
    const cajaAbierta = await db.caja.findFirst({
      where: { estado: 'ABIERTA' },
    });

    if (!cajaAbierta) {
      return NextResponse.json(
        { error: 'No hay caja abierta' },
        { status: 400 }
      );
    }

    const montoCierre = data.montoCierre || 0;
    const diferencia = montoCierre - (cajaAbierta.montoApertura + cajaAbierta.ventasEfectivo - cajaAbierta.retiros + cajaAbierta.ingresosExtra);

    const estado = Math.abs(diferencia) < 1000 ? 'CUADRADA' : 'DIFERENCIA';

    const caja = await db.caja.update({
      where: { id: cajaAbierta.id },
      data: {
        montoCierre,
        horaCierre: new Date(),
        cerradaPor: data.usuarioId || null,
        diferencia,
        notas: data.notas || null,
        estado,
      },
    });

    return NextResponse.json(caja);
  } catch (error) {
    console.error('Error cerrando caja:', error);
    return NextResponse.json(
      { error: 'Error cerrando caja' },
      { status: 500 }
    );
  }
}
