import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar horarios (por profesional o todos)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profesionalId = searchParams.get('profesionalId');
    
    const where: Record<string, unknown> = {};
    
    if (profesionalId) {
      where.profesionalId = profesionalId;
    }
    
    const horarios = await db.horarioProfesional.findMany({
      where,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
      include: {
        profesional: {
          select: { id: true, nombre: true }
        }
      }
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    return NextResponse.json(
      { error: 'Error obteniendo horarios' },
      { status: 500 }
    );
  }
}

// POST - Crear/actualizar horario
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.profesionalId || data.diaSemana === undefined || !data.horaInicio || !data.horaFin) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un horario para ese día y profesional
    const existente = await db.horarioProfesional.findFirst({
      where: {
        profesionalId: data.profesionalId,
        diaSemana: data.diaSemana,
      }
    });

    let horario;
    
    if (existente) {
      // Actualizar
      horario = await db.horarioProfesional.update({
        where: { id: existente.id },
        data: {
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          activo: data.activo !== undefined ? data.activo : true,
        }
      });
    } else {
      // Crear
      horario = await db.horarioProfesional.create({
        data: {
          profesionalId: data.profesionalId,
          diaSemana: data.diaSemana,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          activo: data.activo !== undefined ? data.activo : true,
        }
      });
    }

    return NextResponse.json(horario);
  } catch (error) {
    console.error('Error guardando horario:', error);
    return NextResponse.json(
      { error: 'Error guardando horario' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar horario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de horario requerido' },
        { status: 400 }
      );
    }

    await db.horarioProfesional.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando horario:', error);
    return NextResponse.json(
      { error: 'Error eliminando horario' },
      { status: 500 }
    );
  }
}
