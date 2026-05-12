import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar todos los empleados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const soloActivos = searchParams.get('activos') === 'true';
    const esProfesional = searchParams.get('profesionales') === 'true';
    
    const where: Record<string, unknown> = {};
    
    if (rol) {
      where.rol = rol;
    }
    
    if (esProfesional) {
      where.rol = { in: ['PROFESIONAL', 'GERENTE', 'SUPER_ADMIN'] };
    }
    
    if (soloActivos) {
      where.activo = true;
    }
    
    const empleados = await db.adminUser.findMany({
      where,
      orderBy: [{ rol: 'asc' }, { nombre: 'asc' }],
      include: {
        horarios: {
          orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }]
        }
      }
    });

    // Remover contraseñas
    const empleadosSinPassword = empleados.map(({ password, ...rest }) => rest);

    return NextResponse.json(empleadosSinPassword);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    return NextResponse.json(
      { error: 'Error obteniendo empleados' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo empleado
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.nombre || !data.email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existente = await db.adminUser.findUnique({
      where: { email: data.email },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un empleado con ese email' },
        { status: 400 }
      );
    }

    const empleado = await db.adminUser.create({
      data: {
        email: data.email,
        password: data.password || 'temp123', // Contraseña temporal si no se proporciona
        nombre: data.nombre,
        rol: data.rol || 'PROFESIONAL',
        activo: data.activo !== undefined ? data.activo : true,
        telefono: data.telefono || null,
        foto: data.foto || null,
      },
    });

    // Remover contraseña del response
    const { password: _, ...empleadoSinPassword } = empleado;

    return NextResponse.json(empleadoSinPassword);
  } catch (error) {
    console.error('Error creando empleado:', error);
    return NextResponse.json(
      { error: 'Error creando empleado' },
      { status: 500 }
    );
  }
}
