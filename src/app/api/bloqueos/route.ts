import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar bloqueos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');

    const where: Record<string, unknown> = {};

    if (fecha) {
      // Buscar bloqueos que incluyan esa fecha
      const fechaDate = new Date(fecha + 'T12:00:00.000Z');
      where.AND = [
        { fechaInicio: { lte: fechaDate } },
        { fechaFin: { gte: fechaDate } }
      ];
    }

    const bloqueos = await db.bloqueoAgenda.findMany({
      where,
      orderBy: [{ fechaInicio: 'asc' }],
      include: {
        profesional: {
          select: { id: true, nombre: true }
        }
      },
      take: 100,
    });

    return NextResponse.json(bloqueos);
  } catch (error) {
    console.error('Error obteniendo bloqueos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo bloqueos' },
      { status: 500 }
    );
  }
}

// POST - Crear bloqueo
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Convertir fecha string a DateTime (usando medio día para evitar problemas de zona horaria)
    const fechaInicio = new Date(data.fecha + 'T12:00:00.000Z');
    const fechaFin = new Date(data.fecha + 'T12:00:00.000Z');

    const bloqueo = await db.bloqueoAgenda.create({
      data: {
        profesionalId: data.profesionalId || null, // null = todos
        fechaInicio,
        fechaFin,
        motivo: data.motivo || 'Sin motivo',
        tipo: data.tipo || 'OTRO',
      },
      include: {
        profesional: {
          select: { id: true, nombre: true }
        }
      }
    });

    return NextResponse.json(bloqueo);
  } catch (error) {
    console.error('Error creando bloqueo:', error);
    return NextResponse.json(
      { error: 'Error creando bloqueo' },
      { status: 500 }
    );
  }
}
