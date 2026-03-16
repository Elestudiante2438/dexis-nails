import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar gift cards
export async function GET() {
  try {
    const giftCards = await db.giftCard.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(giftCards);
  } catch (error) {
    console.error('Error obteniendo gift cards:', error);
    return NextResponse.json(
      { error: 'Error obteniendo gift cards' },
      { status: 500 }
    );
  }
}

// POST - Crear gift card
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.montoOriginal) {
      return NextResponse.json(
        { error: 'El monto es requerido' },
        { status: 400 }
      );
    }

    // Generar código único
    const codigo = `GC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const giftCard = await db.giftCard.create({
      data: {
        codigo,
        montoOriginal: data.montoOriginal,
        montoDisponible: data.montoOriginal,
        montoUsado: 0,
        compradorNombre: data.compradorNombre || null,
        compradorEmail: data.compradorEmail || null,
        destinatarioNombre: data.destinatarioNombre || null,
        destinatarioEmail: data.destinatarioEmail || null,
        mensaje: data.mensaje || null,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
      },
    });

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('Error creando gift card:', error);
    return NextResponse.json(
      { error: 'Error creando gift card' },
      { status: 500 }
    );
  }
}