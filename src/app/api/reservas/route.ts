import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar reservas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const clienteId = searchParams.get('clienteId');
    const profesionalId = searchParams.get('profesionalId');

    const where: Record<string, unknown> = {};

    if (fecha) {
      where.fecha = fecha;
    }

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (profesionalId) {
      where.profesionalId = profesionalId;
    }

    const reservas = await db.reserva.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
      include: {
        cliente: true,
        profesional: true,
        servicio: true,
      },
      take: 100,
    });

    return NextResponse.json(reservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo reservas' },
      { status: 500 }
    );
  }
}

// POST - Crear reserva
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Generar código único
    const codigo = `RES-${Date.now().toString(36).toUpperCase()}`;

    const reserva = await db.reserva.create({
      data: {
        codigo,
        clienteId: data.clienteId || null,
        profesionalId: data.profesionalId || null,
        servicioId: data.servicioId || null,
        fecha: data.fecha,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin || null,
        estado: 'PENDIENTE',
        precioOriginal: data.precioOriginal || null,
        descuento: data.descuento || 0,
        precioFinal: data.precioFinal || null,
        notas: data.notas || null,
      },
      include: {
        cliente: true,
        servicio: true,
      },
    });

    return NextResponse.json(reserva);
  } catch (error) {
    console.error('Error creando reserva:', error);
    return NextResponse.json(
      { error: 'Error creando reserva' },
      { status: 500 }
    );
  }
}