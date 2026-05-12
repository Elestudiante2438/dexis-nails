import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Ajustar puntos de fidelidad de un cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.clienteId || data.puntos === undefined) {
      return NextResponse.json(
        { error: 'Cliente ID y puntos son requeridos' },
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

    const puntosActuales = cliente.puntosFidelidad;
    const nuevosPuntos = puntosActuales + parseInt(data.puntos);

    // Calcular nuevo nivel
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
        puntosFidelidad: Math.max(0, nuevosPuntos),
        nivelFidelidad: nuevoNivel,
        fechaUltimaVisita: data.tipo === 'visita' ? new Date() : cliente.fechaUltimaVisita,
      }
    });

    return NextResponse.json({
      success: true,
      cliente: clienteActualizado,
      mensaje: data.puntos >= 0 
        ? `Se agregaron ${data.puntos} puntos` 
        : `Se restaron ${Math.abs(data.puntos)} puntos`
    });
  } catch (error) {
    console.error('Error ajustando puntos:', error);
    return NextResponse.json(
      { error: 'Error ajustando puntos de fidelidad' },
      { status: 500 }
    );
  }
}
