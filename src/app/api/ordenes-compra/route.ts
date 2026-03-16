import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar órdenes de compra
export async function GET() {
  try {
    const ordenes = await db.ordenCompra.findMany({
      orderBy: { fechaOrden: 'desc' },
      include: {
        proveedor: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      take: 50,
    });

    return NextResponse.json(ordenes);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return NextResponse.json(
      { error: 'Error obteniendo órdenes' },
      { status: 500 }
    );
  }
}

// POST - Crear orden de compra
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.proveedorId || !data.detalles?.length) {
      return NextResponse.json(
        { error: 'Proveedor y detalles son requeridos' },
        { status: 400 }
      );
    }

    // Generar número de orden
    const numeroOrden = `OC-${Date.now().toString(36).toUpperCase()}`;

    // Calcular totales
    let subtotal = 0;
    for (const detalle of data.detalles) {
      subtotal += detalle.cantidad * detalle.precioUnitario;
    }

    const orden = await db.ordenCompra.create({
      data: {
        numeroOrden,
        proveedorId: data.proveedorId,
        estado: 'BORRADOR',
        subtotal,
        descuento: data.descuento || 0,
        iva: 0, // IVA dormido
        total: subtotal - (data.descuento || 0),
        notas: data.notas || null,
        direccionEnvio: data.direccionEnvio || null,
        creadoPor: data.creadoPor || null,
        detalles: {
          create: data.detalles.map((d: { productoId: string; cantidad: number; precioUnitario: number }) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.cantidad * d.precioUnitario,
          })),
        },
      },
      include: {
        proveedor: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    return NextResponse.json(orden);
  } catch (error) {
    console.error('Error creando orden:', error);
    return NextResponse.json(
      { error: 'Error creando orden' },
      { status: 500 }
    );
  }
}