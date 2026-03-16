import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Actualizar proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const proveedor = await db.proveedor.update({
      where: { id },
      data: {
        nombre: data.nombre,
        contacto: data.contacto,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        ciudad: data.ciudad,
        web: data.web,
        notas: data.notas,
        activo: data.activo,
      },
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    return NextResponse.json(
      { error: 'Error actualizando proveedor' },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar proveedor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.proveedor.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ message: 'Proveedor desactivado' });
  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    return NextResponse.json(
      { error: 'Error eliminando proveedor' },
      { status: 500 }
    );
  }
}