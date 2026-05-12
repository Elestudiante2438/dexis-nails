import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un empleado por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const empleado = await db.adminUser.findUnique({
      where: { id },
      include: {
        horarios: {
          orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
        }
      }
    });

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    // Remover contraseña
    const { password: _, ...empleadoSinPassword } = empleado;

    return NextResponse.json(empleadoSinPassword);
  } catch (error) {
    console.error('Error obteniendo empleado:', error);
    return NextResponse.json(
      { error: 'Error obteniendo empleado' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar empleado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Verificar que existe
    const existente = await db.adminUser.findUnique({
      where: { id },
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    // Si se cambia el email, verificar que no exista
    if (data.email && data.email !== existente.email) {
      const emailExistente = await db.adminUser.findUnique({
        where: { email: data.email },
      });
      if (emailExistente) {
        return NextResponse.json(
          { error: 'Ya existe un empleado con ese email' },
          { status: 400 }
        );
      }
    }

    // Preparar datos a actualizar
    const updateData: Record<string, unknown> = {};
    
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.rol !== undefined) updateData.rol = data.rol;
    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.foto !== undefined) updateData.foto = data.foto;
    if (data.password) updateData.password = data.password;

    const empleado = await db.adminUser.update({
      where: { id },
      data: updateData,
    });

    // Remover contraseña del response
    const { password: _, ...empleadoSinPassword } = empleado;

    return NextResponse.json(empleadoSinPassword);
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    return NextResponse.json(
      { error: 'Error actualizando empleado' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar empleado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar que existe
    const existente = await db.adminUser.findUnique({
      where: { id },
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    // En lugar de eliminar, marcamos como inactivo
    await db.adminUser.update({
      where: { id },
      data: { activo: false },
    });

    return NextResponse.json({ success: true, message: 'Empleado desactivado' });
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    return NextResponse.json(
      { error: 'Error eliminando empleado' },
      { status: 500 }
    );
  }
}
