import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar clientes con puntos de fidelidad
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nivel = searchParams.get('nivel');
    const buscar = searchParams.get('buscar');

    const where: Record<string, unknown> = { activo: true };

    if (nivel) {
      where.nivelFidelidad = nivel;
    }

    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { email: { contains: buscar } },
        { cedula: { contains: buscar } },
      ];
    }

    const clientes = await db.cliente.findMany({
      where,
      orderBy: [
        { nivelFidelidad: 'desc' },
        { puntosFidelidad: 'desc' },
      ],
      include: {
        _count: {
          select: { 
            reservas: true,
            compras: true,
            cuponesUsados: true,
          }
        }
      }
    });

    // Calcular estadísticas generales
    const estadisticas = {
      totalClientes: clientes.length,
      puntosEnCirculacion: clientes.reduce((sum, c) => sum + c.puntosFidelidad, 0),
      porNivel: {
        BRONCE: clientes.filter(c => c.nivelFidelidad === 'BRONCE').length,
        PLATA: clientes.filter(c => c.nivelFidelidad === 'PLATA').length,
        ORO: clientes.filter(c => c.nivelFidelidad === 'ORO').length,
        DIAMANTE: clientes.filter(c => c.nivelFidelidad === 'DIAMANTE').length,
      }
    };

    return NextResponse.json({ clientes, estadisticas });
  } catch (error) {
    console.error('Error obteniendo fidelidad:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de fidelidad' },
      { status: 500 }
    );
  }
}
