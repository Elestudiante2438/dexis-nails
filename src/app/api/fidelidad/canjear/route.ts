import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Canjear puntos de fidelidad por descuento
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.clienteId || !data.puntos || data.puntos <= 0) {
      return NextResponse.json(
        { error: 'Cliente ID y puntos a canjear son requeridos' },
        { status: 400 }
      );
    }

    const puntosCanjear = parseInt(data.puntos);

    // Mínimo 10 puntos para canjear
    if (puntosCanjear < 10) {
      return NextResponse.json(
        { error: 'Mínimo 10 puntos para canjear' },
        { status: 400 }
      );
    }

    const cliente = await db.cliente.findUnique({
      where: { id: data.clienteId }
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    if (cliente.puntosFidelidad < puntosCanjear) {
      return NextResponse.json(
        { error: `Puntos insuficientes. Disponible: ${cliente.puntosFidelidad}` },
        { status: 400 }
      );
    }

    // Calcular valor del descuento (1 punto = $100 COP)
    const valorDescuento = puntosCanjear * 100;

    // Actualizar puntos del cliente
    const nuevosPuntos = cliente.puntosFidelidad - puntosCanjear;
    
    // Recalcular nivel
    let nuevoNivel = cliente.nivelFidelidad;
    if (nuevosPuntos >= 300) {
      nuevoNivel = 'DIAMANTE';
    } else if (nuevosPuntos >= 150) {
      nuevoNivel = 'ORO';
    } else if (nuevosPuntos >= 50) {
      nuevoNivel = 'PLATA';
    } else {
      nuevoNivel = 'BRONCE';
    }

    const clienteActualizado = await db.cliente.update({
      where: { id: data.clienteId },
      data: {
        puntosFidelidad: nuevosPuntos,
        nivelFidelidad: nuevoNivel,
      }
    });

    return NextResponse.json({
      success: true,
      cliente: clienteActualizado,
      canje: {
        puntosCanjeados: puntosCanjear,
        valorDescuento,
        puntosRestantes: nuevosPuntos,
      },
      mensaje: `Canje exitoso: $${valorDescuento.toLocaleString()} de descuento`
    });
  } catch (error) {
    console.error('Error canjeando puntos:', error);
    return NextResponse.json(
      { error: 'Error canjeando puntos de fidelidad' },
      { status: 500 }
    );
  }
}
