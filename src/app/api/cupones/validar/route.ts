import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Validar y aplicar un cupón
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { codigo, montoCompra, clienteId } = data;

    if (!codigo) {
      return NextResponse.json(
        { valido: false, error: 'Código de cupón requerido' },
        { status: 400 }
      );
    }

    const cupon = await db.cupon.findUnique({
      where: { codigo: codigo.toUpperCase() },
    });

    if (!cupon) {
      return NextResponse.json(
        { valido: false, error: 'Cupón no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si está activo
    if (!cupon.activo) {
      return NextResponse.json(
        { valido: false, error: 'Este cupón ya no está activo' }
      );
    }

    const ahora = new Date();

    // Verificar fechas de vigencia
    if (cupon.fechaInicio > ahora) {
      return NextResponse.json(
        { valido: false, error: 'Este cupón aún no está vigente' }
      );
    }

    if (cupon.fechaFin < ahora) {
      return NextResponse.json(
        { valido: false, error: 'Este cupón ha expirado' }
      );
    }

    // Verificar usos máximos
    if (cupon.usosMaximos && cupon.usosActuales >= cupon.usosMaximos) {
      return NextResponse.json(
        { valido: false, error: 'Este cupón ha alcanzado su límite de usos' }
      );
    }

    // Verificar monto mínimo
    if (cupon.montoMinimo && montoCompra && montoCompra < cupon.montoMinimo) {
      return NextResponse.json(
        { 
          valido: false, 
          error: `Compra mínima de $${cupon.montoMinimo.toLocaleString()} requerida` 
        }
      );
    }

    // Verificar si es único por cliente
    if (cupon.unicoPorCliente && clienteId) {
      const redencionPrevia = await db.cuponRedencion.findFirst({
        where: {
          cuponId: cupon.id,
          clienteId,
        }
      });

      if (redencionPrevia) {
        return NextResponse.json(
          { valido: false, error: 'Ya usaste este cupón anteriormente' }
        );
      }
    }

    // Calcular descuento
    let descuentoCalculado = 0;
    if (montoCompra) {
      if (cupon.tipoDescuento === 'PORCENTAJE') {
        descuentoCalculado = montoCompra * (cupon.valor / 100);
      } else if (cupon.tipoDescuento === 'MONTO_FIJO') {
        descuentoCalculado = cupon.valor;
      } else if (cupon.tipoDescuento === 'SERVICIO_GRATIS') {
        descuentoCalculado = montoCompra; // 100% descuento
      }
    }

    return NextResponse.json({
      valido: true,
      cupon: {
        id: cupon.id,
        codigo: cupon.codigo,
        descripcion: cupon.descripcion,
        tipoDescuento: cupon.tipoDescuento,
        valor: cupon.valor,
        descuentoCalculado,
      }
    });
  } catch (error) {
    console.error('Error validando cupón:', error);
    return NextResponse.json(
      { valido: false, error: 'Error validando cupón' },
      { status: 500 }
    );
  }
}
