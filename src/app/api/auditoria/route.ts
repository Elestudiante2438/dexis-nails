import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar registros de auditoría
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '100');
    const tabla = searchParams.get('tabla');
    const accion = searchParams.get('accion');

    const where: Record<string, unknown> = {};
    if (tabla) where.tabla = tabla;
    if (accion) where.accion = { contains: accion };

    const registros = await db.auditoriaLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limite
    });

    return NextResponse.json(registros);
  } catch (error) {
    console.error('Error obteniendo auditoría:', error);
    return NextResponse.json({ error: 'Error obteniendo auditoría' }, { status: 500 });
  }
}

// POST - Registrar acción de auditoría
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const registro = await db.auditoriaLog.create({
      data: {
        usuarioId: data.usuarioId || null,
        accion: data.accion,
        tabla: data.tabla,
        registroId: data.registroId || '',
        datosAnteriores: data.datosAnteriores || null,
        datosNuevos: data.datosNuevos || null,
        ip: data.ip || null,
        userAgent: data.userAgent || null
      }
    });

    return NextResponse.json(registro);
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    return NextResponse.json({ error: 'Error registrando auditoría' }, { status: 500 });
  }
}
