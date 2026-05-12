import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener gift card por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const giftCard = await db.giftCard.findUnique({
      where: { id },
      include: {
        redenciones: {
          orderBy: { fecha: 'desc' },
        }
      }
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('Error obteniendo gift card:', error);
    return NextResponse.json(
      { error: 'Error obteniendo gift card' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar gift card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const giftCardActual = await db.giftCard.findUnique({
      where: { id }
    });

    if (!giftCardActual) {
      return NextResponse.json(
        { error: 'Gift card no encontrada' },
        { status: 404 }
      );
    }

    // Si es cambio de estado
    if (data.estado) {
      const giftCard = await db.giftCard.update({
        where: { id },
        data: { estado: data.estado }
      });
      return NextResponse.json(giftCard);
    }

    // Actualización general
    const giftCard = await db.giftCard.update({
      where: { id },
      data: {
        destinatarioNombre: data.destinatarioNombre,
        destinatarioEmail: data.destinatarioEmail,
        mensaje: data.mensaje,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
      }
    });

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error('Error actualizando gift card:', error);
    return NextResponse.json(
      { error: 'Error actualizando gift card' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar gift card (cambiar estado a CANCELADA)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const giftCard = await db.giftCard.findUnique({
      where: { id }
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card no encontrada' },
        { status: 404 }
      );
    }

    // Cambiar estado a CANCELADA
    const giftCardCancelada = await db.giftCard.update({
      where: { id },
      data: { estado: 'CANCELADA' }
    });

    return NextResponse.json(giftCardCancelada);
  } catch (error) {
    console.error('Error cancelando gift card:', error);
    return NextResponse.json(
      { error: 'Error cancelando gift card' },
      { status: 500 }
    );
  }
}
