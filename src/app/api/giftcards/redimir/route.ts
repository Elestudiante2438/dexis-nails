import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Redimir (usar) gift card
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.codigo || !data.monto) {
      return NextResponse.json(
        { error: 'Código y monto son requeridos', exito: false },
        { status: 400 }
      );
    }

    const montoRedimir = parseFloat(data.monto);

    if (montoRedimir <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0', exito: false },
        { status: 400 }
      );
    }

    const giftCard = await db.giftCard.findUnique({
      where: { codigo: data.codigo.toUpperCase() }
    });

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card no encontrada', exito: false },
        { status: 404 }
      );
    }

    // Verificar estado
    if (giftCard.estado !== 'ACTIVA') {
      return NextResponse.json(
        { error: `Gift card ${giftCard.estado.toLowerCase()}`, exito: false },
        { status: 400 }
      );
    }

    // Verificar vencimiento
    const ahora = new Date();
    if (giftCard.fechaVencimiento && new Date(giftCard.fechaVencimiento) < ahora) {
      await db.giftCard.update({
        where: { id: giftCard.id },
        data: { estado: 'VENCIDA' }
      });
      return NextResponse.json(
        { error: 'Gift card vencida', exito: false },
        { status: 400 }
      );
    }

    // Verificar saldo suficiente
    if (giftCard.montoDisponible < montoRedimir) {
      return NextResponse.json(
        { 
          error: `Saldo insuficiente. Disponible: $${giftCard.montoDisponible.toLocaleString()}`,
          saldoDisponible: giftCard.montoDisponible,
          exito: false 
        },
        { status: 400 }
      );
    }

    // Realizar la redención en una transacción
    const resultado = await db.$transaction(async (tx) => {
      // Crear registro de redención
      const redencion = await tx.giftCardRedencion.create({
        data: {
          giftCardId: giftCard.id,
          clienteId: data.clienteId || null,
          monto: montoRedimir
        }
      });

      // Actualizar gift card
      const nuevoMontoUsado = giftCard.montoUsado + montoRedimir;
      const nuevoMontoDisponible = giftCard.montoDisponible - montoRedimir;
      
      const nuevoEstado = nuevoMontoDisponible <= 0 ? 'AGOTADA' : 'ACTIVA';

      const giftCardActualizada = await tx.giftCard.update({
        where: { id: giftCard.id },
        data: {
          montoUsado: nuevoMontoUsado,
          montoDisponible: nuevoMontoDisponible,
          estado: nuevoEstado
        }
      });

      return { redencion, giftCardActualizada };
    });

    return NextResponse.json({
      exito: true,
      mensaje: `Redimido $${montoRedimir.toLocaleString()} correctamente`,
      redencion: resultado.redencion,
      giftCard: resultado.giftCardActualizada,
      saldoRestante: resultado.giftCardActualizada.montoDisponible
    });
  } catch (error) {
    console.error('Error redimiendo gift card:', error);
    return NextResponse.json(
      { error: 'Error redimiendo gift card', exito: false },
      { status: 500 }
    );
  }
}
