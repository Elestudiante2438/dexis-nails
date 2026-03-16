import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar cupones
export async function GET() {
  try {
    const cupones = await db.cupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cupones);
  } catch (error) {
    console.error('Error obteniendo cupones:', error);
    return NextResponse.json(
      { error: 'Error obteniendo cupones' },
      { status: 500 }
    );
  }
}

// POST - Crear cupón
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.codigo || !data.descripcion) {
      return NextResponse.json(
        { error: 'Código y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Verificar código único
    const existente = await db.cupon.findUnique({
      where: { codigo: data.codigo.toUpperCase() },
    });
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con ese código' },
        { status: 400 }
      );
    }

    const cupon = await db.cupon.create({
      data: {
        codigo: data.codigo.toUpperCase(),
        descripcion: data.descripcion,
        tipoDescuento: data.tipoDescuento || 'PORCENTAJE',
        valor: data.valor || 0,
        montoMinimo: data.montoMinimo || null,
        usosMaximos: data.usosMaximos || null,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        unicoPorCliente: data.unicoPorCliente || false,
      },
    });

    return NextResponse.json(cupon);
  } catch (error) {
    console.error('Error creando cupón:', error);
    return NextResponse.json(
      { error: 'Error creando cupón' },
      { status: 500 }
    );
  }
}