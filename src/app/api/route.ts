import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar comisiones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const profesionalId = searchParams.get('profesionalId');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    const where: Record<string, unknown> = {};

    if (estado) {
      where.estado = estado;
    }

    if (profesionalId) {
      where.profesionalId = profesionalId;
    }

    if (desde || hasta) {
      where.fecha = {};
      if (desde) {
        (where.fecha as Record<string, unknown>).gte = new Date(desde);
      }
      if (hasta) {
        (where.fecha as Record<string, unknown>).lte = new Date(hasta);
      }
    }

    const comisiones = await db.comision.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        profesional: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          }
        }
      }
    });

    // Calcular estadísticas
    const estadisticas = {
      totalComisiones: comisiones.length,
      montoTotal: comisiones.reduce((sum, c) => sum + c.montoComision, 0),
      pendientes: comisiones.filter(c => c.estado === 'PENDIENTE'),
      pagadas: comisiones.filter(c => c.estado === 'PAGADA'),
      montoPendiente: comisiones.filter(c => c.estado === 'PENDIENTE').reduce((sum, c) => sum + c.montoComision, 0),
      montoPagado: comisiones.filter(c => c.estado === 'PAGADA').reduce((sum, c) => sum + c.montoComision, 0),
      porProfesional: comisiones.reduce((acc, c) => {
        const profId = c.profesionalId;
        if (!acc[profId]) {
          acc[profId] = {
            nombre: c.profesional.nombre,
            total: 0,
            pendiente: 0,
            pagado: 0,
            cantidad: 0
          };
        }
        acc[profId].total += c.montoComision;
        acc[profId].cantidad += 1;
        if (c.estado === 'PENDIENTE') {
          acc[profId].pendiente += c.montoComision;
        } else if (c.estado === 'PAGADA') {
          acc[profId].pagado += c.montoComision;
        }
        return acc;
      }, {} as Record<string, { nombre: string; total: number; pendiente: number; pagado: number; cantidad: number }>)
    };

    return NextResponse.json({ comisiones, estadisticas });
  } catch (error) {
    console.error('Error obteniendo comisiones:', error);
    return NextResponse.json(
      { error: 'Error obteniendo comisiones' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva comisión
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.profesionalId || !data.montoServicio || !data.porcentaje) {
      return NextResponse.json(
        { error: 'Profesional, monto del servicio y porcentaje son requeridos' },
        { status: 400 }
      );
    }

    const montoServicio = parseFloat(data.montoServicio);
    const porcentaje = parseFloat(data.porcentaje);
    const montoComision = (montoServicio * porcentaje) / 100;

    const comision = await db.comision.create({
      data: {
        profesionalId: data.profesionalId,
        reservaId: data.reservaId || null,
        montoServicio,
        porcentaje,
        montoComision,
        estado: 'PENDIENTE',
      },
      include: {
        profesional: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    });

    return NextResponse.json(comision);
  } catch (error) {
    console.error('Error creando comisión:', error);
    return NextResponse.json(
      { error: 'Error creando comisión' },
      { status: 500 }
    );
  }
}
