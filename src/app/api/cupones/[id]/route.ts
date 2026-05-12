import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un cupón por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cupon = await db.cupon.findUnique({
      where: { id },
      include: {
        redenciones: {
          orderBy: { fecha: 'desc' },
          take: 20,
        }
      }
    });

    if (!cupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cupon);
  } catch (error) {
    console.error('Error obteniendo cupón:', error);
    return NextResponse.json(
      { error: 'Error obteniendo cupón' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cupón
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const existente = await db.cupon.findUnique({
      where: { id },
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    // Si se cambia el código, verificar que no exista
    if (data.codigo && data.codigo.toUpperCase() !== existente.codigo) {
      const codigoExistente = await db.cupon.findUnique({
        where: { codigo: data.codigo.toUpperCase() },
      });
      if (codigoExistente) {
        return NextResponse.json(
          { error: 'Ya existe un cupón con ese código' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    
    if (data.codigo !== undefined) updateData.codigo = data.codigo.toUpperCase();
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.tipoDescuento !== undefined) updateData.tipoDescuento = data.tipoDescuento;
    if (data.valor !== undefined) updateData.valor = parseFloat(data.valor);
    if (data.montoMinimo !== undefined) updateData.montoMinimo = data.montoMinimo ? parseFloat(data.montoMinimo) : null;
    if (data.usosMaximos !== undefined) updateData.usosMaximos = data.usosMaximos ? parseInt(data.usosMaximos) : null;
    if (data.fechaInicio !== undefined) updateData.fechaInicio = new Date(data.fechaInicio);
    if (data.fechaFin !== undefined) updateData.fechaFin = new Date(data.fechaFin);
    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.unicoPorCliente !== undefined) updateData.unicoPorCliente = data.unicoPorCliente;

    const cupon = await db.cupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(cupon);
  } catch (error) {
    console.error('Error actualizando cupón:', error);
    return NextResponse.json(
      { error: 'Error actualizando cupón' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cupón (desactivar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existente = await db.cupon.findUnique({
      where: { id },
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    // Desactivar en lugar de eliminar
    await db.cupon.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ success: true, message: 'Cupón desactivado' });
  } catch (error) {
    console.error('Error eliminando cupón:', error);
    return NextResponse.json(
      { error: 'Error eliminando cupón' },
      { status: 500 }
    );
  }
}
