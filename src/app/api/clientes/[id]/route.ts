import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cliente = await db.cliente.findUnique({
      where: { id },
      include: {
        reservas: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        compras: {
          take: 10,
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    return NextResponse.json(
      { error: 'Error obteniendo cliente' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const cliente = await db.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        notas: data.notas,
        puntosFidelidad: data.puntosFidelidad,
        nivelFidelidad: data.nivelFidelidad,
        activo: data.activo,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    return NextResponse.json(
      { error: 'Error actualizando cliente' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cliente (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.cliente.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ message: 'Cliente desactivado' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    return NextResponse.json(
      { error: 'Error eliminando cliente' },
      { status: 500 }
    );
  }
}