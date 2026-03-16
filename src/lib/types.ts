// ========================================
// DEXI'S NAILS - TIPOS TYPESCRIPT EMPRESARIAL
// ========================================

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔐 AUTENTICACIÓN Y ROLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type RolUsuario = 
  | 'SUPER_ADMIN' 
  | 'GERENTE' 
  | 'RECEPCIONISTA' 
  | 'PROFESIONAL' 
  | 'INVENTARIO' 
  | 'MARKETING' 
  | 'CONTABILIDAD';

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  foto?: string;
  telefono?: string;
  createdAt: string;
  updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 CLIENTES Y FIDELIZACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type NivelFidelidad = 'BRONCE' | 'PLATA' | 'ORO' | 'DIAMANTE';

export interface Cliente {
  id: string;
  cedula?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  notas?: string;
  puntosFidelidad: number;
  nivelFidelidad: NivelFidelidad;
  fechaUltimaVisita?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏭 PROVEEDORES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Proveedor {
  id: string;
  nombre: string;
  nit?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais: string;
  web?: string;
  notas?: string;
  rating: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluacionProveedor {
  id: string;
  proveedorId: string;
  fecha: string;
  puntualidad: number;
  calidad: number;
  precio: number;
  servicio: number;
  notas?: string;
  puntajeTotal: number;
}

export interface ContratoProveedor {
  id: string;
  proveedorId: string;
  numeroContrato: string;
  fechaInicio: string;
  fechaFin?: string;
  terminos: string;
  descuentoAcordado: number;
  plazoPago: number;
  activo: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 INVENTARIO Y PRODUCTOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CategoriaProducto {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
}

export type TipoMovimiento = 
  | 'ENTRADA' 
  | 'SALIDA_VENTA' 
  | 'SALIDA_SERVICIO' 
  | 'AJUSTE' 
  | 'PERDIDA' 
  | 'DEVOLUCION' 
  | 'TRANSFERENCIA';

export interface Producto {
  id: string;
  codigo: string;
  codigoBarras?: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: string;
  precioCosto: number;
  precioVenta: number;
  precioMayoreo?: number;
  stockActual: number;
  stockMinimo: number;
  stockMaximo?: number;
  puntoReorden: number;
  ubicacion?: string;
  fechaCaducidad?: string;
  fechaUltimaCompra?: string;
  activo: boolean;
  esPerecedero: boolean;
  diasGarantia?: number;
  ivaPorcentaje: number;
  ivaActivo: boolean;
  tipo: 'producto' | 'colonia';
  notas?: string;
  foto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductoProveedor {
  id: string;
  productoId: string;
  proveedorId: string;
  codigoProveedor?: string;
  precioCosto: number;
  tiempoEntrega: number;
  esPrincipal: boolean;
}

export interface MovimientoInventario {
  id: string;
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo?: string;
  referencia?: string;
  usuarioId?: string;
  createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛒 ÓRDENES DE COMPRA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EstadoOrden = 
  | 'BORRADOR' 
  | 'PENDIENTE' 
  | 'CONFIRMADA' 
  | 'EN_CAMINO' 
  | 'RECIBIDA_PARCIAL' 
  | 'RECIBIDA_COMPLETA' 
  | 'CANCELADA';

export interface OrdenCompra {
  id: string;
  numeroOrden: string;
  proveedorId: string;
  fechaOrden: string;
  fechaEntrega?: string;
  fechaRecibido?: string;
  estado: EstadoOrden;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  notas?: string;
  direccionEnvio?: string;
  creadoPor?: string;
  recibidoPor?: string;
}

export interface DetalleOrdenCompra {
  id: string;
  ordenId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  cantidadRecibida: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💇 SERVICIOS DEL SALÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Servicio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  duracion: number;
  precio: number;
  precioPromocion?: number;
  comisionPorcentaje: number;
  activo: boolean;
  requiereDeposito: boolean;
}

export interface DetalleServicioUsado {
  id: string;
  servicioId?: string;
  productoId: string;
  cantidad: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📅 RESERVAS Y AGENDA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EstadoReserva = 
  | 'PENDIENTE' 
  | 'CONFIRMADA' 
  | 'EN_PROCESO' 
  | 'COMPLETADA' 
  | 'CANCELADA' 
  | 'NO_ASISTIO' 
  | 'REPROGRAMADA';

export interface Reserva {
  id: string;
  codigo: string;
  clienteId?: string;
  profesionalId?: string;
  servicioId?: string;
  fecha: string;
  horaInicio: string;
  horaFin?: string;
  estado: EstadoReserva;
  precioOriginal?: number;
  descuento: number;
  precioFinal?: number;
  notas?: string;
  recordatorioEnviado: boolean;
  rating?: number;
  comentario?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  cliente?: Cliente;
  profesional?: AdminUser;
  servicio?: Servicio;
}

export interface HorarioProfesional {
  id: string;
  profesionalId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export type TipoBloqueo = 'VACACIONES' | 'INCAPACIDAD' | 'CAPACITACION' | 'PERSONAL' | 'OTRO';

export interface BloqueoAgenda {
  id: string;
  profesionalId?: string;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
  tipo: TipoBloqueo;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 VENTAS (TIENDA Y SERVICIOS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MetodoPago = 
  | 'EFECTIVO' 
  | 'TARJETA_CREDITO' 
  | 'TARJETA_DEBITO' 
  | 'TRANSFERENCIA' 
  | 'NEQUI' 
  | 'DAVIPLATA' 
  | 'PSE' 
  | 'GIFT_CARD' 
  | 'PUNTOS_FIDELIDAD' 
  | 'MIXTO';

export type EstadoCompra = 
  | 'PENDIENTE' 
  | 'COMPLETADA' 
  | 'CANCELADA' 
  | 'ENVIANDO' 
  | 'ENTREGADA' 
  | 'DEVUELTA';

export interface Compra {
  id: string;
  numeroFactura: string;
  clienteId?: string;
  fecha: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoCompra;
  notas?: string;
  direccionEnvio?: string;
  costoEnvio: number;
  fechaEnvio?: string;
  codigoSeguimiento?: string;
}

export interface DetalleCompra {
  id: string;
  compraId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💵 PAGOS Y CAJA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EstadoPago = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO' | 'REEMBOLSADO';

export interface Pago {
  id: string;
  reservaId?: string;
  compraId?: string;
  monto: number;
  metodoPago: MetodoPago;
  codigoTransaccion?: string;
  fecha: string;
  estado: EstadoPago;
  pagoPadreId?: string;
}

export type EstadoCaja = 'ABIERTA' | 'CERRADA' | 'CUADRADA' | 'DIFERENCIA';

export interface Caja {
  id: string;
  fecha: string;
  montoApertura: number;
  horaApertura: string;
  abiertaPor?: string;
  montoCierre?: number;
  horaCierre?: string;
  cerradaPor?: string;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasOtras: number;
  retiros: number;
  ingresosExtra: number;
  diferencia: number;
  notas?: string;
  estado: EstadoCaja;
}

export type TipoMovimientoCaja = 
  | 'VENTA_EFECTIVO' 
  | 'RETIRO' 
  | 'INGRESO_EXTRA' 
  | 'GASTO' 
  | 'CAMBIO' 
  | 'AJUSTE';

export interface MovimientoCaja {
  id: string;
  cajaId: string;
  tipo: TipoMovimientoCaja;
  monto: number;
  concepto: string;
  comprobante?: string;
  registradoPor?: string;
  createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 NÓMINA Y COMISIONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type EstadoComision = 'PENDIENTE' | 'PAGADA' | 'CANCELADA';

export interface Comision {
  id: string;
  profesionalId: string;
  reservaId?: string;
  fecha: string;
  montoServicio: number;
  porcentaje: number;
  montoComision: number;
  estado: EstadoComision;
  fechaPago?: string;
}

export type EstadoAsistencia = 'PENDIENTE' | 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'PERMISO';

export interface Asistencia {
  id: string;
  profesionalId: string;
  fecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  horasTrabajadas?: number;
  estado: EstadoAsistencia;
  notas?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 MARKETING Y FIDELIZACIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO' | 'SERVICIO_GRATIS';

export interface Cupon {
  id: string;
  codigo: string;
  descripcion: string;
  tipoDescuento: TipoDescuento;
  valor: number;
  montoMinimo?: number;
  usosMaximos?: number;
  usosActuales: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  unicoPorCliente: boolean;
}

export interface CuponRedencion {
  id: string;
  cuponId: string;
  clienteId?: string;
  fecha: string;
  montoDescontado: number;
}

export type EstadoGiftCard = 'ACTIVA' | 'AGOTADA' | 'VENCIDA' | 'CANCELADA';

export interface GiftCard {
  id: string;
  codigo: string;
  montoOriginal: number;
  montoDisponible: number;
  montoUsado: number;
  compradorNombre?: string;
  compradorEmail?: string;
  destinatarioNombre?: string;
  destinatarioEmail?: string;
  mensaje?: string;
  fechaCompra: string;
  fechaVencimiento?: string;
  estado: EstadoGiftCard;
}

export interface GiftCardRedencion {
  id: string;
  giftCardId: string;
  clienteId?: string;
  fecha: string;
  monto: number;
}

export type TipoCampana = 'PROMOCION' | 'RECORDATORIO_CITA' | 'CUMPLEANOS' | 'REACTIVACION' | 'BIENVENIDA' | 'ENCUESTA';
export type CanalMarketing = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
export type EstadoCampana = 'BORRADOR' | 'PROGRAMADA' | 'ENVIANDO' | 'ENVIADA' | 'CANCELADA';

export interface CampanaMarketing {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoCampana;
  canal: CanalMarketing;
  mensaje: string;
  plantilla?: string;
  filtroClientes?: string;
  fechaProgramada?: string;
  fechaEnviada?: string;
  totalEnviados: number;
  totalAbiertos: number;
  totalClicks: number;
  estado: EstadoCampana;
  createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 ENCUESTAS Y FEEDBACK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Encuesta {
  id: string;
  titulo: string;
  descripcion?: string;
  preguntas: string;
  activa: boolean;
}

export interface EncuestaRespuesta {
  id: string;
  encuestaId?: string;
  clienteId?: string;
  reservaId?: string;
  respuestas: string;
  rating?: number;
  comentario?: string;
  fecha: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 REPORTES Y AUDITORÍA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AuditoriaLog {
  id: string;
  usuarioId?: string;
  accion: string;
  tabla: string;
  registroId: string;
  datosAnteriores?: string;
  datosNuevos?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN DEL SISTEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Configuracion {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo?: string;
  createdAt: string;
  updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 JUEGO (SPACE SHOOTER)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GameScore {
  id: string;
  jugadorNombre: string;
  score: number;
  nivel: number;
  createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📍 SUCURSALES (FUTURO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  email?: string;
  activa: boolean;
  createdAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 TIPOS DE UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Estado de navegación
export type Seccion = 
  | 'inicio' 
  | 'precios' 
  | 'reservas' 
  | 'ia' 
  | 'tienda' 
  | 'dashboard' 
  | 'juego' 
  | 'admin';

// Sub-secciones del admin
export type AdminSeccion = 
  | 'dashboard'
  | 'clientes'
  | 'profesionales'
  | 'proveedores'
  | 'inventario'
  | 'ordenes'
  | 'servicios'
  | 'reservas'
  | 'ventas'
  | 'finanzas'
  | 'caja'
  | 'nomina'
  | 'marketing'
  | 'cupones'
  | 'giftcards'
  | 'reportes'
  | 'configuracion'
  | 'encuestas';

// Datos del panel
export interface PanelMeta {
  icon: string;
  title: string;
  color: string;
}

// Mensaje de chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Nivel de fidelidad
export interface Nivel {
  nombre: string;
  icon: string;
  color: string;
  descuento: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 DASHBOARD KPIs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DashboardKPIs {
  ventasHoy: number;
  ventasMes: number;
  citasHoy: number;
  citasPendientes: number;
  nuevosClientes: number;
  productosStockBajo: number;
  comisionesPendientes: number;
  alertas: Alerta[];
}

export interface Alerta {
  id: string;
  tipo: 'stock' | 'pago' | 'reserva' | 'sistema';
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 CONSTANTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HORARIOS = [
  '9:00', '9:45', '10:30', '11:15', '12:00', 
  '14:00', '14:45', '15:30', '16:15', '17:00', '17:45'
];

export const DIAS_SEMANA = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 
  'Jueves', 'Viernes', 'Sábado'
];

export const NIVELES_FIDELIDAD: Nivel[] = [
  { nombre: 'BRONCE', icon: '🥉', color: '#CD7F32', descuento: 5 },
  { nombre: 'PLATA', icon: '🥈', color: '#C0C0C0', descuento: 10 },
  { nombre: 'ORO', icon: '🥇', color: '#FFD700', descuento: 15 },
  { nombre: 'DIAMANTE', icon: '💎', color: '#B9F2FF', descuento: 20 },
];

export const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const METODOS_PAGO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  TARJETA_DEBITO: 'Tarjeta de Débito',
  TRANSFERENCIA: 'Transferencia',
  NEQUI: 'Nequi',
  DAVIPLATA: 'DaviPlata',
  PSE: 'PSE',
  GIFT_CARD: 'Gift Card',
  PUNTOS_FIDELIDAD: 'Puntos de Fidelidad',
  MIXTO: 'Pago Mixto',
};

export const ESTADOS_RESERVA_LABELS: Record<EstadoReserva, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_PROCESO: 'En Proceso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No Asistió',
  REPROGRAMADA: 'Reprogramada',
};

export const ESTADOS_ORDEN_LABELS: Record<EstadoOrden, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  EN_CAMINO: 'En Camino',
  RECIBIDA_PARCIAL: 'Recibida Parcial',
  RECIBIDA_COMPLETA: 'Recibida Completa',
  CANCELADA: 'Cancelada',
};