import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Actualizar reserva
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const reserva = await db.reserva.update({
      where: { id },
      data: {
        estado: data.estado,
        profesionalId: data.profesionalId,
        fecha: data.fecha,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        precioFinal: data.precioFinal,
        notas: data.notas,
        rating: data.rating,
        comentario: data.comentario,
      },
      include: {
        cliente: true,
        profesional: true,
        servicio: true,
      },
    });

    // Si se completa, crear comisión
    if (data.estado === 'COMPLETADA' && reserva.profesionalId && reserva.precioFinal) {
      const servicio = reserva.servicioId 
        ? await db.servicio.findUnique({ where: { id: reserva.servicioId } })
        : null;
      
      const porcentaje = servicio?.comisionPorcentaje || 30;
      
      await db.comision.create({
        data: {
          profesionalId: reserva.profesionalId,
          reservaId: reserva.id,
          montoServicio: reserva.precioFinal,
          porcentaje,
          montoComision: reserva.precioFinal * (porcentaje / 100),
          estado: 'PENDIENTE',
        },
      });
    }

    return NextResponse.json(reserva);
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    return NextResponse.json(
      { error: 'Error actualizando reserva' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reserva = await db.reserva.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    });

    return NextResponse.json(reserva);
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    return NextResponse.json(
      { error: 'Error cancelando reserva' },
      { status: 500 }
    );
  }
}
