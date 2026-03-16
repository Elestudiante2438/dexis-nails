import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar clientes
export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return NextResponse.json(
      { error: 'Error obteniendo clientes' },
      { status: 500 }
    );
  }
}

// POST - Crear cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe por cédula o email
    if (data.cedula) {
      const existente = await db.cliente.findUnique({
        where: { cedula: data.cedula },
      });
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con esa cédula' },
          { status: 400 }
        );
      }
    }

    if (data.email) {
      const existente = await db.cliente.findFirst({
        where: { email: data.email },
      });
      if (existente) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con ese email' },
          { status: 400 }
        );
      }
    }

    const cliente = await db.cliente.create({
      data: {
        cedula: data.cedula || null,
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        notas: data.notas || null,
        puntosFidelidad: data.puntosFidelidad || 0,
        nivelFidelidad: data.nivelFidelidad || 'BRONCE',
        activo: true,
      },
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error creando cliente:', error);
    return NextResponse.json(
      { error: 'Error creando cliente' },
      { status: 500 }
    );
  }
}