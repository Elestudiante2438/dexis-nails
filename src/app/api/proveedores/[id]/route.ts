import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar proveedores
export async function GET() {
  try {
    const proveedores = await db.proveedor.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { 
            productos: true,
            ordenes: true,
          },
        },
      },
    });

    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    return NextResponse.json(
      { error: 'Error obteniendo proveedores' },
      { status: 500 }
    );
  }
}

// POST - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar NIT único
    if (data.nit) {
      const existente = await db.proveedor.findUnique({
        where: { nit: data.nit },
      });
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe un proveedor con ese NIT' },
          { status: 400 }
        );
      }
    }

    const proveedor = await db.proveedor.create({
      data: {
        nombre: data.nombre,
        nit: data.nit || null,
        contacto: data.contacto || null,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        pais: data.pais || 'Colombia',
        web: data.web || null,
        notas: data.notas || null,
        rating: 0,
        activo: true,
      },
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error creando proveedor:', error);
    return NextResponse.json(
      { error: 'Error creando proveedor' },
      { status: 500 }
    );
  }
}
