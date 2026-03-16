import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const stockAnterior = await db.producto.findUnique({
      where: { id },
      select: { stockActual: true },
    });

    const producto = await db.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precioCosto: data.precioCosto,
        precioVenta: data.precioVenta,
        stockActual: data.stockActual,
        stockMinimo: data.stockMinimo,
        ubicacion: data.ubicacion,
        notas: data.notas,
        activo: data.activo,
      },
    });

    // Si cambió el stock, registrar movimiento
    if (stockAnterior && data.stockActual !== stockAnterior.stockActual) {
      await db.movimientoInventario.create({
        data: {
          productoId: id,
          tipo: 'AJUSTE',
          cantidad: data.stockActual - stockAnterior.stockActual,
          stockAnterior: stockAnterior.stockActual,
          stockNuevo: data.stockActual,
          motivo: data.motivoMovimiento || 'Ajuste manual',
        },
      });
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { error: 'Error actualizando producto' },
      { status: 500 }
    );
  }
}