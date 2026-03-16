import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar servicios
export async function GET() {
  try {
    const servicios = await db.servicio.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });

    return NextResponse.json(servicios);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    return NextResponse.json(
      { error: 'Error obteniendo servicios' },
      { status: 500 }
    );
  }
}

// POST - Crear servicio
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.nombre || !data.codigo) {
      return NextResponse.json(
        { error: 'Nombre y código son requeridos' },
        { status: 400 }
      );
    }

    const servicio = await db.servicio.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        categoria: data.categoria || null,
        duracion: data.duracion || 30,
        precio: data.precio || 0,
        precioPromocion: data.precioPromocion || null,
        comisionPorcentaje: data.comisionPorcentaje || 30,
        requiereDeposito: data.requiereDeposito || false,
      },
    });

    return NextResponse.json(servicio);
  } catch (error) {
    console.error('Error creando servicio:', error);
    return NextResponse.json(
      { error: 'Error creando servicio' },
      { status: 500 }
    );
  }
}