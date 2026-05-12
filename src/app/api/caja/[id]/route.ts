import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una caja específica con todos sus movimientos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const caja = await db.caja.findUnique({
      where: { id },
      include: {
        movimientos: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!caja) {
      return NextResponse.json(
        { error: 'Caja no encontrada' },
        { status: 404 }
      );
    }

    // Calcular totales
    const totalMovimientos = caja.movimientos.reduce((acc, m) => {
      if (m.tipo === 'VENTA_EFECTIVO' || m.tipo === 'INGRESO_EXTRA') {
        return acc + m.monto;
      }
      if (m.tipo === 'RETIRO' || m.tipo === 'GASTO') {
        return acc - m.monto;
      }
      return acc;
    }, 0);

    const resumen = {
      totalVentasEfectivo: caja.movimientos
        .filter(m => m.tipo === 'VENTA_EFECTIVO')
        .reduce((s, m) => s + m.monto, 0),
      totalRetiros: caja.movimientos
        .filter(m => m.tipo === 'RETIRO')
        .reduce((s, m) => s + m.monto, 0),
      totalIngresosExtra: caja.movimientos
        .filter(m => m.tipo === 'INGRESO_EXTRA')
        .reduce((s, m) => s + m.monto, 0),
      totalGastos: caja.movimientos
        .filter(m => m.tipo === 'GASTO')
        .reduce((s, m) => s + m.monto, 0),
      balanceEsperado: caja.montoApertura + totalMovimientos,
    };

    return NextResponse.json({ ...caja, resumen });
  } catch (error) {
    console.error('Error obteniendo caja:', error);
    return NextResponse.json(
      { error: 'Error obteniendo caja' },
      { status: 500 }
    );
  }
}

// PUT - Cerrar caja
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const caja = await db.caja.findUnique({
      where: { id },
      include: { movimientos: true }
    });

    if (!caja) {
      return NextResponse.json(
        { error: 'Caja no encontrada' },
        { status: 404 }
      );
    }

    if (caja.estado !== 'ABIERTA') {
      return NextResponse.json(
        { error: 'Esta caja ya está cerrada' },
        { status: 400 }
      );
    }

    const montoCierre = parseFloat(data.montoCierre) || 0;
    
    // Calcular balance esperado
    const totalVentasEfectivo = caja.movimientos
      .filter(m => m.tipo === 'VENTA_EFECTIVO')
      .reduce((s, m) => s + m.monto, 0);
    const totalRetiros = caja.movimientos
      .filter(m => m.tipo === 'RETIRO')
      .reduce((s, m) => s + m.monto, 0);
    const totalIngresosExtra = caja.movimientos
      .filter(m => m.tipo === 'INGRESO_EXTRA')
      .reduce((s, m) => s + m.monto, 0);
    const totalGastos = caja.movimientos
      .filter(m => m.tipo === 'GASTO')
      .reduce((s, m) => s + m.monto, 0);

    const balanceEsperado = caja.montoApertura + totalVentasEfectivo + totalIngresosExtra - totalRetiros - totalGastos;
    const diferencia = montoCierre - balanceEsperado;

    // Determinar estado final
    let estado: 'CERRADA' | 'CUADRADA' | 'DIFERENCIA' = 'CERRADA';
    if (Math.abs(diferencia) < 1) {
      estado = 'CUADRADA';
    } else if (Math.abs(diferencia) >= 1) {
      estado = 'DIFERENCIA';
    }

    const cajaCerrada = await db.caja.update({
      where: { id },
      data: {
        montoCierre,
        horaCierre: new Date(),
        cerradaPor: data.cerradaPor || 'Sistema',
        ventasEfectivo: totalVentasEfectivo,
        retiros: totalRetiros,
        ingresosExtra: totalIngresosExtra,
        diferencia,
        estado,
        notas: data.notas || caja.notas,
      },
    });

    return NextResponse.json({
      ...cajaCerrada,
      balanceEsperado,
      diferencia,
      estado
    });
  } catch (error) {
    console.error('Error cerrando caja:', error);
    return NextResponse.json(
      { error: 'Error cerrando caja' },
      { status: 500 }
    );
  }
}
