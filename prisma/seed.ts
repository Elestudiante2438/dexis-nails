// ═══════════════════════════════════════════════════
// DEXI'S NAILS - SEMILLA DE DATOS INICIALES
// ═══════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Dexi\'s Nails...\n');

  // ═══════════════════════════════════════════════════
  // 1. EMPLEADOS / PROFESIONALES
  // ═══════════════════════════════════════════════════
  console.log('👤 Creando empleados...');
  
  const empleados = [
    {
      email: 'dexi@dexisnails.com',
      password: 'dexi2026',
      nombre: 'Dexi',
      rol: 'SUPER_ADMIN' as const,
      activo: true,
      telefono: '+57 320 123 4567',
    },
    {
      email: 'valentina@dexisnails.com',
      password: 'valentina2026',
      nombre: 'Valentina',
      rol: 'PROFESIONAL' as const,
      activo: true,
      telefono: '+57 320 234 5678',
    },
    {
      email: 'carolina@dexisnails.com',
      password: 'carolina2026',
      nombre: 'Carolina',
      rol: 'PROFESIONAL' as const,
      activo: true,
      telefono: '+57 320 345 6789',
    },
    {
      email: 'dario@dexisnails.com',
      password: 'dario2026',
      nombre: 'Dario',
      rol: 'GERENTE' as const,
      activo: true,
      telefono: '+57 320 456 7890',
    },
    {
      email: 'antonio@dexisnails.com',
      password: 'antonio2026',
      nombre: 'Antonio',
      rol: 'GERENTE' as const,
      activo: true,
      telefono: '+57 320 567 8901',
    },
  ];

  for (const empleado of empleados) {
    const existente = await prisma.adminUser.findUnique({
      where: { email: empleado.email },
    });
    
    if (!existente) {
      await prisma.adminUser.create({ data: empleado });
      console.log(`  ✅ ${empleado.nombre} (${empleado.rol})`);
    } else {
      console.log(`  ⏭️  ${empleado.nombre} ya existe`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 2. SERVICIOS
  // ═══════════════════════════════════════════════════
  console.log('\n💅 Creando servicios...');
  
  const servicios = [
    // MANICURA
    { codigo: 'MAN-001', nombre: 'Manicura tradicional', descripcion: 'Corte, limado y esmaltado clásico con acabado perfecto', categoria: 'MANICURA', duracion: 30, precio: 25000, comisionPorcentaje: 30 },
    { codigo: 'MAN-002', nombre: 'Manicura con diseños', descripcion: 'Arte en uñas, stickers, brillos y diseños personalizados', categoria: 'MANICURA', duracion: 45, precio: 35000, comisionPorcentaje: 30 },
    { codigo: 'MAN-003', nombre: 'Semipermanente', descripcion: 'Duración 2–3 semanas, alto brillo y colores vibrantes', categoria: 'MANICURA', duracion: 45, precio: 35000, comisionPorcentaje: 30 },
    { codigo: 'MAN-004', nombre: 'Press On', descripcion: 'Uñas postizas personalizadas, fácil de poner y retirar', categoria: 'MANICURA', duracion: 30, precio: 40000, comisionPorcentaje: 30 },
    { codigo: 'MAN-005', nombre: 'Base Rubber', descripcion: 'Fortalecedor para uñas débiles o dañadas', categoria: 'MANICURA', duracion: 15, precio: 15000, comisionPorcentaje: 30 },
    
    // PODOLOGÍA
    { codigo: 'POD-001', nombre: 'Podología integral', descripcion: 'Diagnóstico y tratamiento completo de pies', categoria: 'PODOLOGIA', duracion: 45, precio: 45000, comisionPorcentaje: 35 },
    { codigo: 'POD-002', nombre: 'Pedicure tradicional', descripcion: 'Corte, limado, callos e hidratación profunda', categoria: 'PODOLOGIA', duracion: 40, precio: 35000, comisionPorcentaje: 30 },
    { codigo: 'POD-003', nombre: 'Terapia con parafina', descripcion: 'Hidratación profunda para pies y manos. Relajación total', categoria: 'PODOLOGIA', duracion: 30, precio: 30000, comisionPorcentaje: 25 },
    
    // FACIAL
    { codigo: 'FAC-001', nombre: 'Limpieza facial básica', descripcion: 'Higiene profunda e hidratación revitalizante', categoria: 'FACIAL', duracion: 45, precio: 40000, comisionPorcentaje: 30 },
    { codigo: 'FAC-002', nombre: 'Limpieza facial profunda', descripcion: 'Exfoliación, extracción y mascarilla premium', categoria: 'FACIAL', duracion: 60, precio: 65000, comisionPorcentaje: 35 },
  ];

  for (const servicio of servicios) {
    const existente = await prisma.servicio.findUnique({
      where: { codigo: servicio.codigo },
    });
    
    if (!existente) {
      await prisma.servicio.create({ data: servicio });
      console.log(`  ✅ ${servicio.nombre} (${servicio.categoria})`);
    } else {
      console.log(`  ⏭️  ${servicio.nombre} ya existe`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 3. CONFIGURACIÓN DEL NEGOCIO
  // ═══════════════════════════════════════════════════
  console.log('\n⚙️ Creando configuración...');
  
  const configuraciones = [
    { clave: 'nombre_negocio', valor: "Dexi's Nails", descripcion: 'Nombre del salón' },
    { clave: 'direccion', valor: 'Centro Comercial Plaza Mayor, Local 123', descripcion: 'Dirección del negocio' },
    { clave: 'telefono', valor: '+57 320 123 4567', descripcion: 'Teléfono de contacto' },
    { clave: 'email', valor: 'contacto@dexisnails.com', descripcion: 'Email de contacto' },
    { clave: 'horario_apertura', valor: '09:00', descripcion: 'Hora de apertura' },
    { clave: 'horario_cierre', valor: '18:00', descripcion: 'Hora de cierre' },
    { clave: 'dias_laborales', valor: 'Lunes a Sábado', descripcion: 'Días de atención' },
    { clave: 'puntos_por_reserva', valor: '10', descripcion: 'Puntos de fidelidad por reserva' },
    { clave: 'puntos_por_compra', valor: '5', descripcion: 'Puntos de fidelidad por cada $10.000 en compras' },
    { clave: 'moneda', valor: 'COP', descripcion: 'Moneda del negocio' },
    { clave: 'iva_activo', valor: 'false', descripcion: 'Si el IVA está activo' },
    { clave: 'porcentaje_iva', valor: '19', descripcion: 'Porcentaje de IVA' },
  ];

  for (const config of configuraciones) {
    const existente = await prisma.configuracion.findUnique({
      where: { clave: config.clave },
    });
    
    if (!existente) {
      await prisma.configuracion.create({ data: config });
      console.log(`  ✅ ${config.clave}: ${config.valor}`);
    } else {
      console.log(`  ⏭️  ${config.clave} ya existe`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 4. PRODUCTOS DE TIENDA
  // ═══════════════════════════════════════════════════
  console.log('\n🛍️ Creando productos de tienda...');
  
  const productos = [
    { codigo: 'COL-001', codigoBarras: '7501234567890', nombre: 'Agua de Oriente', descripcion: 'Colonia fresca con notas cítricas y un toque de azahar', precioCosto: 25000, precioVenta: 45900, stockActual: 10, stockMinimo: 3, tipo: 'colonia' },
    { codigo: 'COL-002', codigoBarras: '7501234567891', nombre: 'Brisas de Dubai', descripcion: 'Colonia fresca con notas marinas y fondo de almizcle', precioCosto: 28000, precioVenta: 49900, stockActual: 8, stockMinimo: 3, tipo: 'colonia' },
    { codigo: 'COL-003', codigoBarras: '7501234567892', nombre: 'Flor de Azahar', descripcion: 'Colonia floral suave con notas de azahar y neroli', precioCosto: 22000, precioVenta: 42500, stockActual: 12, stockMinimo: 3, tipo: 'colonia' },
    { codigo: 'PER-001', codigoBarras: '7501234567893', nombre: 'La Bestia Negra', descripcion: 'Perfume intenso y profundo con notas amaderadas', precioCosto: 55000, precioVenta: 89900, stockActual: 5, stockMinimo: 2, tipo: 'perfume' },
    { codigo: 'PER-002', codigoBarras: '7501234567894', nombre: 'Oud Silver', descripcion: 'Frescura plateada con notas cítricas y oud intenso', precioCosto: 58000, precioVenta: 95000, stockActual: 6, stockMinimo: 2, tipo: 'perfume' },
    { codigo: 'PER-003', codigoBarras: '7501234567895', nombre: 'Rose Noir', descripcion: 'Rosa oscura fusionada con pachulí y especias', precioCosto: 56000, precioVenta: 92500, stockActual: 7, stockMinimo: 2, tipo: 'perfume' },
    { codigo: 'PER-004', codigoBarras: '7501234567896', nombre: 'Amber Gold', descripcion: 'Ámbar dorado con vainilla y resinas. Cálido y dulce', precioCosto: 52000, precioVenta: 87900, stockActual: 9, stockMinimo: 2, tipo: 'perfume' },
  ];

  for (const producto of productos) {
    const existente = await prisma.producto.findUnique({
      where: { codigo: producto.codigo },
    });
    
    if (!existente) {
      await prisma.producto.create({ data: producto });
      console.log(`  ✅ ${producto.nombre} (${producto.tipo})`);
    } else {
      console.log(`  ⏭️  ${producto.nombre} ya existe`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 5. PROVEEDORES DE EJEMPLO
  // ═══════════════════════════════════════════════════
  console.log('\n🏭 Creando proveedores...');
  
  const proveedores = [
    { nombre: 'Perfumes Árabes Colombia', nit: '900123456-1', contacto: 'Carlos Mendoza', email: 'carlos@perfumesarabes.com', telefono: '+57 1 234 5678', ciudad: 'Bogotá', pais: 'Colombia', rating: 4.8 },
    { nombre: 'Belleza Premium SAS', nit: '900234567-2', contacto: 'María García', email: 'maria@bellezapremium.com', telefono: '+57 1 345 6789', ciudad: 'Medellín', pais: 'Colombia', rating: 4.5 },
    { nombre: 'Distribuidora NailPro', nit: '900345678-3', contacto: 'Ana López', email: 'ana@nailpro.com', telefono: '+57 1 456 7890', ciudad: 'Cali', pais: 'Colombia', rating: 4.7 },
  ];

  for (const proveedor of proveedores) {
    const existente = await prisma.proveedor.findFirst({
      where: { nit: proveedor.nit },
    });
    
    if (!existente) {
      await prisma.proveedor.create({ data: proveedor });
      console.log(`  ✅ ${proveedor.nombre}`);
    } else {
      console.log(`  ⏭️  ${proveedor.nombre} ya existe`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 6. CUPONES DE EJEMPLO
  // ═══════════════════════════════════════════════════
  console.log('\n🎟️ Creando cupones...');
  
  const cupones = [
    { codigo: 'BIENVENIDA10', descripcion: '10% de descuento para nuevos clientes', tipoDescuento: 'PORCENTAJE' as const, valor: 10, montoMinimo: 30000, usosMaximos: 100, fechaInicio: new Date(), fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), activo: true, unicoPorCliente: true },
    { codigo: 'FIDELIDAD15', descripcion: '15% de descuento para clientes Diamond', tipoDescuento: 'PORCENTAJE' as const, valor: 15, montoMinimo: 50000, usosMaximos: null, fechaInicio: new Date(), fechaFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), activo: true, unicoPorCliente: false },
    { codigo: 'DESCUENTO5K', descripcion: '$5.000 de descuento en cualquier servicio', tipoDescuento: 'MONTO_FIJO' as const, valor: 5000, montoMinimo: 25000, usosMaximos: 50, fechaInicio: new Date(), fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), activo: true, unicoPorCliente: false },
  ];

  for (const cupon of cupones) {
    const existente = await prisma.cupon.findUnique({
      where: { codigo: cupon.codigo },
    });
    
    if (!existente) {
      await prisma.cupon.create({ data: cupon });
      console.log(`  ✅ ${cupon.codigo} (${cupon.tipoDescuento})`);
    } else {
      console.log(`  ⏭️  ${cupon.codigo} ya existe`);
    }
  }

  console.log('\n✨ ¡Seed completado con éxito!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
