import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener comisión por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comision = await db.comision.findUnique({
      where: { id },
      include: {
        profesional: true,
      }
    });

    if (!comision) {
      return NextResponse.json(
        { error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(comision);
  } catch (error) {
    console.error('Error obteniendo comisión:', error);
    return NextResponse.json(
      { error: 'Error obteniendo comisión' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar comisión (marcar como pagada)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const comision = await db.comision.findUnique({
      where: { id }
    });

    if (!comision) {
      return NextResponse.json(
        { error: 'Comisión no encontrada' },
        { status: 404 }
      );
    }

    // Si es para marcar como pagada
    if (data.estado === 'PAGADA') {
      const comisionActualizada = await db.comision.update({
        where: { id },
        data: {
          estado: 'PAGADA',
          fechaPago: new Date(),
        }
      });
      return NextResponse.json(comisionActualizada);
    }

    // Si es para cancelar
    if (data.estado === 'CANCELADA') {
      const comisionActualizada = await db.comision.update({
        where: { id },
        data: {
          estado: 'CANCELADA',
        }
      });
      return NextResponse.json(comisionActualizada);
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error actualizando comisión:', error);
    return NextResponse.json(
      { error: 'Error actualizando comisión' },
      { status: 500 }
    );
  }
}
