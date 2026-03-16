import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const stockBajo = searchParams.get('stockBajo');

    const where: Record<string, unknown> = { activo: true };

    if (categoria) {
      where.categoriaId = categoria;
    }

    if (stockBajo === 'true') {
      // Productos con stock bajo
      const productos = await db.$queryRaw`
        SELECT * FROM productos 
        WHERE activo = 1 
        AND stockActual <= stockMinimo
        ORDER BY stockActual ASC
      `;
      return NextResponse.json(productos);
    }

    const productos = await db.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo productos' },
      { status: 500 }
    );
  }
}

// POST - Crear producto
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.nombre || !data.codigo) {
      return NextResponse.json(
        { error: 'Nombre y código son requeridos' },
        { status: 400 }
      );
    }

    // Verificar código único
    const existente = await db.producto.findUnique({
      where: { codigo: data.codigo },
    });
    if (existente) {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese código' },
        { status: 400 }
      );
    }

    const producto = await db.producto.create({
      data: {
        codigo: data.codigo,
        codigoBarras: data.codigoBarras || null,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        categoriaId: data.categoriaId || null,
        precioCosto: data.precioCosto || 0,
        precioVenta: data.precioVenta || 0,
        precioMayoreo: data.precioMayoreo || null,
        stockActual: data.stockActual || 0,
        stockMinimo: data.stockMinimo || 5,
        stockMaximo: data.stockMaximo || null,
        puntoReorden: data.puntoReorden || 10,
        ubicacion: data.ubicacion || null,
        fechaCaducidad: data.fechaCaducidad ? new Date(data.fechaCaducidad) : null,
        esPerecedero: data.esPerecedero || false,
        diasGarantia: data.diasGarantia || null,
        tipo: data.tipo || 'producto',
        notas: data.notas || null,
        foto: data.foto || null,
      },
    });

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json(
      { error: 'Error creando producto' },
      { status: 500 }
    );
  }
}