import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Validar gift card por código
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.codigo) {
      return NextResponse.json(
        { error: 'Código es requerido', valida: false },
        { status: 400 }
      );
    }

    const giftCard = await db.giftCard.findUnique({
      where: { codigo: data.codigo.toUpperCase() }
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card no encontrada', valida: false },
        { status: 404 }
      );
    }

    const ahora = new Date();
    let estadoValido = true;
    let mensajeEstado = '';

    // Verificar estado
    if (giftCard.estado !== 'ACTIVA') {
      estadoValido = false;
      mensajeEstado = `Gift card ${giftCard.estado.toLowerCase()}`;
    }

    // Verificar vencimiento
    if (giftCard.fechaVencimiento && new Date(giftCard.fechaVencimiento) < ahora) {
      estadoValido = false;
      mensajeEstado = 'Gift card vencida';
      // Actualizar estado en BD
      await db.giftCard.update({
        where: { id: giftCard.id },
        data: { estado: 'VENCIDA' }
      });
    }

    // Verificar saldo
    if (giftCard.montoDisponible <= 0) {
      estadoValido = false;
      mensajeEstado = 'Gift card sin saldo disponible';
      // Actualizar estado en BD
      await db.giftCard.update({
        where: { id: giftCard.id },
        data: { estado: 'AGOTADA' }
      });
    }

    return NextResponse.json({
      valida: estadoValido,
      giftCard: {
        id: giftCard.id,
        codigo: giftCard.codigo,
        montoOriginal: giftCard.montoOriginal,
        montoDisponible: giftCard.montoDisponible,
        montoUsado: giftCard.montoUsado,
        estado: giftCard.estado,
        fechaVencimiento: giftCard.fechaVencimiento,
        destinatarioNombre: giftCard.destinatarioNombre,
      },
      mensaje: estadoValido ? 'Gift card válida' : mensajeEstado
    });
  } catch (error) {
    console.error('Error validando gift card:', error);
    return NextResponse.json(
      { error: 'Error validando gift card', valida: false },
      { status: 500 }
    );
  }
}
