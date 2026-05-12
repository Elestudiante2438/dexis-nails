import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener configuración
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clave = searchParams.get('clave');

    if (clave) {
      const config = await db.configuracion.findUnique({
        where: { clave }
      });
      return NextResponse.json(config);
    }

    const configuraciones = await db.configuracion.findMany();
    
    // Convertir a objeto para fácil acceso
    const configObj: Record<string, string> = {};
    for (const c of configuraciones) {
      configObj[c.clave] = c.valor;
    }

    return NextResponse.json(configObj);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return NextResponse.json({ error: 'Error obteniendo configuración' }, { status: 500 });
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const config = await db.configuracion.upsert({
      where: { clave: data.clave },
      create: {
        clave: data.clave,
        valor: data.valor,
        descripcion: data.descripcion || null,
        tipo: data.tipo || 'texto'
      },
      update: {
        valor: data.valor,
        descripcion: data.descripcion || null,
        tipo: data.tipo || 'texto'
      }
    });

    // Registrar en auditoría
    await db.auditoriaLog.create({
      data: {
        accion: 'ACTUALIZAR_CONFIGURACION',
        tabla: 'configuracion',
        registroId: config.id,
        datosNuevos: JSON.stringify({ clave: data.clave, valor: data.valor })
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return NextResponse.json({ error: 'Error guardando configuración' }, { status: 500 });
  }
}

// DELETE - Eliminar configuración
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clave = searchParams.get('clave');

    if (!clave) {
      return NextResponse.json({ error: 'Clave requerida' }, { status: 400 });
    }

    await db.configuracion.delete({
      where: { clave }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando configuración:', error);
    return NextResponse.json({ error: 'Error eliminando configuración' }, { status: 500 });
  }
}
