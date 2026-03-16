import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Dashboard KPIs
export async function GET() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Ventas del día (reservas completadas)
    const ventasHoy = await db.reserva.aggregate({
      where: {
        createdAt: { gte: hoy },
        estado: 'COMPLETADA',
      },
      _sum: { precioFinal: true },
    });

    // Ventas del mes
    const ventasMes = await db.reserva.aggregate({
      where: {
        createdAt: { gte: inicioMes },
        estado: 'COMPLETADA',
      },
      _sum: { precioFinal: true },
    });

    // Citas de hoy
    const citasHoy = await db.reserva.count({
      where: {
        fecha: hoy.toISOString().split('T')[0],
        estado: { in: ['PENDIENTE', 'CONFIRMADA', 'EN_PROCESO'] },
      },
    });

    // Citas pendientes totales
    const citasPendientes = await db.reserva.count({
      where: {
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
    });

    // Clientes nuevos del mes
    const nuevosClientes = await db.cliente.count({
      where: {
        createdAt: { gte: inicioMes },
      },
    });

    // Productos con stock bajo
    const productosStockBajo = await db.producto.count({
      where: {
        activo: true,
        stockActual: { lte: db.producto.fields.stockMinimo },
      },
    });

    // Comisiones pendientes
    const comisionesPendientes = await db.comision.aggregate({
      where: { estado: 'PENDIENTE' },
      _sum: { montoComision: true },
    });

    // Productos stock bajo detalle
    const productosAlerta = await db.producto.findMany({
      where: {
        activo: true,
        stockActual: { lte: db.producto.fields.stockMinimo },
      },
      take: 5,
      orderBy: { stockActual: 'asc' },
    });

    // Próximas citas
    const proximasCitas = await db.reserva.findMany({
      where: {
        fecha: { gte: hoy.toISOString().split('T')[0] },
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
      take: 5,
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
      include: {
        cliente: true,
        servicio: true,
      },
    });

    // Generar alertas
    const alertas = [];

    if (productosStockBajo > 0) {
      alertas.push({
        id: 'stock-bajo',
        tipo: 'stock',
        mensaje: `${productosStockBajo} productos con stock bajo`,
        prioridad: 'alta',
        fecha: new Date().toISOString(),
      });
    }

    if (comisionesPendientes._sum.montoComision && comisionesPendientes._sum.montoComision > 0) {
      alertas.push({
        id: 'comisiones-pendientes',
        tipo: 'pago',
        mensaje: `Comisiones pendientes por $${comisionesPendientes._sum.montoComision.toLocaleString()}`,
        prioridad: 'media',
        fecha: new Date().toISOString(),
      });
    }

    // KPIs
    const kpis = {
      ventasHoy: ventasHoy._sum.precioFinal || 0,
      ventasMes: ventasMes._sum.precioFinal || 0,
      citasHoy,
      citasPendientes,
      nuevosClientes,
      productosStockBajo,
      comisionesPendientes: comisionesPendientes._sum.montoComision || 0,
    };

    return NextResponse.json({
      kpis,
      alertas,
      productosAlerta,
      proximasCitas,
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    return NextResponse.json(
      { error: 'Error obteniendo dashboard' },
      { status: 500 }
    );
  }
}