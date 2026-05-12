import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar cajas (por fecha o activa)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const activa = searchParams.get('activa') === 'true';
    const limite = searchParams.get('limite');
    
    const where: Record<string, unknown> = {};
    
    if (activa) {
      where.estado = 'ABIERTA';
    }
    
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);
      
      where.fecha = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    }
    
    const cajas = await db.caja.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take: limite ? parseInt(limite) : undefined,
      include: {
        movimientos: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Si se busca la caja activa y no existe, devolver null
    if (activa && cajas.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(activa ? cajas[0] : cajas);
  } catch (error) {
    console.error('Error obteniendo cajas:', error);
    return NextResponse.json(
      { error: 'Error obteniendo cajas' },
      { status: 500 }
    );
  }
}

// POST - Abrir nueva caja
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Verificar si ya hay una caja abierta
    const cajaAbierta = await db.caja.findFirst({
      where: { estado: 'ABIERTA' }
    });

    if (cajaAbierta) {
      return NextResponse.json(
        { error: 'Ya existe una caja abierta. Debe cerrarla primero.' },
        { status: 400 }
      );
    }

    const montoApertura = parseFloat(data.montoApertura) || 0;

    const caja = await db.caja.create({
      data: {
        fecha: new Date(),
        montoApertura,
        horaApertura: new Date(),
        abiertaPor: data.abiertaPor || 'Sistema',
        ventasEfectivo: 0,
        ventasTarjeta: 0,
        ventasOtras: 0,
        retiros: 0,
        ingresosExtra: 0,
        diferencia: 0,
        estado: 'ABIERTA',
        notas: data.notas || null,
      },
    });

    // Si hay monto de apertura, crear movimiento inicial
    if (montoApertura > 0) {
      await db.movimientoCaja.create({
        data: {
          cajaId: caja.id,
          tipo: 'INGRESO_EXTRA',
          monto: montoApertura,
          concepto: 'Apertura de caja',
          registradoPor: data.abiertaPor || 'Sistema',
        }
      });
    }

    return NextResponse.json(caja);
  } catch (error) {
    console.error('Error abriendo caja:', error);
    return NextResponse.json(
      { error: 'Error abriendo caja' },
      { status: 500 }
    );
  }
}
