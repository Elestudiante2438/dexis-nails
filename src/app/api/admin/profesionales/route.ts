import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar profesionales
export async function GET() {
  try {
    const profesionales = await db.adminUser.findMany({
      where: {
        rol: { in: ['PROFESIONAL', 'GERENTE', 'SUPER_ADMIN'] },
        activo: true,
      },
      orderBy: { nombre: 'asc' },
    });

    // Remover contraseñas
    const profesionalesSinPassword = profesionales.map(({ password, ...rest }) => rest);

    return NextResponse.json(profesionalesSinPassword);
  } catch (error) {
    console.error('Error obteniendo profesionales:', error);
    return NextResponse.json(
      { error: 'Error obteniendo profesionales' },
      { status: 500 }
    );
  }
}