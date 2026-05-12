import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar movimientos de una caja
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cajaId = searchParams.get('cajaId');
    const tipo = searchParams.get('tipo');
    
    const where: Record<string, unknown> = {};
    
    if (cajaId) {
      where.cajaId = cajaId;
    }
    
    if (tipo) {
      where.tipo = tipo;
    }
    
    const movimientos = await db.movimientoCaja.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(movimientos);
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo movimientos' },
      { status: 500 }
    );
  }
}

// POST - Agregar movimiento a caja abierta
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.cajaId) {
      return NextResponse.json(
        { error: 'ID de caja requerido' },
        { status: 400 }
      );
    }

    // Verificar que la caja esté abierta
    const caja = await db.caja.findUnique({
      where: { id: data.cajaId }
    });

    if (!caja) {
      return NextResponse.json(
        { error: 'Caja no encontrada' },
        { status: 404 }
      );
    }

    if (caja.estado !== 'ABIERTA') {
      return NextResponse.json(
        { error: 'La caja está cerrada' },
        { status: 400 }
      );
    }

    const monto = parseFloat(data.monto) || 0;
    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const movimiento = await db.movimientoCaja.create({
      data: {
        cajaId: data.cajaId,
        tipo: data.tipo || 'INGRESO_EXTRA',
        monto,
        concepto: data.concepto || 'Movimiento',
        comprobante: data.comprobante || null,
        registradoPor: data.registradoPor || 'Sistema',
      }
    });

    // Actualizar totales en la caja
    const updateData: Record<string, unknown> = {};
    
    if (data.tipo === 'RETIRO') {
      updateData.retiros = caja.retiros + monto;
    } else if (data.tipo === 'INGRESO_EXTRA') {
      updateData.ingresosExtra = caja.ingresosExtra + monto;
    } else if (data.tipo === 'VENTA_EFECTIVO') {
      updateData.ventasEfectivo = caja.ventasEfectivo + monto;
    }

    if (Object.keys(updateData).length > 0) {
      await db.caja.update({
        where: { id: data.cajaId },
        data: updateData
      });
    }

    return NextResponse.json(movimiento);
  } catch (error) {
    console.error('Error creando movimiento:', error);
    return NextResponse.json(
      { error: 'Error creando movimiento' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar movimiento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de movimiento requerido' },
        { status: 400 }
      );
    }

    const movimiento = await db.movimientoCaja.findUnique({
      where: { id },
      include: { caja: true }
    });

    if (!movimiento) {
      return NextResponse.json(
        { error: 'Movimiento no encontrado' },
        { status: 404 }
      );
    }

    if (movimiento.caja.estado !== 'ABIERTA') {
      return NextResponse.json(
        { error: 'No se puede eliminar movimiento de caja cerrada' },
        { status: 400 }
      );
    }

    await db.movimientoCaja.delete({ where: { id } });

    // Actualizar totales en la caja
    const updateData: Record<string, unknown> = {};
    
    if (movimiento.tipo === 'RETIRO') {
      updateData.retiros = movimiento.caja.retiros - movimiento.monto;
    } else if (movimiento.tipo === 'INGRESO_EXTRA') {
      updateData.ingresosExtra = movimiento.caja.ingresosExtra - movimiento.monto;
    } else if (movimiento.tipo === 'VENTA_EFECTIVO') {
      updateData.ventasEfectivo = movimiento.caja.ventasEfectivo - movimiento.monto;
    }

    if (Object.keys(updateData).length > 0) {
      await db.caja.update({
        where: { id: movimiento.cajaId },
        data: updateData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando movimiento:', error);
    return NextResponse.json(
      { error: 'Error eliminando movimiento' },
      { status: 500 }
    );
  }
}
