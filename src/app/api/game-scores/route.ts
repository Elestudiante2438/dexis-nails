import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar high scores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '10');

    const scores = await db.gameScore.findMany({
      take: limite,
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error obteniendo scores:', error);
    return NextResponse.json(
      { error: 'Error obteniendo scores' },
      { status: 500 }
    );
  }
}

// POST - Guardar nuevo score
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.jugadorNombre || !data.score) {
      return NextResponse.json(
        { error: 'Nombre y score son requeridos' },
        { status: 400 }
      );
    }

    const score = await db.gameScore.create({
      data: {
        jugadorNombre: data.jugadorNombre,
        score: parseInt(data.score),
        nivel: parseInt(data.nivel) || 1
      }
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Error guardando score:', error);
    return NextResponse.json(
      { error: 'Error guardando score' },
      { status: 500 }
    );
  }
}
