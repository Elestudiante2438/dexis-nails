'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════
// DEXI'S NAILS — Experiencia Cósmica
// © 2026 Dexi's Nails. Todos los derechos reservados.
// Desarrollado con ♥ para Dexi's Nails
// ═══════════════════════════════════════════════════

// ── TIPOS ──
interface Profesional {
  id: number;
  nombre: string;
  emoji: string;
  especialidad: string;
  activa: boolean;
}

interface Reserva {
  id: number;
  cedula: string;
  cliente: string;
  profesional: number;
  profesionalNombre: string;
  fecha: string;
  hora: string;
  servicio: string;
  estado: string;
  creada: string;
}

interface Cliente {
  cedula: string;
  nombre: string;
  telefono?: string;
  email?: string;
  fechaReg: string;
}

interface Compra {
  id: number;
  cedula: string;
  clienteNombre: string;
  producto: string;
  tipo: string;
  precio: number;
  fecha: string;
}

interface Bloqueo {
  id: number;
  profesional: number | 'todos';
  profesionalNombre: string;
  fecha: string;
  motivo: string;
  creado: string;
}

interface Producto {
  id: number;
  nombre: string;
  tipo: string;
  precio: number;
  stock: number;
  svg?: string;
  desc?: string;
  notas?: string[];
  foto?: string;
}

interface AdminUser {
  usuario: string;
  clave: string;
  rol: string;
  tipo?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Configuracion {
  nombreNegocio: string;
  direccion: string;
  telefono: string;
  email: string;
  horaApertura: string;
  horaCierre: string;
  diasCerrado: string[];
  mensajeBienvenida: string;
}

interface AuditLog {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  detalle: string;
  tipo: 'reserva' | 'cliente' | 'venta' | 'admin' | 'sistema' | 'caja';
}

interface TransaccionCaja {
  id: number;
  tipo: 'apertura' | 'ingreso' | 'egreso' | 'venta' | 'cierre';
  monto: number;
  descripcion: string;
  fecha: string;
  usuario: string;
  metodo: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
  cajaId: number;
}

interface CajaDia {
  id: number;
  fecha: string;
  horaApertura: string;
  horaCierre?: string;
  montoInicial: number;
  montoFinal?: number;
  estado: 'abierta' | 'cerrada';
  usuarioApertura: string;
  usuarioCierre?: string;
}

interface Empleado {
  id: number;
  nombre: string;
  emoji: string;
  especialidad: string;
  activa: boolean;
  rol: 'profesional' | 'asistente' | 'recepcionista' | 'gerente';
  telefono?: string;
  email?: string;
  fechaIngreso: string;
  comision: number; // Porcentaje
  horarios: { dia: string; horaInicio: string; horaFin: string }[];
  salarioBase?: number;
}

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria: string;
  notas?: string;
  activo: boolean;
}

interface OrdenCompra {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  fecha: string;
  items: { producto: string; cantidad: number; precioUnitario: number }[];
  total: number;
  estado: 'pendiente' | 'recibida' | 'cancelada';
}

interface Cupon {
  id: number;
  codigo: string;
  descuento: number;
  tipoDescuento: 'porcentaje' | 'fijo';
  fechaInicio: string;
  fechaFin: string;
  usosMaximos: number;
  usosActuales: number;
  activo: boolean;
  minimoCompra?: number;
}

interface GiftCard {
  id: number;
  codigo: string;
  saldoInicial: number;
  saldoActual: number;
  comprador?: string;
  destinatario?: string;
  fechaCompra: string;
  fechaVencimiento: string;
  activa: boolean;
  historial: { fecha: string; monto: number; descripcion: string }[];
}

interface ComisionRegistro {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  servicio: string;
  montoVenta: number;
  porcentaje: number;
  comision: number;
  pagada: boolean;
}

// ── DATOS BASE ──
const PROFESIONALES_DEFAULT: Profesional[] = [
  { id: 1, nombre: 'Dexi', emoji: '👩', especialidad: 'Podología & Manicura', activa: true },
  { id: 2, nombre: 'Valentina', emoji: '💁', especialidad: 'Manicura & Diseños', activa: true },
  { id: 3, nombre: 'Carolina', emoji: '🙆', especialidad: 'Parafina & Facial', activa: true },
];

const HORARIOS = ['9:00', '9:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45'];

const ADMIN_DEFAULT: AdminUser[] = [
  { usuario: 'Dro', clave: 'dro2026', rol: 'admin', tipo: 'default' },
  { usuario: 'Antonio', clave: 'antonio2026', rol: 'admin', tipo: 'default' },
  { usuario: 'Decsi', clave: 'decsi2026', rol: 'admin', tipo: 'default' },
];

// ═══════════════════════════════════════════════════
// GAME CONSTANTS - DEXI'S NAILS ARCADIA
// ═══════════════════════════════════════════════════
const GCOL = {
  fucsia: '#ff1493',
  turquesa: '#00f5d4',
  morado: '#9b5de5',
  dorado: '#ffd700',
  azul: '#00b4d8',
  fondo: '#03040e',
};

const SHIP_COOLDOWN = 150;
const SHIP_SPEED = 5.5;
const BULLET_SPEED = 14;
const MAX_LB = 5;

const POWER_DEFS = [
  { type: 'triple', icon: '🔱', color: '#ffd700', label: 'Triple Disparo', duration: 8000 },
  { type: 'shield', icon: '🛡️', color: '#00b4d8', label: 'Escudo', duration: 6000 },
  { type: 'speed', icon: '⚡', color: '#00f5d4', label: 'Turbo', duration: 6000 },
  { type: 'rapid', icon: '🔥', color: '#ff1493', label: 'Disparo Rápido', duration: 7000 },
];

const INVENTARIO_DEFAULT: Producto[] = [
  { id: 1, nombre: 'Agua de Oriente', tipo: 'colonia', precio: 45900, stock: 10, svg: 'colonia1', desc: 'Colonia fresca con notas cítricas y un toque de azahar.', notas: ['Limón', 'Naranja', 'Azahar'] },
  { id: 2, nombre: 'Brisas de Dubai', tipo: 'colonia', precio: 49900, stock: 8, svg: 'colonia2', desc: 'Colonia fresca con notas marinas y fondo de almizcle.', notas: ['Marina', 'Almizcle', 'Madera'] },
  { id: 3, nombre: 'Flor de Azahar', tipo: 'colonia', precio: 42500, stock: 12, svg: 'colonia3', desc: 'Colonia floral suave con notas de azahar y neroli.', notas: ['Azahar', 'Neroli', 'Miel'] },
  { id: 4, nombre: 'La Bestia Negra', tipo: 'perfume', precio: 89900, stock: 5, svg: 'perfume1', desc: 'Perfume intenso y profundo con notas amaderadas.', notas: ['Cuero', 'Almizcle', 'Ámbar'] },
  { id: 5, nombre: 'Oud Silver', tipo: 'perfume', precio: 95000, stock: 6, svg: 'perfume2', desc: 'Frescura plateada con notas cítricas y oud intenso.', notas: ['Bergamota', 'Oud', 'Azafrán'] },
  { id: 6, nombre: 'Rose Noir', tipo: 'perfume', precio: 92500, stock: 7, svg: 'perfume3', desc: 'Rosa oscura fusionada con pachulí y especias.', notas: ['Rosa', 'Pachulí', 'Canela'] },
  { id: 7, nombre: 'Amber Gold', tipo: 'perfume', precio: 87900, stock: 9, svg: 'perfume4', desc: 'Ámbar dorado con vainilla y resinas. Cálido y dulce.', notas: ['Ámbar', 'Vainilla', 'Benjuí'] },
];

const CONFIG_DEFAULT: Configuracion = {
  nombreNegocio: "Dexi's Nails",
  direccion: 'Calle Principal #123, Centro',
  telefono: '+57 300 123 4567',
  email: 'contacto@dexisnails.com',
  horaApertura: '09:00',
  horaCierre: '18:00',
  diasCerrado: ['Domingo'],
  mensajeBienvenida: '¡Bienvenido a Dexi\'s Nails! Tu experiencia cósmica de belleza.',
};

// ═══════════════════════════════════════════════════
// BOTTLE SVGS - Frascos originales para la tienda
// ═══════════════════════════════════════════════════
const BOTTLE_SVGS: Record<string, string> = {
  colonia1: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:120px">
    <defs>
      <linearGradient id="cg1a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f7fa"/><stop offset="100%" stop-color="#00b8d4"/></linearGradient>
      <linearGradient id="cg1b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.6)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <rect x="44" y="8" width="32" height="14" rx="5" fill="#b2ebf2" stroke="#00acc1" stroke-width="1.5"/>
    <rect x="50" y="4" width="20" height="8" rx="3" fill="#00acc1"/>
    <rect x="48" y="22" width="24" height="12" rx="3" fill="#b2ebf2" stroke="#00acc1" stroke-width="1"/>
    <ellipse cx="60" cy="110" rx="38" ry="56" fill="url(#cg1a)" stroke="#00acc1" stroke-width="1.5"/>
    <ellipse cx="44" cy="80" rx="10" ry="22" fill="url(#cg1b)" opacity=".7"/>
    <ellipse cx="60" cy="118" rx="30" ry="44" fill="#80deea" opacity=".4"/>
    <rect x="28" y="95" width="64" height="32" rx="8" fill="white" opacity=".15" stroke="white" stroke-width=".5"/>
    <text x="60" y="113" text-anchor="middle" font-size="7" fill="white" font-family="serif" font-style="italic">Agua de</text>
    <text x="60" y="123" text-anchor="middle" font-size="7" fill="white" font-family="serif" font-style="italic">Oriente</text>
    <circle cx="48" cy="140" r="3" fill="white" opacity=".2"/>
    <circle cx="72" cy="155" r="2" fill="white" opacity=".15"/>
  </svg>`,

  colonia2: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:120px">
    <defs>
      <linearGradient id="cg2a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8f5e9"/><stop offset="100%" stop-color="#26a69a"/></linearGradient>
      <linearGradient id="cg2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.7)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <rect x="38" y="6" width="44" height="16" rx="3" fill="#80cbc4" stroke="#00897b" stroke-width="1.5"/>
    <rect x="46" y="2" width="28" height="8" rx="2" fill="#00897b"/>
    <rect x="44" y="22" width="32" height="10" rx="2" fill="#b2dfdb" stroke="#00897b" stroke-width="1"/>
    <rect x="22" y="32" width="76" height="120" rx="12" fill="url(#cg2a)" stroke="#00897b" stroke-width="1.5"/>
    <rect x="26" y="38" width="18" height="70" rx="9" fill="url(#cg2b)" opacity=".6"/>
    <rect x="26" y="80" width="68" height="68" rx="10" fill="#4db6ac" opacity=".35"/>
    <path d="M26 100 Q44 92 60 100 Q76 108 94 100" stroke="white" stroke-width="1" fill="none" opacity=".3"/>
    <path d="M26 115 Q44 107 60 115 Q76 123 94 115" stroke="white" stroke-width="1" fill="none" opacity=".2"/>
    <rect x="32" y="52" width="56" height="28" rx="6" fill="white" opacity=".12" stroke="white" stroke-width=".5"/>
    <text x="60" y="66" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Brisas de</text>
    <text x="60" y="76" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Dubai</text>
  </svg>`,

  colonia3: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:120px">
    <defs>
      <linearGradient id="cg3a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fce4ec"/><stop offset="100%" stop-color="#f48fb1"/></linearGradient>
      <linearGradient id="cg3b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.8)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="14" rx="18" ry="10" fill="#f8bbd0" stroke="#e91e8c" stroke-width="1.5"/>
    <ellipse cx="60" cy="8" rx="10" ry="6" fill="#e91e8c"/>
    <path d="M55 14 Q60 8 65 14 Q60 18 55 14" fill="#fff" opacity=".4"/>
    <rect x="52" y="24" width="16" height="14" rx="4" fill="#f8bbd0" stroke="#e91e8c" stroke-width="1"/>
    <ellipse cx="60" cy="112" rx="36" ry="54" fill="url(#cg3a)" stroke="#e91e8c" stroke-width="1.5"/>
    <ellipse cx="44" cy="82" rx="9" ry="20" fill="url(#cg3b)" opacity=".7"/>
    <ellipse cx="60" cy="120" rx="28" ry="42" fill="#f48fb1" opacity=".3"/>
    <circle cx="60" cy="90" r="12" fill="none" stroke="white" stroke-width=".5" opacity=".3"/>
    <circle cx="60" cy="90" r="4" fill="white" opacity=".2"/>
    <rect x="30" y="108" width="60" height="26" rx="7" fill="white" opacity=".13" stroke="white" stroke-width=".5"/>
    <text x="60" y="122" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Flor de</text>
    <text x="60" y="130" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Azahar</text>
  </svg>`,

  perfume1: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:130px">
    <defs>
      <linearGradient id="pg1a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="60%" stop-color="#16213e"/><stop offset="100%" stop-color="#0f3460"/></linearGradient>
      <linearGradient id="pg1b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.35)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
      <linearGradient id="pg1c" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#ff8c00"/></linearGradient>
    </defs>
    <rect x="36" y="4" width="48" height="18" rx="4" fill="#0a0a0a" stroke="#333" stroke-width="1.5"/>
    <rect x="44" y="1" width="32" height="8" rx="3" fill="#111"/>
    <rect x="36" y="19" width="48" height="3" fill="url(#pg1c)"/>
    <rect x="44" y="22" width="32" height="12" rx="3" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <rect x="18" y="34" width="84" height="130" rx="8" fill="url(#pg1a)" stroke="#333" stroke-width="1.5"/>
    <rect x="22" y="38" width="16" height="80" rx="8" fill="url(#pg1b)" opacity=".5"/>
    <rect x="18" y="34" width="4" height="130" rx="2" fill="url(#pg1c)" opacity=".8"/>
    <rect x="98" y="34" width="4" height="130" rx="2" fill="url(#pg1c)" opacity=".8"/>
    <rect x="22" y="100" width="76" height="60" rx="6" fill="#050510" opacity=".6"/>
    <rect x="28" y="60" width="64" height="50" rx="6" fill="rgba(255,215,0,.08)" stroke="rgba(255,215,0,.4)" stroke-width="1"/>
    <text x="60" y="80" text-anchor="middle" font-size="7" fill="#ffd700" font-family="serif" font-style="italic">La Bestia</text>
    <text x="60" y="92" text-anchor="middle" font-size="7" fill="#ffd700" font-family="serif" font-style="italic">Negra</text>
    <text x="60" y="103" text-anchor="middle" font-size="5" fill="rgba(255,215,0,.5)" font-family="sans-serif" letter-spacing="2">EAU DE PARFUM</text>
    <circle cx="35" cy="130" r="1.5" fill="#ffd700" opacity=".4"/>
    <circle cx="85" cy="145" r="1" fill="#ffd700" opacity=".3"/>
  </svg>`,

  perfume2: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:130px">
    <defs>
      <linearGradient id="pg2a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8eaf6"/><stop offset="50%" stop-color="#9fa8da"/><stop offset="100%" stop-color="#5c6bc0"/></linearGradient>
      <linearGradient id="pg2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.9)"/><stop offset="100%" stop-color="rgba(255,255,255,.1)"/></linearGradient>
      <linearGradient id="pg2c" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c0c0c0"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#c0c0c0"/></linearGradient>
    </defs>
    <polygon points="60,2 80,12 80,28 60,38 40,28 40,12" fill="url(#pg2c)" stroke="#9e9e9e" stroke-width="1"/>
    <polygon points="60,8 74,16 74,26 60,34 46,26 46,16" fill="white" opacity=".4"/>
    <rect x="48" y="38" width="24" height="12" rx="3" fill="#c5cae9" stroke="#9fa8da" stroke-width="1"/>
    <polygon points="60,50 96,70 96,140 60,160 24,140 24,70" fill="url(#pg2a)" stroke="#9fa8da" stroke-width="1.5"/>
    <polygon points="28,72 44,62 44,138 28,128" fill="url(#pg2b)" opacity=".6"/>
    <polygon points="92,72 80,66 80,134 92,128" fill="rgba(255,255,255,.15)"/>
    <polygon points="60,110 88,126 88,138 60,154 32,138 32,126" fill="#7986cb" opacity=".3"/>
    <rect x="36" y="78" width="48" height="42" rx="5" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.4)" stroke-width=".8"/>
    <text x="60" y="96" text-anchor="middle" font-size="7.5" fill="white" font-family="serif" font-style="italic">Oud</text>
    <text x="60" y="108" text-anchor="middle" font-size="7.5" fill="white" font-family="serif" font-style="italic">Silver</text>
    <text x="60" y="116" text-anchor="middle" font-size="4.5" fill="rgba(255,255,255,.5)" font-family="sans-serif" letter-spacing="2">EAU DE PARFUM</text>
    <circle cx="34" cy="78" r="3" fill="white" opacity=".6"/>
    <circle cx="86" cy="70" r="2" fill="white" opacity=".5"/>
  </svg>`,

  perfume3: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:130px">
    <defs>
      <linearGradient id="pg3a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#880e4f"/><stop offset="50%" stop-color="#ad1457"/><stop offset="100%" stop-color="#4a148c"/></linearGradient>
      <linearGradient id="pg3b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,200,200,.6)"/><stop offset="100%" stop-color="rgba(255,100,150,0)"/></linearGradient>
      <radialGradient id="pg3c" cx="50%" cy="30%"><stop offset="0%" stop-color="rgba(255,255,255,.3)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <ellipse cx="60" cy="14" rx="20" ry="12" fill="#880e4f" stroke="#6a0f3c" stroke-width="1.5"/>
    <circle cx="60" cy="12" r="7" fill="#c2185b" opacity=".8"/>
    <path d="M56 12 Q60 6 64 12 Q60 16 56 12" fill="#f06292" opacity=".7"/>
    <path d="M60 8 Q64 12 60 16 Q56 12 60 8" fill="#f06292" opacity=".7"/>
    <circle cx="60" cy="12" r="3" fill="#880e4f"/>
    <rect x="50" y="26" width="20" height="12" rx="4" fill="#880e4f" stroke="#6a0f3c" stroke-width="1"/>
    <path d="M30 38 Q18 70 18 105 Q18 155 60 168 Q102 155 102 105 Q102 70 90 38 Z" fill="url(#pg3a)" stroke="#6a0f3c" stroke-width="1.5"/>
    <path d="M32 42 Q24 72 24 105 Q24 130 36 148" stroke="url(#pg3b)" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5"/>
    <ellipse cx="60" cy="55" rx="28" ry="12" fill="url(#pg3c)"/>
    <path d="M28 120 Q18 145 60 158 Q102 145 92 120 Z" fill="#4a148c" opacity=".4"/>
    <ellipse cx="60" cy="100" rx="28" ry="22" fill="rgba(255,255,255,.07)" stroke="rgba(255,192,203,.4)" stroke-width="1"/>
    <text x="60" y="97" text-anchor="middle" font-size="7.5" fill="#ffb3c6" font-family="serif" font-style="italic">Rose</text>
    <text x="60" y="108" text-anchor="middle" font-size="7.5" fill="#ffb3c6" font-family="serif" font-style="italic">Noir</text>
  </svg>`,

  perfume4: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:130px">
    <defs>
      <linearGradient id="pg4a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff8e1"/><stop offset="40%" stop-color="#ffb300"/><stop offset="100%" stop-color="#e65100"/></linearGradient>
      <linearGradient id="pg4b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.7)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
      <linearGradient id="pg4c" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffd700"/><stop offset="50%" stop-color="#fff9c4"/><stop offset="100%" stop-color="#ffd700"/></linearGradient>
    </defs>
    <rect x="38" y="4" width="44" height="20" rx="6" fill="#b8860b" stroke="#ffd700" stroke-width="1.5"/>
    <path d="M48 14 L52 10 L56 14 L60 8 L64 14 L68 10 L72 14" stroke="#ffd700" stroke-width="1.5" fill="none"/>
    <rect x="44" y="1" width="32" height="7" rx="3" fill="#ffd700"/>
    <rect x="38" y="24" width="44" height="4" fill="url(#pg4c)"/>
    <rect x="46" y="28" width="28" height="12" rx="3" fill="#b8860b" stroke="#ffd700" stroke-width="1"/>
    <path d="M32 40 L22 55 L22 140 L32 158 L88 158 L98 140 L98 55 L88 40 Z" fill="url(#pg4a)" stroke="#b8860b" stroke-width="1.5"/>
    <path d="M26 56 L26 138 L32 154 L36 154 L36 56 Z" fill="url(#pg4b)" opacity=".5"/>
    <path d="M24 120 L22 140 L32 158 L88 158 L98 140 L96 120 Z" fill="#ff6f00" opacity=".4"/>
    <line x1="22" y1="75" x2="98" y2="75" stroke="rgba(255,215,0,.25)" stroke-width="1"/>
    <line x1="22" y1="130" x2="98" y2="130" stroke="rgba(255,215,0,.25)" stroke-width="1"/>
    <rect x="30" y="80" width="60" height="46" rx="5" fill="rgba(255,255,255,.08)" stroke="rgba(255,215,0,.5)" stroke-width="1"/>
    <text x="60" y="99" text-anchor="middle" font-size="7.5" fill="#fff9c4" font-family="serif" font-style="italic">Amber</text>
    <text x="60" y="111" text-anchor="middle" font-size="7.5" fill="#fff9c4" font-family="serif" font-style="italic">Gold</text>
    <text x="60" y="121" text-anchor="middle" font-size="4.5" fill="rgba(255,215,0,.5)" font-family="sans-serif" letter-spacing="2">EAU DE PARFUM</text>
    <circle cx="30" cy="50" r="2" fill="#ffd700" opacity=".5"/>
    <circle cx="90" cy="48" r="1.5" fill="#ffd700" opacity=".4"/>
  </svg>`,
};

// ── UTILIDADES ──
const LS = {
  get: <T,>(k: string, d: T): T => {
    if (typeof window === 'undefined') return d;
    try {
      const item = localStorage.getItem('dexys_' + k);
      return item ? JSON.parse(item) : d;
    } catch {
      return d;
    }
  },
  set: (k: string, v: unknown): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dexys_' + k, JSON.stringify(v));
  },
};

const getPuntos = (cedula: string, reservas: Reserva[], compras: Compra[]): number => {
  const r = reservas.filter(x => x.cedula === cedula).length * 10;
  const c = compras.filter(x => x.cedula === cedula).reduce((s, x) => s + Math.floor((x.precio || 0) / 10000) * 5, 0);
  return r + c;
};

const getNivel = (pts: number): { nombre: string; icon: string; color: string; descuento: number } => {
  if (pts >= 300) return { nombre: 'DIAMANTE', icon: '💎', color: '#b9f2ff', descuento: 15 };
  if (pts >= 150) return { nombre: 'ORO', icon: '🥇', color: '#ffd700', descuento: 10 };
  if (pts >= 50) return { nombre: 'PLATA', icon: '🥈', color: '#c0c0c0', descuento: 5 };
  return { nombre: 'BRONCE', icon: '🥉', color: '#cd7f32', descuento: 3 };
};

// ═══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════

export default function DexisNails() {
  // ── ESTADOS ──
  const [showIntro, setShowIntro] = useState(true);
  const [currentSec, setCurrentSec] = useState('inicio');
  // Sesión - Inicialización lazy desde sessionStorage
  const [clienteActual, setClienteActual] = useState<Cliente | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const s = sessionStorage.getItem('dexysCliente');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [adminActual, setAdminActual] = useState<{ usuario: string; rol: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const a = sessionStorage.getItem('dexysAdmin');
      if (a) {
        const parsed = JSON.parse(a);
        // Migrar usuario antiguo "Dario" a "Dro"
        if (parsed.usuario === 'Dario') {
          const updated = { ...parsed, usuario: 'Dro' };
          sessionStorage.setItem('dexysAdmin', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  
  // Datos - Inicialización lazy desde localStorage
  const [profesionales, setProfesionales] = useState<Profesional[]>(() => LS.get('profesionales', PROFESIONALES_DEFAULT));
  const [reservas, setReservas] = useState<Reserva[]>(() => LS.get('reservas', []));
  const [clientes, setClientes] = useState<Cliente[]>(() => LS.get('clientes', []));
  const [compras, setCompras] = useState<Compra[]>(() => LS.get('compras', []));
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>(() => LS.get('bloqueos', []));
  const [inventario, setInventario] = useState<Producto[]>(() => LS.get('inventario', INVENTARIO_DEFAULT));
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => [...ADMIN_DEFAULT, ...LS.get('adminUsers', [])]);
  
  // UI States
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [modalAdmin, setModalAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('stats');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [datosReserva, setDatosReserva] = useState<Record<string, string>>({});
  const [chatLoading, setChatLoading] = useState(false);
  
  // Reservas
  const [selProf, setSelProf] = useState<number | null>(null);
  const [selFecha, setSelFecha] = useState<string | null>(null);
  const [selHora, setSelHora] = useState<string | null>(null);
  const [calMes, setCalMes] = useState(new Date().getMonth());
  const [calAnno, setCalAnno] = useState(new Date().getFullYear());
  const [reservaTab, setReservaTab] = useState<'nueva' | 'mis'>('nueva');
  const [servicioInput, setServicioInput] = useState('');
  
  // Login forms
  const [loginNombre, setLoginNombre] = useState('');
  const [loginCedula, setLoginCedula] = useState('');
  const [loginTel, setLoginTel] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  // IA
  const [iaSintomas, setIaSintomas] = useState('');
  const [iaImagen, setIaImagen] = useState<string | null>(null);
  const [iaResultado, setIaResultado] = useState<{
    nombre: string;
    confianza: number;
    recs: string[];
    especialista: string;
  } | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  
  // Game state
  const gameRef = useRef<{
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    animId: number | null;
    gameActive: boolean;
    G: Record<string, unknown>;
    enemyBullets: unknown[];
    audioCtx: AudioContext | null;
    musicNodes: unknown[];
    musicOn: boolean;
    touchTarget: { x: number; y: number } | null;
    keys: Record<string, boolean>;
  }>({
    canvas: null,
    ctx: null,
    animId: null,
    gameActive: false,
    G: {},
    enemyBullets: [],
    audioCtx: null,
    musicNodes: [],
    musicOn: false,
    touchTarget: null,
    keys: {},
  });
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Admin panel states
  const [bloquearProf, setBloquearProf] = useState('todos');
  const [bloquearFecha, setBloquearFecha] = useState('');
  const [bloquearMotivo, setBloquearMotivo] = useState('');
  
  // Auditoría y Configuración
  const [auditLog, setAuditLog] = useState<AuditLog[]>(() => LS.get('auditLog', []));
  const [config, setConfig] = useState<Configuracion>(() => LS.get('config', CONFIG_DEFAULT));
  const [reporteTipo, setReporteTipo] = useState<'reservas' | 'clientes' | 'ventas' | 'inventario'>('reservas');
  const [reporteFormato, setReporteFormato] = useState<'csv' | 'json'>('csv');
  
  // Nuevos módulos admin
  const [servicios, setServicios] = useState<{id: number; nombre: string; precio: number; duracion: number; categoria: string}[]>(() => LS.get('servicios', [
    { id: 1, nombre: 'Manicura tradicional', precio: 25000, duracion: 30, categoria: 'manicura' },
    { id: 2, nombre: 'Semipermanente', precio: 35000, duracion: 45, categoria: 'manicura' },
    { id: 3, nombre: 'Podología integral', precio: 45000, duracion: 45, categoria: 'podologia' },
    { id: 4, nombre: 'Pedicure tradicional', precio: 35000, duracion: 40, categoria: 'podologia' },
    { id: 5, nombre: 'Limpieza facial', precio: 40000, duracion: 45, categoria: 'facial' },
  ]));
  const [promociones, setPromociones] = useState<{id: number; nombre: string; descuento: number; activa: boolean; fechaInicio: string; fechaFin: string}[]>(() => LS.get('promociones', []));
  const [horariosEsp, setHorariosEsp] = useState<{id: number; profesional: number; dia: string; horaInicio: string; horaFin: string}[]>(() => LS.get('horariosEsp', []));
  const [nuevoAdminUser, setNuevoAdminUser] = useState('');
  const [nuevoAdminPass, setNuevoAdminPass] = useState('');
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: 0, duracion: 30, categoria: 'manicura' });
  const [nuevaPromo, setNuevaPromo] = useState({ nombre: '', descuento: 10, activa: true, fechaInicio: '', fechaFin: '' });
  
  // Caja Registradora
  const [cajas, setCajas] = useState<CajaDia[]>(() => LS.get('cajas', []));
  const [transacciones, setTransacciones] = useState<TransaccionCaja[]>(() => LS.get('transacciones', []));
  const [nuevaTransaccion, setNuevaTransaccion] = useState({ tipo: 'ingreso' as 'ingreso' | 'egreso', monto: 0, descripcion: '', metodo: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'otro' });
  const [montoApertura, setMontoApertura] = useState(0);
  const [montoCierre, setMontoCierre] = useState(0);

  // Empleados (extendido)
  const [empleados, setEmpleados] = useState<Empleado[]>(() => LS.get('empleados', [
    { id: 1, nombre: 'Dexi', emoji: '👩', especialidad: 'Podología & Manicura', activa: true, rol: 'profesional', telefono: '3001112222', fechaIngreso: '2023-01-15', comision: 30, horarios: [], salarioBase: 1500000 },
    { id: 2, nombre: 'Valentina', emoji: '💁', especialidad: 'Manicura & Diseños', activa: true, rol: 'profesional', telefono: '3003334444', fechaIngreso: '2023-06-01', comision: 25, horarios: [], salarioBase: 1300000 },
    { id: 3, nombre: 'Carolina', emoji: '🙆', especialidad: 'Parafina & Facial', activa: true, rol: 'profesional', telefono: '3005556666', fechaIngreso: '2024-01-10', comision: 25, horarios: [], salarioBase: 1300000 },
  ]));
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', emoji: '👩', especialidad: '', rol: 'profesional' as Empleado['rol'], telefono: '', comision: 20, salarioBase: 0 });

  // Proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => LS.get('proveedores', []));
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompra[]>(() => LS.get('ordenesCompra', []));
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: '', contacto: '', telefono: '', email: '', direccion: '', categoria: '', notas: '' });
  const [nuevaOrden, setNuevaOrden] = useState({ proveedorId: 0, items: [] as { producto: string; cantidad: number; precioUnitario: number }[] });

  // Cupones
  const [cupones, setCupones] = useState<Cupon[]>(() => LS.get('cupones', []));
  const [nuevoCupon, setNuevoCupon] = useState({ codigo: '', descuento: 10, tipoDescuento: 'porcentaje' as 'porcentaje' | 'fijo', fechaInicio: '', fechaFin: '', usosMaximos: 100, minimoCompra: 0 });

  // Gift Cards
  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => LS.get('giftCards', []));
  const [nuevaGiftCard, setNuevaGiftCard] = useState({ saldoInicial: 50000, comprador: '', destinatario: '', fechaVencimiento: '' });

  // Comisiones
  const [comisiones, setComisiones] = useState<ComisionRegistro[]>(() => LS.get('comisiones', []));

  // Refs
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  
  // ── EFECTOS ──
  useEffect(() => {
    // Intro timeout
    const t = setTimeout(() => setShowIntro(false), 1400);
    return () => clearTimeout(t);
  }, []);
  
  useEffect(() => {
    // Generar estrellas
    if (starsRef.current) {
      starsRef.current.innerHTML = '';
      for (let i = 0; i < 220; i++) {
        const s = document.createElement('div');
        s.className = 'st';
        const sz = (Math.random() * 2.5 + 0.5).toFixed(1);
        s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${sz}px;--d:${(Math.random() * 4 + 2).toFixed(1)}s;--dl:${(Math.random() * 5).toFixed(1)}s`;
        starsRef.current.appendChild(s);
      }
    }
  }, [showIntro]);
  
  useEffect(() => {
    // Scroll chat to bottom
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // ═══════════════════════════════════════════════════
  // GAME INITIALIZATION - ARCADIA
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    if (currentSec !== 'juego') {
      // Cleanup game when leaving
      if (gameRef.current.animId) {
        cancelAnimationFrame(gameRef.current.animId);
        gameRef.current.animId = null;
      }
      gameRef.current.gameActive = false;
      return;
    }
    
    const container = gameContainerRef.current;
    if (!container) return;
    
    // Game helper functions
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    
    // Create video background
    let videoBg = container.querySelector('#juegoVideoBg') as HTMLVideoElement;
    if (!videoBg) {
      videoBg = document.createElement('video');
      videoBg.id = 'juegoVideoBg';
      videoBg.loop = true;
      videoBg.playsInline = true;
      videoBg.muted = false;
      videoBg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none';
      videoBg.src = '/Universo.mp4';
      container.insertBefore(videoBg, container.firstChild);
    }
    videoBg.volume = 0.75;
    videoBg.play().catch(() => { videoBg.muted = true; videoBg.play(); });
    
    // Create canvas
    let canvas = container.querySelector('#gCanvas') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'gCanvas';
      canvas.style.cssText = 'position:absolute;inset:0;display:block;z-index:1;background:transparent';
      container.appendChild(canvas);
    }
    canvas.width = container.offsetWidth || window.innerWidth;
    canvas.height = container.offsetHeight || window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    gameRef.current.canvas = canvas;
    gameRef.current.ctx = ctx;
    gameRef.current.gameActive = true;
    
    // Audio context for beeps
    let audioCtx: AudioContext | null = null;
    const getAudioCtx = () => {
      if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    };
    const beep = (freq = 880, dur = 0.1, vol = 0.08) => {
      try {
        const a = getAudioCtx();
        if (!a) return;
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
        o.connect(g);
        g.connect(a.destination);
        o.start();
        o.stop(a.currentTime + dur);
      } catch { /* ignore */ }
    };
    
    // Game state
    interface Star { x: number; y: number; r: number; a: number; twinkle: number; speed: number; }
    interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; color: string; }
    interface Bullet { x: number; y: number; vx: number; vy: number; life: number; r: number; color: string; }
    interface Enemy { 
      type: string; x: number; y: number; vx?: number; vy?: number; radius: number; 
      hp: number; maxHp: number; pts: number; speed: number; rot: number; rotSpd: number; 
      color: string; craters?: { x: number; y: number; r: number }[]; size?: string; ai: string;
      formIndex?: number; formTotal?: number; phase?: number; phaseTimer?: number;
    }
    interface PowerDrop { type: string; icon: string; color: string; label: string; duration: number; x: number; y: number; vy: number; life: number; maxLife: number; bob: number; }
    interface Power { type: string; timer: number; maxTimer: number; }
    
    const W = canvas.width;
    const H = canvas.height;
    
    const genStars = (n: number): Star[] => 
      Array.from({ length: n }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(0.3, 1.8), a: rand(0.2, 1),
        twinkle: rand(0, Math.PI * 2), speed: rand(0.01, 0.03),
      }));
    
    const genCraters = (r: number) => 
      Array.from({ length: Math.floor(rand(2, 5)) }, () => ({
        x: rand(-r * 0.5, r * 0.5), y: rand(-r * 0.5, r * 0.5), r: rand(r * 0.1, r * 0.3),
      }));
    
    const randRock = () => {
      const c = ['#c0c0c0', '#a9a9a9', '#808080', '#696969', '#4a4a4a', '#8B4513', '#A0522D', '#b5b5b5'];
      return c[Math.floor(rand(0, c.length))];
    };
    
    // Initialize game state
    const G = {
      W, H,
      ship: { x: W / 2, y: H / 2, rot: -Math.PI / 2, radius: 22, invincible: false, invTimer: 0, blinkTimer: 0 },
      mouse: { x: W / 2, y: H / 2 },
      bullets: [] as Bullet[],
      enemies: [] as Enemy[],
      particles: [] as Particle[],
      stars: genStars(120),
      score: 0,
      lives: 3,
      wave: 1,
      waveTimer: 0,
      waveState: 'announcing',
      spawnQueue: [] as { type: string; size?: string; index?: number; total?: number; delay: number }[],
      spawnTimer: 0,
      lastShot: 0,
      running: true,
      powers: [] as Power[],
      powerDrops: [] as PowerDrop[],
      keys: {} as Record<string, boolean>,
      touchTarget: null as { x: number; y: number } | null,
      frameCount: 0,
      shake: 0,
      teleportCd: 0,
    };
    gameRef.current.G = G;
    const enemyBullets: Bullet[] = [];
    gameRef.current.enemyBullets = enemyBullets;
    
    // Build wave
    const buildWave = (wave: number) => {
      const queue: { type: string; size?: string; index?: number; total?: number; delay: number }[] = [];
      const base = 4 + wave * 2;
      for (let i = 0; i < base; i++) {
        const size = wave < 3 ? 'big' : (Math.random() < 0.4 ? 'big' : 'medium');
        queue.push({ type: 'asteroid', size, delay: i * 380 });
      }
      if (wave >= 2) {
        const fc = Math.min(2 + wave, 8);
        for (let i = 0; i < fc; i++) queue.push({ type: 'formation', index: i, total: fc, delay: 1300 + i * 160 });
      }
      if (wave >= 3) {
        const kc = Math.min(wave - 1, 6);
        for (let i = 0; i < kc; i++) queue.push({ type: 'kamikaze', delay: 2300 + i * 550 });
      }
      if (wave >= 4 && wave % 3 === 0) queue.push({ type: 'tank', delay: 3200 });
      G.spawnQueue = queue;
      G.spawnTimer = 0;
      G.waveState = 'announcing';
      G.waveTimer = 130;
      updateHUD();
    };
    
    // Spawn enemy
    const spawnEnemy = (spec: { type: string; size?: string; index?: number; total?: number }) => {
      let x: number, y: number;
      const side = Math.floor(rand(0, 4));
      if (side === 0) { x = rand(0, G.W); y = -70; }
      else if (side === 1) { x = G.W + 70; y = rand(0, G.H); }
      else if (side === 2) { x = rand(0, G.W); y = G.H + 70; }
      else { x = -70; y = rand(0, G.H); }
      
      const wave = G.wave;
      if (spec.type === 'asteroid') {
        const sz: Record<string, { r: number; hp: number; pts: number; spd: number }> = {
          big: { r: 30, hp: 3, pts: 100, spd: 0.9 },
          medium: { r: 20, hp: 2, pts: 60, spd: 1.3 },
          small: { r: 12, hp: 1, pts: 30, spd: 1.8 },
        };
        const s = sz[spec.size || 'big'];
        G.enemies.push({
          type: 'asteroid', x, y, radius: s.r + rand(-3, 3), hp: s.hp, maxHp: s.hp, pts: s.pts,
          speed: s.spd * (1 + (wave - 1) * 0.1), rot: rand(0, Math.PI * 2), rotSpd: rand(-0.025, 0.025),
          color: randRock(), craters: genCraters(s.r), size: spec.size || 'big', ai: 'chase',
        });
      } else if (spec.type === 'formation') {
        const total = spec.total || 5, idx = spec.index || 0;
        x = G.W / 2 + (idx - (total - 1) / 2) * 55;
        y = -60;
        G.enemies.push({
          type: 'formation', x, y, radius: 16, hp: 2, maxHp: 2, pts: 80,
          speed: 1.4 + wave * 0.08, rot: 0, rotSpd: 0.04,
          color: GCOL.morado, ai: 'formation', formIndex: idx, formTotal: total, phase: 0, phaseTimer: 0,
        });
      } else if (spec.type === 'kamikaze') {
        const spd = 3.5 + wave * 0.15;
        const dx = G.ship.x - x, dy = G.ship.y - y, len = Math.hypot(dx, dy) || 1;
        G.enemies.push({
          type: 'kamikaze', x, y, vx: dx / len * spd, vy: dy / len * spd,
          radius: 10, hp: 1, maxHp: 1, pts: 50, speed: spd,
          rot: Math.atan2(dy, dx), rotSpd: 0, color: GCOL.fucsia, ai: 'kamikaze',
        });
      } else if (spec.type === 'tank') {
        G.enemies.push({
          type: 'tank', x, y, vx: 0, vy: 0, radius: 44, hp: 8 + wave, maxHp: 8 + wave, pts: 500,
          speed: 0.6 + wave * 0.05, rot: 0, rotSpd: 0.008, color: '#8B4513', ai: 'chase',
        });
      }
    };
    
    // Power-ups
    const dropPower = (x: number, y: number) => {
      if (Math.random() > 0.28) return;
      const def = POWER_DEFS[Math.floor(rand(0, POWER_DEFS.length))];
      G.powerDrops.push({ ...def, x, y, vy: -1.5, life: 360, maxLife: 360, bob: rand(0, Math.PI * 2) });
    };
    
    const hasPower = (t: string) => G.powers.some(p => p.type === t);
    
    // Particles
    const particleBurst = (x: number, y: number, color: string, count = 12, spread = 50) => {
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2), spd = rand(1, spread / 15);
        G.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: rand(20, 50), maxLife: 50, r: rand(2, 6), color });
      }
    };
    
    // Shoot
    const shoot = () => {
      if (!G.running || !gameRef.current.gameActive) return;
      const cd = hasPower('rapid') ? SHIP_COOLDOWN * 0.4 : SHIP_COOLDOWN;
      if (Date.now() - G.lastShot < cd) return;
      G.lastShot = Date.now();
      
      const sx = G.ship.x, sy = G.ship.y;
      const dx = G.mouse.x - sx, dy = G.mouse.y - sy;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len, ny = dy / len;
      
      const mkB = (ox: number, oy: number, vx: number, vy: number): Bullet => ({
        x: sx + nx * 36 + ox, y: sy + ny * 36 + oy, vx, vy,
        life: 80, r: hasPower('triple') ? 5 : 4, color: hasPower('rapid') ? GCOL.fucsia : GCOL.turquesa,
      });
      
      G.bullets.push(mkB(0, 0, nx * BULLET_SPEED, ny * BULLET_SPEED));
      if (hasPower('triple')) {
        const base = Math.atan2(ny, nx);
        G.bullets.push(mkB(0, 0, Math.cos(base + 0.25) * BULLET_SPEED, Math.sin(base + 0.25) * BULLET_SPEED));
        G.bullets.push(mkB(0, 0, Math.cos(base - 0.25) * BULLET_SPEED, Math.sin(base - 0.25) * BULLET_SPEED));
      }
      beep(1200, 0.04, 0.05);
    };
    
    // Teleport
    const teleport = () => {
      if (!G.running || !gameRef.current.gameActive || G.teleportCd > 0) return;
      particleBurst(G.ship.x, G.ship.y, GCOL.morado, 24, 90);
      let nx: number, ny: number, attempts = 0;
      do {
        nx = rand(40, G.W - 40);
        ny = rand(40, G.H - 40);
        attempts++;
      } while (attempts < 20 && G.enemies.some(e => Math.hypot(e.x - nx, e.y - ny) < 100));
      G.ship.x = nx;
      G.ship.y = ny;
      G.mouse.x = nx;
      G.mouse.y = ny - 100;
      particleBurst(G.ship.x, G.ship.y, GCOL.turquesa, 24, 90);
      G.ship.invincible = true;
      G.ship.invTimer = 60;
      G.ship.blinkTimer = 0;
      G.teleportCd = 300;
      beep(660, 0.1, 0.2);
    };
    
    // Update HUD
    const updateHUD = () => {
      const scoreEl = document.getElementById('gHudScore');
      const waveEl = document.getElementById('gHudWave');
      const livesEl = document.getElementById('gHudLives');
      if (scoreEl) scoreEl.textContent = `⭐ ${G.score}`;
      if (waveEl) waveEl.textContent = `OLEADA ${G.wave}`;
      if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, G.lives));
    };
    
    // Update power icons
    const updatePowerIcons = () => {
      const el = document.getElementById('gPowerIcons');
      if (!el) return;
      el.innerHTML = G.powers.map(p => {
        const d = POWER_DEFS.find(t => t.type === p.type);
        const pct = Math.round(p.timer / p.maxTimer * 100);
        return `<div style="display:flex;align-items:center;gap:4px;background:rgba(0,0,0,.5);border:1px solid ${d?.color || '#fff'};border-radius:20px;padding:3px 8px;font-size:.5rem;color:${d?.color || '#fff'}">${d?.icon || '?'} <div style="width:36px;height:3px;background:rgba(255,255,255,.15);border-radius:2px"><div style="width:${pct}%;height:100%;background:${d?.color || '#fff'};border-radius:2px"></div></div></div>`;
      }).join('');
    };
    
    // Enemy shoot
    const enemyShoot = (en: Enemy) => {
      const dx = G.ship.x - en.x, dy = G.ship.y - en.y, len = Math.hypot(dx, dy) || 1;
      enemyBullets.push({ x: en.x, y: en.y, vx: dx / len * 5, vy: dy / len * 5, life: 90, r: 4, color: GCOL.morado });
      beep(300, 0.03, 0.08);
    };
    
    // Hit enemy
    const hitEnemy = (j: number) => {
      const en = G.enemies[j];
      if (!en) return;
      en.hp--;
      G.shake = Math.min(G.shake + 2, 10);
      particleBurst(en.x, en.y, en.color, 6, 30);
      if (en.hp > 0) return;
      
      particleBurst(en.x, en.y, en.color, 18, 80);
      if (en.type === 'tank') particleBurst(en.x, en.y, GCOL.dorado, 30, 120);
      G.score += en.pts;
      updateHUD();
      dropPower(en.x, en.y);
      
      // Split asteroids
      if (en.type === 'asteroid' && en.size === 'big') {
        for (let k = 0; k < 2; k++) G.enemies.push({
          type: 'asteroid', x: en.x + rand(-20, 20), y: en.y + rand(-20, 20), radius: 20 + rand(-3, 3),
          hp: 2, maxHp: 2, pts: 60, speed: en.speed * 1.4, rot: rand(0, Math.PI * 2), rotSpd: rand(-0.03, 0.03),
          color: randRock(), craters: genCraters(20), size: 'medium', ai: 'chase',
        });
      } else if (en.type === 'asteroid' && en.size === 'medium') {
        for (let k = 0; k < 2; k++) G.enemies.push({
          type: 'asteroid', x: en.x + rand(-15, 15), y: en.y + rand(-15, 15), radius: 12 + rand(-2, 2),
          hp: 1, maxHp: 1, pts: 30, speed: en.speed * 1.5, rot: rand(0, Math.PI * 2), rotSpd: rand(-0.04, 0.04),
          color: randRock(), craters: genCraters(12), size: 'small', ai: 'chase',
        });
      }
      G.enemies.splice(j, 1);
      beep(440, 0.08, 0.1);
    };
    
    // Ship hit
    const shipHit = (enemyIdx: number) => {
      if (G.ship.invincible) return;
      G.lives--;
      G.shake = 15;
      particleBurst(G.ship.x, G.ship.y, GCOL.fucsia, 25, 90);
      updateHUD();
      if (enemyIdx >= 0 && G.enemies[enemyIdx]) G.enemies.splice(enemyIdx, 1);
      if (G.lives <= 0) {
        G.running = false;
        beep(220, 0.3, 0.5);
        setTimeout(showGameOver, 600);
        return;
      }
      G.ship.invincible = true;
      G.ship.invTimer = 180;
      G.ship.blinkTimer = 0;
      beep(300, 0.15, 0.2);
    };
    
    // Show game over
    const showGameOver = () => {
      const over = document.getElementById('gOver');
      if (!over) return;
      const scoreEl = document.getElementById('gOverScore');
      const waveEl = document.getElementById('gOverWave');
      if (scoreEl) scoreEl.textContent = `Puntuación: ${G.score}`;
      if (waveEl) waveEl.textContent = `Oleada ${G.wave}`;
      over.style.display = 'flex';
      container.style.cursor = 'default';
      
      // Save leaderboard
      let lb = JSON.parse(localStorage.getItem('dexis_lb') || '[]');
      lb.push({ score: G.score, wave: G.wave, date: new Date().toLocaleDateString('es-CO') });
      lb.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
      lb = lb.slice(0, MAX_LB);
      localStorage.setItem('dexis_lb', JSON.stringify(lb));
      
      // Render leaderboard
      const lbEl = document.getElementById('gLeaderboard');
      if (lbEl) {
        const medals = ['🥇', '🥈', '🥉', '4º', '5º'];
        lbEl.innerHTML = `
          <div style="font-family:'Orbitron',sans-serif;font-size:.6rem;color:${GCOL.turquesa};letter-spacing:3px;margin-bottom:10px;text-align:center">🏆 TOP PUNTUACIONES</div>
          ${lb.map((e: { score: number; wave: number; date: string }, i: number) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 12px;margin:3px 0;background:rgba(255,255,255,.04);border-radius:8px;border-left:2px solid ${i === 0 ? GCOL.dorado : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : GCOL.morado}">
              <span style="font-family:'Orbitron',sans-serif;font-size:.55rem;color:${i === 0 ? GCOL.dorado : 'rgba(255,255,255,.6)'}">${medals[i]} ${e.score}</span>
              <span style="font-family:'Orbitron',sans-serif;font-size:.45rem;color:rgba(255,255,255,.4)">Ola ${e.wave} · ${e.date}</span>
            </div>
          `).join('')}
        `;
      }
    };
    
    // Restart game
    const restartGame = () => {
      G.ship.x = W / 2;
      G.ship.y = H / 2;
      G.bullets = [];
      G.enemies = [];
      G.particles = [];
      G.powerDrops = [];
      G.powers = [];
      G.score = 0;
      G.lives = 3;
      G.wave = 1;
      G.running = true;
      G.teleportCd = 0;
      G.ship.invincible = false;
      enemyBullets.length = 0;
      buildWave(1);
      updateHUD();
      updatePowerIcons();
      const over = document.getElementById('gOver');
      if (over) over.style.display = 'none';
      container.style.cursor = 'none';
    };
    (window as unknown as Record<string, unknown>).gameRestart = restartGame;
    
    // Input handlers
    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      G.mouse.x = e.clientX - r.left;
      G.mouse.y = e.clientY - r.top;
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) shoot();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current.gameActive) return;
      G.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'Space') shoot();
      if (e.code === 'KeyT') teleport();
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      G.keys[e.code] = false;
    };
    
    // Joystick virtual para móvil
    const JOYSTICK_RADIUS = 60;
    const JOYSTICK_KNOB = 28;
    let joystickBase = { x: 100, y: G.H - 100 }; // Posición base del joystick
    let joystickKnob = { x: 0, y: 0 }; // Offset del knob
    let joystickActive = false;
    let joystickTouchId: number | null = null;
    let shootTouchId: number | null = null;
    let shootTarget = { x: G.W / 2, y: G.H / 3 };
    
    // Dibujar joystick
    const drawJoystick = () => {
      // Solo mostrar en dispositivos touch cuando el joystick está activo
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!isTouchDevice && !joystickActive) return;
      
      ctx.save();
      // Base del joystick
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = 'rgba(0,245,212,.15)';
      ctx.strokeStyle = 'rgba(0,245,212,.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(joystickBase.x, joystickBase.y, JOYSTICK_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Knob
      const knobX = joystickBase.x + joystickKnob.x;
      const knobY = joystickBase.y + joystickKnob.y;
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = GCOL.turquesa;
      ctx.shadowBlur = 15;
      ctx.shadowColor = GCOL.turquesa;
      ctx.beginPath();
      ctx.arc(knobX, knobY, JOYSTICK_KNOB, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const tx = touch.clientX - r.left;
        const ty = touch.clientY - r.top;
        
        // Verificar si está en la zona del joystick (mitad izquierda inferior)
        const inJoystickZone = tx < G.W / 2 && ty > G.H / 3;
        
        if (inJoystickZone && joystickTouchId === null) {
          // Activar joystick
          joystickTouchId = touch.identifier;
          joystickActive = true;
          // Actualizar posición base al punto donde se toca
          joystickBase = { x: tx, y: ty };
          joystickKnob = { x: 0, y: 0 };
        } else if (!inJoystickZone && shootTouchId === null) {
          // Zona de disparo (derecha o superior)
          shootTouchId = touch.identifier;
          shootTarget = { x: tx, y: ty };
          G.mouse.x = tx;
          G.mouse.y = ty;
          shoot();
        }
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const tx = touch.clientX - r.left;
        const ty = touch.clientY - r.top;
        
        if (touch.identifier === joystickTouchId) {
          // Mover knob del joystick
          const dx = tx - joystickBase.x;
          const dy = ty - joystickBase.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = JOYSTICK_RADIUS - JOYSTICK_KNOB / 2;
          
          if (dist > maxDist) {
            joystickKnob = { x: (dx / dist) * maxDist, y: (dy / dist) * maxDist };
          } else {
            joystickKnob = { x: dx, y: dy };
          }
        } else if (touch.identifier === shootTouchId) {
          // Mover objetivo de disparo
          shootTarget = { x: tx, y: ty };
          G.mouse.x = tx;
          G.mouse.y = ty;
        }
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        if (touch.identifier === joystickTouchId) {
          joystickTouchId = null;
          joystickActive = false;
          joystickKnob = { x: 0, y: 0 };
        }
        
        if (touch.identifier === shootTouchId) {
          shootTouchId = null;
        }
      }
    };
    
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = container.offsetWidth || window.innerWidth;
      canvas.height = container.offsetHeight || window.innerHeight;
      G.W = canvas.width;
      G.H = canvas.height;
      G.ship.x = clamp(G.ship.x, 0, canvas.width);
      G.ship.y = clamp(G.ship.y, 0, canvas.height);
      G.stars = genStars(120);
    };
    
    // Bind events
    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);
    
    // Build initial wave
    buildWave(1);
    
    // Game update
    const update = () => {
      if (!G.running) return;
      G.frameCount++;
      G.shake = Math.max(0, G.shake - 0.6);
      
      // Wave announcing
      if (G.waveState === 'announcing') {
        if (--G.waveTimer <= 0) G.waveState = 'spawning';
        return;
      }
      
      // Spawn queue
      if (G.waveState === 'spawning' && G.spawnQueue.length > 0) {
        G.spawnTimer++;
        while (G.spawnQueue.length && G.spawnTimer >= G.spawnQueue[0].delay / 16.6) {
          const spec = G.spawnQueue.shift();
          if (spec) spawnEnemy(spec);
        }
        if (G.spawnQueue.length === 0) G.waveState = 'playing';
      }
      
      // Next wave
      if (G.waveState === 'playing' && G.enemies.length === 0 && G.spawnQueue.length === 0) {
        G.wave++;
        updateHUD();
        buildWave(G.wave);
        return;
      }
      
      // Ship movement
      let dx = 0, dy = 0;
      if (G.keys['ArrowUp'] || G.keys['KeyW']) dy -= SHIP_SPEED;
      if (G.keys['ArrowDown'] || G.keys['KeyS']) dy += SHIP_SPEED;
      if (G.keys['ArrowLeft'] || G.keys['KeyA']) dx -= SHIP_SPEED;
      if (G.keys['ArrowRight'] || G.keys['KeyD']) dx += SHIP_SPEED;
      
      // Joystick control para móvil
      if (joystickActive) {
        const maxDist = JOYSTICK_RADIUS - JOYSTICK_KNOB / 2;
        const joyNormX = joystickKnob.x / maxDist; // -1 a 1
        const joyNormY = joystickKnob.y / maxDist; // -1 a 1
        dx += joyNormX * SHIP_SPEED;
        dy += joyNormY * SHIP_SPEED;
      }
      
      const spd = hasPower('speed') ? 1.65 : 1;
      const margin = 28;
      G.ship.x += dx * spd;
      G.ship.y += dy * spd;
      if (G.ship.x < -margin) G.ship.x = G.W + margin;
      if (G.ship.x > G.W + margin) G.ship.x = -margin;
      if (G.ship.y < -margin) G.ship.y = G.H + margin;
      if (G.ship.y > G.H + margin) G.ship.y = -margin;
      
      if (dx || dy) {
        G.ship.rot = Math.atan2(dy, dx) + Math.PI / 2;
        const len = Math.hypot(dx, dy) || 1;
        G.mouse.x = G.ship.x + (dx / len) * 200;
        G.mouse.y = G.ship.y + (dy / len) * 200;
      } else {
        const mx = G.mouse.x - G.ship.x, my = G.mouse.y - G.ship.y;
        if (Math.hypot(mx, my) > 20) G.ship.rot = Math.atan2(my, mx) + Math.PI / 2;
      }
      
      // Invincibility
      if (G.ship.invincible) {
        G.ship.blinkTimer++;
        if (--G.ship.invTimer <= 0) {
          G.ship.invincible = false;
          G.ship.invTimer = 0;
        }
      }
      
      // Teleport cooldown
      if (G.teleportCd > 0) {
        G.teleportCd--;
        const btn = document.getElementById('gBtnTele') as HTMLButtonElement;
        if (btn) {
          btn.style.opacity = G.teleportCd > 0 ? '0.4' : '1';
          btn.title = G.teleportCd > 0 ? `Recargando... ${Math.ceil(G.teleportCd / 60)}s` : 'Teletransportación [T]';
        }
      }
      
      // Disparo continuo en móvil mientras se mantiene presionada la zona de disparo
      if (shootTouchId !== null) {
        shoot();
      }
      
      // Power timers
      G.powers = G.powers.filter(p => { p.timer -= 16.6; return p.timer > 0; });
      if (G.frameCount % 6 === 0) updatePowerIcons();
      
      // Power drops
      for (let i = G.powerDrops.length - 1; i >= 0; i--) {
        const d = G.powerDrops[i];
        d.y += d.vy;
        d.vy = lerp(d.vy, 0, 0.05);
        d.life--;
        d.bob += 0.06;
        if (d.life <= 0) { G.powerDrops.splice(i, 1); continue; }
        if (Math.hypot(d.x - G.ship.x, d.y - G.ship.y) < G.ship.radius + 16) {
          G.powers = G.powers.filter(p => p.type !== d.type);
          G.powers.push({ type: d.type, timer: d.duration, maxTimer: d.duration });
          particleBurst(d.x, d.y, d.color, 18, 60);
          updatePowerIcons();
          G.powerDrops.splice(i, 1);
          beep(880, 0.06, 0.12);
        }
      }
      
      // Bullets
      for (let i = G.bullets.length - 1; i >= 0; i--) {
        const b = G.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        if (b.life <= 0 || b.x < -40 || b.x > G.W + 40 || b.y < -40 || b.y > G.H + 40) {
          G.bullets.splice(i, 1);
          continue;
        }
        for (let j = G.enemies.length - 1; j >= 0; j--) {
          const en = G.enemies[j];
          if (Math.hypot(b.x - en.x, b.y - en.y) < b.r + en.radius) {
            G.bullets.splice(i, 1);
            hitEnemy(j);
            break;
          }
        }
      }
      
      // Enemies
      for (let i = G.enemies.length - 1; i >= 0; i--) {
        const en = G.enemies[i];
        const sx = G.ship.x, sy = G.ship.y;
        
        if (en.ai === 'chase') {
          const dx2 = sx - en.x, dy2 = sy - en.y, len = Math.hypot(dx2, dy2) || 1;
          en.x += (dx2 / len) * en.speed;
          en.y += (dy2 / len) * en.speed;
          en.rot += en.rotSpd;
        } else if (en.ai === 'formation' && en.formIndex !== undefined && en.formTotal !== undefined) {
          en.phaseTimer = (en.phaseTimer || 0) + 1;
          if (en.phase === 0) {
            en.y += en.speed;
            if (en.y > G.H * 0.22 + en.formIndex * 8) en.phase = 1;
          } else {
            en.phase = (en.phase || 0) + 0.012;
            const bx = G.W / 2 + (en.formIndex - (en.formTotal - 1) / 2) * 55;
            en.x = lerp(en.x, bx + Math.sin(en.phase * 2.5 + en.formIndex) * 80, 0.04);
            en.y = lerp(en.y, G.H * 0.22 + en.formIndex * 8 + Math.cos(en.phase * 1.5) * 30, 0.04);
            if (G.frameCount % (Math.max(20, 70 - G.wave * 2)) === en.formIndex % 7) enemyShoot(en);
          }
          en.rot += en.rotSpd;
        } else if (en.ai === 'kamikaze' && en.vx !== undefined && en.vy !== undefined) {
          en.x += en.vx;
          en.y += en.vy;
          en.rot = Math.atan2(en.vy, en.vx);
          if (G.frameCount % 2 === 0) G.particles.push({ x: en.x, y: en.y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), life: 10, maxLife: 10, r: rand(2, 4), color: GCOL.fucsia });
          if (en.x < -90 || en.x > G.W + 90 || en.y < -90 || en.y > G.H + 90) {
            G.enemies.splice(i, 1);
            continue;
          }
        }
        
        // Collision with ship
        if (!G.ship.invincible && Math.hypot(en.x - sx, en.y - sy) < en.radius + G.ship.radius - 8) {
          if (hasPower('shield')) {
            G.powers = G.powers.filter(p => p.type !== 'shield');
            particleBurst(G.ship.x, G.ship.y, GCOL.azul, 20, 70);
            updatePowerIcons();
            beep(300, 0.15, 0.2);
          } else {
            shipHit(i);
          }
        }
      }
      
      // Enemy bullets
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        if (b.life <= 0 || b.x < -20 || b.x > G.W + 20 || b.y < -20 || b.y > G.H + 20) {
          enemyBullets.splice(i, 1);
          continue;
        }
        if (!G.ship.invincible && Math.hypot(b.x - G.ship.x, b.y - G.ship.y) < G.ship.radius + b.r) {
          if (hasPower('shield')) {
            G.powers = G.powers.filter(p => p.type !== 'shield');
            particleBurst(G.ship.x, G.ship.y, GCOL.azul, 20, 70);
            updatePowerIcons();
          } else {
            shipHit(-1);
          }
          enemyBullets.splice(i, 1);
        }
      }
      
      // Particles
      for (let i = G.particles.length - 1; i >= 0; i--) {
        const p = G.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.life--;
        if (p.life <= 0) G.particles.splice(i, 1);
      }
      
      // Cooldown bar
      const cd = hasPower('rapid') ? SHIP_COOLDOWN * 0.4 : SHIP_COOLDOWN;
      const cf = document.getElementById('gCoolFill');
      if (cf) cf.style.width = Math.min(100, (Date.now() - G.lastShot) / cd * 100) + '%';
    };
    
    // Render
    const render = () => {
      ctx.save();
      if (G.shake > 0) ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake));
      
      ctx.clearRect(0, 0, G.W, G.H);
      ctx.fillStyle = 'rgba(3,4,14,0.08)';
      ctx.fillRect(0, 0, G.W, G.H);
      
      // Stars
      G.stars.forEach(s => {
        ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(G.frameCount * s.speed + s.twinkle));
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      
      // Sun
      const sunX = G.W * 0.90, sunY = G.H * 0.08, sunR = 42;
      const sunT = G.frameCount * 0.012;
      for (let i = 0; i < 4; i++) {
        const sg = ctx.createRadialGradient(sunX, sunY, sunR * (0.8 + i * 0.2), sunX, sunY, sunR * (2 + i * 0.9 + Math.sin(sunT + i) * 0.4));
        sg.addColorStop(0, `rgba(255,${180 - i * 25},0,${0.12 - i * 0.02})`);
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * (2.8 + i), 0, Math.PI * 2);
        ctx.fill();
      }
      const sunG = ctx.createRadialGradient(sunX - sunR * 0.35, sunY - sunR * 0.35, 0, sunX, sunY, sunR);
      sunG.addColorStop(0, '#fffbe0');
      sunG.addColorStop(0.35, '#ffe566');
      sunG.addColorStop(0.75, '#ff9900');
      sunG.addColorStop(1, '#cc5500');
      ctx.shadowBlur = 70;
      ctx.shadowColor = '#ff9900';
      ctx.fillStyle = sunG;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Planets
      const bgPlanets = [
        { nx: 0.08, ny: 0.15, r: 14, color: '#b5b5b5', glow: '#d0d0d0', name: 'Mercurio', ring: false, bands: false },
        { nx: 0.18, ny: 0.25, r: 20, color: '#e8cda0', glow: '#f5e0a0', name: 'Venus', ring: false, bands: false },
        { nx: 0.12, ny: 0.70, r: 22, color: '#4fa3e0', glow: '#00bfff', name: 'Tierra', ring: false, bands: false },
        { nx: 0.05, ny: 0.50, r: 16, color: '#c1440e', glow: '#ff4500', name: 'Marte', ring: false, bands: false },
        { nx: 0.82, ny: 0.55, r: 34, color: '#c88b3a', glow: '#ffa500', name: 'Júpiter', ring: false, bands: true },
        { nx: 0.70, ny: 0.82, r: 28, color: '#e4d191', glow: '#ffd700', name: 'Saturno', ring: true, bands: false },
        { nx: 0.25, ny: 0.88, r: 20, color: '#7de8e8', glow: '#00f5d4', name: 'Urano', ring: false, bands: false },
        { nx: 0.45, ny: 0.92, r: 22, color: '#5b5ddf', glow: '#7b8cde', name: 'Neptuno', ring: false, bands: false },
      ];
      
      bgPlanets.forEach(p => {
        const px = p.nx * G.W, py = p.ny * G.H, r = p.r;
        ctx.save();
        ctx.shadowBlur = r * 1.4;
        ctx.shadowColor = p.glow;
        const pg = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.04, px, py, r);
        pg.addColorStop(0, 'rgba(255,255,255,0.30)');
        pg.addColorStop(0.25, p.color);
        pg.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (p.ring) {
          ctx.globalAlpha = 0.45;
          ctx.strokeStyle = 'rgba(228,209,145,0.7)';
          ctx.lineWidth = r * 0.22;
          ctx.beginPath();
          ctx.ellipse(px, py, r * 1.75, r * 0.42, 0.3, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (p.bands) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = 0.15;
          ['#d4956a', '#c88b3a', '#e8c070', '#c06030'].forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect(px - r, py - r * 0.6 + i * r * 0.32, r * 2, r * 0.18);
          });
          ctx.restore();
        }
        
        ctx.globalAlpha = 0.55;
        const gl = ctx.createRadialGradient(px - r * 0.32, py - r * 0.32, 0, px - r * 0.32, py - r * 0.32, r * 0.55);
        gl.addColorStop(0, 'rgba(255,255,255,0.40)');
        gl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gl;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Power drops
      G.powerDrops.forEach(d => {
        const a = d.life / d.maxLife, bob = Math.sin(d.bob) * 4;
        ctx.save();
        ctx.globalAlpha = Math.min(a * 3, 0.95);
        ctx.translate(d.x, d.y + bob);
        ctx.shadowBlur = 20;
        ctx.shadowColor = d.color;
        ctx.fillStyle = 'rgba(0,0,0,.6)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(d.icon, 0, 1);
        ctx.restore();
      });
      
      // Particles
      G.particles.forEach(p => {
        const a = p.life / p.maxLife;
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      
      // Enemy bullets
      enemyBullets.forEach(b => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Bullets
      G.bullets.forEach(b => {
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(b.x - b.vx * 2, b.y - b.vy * 2, b.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Enemies
      G.enemies.forEach(en => {
        ctx.save();
        ctx.translate(en.x, en.y);
        ctx.rotate(en.rot);
        ctx.shadowBlur = 18;
        ctx.shadowColor = en.glow || en.color;
        
        if (en.ai === 'chase' || en.type === 'asteroid') {
          ctx.fillStyle = en.color;
          ctx.beginPath();
          const n = 10;
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2, noise = 0.72 + 0.28 * Math.sin(a * 3.7 + en.rot * 0.5 + en.radius * 0.3);
            const r = en.radius * noise;
            i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          (en.craters || []).forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (en.type === 'formation') {
          ctx.fillStyle = GCOL.morado;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2, r = en.radius * (i % 2 === 0 ? 1 : 0.7);
            i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(200,100,255,.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.4)';
          ctx.beginPath();
          ctx.arc(0, 0, en.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else if (en.type === 'kamikaze') {
          ctx.fillStyle = GCOL.fucsia;
          ctx.beginPath();
          ctx.moveTo(0, -en.radius);
          ctx.lineTo(-en.radius * 0.7, en.radius * 0.7);
          ctx.lineTo(0, en.radius * 0.3);
          ctx.lineTo(en.radius * 0.7, en.radius * 0.7);
          ctx.closePath();
          ctx.fill();
        } else if (en.type === 'tank') {
          [1, 0.7].forEach((scale, l) => {
            ctx.fillStyle = l === 0 ? '#8B4513' : '#A0522D';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2, r = en.radius * scale;
              i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
          });
          const ng = ctx.createRadialGradient(0, 0, 0, 0, 0, en.radius * 0.4);
          ng.addColorStop(0, 'rgba(255,100,0,.8)');
          ng.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = ng;
          ctx.beginPath();
          ctx.arc(0, 0, en.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // HP bar
        if (en.maxHp > 1) {
          const bw = en.radius * 2.2, bh = 5, by = en.radius + 8;
          ctx.fillStyle = 'rgba(0,0,0,.5)';
          ctx.fillRect(-bw / 2, by, bw, bh);
          const ratio = en.hp / en.maxHp;
          ctx.fillStyle = ratio > 0.5 ? GCOL.turquesa : ratio > 0.25 ? GCOL.dorado : GCOL.fucsia;
          ctx.fillRect(-bw / 2, by, bw * ratio, bh);
        }
        
        ctx.restore();
      });
      
      // Ship
      if (!(G.ship.invincible && Math.floor(G.ship.blinkTimer / 8) % 2 === 0)) {
        ctx.save();
        ctx.translate(G.ship.x, G.ship.y);
        ctx.rotate(G.ship.rot);
        ctx.shadowBlur = 25;
        ctx.shadowColor = hasPower('shield') ? GCOL.azul : GCOL.turquesa;
        
        if (hasPower('shield')) {
          ctx.globalAlpha = 0.3 + 0.15 * Math.sin(G.frameCount * 0.15);
          ctx.strokeStyle = GCOL.azul;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, G.ship.radius + 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        
        ctx.fillStyle = 'rgba(0,180,216,0.7)';
        ctx.beginPath();
        ctx.moveTo(-13, 14);
        ctx.lineTo(-22, 18);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(13, 14);
        ctx.lineTo(22, 18);
        ctx.lineTo(10, 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = GCOL.turquesa;
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(-13, 14);
        ctx.lineTo(0, 8);
        ctx.lineTo(13, 14);
        ctx.closePath();
        ctx.fill();
        
        const cg = ctx.createRadialGradient(0, -4, 0, 0, -4, 10);
        cg.addColorStop(0, GCOL.fucsia);
        cg.addColorStop(1, GCOL.morado);
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(0, -4, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const mg = ctx.createRadialGradient(0, 14, 0, 0, 14, 10);
        mg.addColorStop(0, 'rgba(255,120,0,0.9)');
        mg.addColorStop(0.5, 'rgba(255,200,0,0.4)');
        mg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.8 + 0.2 * Math.sin(G.frameCount * 0.4);
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.ellipse(0, 14, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        ctx.restore();
      }
      
      // Crosshair
      ctx.save();
      ctx.strokeStyle = 'rgba(0,245,212,.7)';
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = GCOL.turquesa;
      const s = 10, g = 5;
      ctx.beginPath();
      ctx.moveTo(G.mouse.x - s - g, G.mouse.y);
      ctx.lineTo(G.mouse.x - g, G.mouse.y);
      ctx.moveTo(G.mouse.x + g, G.mouse.y);
      ctx.lineTo(G.mouse.x + s + g, G.mouse.y);
      ctx.moveTo(G.mouse.x, G.mouse.y - s - g);
      ctx.lineTo(G.mouse.x, G.mouse.y - g);
      ctx.moveTo(G.mouse.x, G.mouse.y + g);
      ctx.lineTo(G.mouse.x, G.mouse.y + s + g);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(G.mouse.x, G.mouse.y, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      // Dibujar joystick virtual en móvil
      drawJoystick();
      
      ctx.restore();
    };
    
    // Game loop
    const tick = () => {
      if (!gameRef.current.gameActive) {
        gameRef.current.animId = null;
        return;
      }
      gameRef.current.animId = requestAnimationFrame(tick);
      update();
      render();
    };
    
    // Start game loop
    gameRef.current.animId = requestAnimationFrame(tick);
    
    // Cleanup
    return () => {
      if (gameRef.current.animId) {
        cancelAnimationFrame(gameRef.current.animId);
        gameRef.current.animId = null;
      }
      gameRef.current.gameActive = false;
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (videoBg) {
        videoBg.muted = true;
        videoBg.pause();
      }
    };
  }, [currentSec]);
  
  // ── FUNCIONES ──
  const showToast = useCallback((msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);
  
  const goTo = useCallback((sec: string) => {
    setCurrentSec(sec);
    if (sec === 'admin' && !adminActual) {
      setModalAdmin(true);
    }
  }, [adminActual]);
  
  // Cliente login
  const loginCliente = useCallback(() => {
    if (!loginNombre.trim() || !loginCedula.trim()) {
      showToast('Completá nombre y cédula', 'error');
      return;
    }
    let cls = [...clientes];
    let cl = cls.find(c => c.cedula === loginCedula);
    if (!cl) {
      cl = {
        cedula: loginCedula,
        nombre: loginNombre,
        telefono: loginTel,
        email: loginEmail,
        fechaReg: new Date().toISOString(),
      };
      cls.push(cl);
      LS.set('clientes', cls);
      setClientes(cls);
    }
    setClienteActual(cl);
    sessionStorage.setItem('dexysCliente', JSON.stringify(cl));
    showToast(`¡Bienvenida, ${cl.nombre.split(' ')[0]}! 🌙`);
  }, [loginNombre, loginCedula, loginTel, loginEmail, clientes, showToast]);
  
  const logoutCliente = useCallback(() => {
    setClienteActual(null);
    sessionStorage.removeItem('dexysCliente');
    setSelProf(null);
    setSelFecha(null);
    setSelHora(null);
  }, []);
  
  // Admin login
  const adminDoLogin = useCallback(() => {
    const found = adminUsers.find(x => x.usuario === adminUser && x.clave === adminPass);
    if (!found) {
      showToast('Credenciales incorrectas', 'error');
      return;
    }
    setAdminActual({ usuario: found.usuario, rol: found.rol });
    sessionStorage.setItem('dexysAdmin', JSON.stringify({ usuario: found.usuario, rol: found.rol }));
    setModalAdmin(false);
    goTo('admin');
    showToast(`👑 Bienvenido ${found.usuario}`);
  }, [adminUser, adminPass, adminUsers, showToast, goTo]);
  
  // Reservas
  const confirmarReserva = useCallback(() => {
    if (!selProf) return showToast('Elegí una profesional', 'error');
    if (!selFecha) return showToast('Elegí un día', 'error');
    if (!selHora) return showToast('Elegí un horario', 'error');
    if (!clienteActual) return;
    
    const prof = profesionales.find(p => p.id === selProf);
    const nueva: Reserva = {
      id: Date.now(),
      cedula: clienteActual.cedula,
      cliente: clienteActual.nombre,
      profesional: selProf,
      profesionalNombre: prof?.nombre || '',
      fecha: selFecha,
      hora: selHora,
      servicio: servicioInput || 'Servicio general',
      estado: 'Confirmada',
      creada: new Date().toISOString(),
    };
    const nuevas = [...reservas, nueva];
    setReservas(nuevas);
    LS.set('reservas', nuevas);
    setSelFecha(null);
    setSelHora(null);
    setServicioInput('');
    setReservaTab('mis'); // Cambiar a MIS RESERVAS automáticamente
    showToast(`✅ Reserva confirmada · ${nueva.fecha} ${nueva.hora}`);
  }, [selProf, selFecha, selHora, servicioInput, clienteActual, profesionales, reservas, showToast]);
  
  const cancelarReservaCliente = useCallback((id: number) => {
    const nuevas = reservas.filter(r => r.id !== id);
    setReservas(nuevas);
    LS.set('reservas', nuevas);
    showToast('Reserva cancelada');
  }, [reservas, showToast]);
  
  // Compras
  const comprar = useCallback((nombre: string, precio: number, tipo: string) => {
    if (!clienteActual) {
      goTo('reservas');
      showToast('Iniciá sesión para comprar', 'error');
      return;
    }
    const prod = inventario.find(x => x.nombre === nombre);
    if (prod && prod.stock <= 0) {
      showToast('❌ Sin stock disponible', 'error');
      return;
    }
    const nueva: Compra = {
      id: Date.now(),
      cedula: clienteActual.cedula,
      clienteNombre: clienteActual.nombre,
      producto: nombre,
      tipo,
      precio,
      fecha: new Date().toISOString(),
    };
    const nuevas = [...compras, nueva];
    setCompras(nuevas);
    LS.set('compras', nuevas);
    
    // Descontar stock
    const inv = inventario.map(p => p.nombre === nombre ? { ...p, stock: Math.max(0, p.stock - 1) } : p);
    setInventario(inv);
    LS.set('inventario', inv);
    
    showToast(`✅ ¡Compra exitosa! +${Math.floor(precio / 10000) * 5} pts`);
  }, [clienteActual, inventario, compras, goTo, showToast]);
  
  // IA Diagnóstico
  const DIAGNOSTICOS = [
    { palabras: ['talón', 'talon', 'fascitis', 'dolor talon', 'punzada'], nombre: 'Fascitis plantar', especialista: 'Dexi (Podología)', confianza: 90, recs: ['Ejercicios de estiramiento de gemelos', 'Plantillas con soporte de arco', 'Hielo 15 min tras actividad física'] },
    { palabras: ['seca', 'agrietada', 'talones rajados', 'xerosis', 'grietas'], nombre: 'Piel seca / Xerosis', especialista: 'Dexi (Podología)', confianza: 92, recs: ['Crema humectante con urea al 10%', 'Evitar agua muy caliente', 'Hidratación diaria'] },
    { palabras: ['callo', 'dureza', 'callosidad', 'callos'], nombre: 'Callosidades plantares', especialista: 'Dexi (Podología)', confianza: 88, recs: ['Lima suave después del baño', 'Crema queratolítica', 'Evaluar calzado'] },
    { palabras: ['hongo', 'hongos', 'amarillo', 'uña gruesa', 'onicomicosis'], nombre: 'Onicomicosis (hongos)', especialista: 'Dexi (Podología)', confianza: 85, recs: ['Aplicar antifúngico tópico', 'Mantener pies secos', 'Consulta con podólogo'] },
    { palabras: ['encarnada', 'uña encarnada', 'dolor costado', 'inflamada'], nombre: 'Uña encarnada', especialista: 'Dexi (Podología)', confianza: 90, recs: ['Pediluvio con agua tibia y sal', 'Calzado ancho y cómodo', 'NO cortar la uña en casa'] },
    { palabras: ['juanete', 'hallux', 'valgus', 'protuberancia'], nombre: 'Hallux valgus (juanete)', especialista: 'Dexi (Podología)', confianza: 80, recs: ['Usar separadores de dedos', 'Calzado ortopédico ancho'] },
    { palabras: ['comezon', 'picazon', 'escamas', 'entre dedos', 'pie de atleta'], nombre: 'Tinea pedis (pie de atleta)', especialista: 'Dexi (Podología)', confianza: 88, recs: ['Antifúngico en crema', 'Secar bien entre los dedos'] },
    { palabras: ['diseño', 'esmalte', 'semipermanente', 'press on', 'manicura'], nombre: 'Consulta manicura / diseños', especialista: 'Valentina (Manicura)', confianza: 95, recs: ['Valentina es especialista en diseños', 'Elegí entre semipermanente o press on'] },
    { palabras: ['parafina', 'hidratacion', 'masaje', 'spa'], nombre: 'Tratamiento de hidratación', especialista: 'Carolina (Parafina & Facial)', confianza: 90, recs: ['Terapia con parafina para hidratación profunda'] },
    { palabras: ['facial', 'limpieza facial', 'acne', 'poros'], nombre: 'Limpieza facial', especialista: 'Carolina (Facial)', confianza: 88, recs: ['Limpieza profunda con extracción', 'Mascarilla hidratante'] },
  ];
  
  const iaAnalizar = useCallback(async () => {
    const sintomas = iaSintomas.toLowerCase();
    if (!sintomas) {
      showToast('Describí tus síntomas', 'error');
      return;
    }
    setIaLoading(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    
    let diag = null;
    let maxCoin = 0;
    DIAGNOSTICOS.forEach(d => {
      const coin = d.palabras.filter(p => sintomas.includes(p)).length;
      if (coin > maxCoin) {
        maxCoin = coin;
        diag = d;
      }
    });
    
    if (!diag) {
      diag = { nombre: 'Consulta general', especialista: 'Dexi (Podología)', confianza: 65, recs: ['Revisión completa con especialista', 'Hidratación diaria'] };
    }
    if (maxCoin < 2) diag.confianza = Math.max(60, diag.confianza - 12);
    
    setIaResultado(diag);
    setIaLoading(false);
  }, [iaSintomas, showToast]);
  
  // Chat IA
  const enviarChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: userMsg,
          messages: chatMessages,
          clienteNombre: clienteActual?.nombre,
          datosReserva: datosReserva,
        }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      // Actualizar contexto de reserva
      if (data.datosReserva) {
        setDatosReserva(data.datosReserva);
        console.log('📊 Datos de reserva actualizados:', data.datosReserva);
      }
      
      // Si se guardó una reserva, mostrar mensaje y limpiar datos
      if (data.reservaGuardada) {
        console.log('✅ Reserva guardada con código:', data.codigoReserva);
        showToast(`✅ Reserva guardada: ${data.codigoReserva}`);
      }
    } catch (error) {
      console.error('Error en chat:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: '💫 Hola! Soy Dexi IA, tu asistente virtual. ¿En qué puedo ayudarte?' }]);
    }
    setChatLoading(false);
  }, [chatInput, chatLoading, chatMessages, clienteActual, datosReserva, showToast]);
  
  // Admin funciones
  const toggleProfActiva = useCallback((id: number) => {
    const nuevas = profesionales.map(p => p.id === id ? { ...p, activa: !p.activa } : p);
    setProfesionales(nuevas);
    LS.set('profesionales', nuevas);
  }, [profesionales]);
  
  const agregarBloqueo = useCallback(() => {
    if (!bloquearFecha) return showToast('Seleccioná una fecha', 'error');
    const nuevo: Bloqueo = {
      id: Date.now(),
      profesional: bloquearProf === 'todos' ? 'todos' : parseInt(bloquearProf),
      profesionalNombre: bloquearProf === 'todos' ? 'TODAS' : profesionales.find(p => p.id === parseInt(bloquearProf))?.nombre || '',
      fecha: bloquearFecha,
      motivo: bloquearMotivo || 'Sin motivo',
      creado: new Date().toISOString(),
    };
    const nuevos = [...bloqueos, nuevo];
    setBloqueos(nuevos);
    LS.set('bloqueos', nuevos);
    setBloquearFecha('');
    setBloquearMotivo('');
    showToast('✅ Día bloqueado');
  }, [bloquearProf, bloquearFecha, bloquearMotivo, profesionales, bloqueos, showToast]);
  
  const eliminarBloqueo = useCallback((id: number) => {
    const nuevos = bloqueos.filter(b => b.id !== id);
    setBloqueos(nuevos);
    LS.set('bloqueos', nuevos);
    showToast('Bloqueo eliminado');
  }, [bloqueos, showToast]);
  
  // ── AUDITORÍA ──
  const logAccion = useCallback((accion: string, detalle: string, tipo: AuditLog['tipo']) => {
    const nuevo: AuditLog = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      usuario: adminActual?.usuario || 'Sistema',
      accion,
      detalle,
      tipo,
    };
    const nuevos = [nuevo, ...auditLog].slice(0, 500); // Mantener últimos 500 registros
    setAuditLog(nuevos);
    LS.set('auditLog', nuevos);
  }, [adminActual, auditLog]);
  
  // ── EXPORTACIÓN ──
  const exportarCSV = useCallback((datos: string, nombre: string) => {
    const blob = new Blob([datos], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombre}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ ${nombre} exportado`);
    logAccion('Exportación', `Exportado ${nombre} en formato CSV`, 'sistema');
  }, [showToast, logAccion]);
  
  const exportarJSON = useCallback((datos: unknown, nombre: string) => {
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombre}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ ${nombre} exportado`);
    logAccion('Exportación', `Exportado ${nombre} en formato JSON`, 'sistema');
  }, [showToast, logAccion]);
  
  const generarReporte = useCallback(() => {
    let datos = '';
    let nombre = '';
    
    if (reporteTipo === 'reservas') {
      nombre = 'reservas';
      if (reporteFormato === 'csv') {
        datos = 'Fecha,Hora,Cliente,Profesional,Servicio,Estado\n';
        datos += reservas.map(r => `${r.fecha},${r.hora},"${r.cliente}","${r.profesionalNombre}","${r.servicio}",${r.estado}`).join('\n');
      } else {
        datos = JSON.stringify(reservas, null, 2);
      }
    } else if (reporteTipo === 'clientes') {
      nombre = 'clientes';
      if (reporteFormato === 'csv') {
        datos = 'Cedula,Nombre,Telefono,Email,FechaRegistro\n';
        datos += clientes.map(c => `${c.cedula},"${c.nombre}","${c.telefono || ''}","${c.email || ''}",${c.fechaReg}`).join('\n');
      } else {
        datos = JSON.stringify(clientes, null, 2);
      }
    } else if (reporteTipo === 'ventas') {
      nombre = 'ventas';
      if (reporteFormato === 'csv') {
        datos = 'Fecha,Cliente,Producto,Tipo,Precio\n';
        datos += compras.map(c => `${c.fecha},"${c.clienteNombre}","${c.producto}",${c.tipo},${c.precio}`).join('\n');
      } else {
        datos = JSON.stringify(compras, null, 2);
      }
    } else if (reporteTipo === 'inventario') {
      nombre = 'inventario';
      if (reporteFormato === 'csv') {
        datos = 'Nombre,Tipo,Precio,Stock\n';
        datos += inventario.map(p => `"${p.nombre}",${p.tipo},${p.precio},${p.stock}`).join('\n');
      } else {
        datos = JSON.stringify(inventario, null, 2);
      }
    }
    
    if (reporteFormato === 'csv') {
      exportarCSV(datos, nombre);
    } else {
      exportarJSON(reporteTipo === 'reservas' ? reservas : reporteTipo === 'clientes' ? clientes : reporteTipo === 'ventas' ? compras : inventario, nombre);
    }
  }, [reporteTipo, reporteFormato, reservas, clientes, compras, inventario, exportarCSV, exportarJSON]);
  
  // ── CONFIGURACIÓN ──
  const guardarConfig = useCallback(() => {
    LS.set('config', config);
    showToast('✅ Configuración guardada');
    logAccion('Configuración', 'Configuración del sistema actualizada', 'admin');
  }, [config, showToast, logAccion]);
  
  // ── SERVICIOS ──
  const agregarServicio = useCallback(() => {
    if (!nuevoServicio.nombre || nuevoServicio.precio <= 0) {
      showToast('Completá nombre y precio', 'error');
      return;
    }
    const nuevo = { ...nuevoServicio, id: Date.now() };
    const nuevos = [...servicios, nuevo];
    setServicios(nuevos);
    LS.set('servicios', nuevos);
    setNuevoServicio({ nombre: '', precio: 0, duracion: 30, categoria: 'manicura' });
    showToast('✅ Servicio agregado');
    logAccion('Servicio', `Agregado: ${nuevo.nombre}`, 'admin');
  }, [nuevoServicio, servicios, showToast, logAccion]);
  
  const eliminarServicio = useCallback((id: number) => {
    const nuevos = servicios.filter(s => s.id !== id);
    setServicios(nuevos);
    LS.set('servicios', nuevos);
    showToast('Servicio eliminado');
  }, [servicios, showToast]);
  
  // ── PROMOCIONES ──
  const agregarPromocion = useCallback(() => {
    if (!nuevaPromo.nombre || !nuevaPromo.fechaInicio || !nuevaPromo.fechaFin) {
      showToast('Completá todos los campos', 'error');
      return;
    }
    const nuevo = { ...nuevaPromo, id: Date.now() };
    const nuevos = [...promociones, nuevo];
    setPromociones(nuevos);
    LS.set('promociones', nuevos);
    setNuevaPromo({ nombre: '', descuento: 10, activa: true, fechaInicio: '', fechaFin: '' });
    showToast('✅ Promoción creada');
    logAccion('Promoción', `Creada: ${nuevo.nombre}`, 'admin');
  }, [nuevaPromo, promociones, showToast, logAccion]);
  
  const togglePromocion = useCallback((id: number) => {
    const nuevos = promociones.map(p => p.id === id ? { ...p, activa: !p.activa } : p);
    setPromociones(nuevos);
    LS.set('promociones', nuevos);
    showToast('Estado actualizado');
  }, [promociones, showToast]);
  
  // ── USUARIOS ADMIN ──
  const agregarAdminUser = useCallback(() => {
    if (!nuevoAdminUser.trim() || !nuevoAdminPass.trim()) {
      showToast('Completá usuario y contraseña', 'error');
      return;
    }
    if (adminUsers.find(u => u.usuario === nuevoAdminUser)) {
      showToast('El usuario ya existe', 'error');
      return;
    }
    const nuevo = { usuario: nuevoAdminUser, clave: nuevoAdminPass, rol: 'admin', tipo: 'custom' };
    const nuevos = [...adminUsers, nuevo];
    setAdminUsers(nuevos);
    LS.set('adminUsers', nuevos.filter(u => u.tipo === 'custom'));
    setNuevoAdminUser('');
    setNuevoAdminPass('');
    showToast('✅ Usuario creado');
    logAccion('Usuario', `Nuevo admin: ${nuevo.usuario}`, 'admin');
  }, [nuevoAdminUser, nuevoAdminPass, adminUsers, showToast, logAccion]);
  
  const eliminarAdminUser = useCallback((usuario: string) => {
    const user = adminUsers.find(u => u.usuario === usuario);
    if (user?.tipo === 'default') {
      showToast('No se pueden eliminar usuarios por defecto', 'error');
      return;
    }
    const nuevos = adminUsers.filter(u => u.usuario !== usuario);
    setAdminUsers(nuevos);
    LS.set('adminUsers', nuevos.filter(u => u.tipo === 'custom'));
    showToast('Usuario eliminado');
  }, [adminUsers, showToast]);
  
  // ── BACKUP ──
  const crearBackup = useCallback(() => {
    const backup = {
      fecha: new Date().toISOString(),
      reservas,
      clientes,
      compras,
      bloqueos,
      inventario,
      profesionales,
      servicios,
      promociones,
      config,
      auditLog,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_dexisnails_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Backup descargado');
    logAccion('Backup', 'Backup completo descargado', 'sistema');
  }, [reservas, clientes, compras, bloqueos, inventario, profesionales, servicios, promociones, config, auditLog, showToast, logAccion]);
  
  const importarBackup = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string);
        if (backup.reservas) { setReservas(backup.reservas); LS.set('reservas', backup.reservas); }
        if (backup.clientes) { setClientes(backup.clientes); LS.set('clientes', backup.clientes); }
        if (backup.compras) { setCompras(backup.compras); LS.set('compras', backup.compras); }
        if (backup.bloqueos) { setBloqueos(backup.bloqueos); LS.set('bloqueos', backup.bloqueos); }
        if (backup.inventario) { setInventario(backup.inventario); LS.set('inventario', backup.inventario); }
        if (backup.profesionales) { setProfesionales(backup.profesionales); LS.set('profesionales', backup.profesionales); }
        if (backup.servicios) { setServicios(backup.servicios); LS.set('servicios', backup.servicios); }
        if (backup.promociones) { setPromociones(backup.promociones); LS.set('promociones', backup.promociones); }
        if (backup.config) { setConfig(backup.config); LS.set('config', backup.config); }
        if (backup.auditLog) { setAuditLog(backup.auditLog); LS.set('auditLog', backup.auditLog); }
        showToast('✅ Backup restaurado');
        logAccion('Backup', 'Backup restaurado desde archivo', 'sistema');
      } catch {
        showToast('Error al leer el archivo', 'error');
      }
    };
    reader.readAsText(file);
  }, [showToast, logAccion]);

  // ── CAJA REGISTRADORA ──
  const cajaActual = cajas.find(c => c.estado === 'abierta');
  const transaccionesHoy = transacciones.filter(t => t.cajaId === cajaActual?.id);

  const abrirCaja = useCallback(() => {
    if (montoApertura < 0) {
      showToast('El monto inicial debe ser mayor o igual a 0', 'error');
      return;
    }
    if (cajaActual) {
      showToast('Ya hay una caja abierta', 'error');
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    if (cajas.find(c => c.fecha === hoy && c.estado === 'cerrada')) {
      showToast('La caja de hoy ya fue cerrada', 'error');
      return;
    }
    const nuevaCaja: CajaDia = {
      id: Date.now(),
      fecha: hoy,
      horaApertura: new Date().toISOString(),
      montoInicial: montoApertura,
      estado: 'abierta',
      usuarioApertura: adminActual?.usuario || 'Sistema',
    };
    const nuevasCajas = [...cajas, nuevaCaja];
    setCajas(nuevasCajas);
    LS.set('cajas', nuevasCajas);

    // Registrar transacción de apertura
    const transApertura: TransaccionCaja = {
      id: Date.now() + 1,
      tipo: 'apertura',
      monto: montoApertura,
      descripcion: 'Apertura de caja',
      fecha: new Date().toISOString(),
      usuario: adminActual?.usuario || 'Sistema',
      metodo: 'efectivo',
      cajaId: nuevaCaja.id,
    };
    const nuevasTrans = [...transacciones, transApertura];
    setTransacciones(nuevasTrans);
    LS.set('transacciones', nuevasTrans);

    setMontoApertura(0);
    showToast('✅ Caja abierta');
    logAccion('Caja', `Apertura con $${montoApertura.toLocaleString()}`, 'caja');
  }, [montoApertura, cajaActual, cajas, transacciones, adminActual, showToast, logAccion]);

  const cerrarCaja = useCallback(() => {
    if (!cajaActual) {
      showToast('No hay caja abierta', 'error');
      return;
    }
    const ingresos = transaccionesHoy.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').reduce((s, t) => s + t.monto, 0);
    const egresos = transaccionesHoy.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0);
    const totalEsperado = cajaActual.montoInicial + ingresos - egresos;
    const diferencia = montoCierre - totalEsperado;

    const cajasActualizadas = cajas.map(c =>
      c.id === cajaActual.id
        ? { ...c, estado: 'cerrada' as const, horaCierre: new Date().toISOString(), montoFinal: montoCierre, usuarioCierre: adminActual?.usuario || 'Sistema' }
        : c
    );
    setCajas(cajasActualizadas);
    LS.set('cajas', cajasActualizadas);

    // Registrar transacción de cierre
    const transCierre: TransaccionCaja = {
      id: Date.now(),
      tipo: 'cierre',
      monto: montoCierre,
      descripcion: `Cierre de caja. Diferencia: ${diferencia >= 0 ? '+' : ''}$${diferencia.toLocaleString()}`,
      fecha: new Date().toISOString(),
      usuario: adminActual?.usuario || 'Sistema',
      metodo: 'efectivo',
      cajaId: cajaActual.id,
    };
    const nuevasTrans = [...transacciones, transCierre];
    setTransacciones(nuevasTrans);
    LS.set('transacciones', nuevasTrans);

    setMontoCierre(0);
    showToast(`✅ Caja cerrada. Diferencia: ${diferencia >= 0 ? '+' : ''}$${diferencia.toLocaleString()}`);
    logAccion('Caja', `Cierre con $${montoCierre.toLocaleString()}. Dif: $${diferencia.toLocaleString()}`, 'caja');
  }, [cajaActual, cajas, transacciones, transaccionesHoy, montoCierre, adminActual, showToast, logAccion]);

  const agregarMovimiento = useCallback(() => {
    if (!cajaActual) {
      showToast('No hay caja abierta', 'error');
      return;
    }
    if (nuevaTransaccion.monto <= 0) {
      showToast('El monto debe ser mayor a 0', 'error');
      return;
    }
    if (!nuevaTransaccion.descripcion.trim()) {
      showToast('Ingresá una descripción', 'error');
      return;
    }
    const trans: TransaccionCaja = {
      id: Date.now(),
      tipo: nuevaTransaccion.tipo,
      monto: nuevaTransaccion.monto,
      descripcion: nuevaTransaccion.descripcion,
      fecha: new Date().toISOString(),
      usuario: adminActual?.usuario || 'Sistema',
      metodo: nuevaTransaccion.metodo,
      cajaId: cajaActual.id,
    };
    const nuevasTrans = [...transacciones, trans];
    setTransacciones(nuevasTrans);
    LS.set('transacciones', nuevasTrans);
    setNuevaTransaccion({ tipo: 'ingreso', monto: 0, descripcion: '', metodo: 'efectivo' });
    showToast(`✅ ${nuevaTransaccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado`);
    logAccion('Caja', `${nuevaTransaccion.tipo}: $${nuevaTransaccion.monto.toLocaleString()} - ${nuevaTransaccion.descripcion}`, 'caja');
  }, [cajaActual, nuevaTransaccion, transacciones, adminActual, showToast, logAccion]);

  const registrarVentaCaja = useCallback((monto: number, descripcion: string, metodo: TransaccionCaja['metodo']) => {
    if (!cajaActual) return;
    const trans: TransaccionCaja = {
      id: Date.now(),
      tipo: 'venta',
      monto,
      descripcion,
      fecha: new Date().toISOString(),
      usuario: adminActual?.usuario || 'Sistema',
      metodo,
      cajaId: cajaActual.id,
    };
    const nuevasTrans = [...transacciones, trans];
    setTransacciones(nuevasTrans);
    LS.set('transacciones', nuevasTrans);
  }, [cajaActual, transacciones, adminActual]);

  // ── EMPLEADOS ──
  const agregarEmpleado = useCallback(() => {
    if (!nuevoEmpleado.nombre.trim()) {
      showToast('Ingresá el nombre del empleado', 'error');
      return;
    }
    const nuevo: Empleado = {
      id: Date.now(),
      nombre: nuevoEmpleado.nombre,
      emoji: nuevoEmpleado.emoji,
      especialidad: nuevoEmpleado.especialidad,
      activa: true,
      rol: nuevoEmpleado.rol,
      telefono: nuevoEmpleado.telefono,
      fechaIngreso: new Date().toISOString().split('T')[0],
      comision: nuevoEmpleado.comision,
      horarios: [],
      salarioBase: nuevoEmpleado.salarioBase,
    };
    const nuevos = [...empleados, nuevo];
    setEmpleados(nuevos);
    LS.set('empleados', nuevos);
    setNuevoEmpleado({ nombre: '', emoji: '👩', especialidad: '', rol: 'profesional', telefono: '', comision: 20, salarioBase: 0 });
    showToast('✅ Empleado agregado');
    logAccion('Empleado', `Nuevo: ${nuevo.nombre}`, 'admin');
  }, [nuevoEmpleado, empleados, showToast, logAccion]);

  const actualizarEmpleado = useCallback((id: number, datos: Partial<Empleado>) => {
    const nuevos = empleados.map(e => e.id === id ? { ...e, ...datos } : e);
    setEmpleados(nuevos);
    LS.set('empleados', nuevos);
    showToast('Empleado actualizado');
  }, [empleados, showToast]);

  const eliminarEmpleado = useCallback((id: number) => {
    const nuevos = empleados.filter(e => e.id !== id);
    setEmpleados(nuevos);
    LS.set('empleados', nuevos);
    showToast('Empleado eliminado');
    logAccion('Empleado', `Eliminado ID: ${id}`, 'admin');
  }, [empleados, showToast, logAccion]);

  // ── PROVEEDORES ──
  const agregarProveedor = useCallback(() => {
    if (!nuevoProveedor.nombre.trim()) {
      showToast('Ingresá el nombre del proveedor', 'error');
      return;
    }
    const nuevo: Proveedor = {
      id: Date.now(),
      nombre: nuevoProveedor.nombre,
      contacto: nuevoProveedor.contacto,
      telefono: nuevoProveedor.telefono,
      email: nuevoProveedor.email,
      direccion: nuevoProveedor.direccion,
      categoria: nuevoProveedor.categoria,
      notas: nuevoProveedor.notas,
      activo: true,
    };
    const nuevos = [...proveedores, nuevo];
    setProveedores(nuevos);
    LS.set('proveedores', nuevos);
    setNuevoProveedor({ nombre: '', contacto: '', telefono: '', email: '', direccion: '', categoria: '', notas: '' });
    showToast('✅ Proveedor agregado');
    logAccion('Proveedor', `Nuevo: ${nuevo.nombre}`, 'admin');
  }, [nuevoProveedor, proveedores, showToast, logAccion]);

  const eliminarProveedor = useCallback((id: number) => {
    const nuevos = proveedores.filter(p => p.id !== id);
    setProveedores(nuevos);
    LS.set('proveedores', nuevos);
    showToast('Proveedor eliminado');
  }, [proveedores, showToast]);

  const crearOrdenCompra = useCallback(() => {
    if (nuevaOrden.proveedorId === 0) {
      showToast('Seleccioná un proveedor', 'error');
      return;
    }
    if (nuevaOrden.items.length === 0) {
      showToast('Agregá items a la orden', 'error');
      return;
    }
    const proveedor = proveedores.find(p => p.id === nuevaOrden.proveedorId);
    const orden: OrdenCompra = {
      id: Date.now(),
      proveedorId: nuevaOrden.proveedorId,
      proveedorNombre: proveedor?.nombre || '',
      fecha: new Date().toISOString(),
      items: nuevaOrden.items,
      total: nuevaOrden.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0),
      estado: 'pendiente',
    };
    const nuevas = [...ordenesCompra, orden];
    setOrdenesCompra(nuevas);
    LS.set('ordenesCompra', nuevas);
    setNuevaOrden({ proveedorId: 0, items: [] });
    showToast('✅ Orden de compra creada');
    logAccion('Orden', `Creada orden #${orden.id} por $${orden.total.toLocaleString()}`, 'admin');
  }, [nuevaOrden, proveedores, ordenesCompra, showToast, logAccion]);

  // ── CUPONES ──
  const generarCodigoCupon = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  };

  const agregarCupon = useCallback(() => {
    if (!nuevoCupon.codigo.trim()) {
      showToast('Ingresá un código para el cupón', 'error');
      return;
    }
    if (cupones.find(c => c.codigo.toLowerCase() === nuevoCupon.codigo.toLowerCase())) {
      showToast('Ese código ya existe', 'error');
      return;
    }
    const cupon: Cupon = {
      id: Date.now(),
      codigo: nuevoCupon.codigo.toUpperCase(),
      descuento: nuevoCupon.descuento,
      tipoDescuento: nuevoCupon.tipoDescuento,
      fechaInicio: nuevoCupon.fechaInicio,
      fechaFin: nuevoCupon.fechaFin,
      usosMaximos: nuevoCupon.usosMaximos,
      usosActuales: 0,
      activo: true,
      minimoCompra: nuevoCupon.minimoCompra,
    };
    const nuevos = [...cupones, cupon];
    setCupones(nuevos);
    LS.set('cupones', nuevos);
    setNuevoCupon({ codigo: '', descuento: 10, tipoDescuento: 'porcentaje', fechaInicio: '', fechaFin: '', usosMaximos: 100, minimoCompra: 0 });
    showToast('✅ Cupón creado');
    logAccion('Cupón', `Creado: ${cupon.codigo}`, 'admin');
  }, [nuevoCupon, cupones, showToast, logAccion]);

  const toggleCupon = useCallback((id: number) => {
    const nuevos = cupones.map(c => c.id === id ? { ...c, activo: !c.activo } : c);
    setCupones(nuevos);
    LS.set('cupones', nuevos);
    showToast('Estado del cupón actualizado');
  }, [cupones, showToast]);

  const eliminarCupon = useCallback((id: number) => {
    const nuevos = cupones.filter(c => c.id !== id);
    setCupones(nuevos);
    LS.set('cupones', nuevos);
    showToast('Cupón eliminado');
  }, [cupones, showToast]);

  // ── GIFT CARDS ──
  const generarCodigoGiftCard = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'GC-';
    for (let i = 0; i < 10; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  };

  const crearGiftCard = useCallback(() => {
    if (nuevaGiftCard.saldoInicial <= 0) {
      showToast('El saldo debe ser mayor a 0', 'error');
      return;
    }
    const giftCard: GiftCard = {
      id: Date.now(),
      codigo: generarCodigoGiftCard(),
      saldoInicial: nuevaGiftCard.saldoInicial,
      saldoActual: nuevaGiftCard.saldoInicial,
      comprador: nuevaGiftCard.comprador,
      destinatario: nuevaGiftCard.destinatario,
      fechaCompra: new Date().toISOString(),
      fechaVencimiento: nuevaGiftCard.fechaVencimiento || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      activa: true,
      historial: [{ fecha: new Date().toISOString(), monto: nuevaGiftCard.saldoInicial, descripcion: 'Saldo inicial' }],
    };
    const nuevas = [...giftCards, giftCard];
    setGiftCards(nuevas);
    LS.set('giftCards', nuevas);
    setNuevaGiftCard({ saldoInicial: 50000, comprador: '', destinatario: '', fechaVencimiento: '' });
    showToast(`✅ Gift Card creada: ${giftCard.codigo}`);
    logAccion('GiftCard', `Creada: ${giftCard.codigo} - $${giftCard.saldoInicial.toLocaleString()}`, 'admin');
  }, [nuevaGiftCard, giftCards, showToast, logAccion]);

  const usarGiftCard = useCallback((codigo: string, monto: number) => {
    const gc = giftCards.find(g => g.codigo === codigo && g.activa && g.saldoActual >= monto);
    if (!gc) {
      showToast('Gift Card no válida o saldo insuficiente', 'error');
      return false;
    }
    const nuevas = giftCards.map(g =>
      g.id === gc.id
        ? {
            ...g,
            saldoActual: g.saldoActual - monto,
            activa: g.saldoActual - monto > 0,
            historial: [...g.historial, { fecha: new Date().toISOString(), monto: -monto, descripcion: 'Uso' }]
          }
        : g
    );
    setGiftCards(nuevas);
    LS.set('giftCards', nuevas);
    showToast(`✅ Gift Card usada: -$${monto.toLocaleString()}`);
    return true;
  }, [giftCards, showToast]);

  // ── COMISIONES ──
  const calcularComision = useCallback((empleadoId: number, servicio: string, montoVenta: number) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    if (!empleado) return 0;
    return Math.round(montoVenta * (empleado.comision / 100));
  }, [empleados]);

  const registrarComision = useCallback((empleadoId: number, servicio: string, montoVenta: number) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    if (!empleado) return;
    const comisionMonto = calcularComision(empleadoId, servicio, montoVenta);
    const registro: ComisionRegistro = {
      id: Date.now(),
      empleadoId,
      empleadoNombre: empleado.nombre,
      fecha: new Date().toISOString(),
      servicio,
      montoVenta,
      porcentaje: empleado.comision,
      comision: comisionMonto,
      pagada: false,
    };
    const nuevas = [...comisiones, registro];
    setComisiones(nuevas);
    LS.set('comisiones', nuevas);
    return registro;
  }, [empleados, calcularComision, comisiones]);

  const marcarComisionPagada = useCallback((id: number) => {
    const nuevas = comisiones.map(c => c.id === id ? { ...c, pagada: true } : c);
    setComisiones(nuevas);
    LS.set('comisiones', nuevas);
    showToast('Comisión marcada como pagada');
    logAccion('Comisión', `Pagada ID: ${id}`, 'admin');
  }, [comisiones, showToast, logAccion]);

  const getComisionesPorEmpleado = useCallback((empleadoId: number) => {
    return comisiones.filter(c => c.empleadoId === empleadoId);
  }, [comisiones]);

  const getTotalComisionesPendientes = useCallback(() => {
    return comisiones.filter(c => !c.pagada).reduce((s, c) => s + c.comision, 0);
  }, [comisiones]);

  // ── RENDER ──
  const pts = clienteActual ? getPuntos(clienteActual.cedula, reservas, compras) : 0;
  const nivel = getNivel(pts);
  
  return (
    <>
      {/* FONDO */}
      <div className="nebulosa" />
      <div id="bgStars" ref={starsRef} />
      <div className="nebula-pill" style={{ width: 400, height: 400, top: -100, left: -100, background: 'rgba(138,43,226,.12)', '--pd': '30s', '--ptx': '40px', '--pty': '30px' } as React.CSSProperties} />
      <div className="nebula-pill" style={{ width: 350, height: 350, bottom: -80, right: -80, background: 'rgba(255,20,147,.08)', '--pd': '25s', '--ptx': '-30px', '--pty': '-40px' } as React.CSSProperties} />
      
      {/* INTRO */}
      {showIntro && (
        <div id="intro">
          <div className="intro-logo">Dexi&apos;s Nails</div>
          <div className="intro-sub">EXPERIENCIA CÓSMICA</div>
          <div className="intro-bar"><div className="intro-bar-fill" /></div>
        </div>
      )}
      
      {/* SHELL PRINCIPAL */}
      {!showIntro && (
        <div id="shell">
          {/* NAV */}
          <nav className="nav">
            {[
              { sec: 'inicio', icon: '✨', label: 'INICIO', color: '#00f5d4' },      // Turquesa - bienvenida
              { sec: 'precios', icon: '💅', label: 'PRECIOS', color: '#ffd700' },    // Dorado - valor
              { sec: 'reservas', icon: '📅', label: 'RESERVA', color: '#00ff88' },   // Verde esmeralda - confirmación
              { sec: 'ia', icon: '🤖', label: 'IA', color: '#9b5de5' },              // Morado - tecnología
              { sec: 'tienda', icon: '🛍️', label: 'TIENDA', color: '#ff1493' },      // Fucsia - atracción
              { sec: 'dashboard', icon: '📊', label: 'MI PERFIL', color: '#00b4d8' },// Azul cielo - personal
              { sec: 'juego', icon: '🚀', label: 'JUGAR', color: '#7fff00' },        // Verde lima - acción
              { sec: 'admin', icon: '👑', label: 'ADMIN', color: '#ff8c00' },        // Naranja - autoridad
            ].map(btn => (
              <div
                key={btn.sec}
                className={`nav-btn ${currentSec === btn.sec ? 'active' : ''}`}
                style={{ '--nav-color': btn.color } as React.CSSProperties}
                onClick={() => goTo(btn.sec)}
              >
                <span className="icon">{btn.icon}</span>
                {btn.label}
              </div>
            ))}
          </nav>
          
          {/* PANEL PRINCIPAL */}
          <div id="mainPanel">
            
            {/* SECCIÓN INICIO */}
            {currentSec === 'inicio' && (
              <div className="section active" id="secInicio">
                {clienteActual ? (
                  /* INICIO CON LOGIN - LAYOUT GRID */
                  <div className="inicio-layout-grid">
                    {/* IZQUIERDA - Info del cliente */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '25px',
                      gap: 12
                    }}>
                      {/* Avatar + Saludo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3px solid var(--c-turquesa)',
                          boxShadow: '0 0 25px rgba(0,245,212,.5)',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem'
                        }}>
                          💅
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{
                            fontFamily: 'var(--font-script)',
                            fontSize: 'clamp(1.6rem, 4.5vw, 2.5rem)',
                            background: 'linear-gradient(180deg, #fff, var(--c-turquesa) 55%, var(--c-dorado))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap'
                          }}>
                            Hola, {clienteActual.nombre.split(' ')[0]}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '.55rem',
                            letterSpacing: 4,
                            color: nivel.color,
                            marginTop: 2
                          }}>
                            {nivel.icon} {nivel.nombre} · {nivel.descuento}% DTO
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <div style={{ background: 'transparent', border: '1px solid rgba(0,245,212,.25)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--c-turquesa)' }}>{pts}</div>
                          <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)', letterSpacing: 1 }}>PUNTOS</div>
                        </div>
                        <div style={{ background: 'transparent', border: '1px solid rgba(255,20,147,.25)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--c-fucsia)' }}>{reservas.filter(r => r.cedula === clienteActual.cedula).length}</div>
                          <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)', letterSpacing: 1 }}>VISITAS</div>
                        </div>
                        <div style={{ background: 'transparent', border: '1px solid rgba(255,215,0,.25)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--c-dorado)' }}>{compras.filter(c => c.cedula === clienteActual.cedula).length}</div>
                          <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)', letterSpacing: 1 }}>COMPRAS</div>
                        </div>
                      </div>
                      
                      {/* Botón */}
                      <button
                        className="btn-primary"
                        style={{ width: 'auto', padding: '12px 28px', fontSize: '.7rem' }}
                        onClick={() => goTo('reservas')}
                      >
                        RESERVAR TURNO →
                      </button>
                    </div>
                    
                    {/* DERECHA - Video */}
                    <div className="inicio-right-log" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '100%',
                        maxWidth: 420,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <video
                          src="/Dexi.mp4"
                          controls
                          autoPlay
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            borderRadius: 16,
                            border: '1px solid rgba(255,20,147,.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,.3)'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* BOTTOM - Equipo y Horarios */}
                    <div className="inicio-bottom-log" style={{
                      gridColumn: '1 / -1',
                      padding: '16px 24px',
                      borderTop: '1px solid rgba(255,255,255,.06)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16
                    }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '.6rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 8 }}>👩 EQUIPO HOY</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {profesionales.slice(0, 4).map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8 }}>
                              <span style={{ fontSize: '1.2rem' }}>{p.emoji}</span>
                              <span style={{ fontSize: '.7rem', color: 'white' }}>{p.nombre}</span>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.activa ? 'var(--c-turquesa)' : 'rgba(255,0,110,.5)' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '.6rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 8 }}>🕐 HORARIO HOY</div>
                        <div style={{ fontSize: '.8rem', color: 'white' }}>
                          {new Date().getDay() === 0 ? (
                            <span style={{ color: 'var(--c-fucsia)' }}>CERRADO</span>
                          ) : (
                            <span>9:00 – 18:00</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* INICIO SIN LOGIN - LAYOUT GRID */
                  <div className="inicio-layout-grid">
                    {/* IZQUIERDA - Logo e info */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '25px',
                      gap: 12
                    }}>
                      {/* Foto + Título */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3px solid var(--c-fucsia)',
                          boxShadow: '0 0 25px rgba(255,20,147,.5)',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #1a1a2e, #16213e)'
                        }}>
                          <img src="/Dexi.jpeg" alt="Dexi's Nails" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{
                            fontFamily: 'var(--font-script)',
                            fontSize: 'clamp(1.6rem, 4.5vw, 2.5rem)',
                            background: 'linear-gradient(180deg, #fff, var(--c-fucsia) 55%, var(--c-dorado))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap'
                          }}>
                            Dexi&apos;s Nails
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '.55rem',
                            letterSpacing: 4,
                            color: 'var(--c-turquesa)',
                            marginTop: 2
                          }}>
                            EXPERIENCIA CÓSMICA
                          </div>
                        </div>
                      </div>
                      
                      {/* Descripción */}
                      <p style={{
                        fontSize: '.8rem',
                        color: 'rgba(255,255,255,.5)',
                        maxWidth: 280,
                        lineHeight: 1.5,
                        textAlign: 'center'
                      }}>
                        Manicura · Podología · Facial · Colonias Árabes · Diagnóstico con IA
                      </p>
                      
                      {/* Botón */}
                      <button
                        className="btn-primary"
                        style={{ width: 'auto', padding: '12px 28px', fontSize: '.7rem' }}
                        onClick={() => goTo('reservas')}
                      >
                        RESERVAR TURNO →
                      </button>
                      
                      {/* Info rápida - Horizontal */}
                      <div style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        marginTop: 8
                      }}>
                        <div style={{
                          background: 'transparent',
                          border: '1px solid rgba(0,245,212,.25)',
                          borderRadius: 10,
                          padding: '8px 14px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '.45rem', letterSpacing: 1, color: 'var(--c-turquesa)' }}>HORARIO</div>
                          <div style={{ fontSize: '.68rem', color: 'white', marginTop: 1 }}>Lun-Sáb 9-18h</div>
                        </div>
                        <div style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,215,0,.25)',
                          borderRadius: 10,
                          padding: '8px 14px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '.45rem', letterSpacing: 1, color: 'var(--c-dorado)' }}>UBICACIÓN</div>
                          <div style={{ fontSize: '.68rem', color: 'white', marginTop: 1 }}>Centro</div>
                        </div>
                        <div style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,20,147,.25)',
                          borderRadius: 10,
                          padding: '8px 14px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '.45rem', letterSpacing: 1, color: 'var(--c-fucsia)' }}>CONTACTO</div>
                          <div style={{ fontSize: '.68rem', color: 'white', marginTop: 1 }}>315 144 5041</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* DERECHA - Video */}
                    <div className="inicio-right" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px'
                    }}>
                      <div style={{
                        width: '100%',
                        maxWidth: 420,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <video
                          src="/Dexi.mp4"
                          controls
                          autoPlay
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            borderRadius: 16,
                            border: '1px solid rgba(255,20,147,.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,.3)'
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* BOTTOM - Servicios destacados */}
                    <div style={{
                      width: '100%',
                      padding: '16px 24px',
                      borderTop: '1px solid rgba(255,255,255,.06)'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 10,
                        maxWidth: 800,
                        margin: '0 auto'
                      }}>
                        {[
                          { icon: '💅', name: 'Manicura', color: 'var(--c-fucsia)', sec: 'precios' },
                          { icon: '🦶', name: 'Podología', color: 'var(--c-turquesa)', sec: 'precios' },
                          { icon: '✨', name: 'Facial', color: 'var(--c-dorado)', sec: 'precios' },
                          { icon: (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#ffd700" />
                                  <stop offset="50%" stopColor="#ff1493" />
                                  <stop offset="100%" stopColor="#9b5de5" />
                                </linearGradient>
                              </defs>
                              <rect x="6" y="10" width="12" height="12" rx="2" fill="url(#bottleGrad)" opacity="0.9"/>
                              <rect x="9" y="5" width="6" height="5" rx="1" fill="url(#bottleGrad)" opacity="0.7"/>
                              <rect x="10" y="2" width="4" height="4" rx="1" fill="#ffd700"/>
                              <rect x="8" y="13" width="8" height="6" rx="1" fill="rgba(255,255,255,0.3)"/>
                            </svg>
                          ), name: 'Colonias Árabes', color: 'var(--c-morado)', sec: 'tienda' },
                        ].map((s, i) => (
                          <div
                            key={i}
                            onClick={() => goTo(s.sec)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              background: 'transparent',
                              border: `1px solid ${s.color}33`,
                              borderRadius: 10,
                              cursor: 'pointer',
                              transition: 'all .2s'
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center' }}>{typeof s.icon === 'string' ? <span style={{ fontSize: '1.4rem' }}>{s.icon}</span> : s.icon}</span>
                            <span style={{ fontSize: '.8rem', color: s.color, fontWeight: 500 }}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* SECCIÓN PRECIOS */}
            {currentSec === 'precios' && (
              <div className="section active">
                <div className="section-inner">
                  <div className="precios-container">
                    {/* MANICURA */}
                    <div>
                      <div className="cat-header" style={{ '--cat-color': 'var(--c-fucsia)' } as React.CSSProperties}>
                        <span className="cat-header-icon">💅</span>
                        <span className="cat-header-title">MANICURA</span>
                      </div>
                      <div className="servicios-grid">
                        {[
                          { nombre: 'Manicura tradicional', desc: 'Corte, limado y esmaltado clásico con acabado perfecto.', precio: 25000, dur: '30 min', badge: true },
                          { nombre: 'Manicura con diseños', desc: 'Arte en uñas, stickers, brillos y diseños personalizados.', precio: 35000, dur: '45 min' },
                          { nombre: 'Semipermanente', desc: 'Duración 2–3 semanas, alto brillo y colores vibrantes.', precio: 35000, dur: '45 min', badge: true },
                          { nombre: 'Press On', desc: 'Uñas postizas personalizadas, fácil de poner y retirar.', precio: 40000, dur: '30 min' },
                          { nombre: 'Base Rubber', desc: 'Fortalecedor para uñas débiles o dañadas.', precio: 15000, dur: '15 min' },
                        ].map((s, i) => (
                          <div key={i} className="svc-card">
                            {s.badge && <span className="svc-badge">MÁS PEDIDO</span>}
                            <div className="svc-nombre">{s.nombre}</div>
                            <div className="svc-desc">{s.desc}</div>
                            <div className="svc-bottom">
                              <div>
                                <div className="svc-precio">${s.precio.toLocaleString()}</div>
                                <div className="svc-dur">⏱ {s.dur}</div>
                              </div>
                              <button className="svc-reservar" onClick={() => { setServicioInput(s.nombre); goTo('reservas'); }}>RESERVAR</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* PODOLOGÍA */}
                    <div>
                      <div className="cat-header" style={{ '--cat-color': 'var(--c-turquesa)' } as React.CSSProperties}>
                        <span className="cat-header-icon">🦶</span>
                        <span className="cat-header-title">PODOLOGÍA</span>
                      </div>
                      <div className="servicios-grid">
                        {[
                          { nombre: 'Podología integral', desc: 'Diagnóstico y tratamiento completo de pies.', precio: 45000, dur: '45 min' },
                          { nombre: 'Pedicure tradicional', desc: 'Corte, limado, callos e hidratación profunda.', precio: 35000, dur: '40 min', badge: true },
                          { nombre: 'Terapia con parafina', desc: 'Hidratación profunda para pies y manos. Relajación total.', precio: 30000, dur: '30 min' },
                        ].map((s, i) => (
                          <div key={i} className="svc-card">
                            {s.badge && <span className="svc-badge">MÁS PEDIDO</span>}
                            <div className="svc-nombre">{s.nombre}</div>
                            <div className="svc-desc">{s.desc}</div>
                            <div className="svc-bottom">
                              <div>
                                <div className="svc-precio">${s.precio.toLocaleString()}</div>
                                <div className="svc-dur">⏱ {s.dur}</div>
                              </div>
                              <button className="svc-reservar" onClick={() => { setServicioInput(s.nombre); goTo('reservas'); }}>RESERVAR</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* FACIAL */}
                    <div>
                      <div className="cat-header" style={{ '--cat-color': 'var(--c-morado)' } as React.CSSProperties}>
                        <span className="cat-header-icon">🧖</span>
                        <span className="cat-header-title">FACIAL</span>
                      </div>
                      <div className="servicios-grid">
                        {[
                          { nombre: 'Limpieza facial básica', desc: 'Higiene profunda e hidratación revitalizante.', precio: 40000, dur: '45 min' },
                          { nombre: 'Limpieza facial profunda', desc: 'Exfoliación, extracción y mascarilla premium.', precio: 65000, dur: '60 min' },
                        ].map((s, i) => (
                          <div key={i} className="svc-card">
                            <div className="svc-nombre">{s.nombre}</div>
                            <div className="svc-desc">{s.desc}</div>
                            <div className="svc-bottom">
                              <div>
                                <div className="svc-precio">${s.precio.toLocaleString()}</div>
                                <div className="svc-dur">⏱ {s.dur}</div>
                              </div>
                              <button className="svc-reservar" onClick={() => { setServicioInput(s.nombre); goTo('reservas'); }}>RESERVAR</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* FIDELIDAD */}
                    <div>
                      <div className="cat-header" style={{ '--cat-color': 'var(--c-dorado)' } as React.CSSProperties}>
                        <span className="cat-header-icon">⭐</span>
                        <span className="cat-header-title">PROGRAMA DE FIDELIDAD</span>
                      </div>
                      <div className="fidelidad-grid">
                        {[
                          { icon: '🥉', nombre: 'BRONCE', desc: '0–49 pts · 3% descuento', class: 'nivel-bronce' },
                          { icon: '🥈', nombre: 'PLATA', desc: '50–149 pts · 5% descuento', class: 'nivel-plata' },
                          { icon: '🥇', nombre: 'ORO', desc: '150–299 pts · 10% descuento', class: 'nivel-oro' },
                          { icon: '💎', nombre: 'DIAMANTE', desc: '300+ pts · 15% descuento', class: 'nivel-diamante' },
                        ].map((n, i) => (
                          <div key={i} className={`nivel-card ${n.class}`}>
                            <div className="nivel-icon">{n.icon}</div>
                            <div className="nivel-nombre">{n.nombre}</div>
                            <div className="nivel-desc">{n.desc}</div>
                          </div>
                        ))}
                      </div>
                      <div className="nota-final">✨ Precios incluyen IVA · 10 pts por reserva · 5 pts por compra en tienda</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* SECCIÓN RESERVAS */}
            {currentSec === 'reservas' && (
              <div className="section active">
                <div className="section-inner">
                  {!clienteActual ? (
                    <div className="login-box">
                      <h2>🌙 INICIAR SESIÓN</h2>
                      <div className="form-field">
                        <label>NOMBRE COMPLETO</label>
                        <input className="form-input" value={loginNombre} onChange={e => setLoginNombre(e.target.value)} placeholder="Tu nombre" />
                      </div>
                      <div className="form-field">
                        <label>CÉDULA / DNI</label>
                        <input className="form-input" value={loginCedula} onChange={e => setLoginCedula(e.target.value)} placeholder="Número de documento" />
                      </div>
                      <div className="form-field">
                        <label>TELÉFONO (opcional)</label>
                        <input className="form-input" value={loginTel} onChange={e => setLoginTel(e.target.value)} placeholder="+57 ..." />
                      </div>
                      <div className="form-field">
                        <label>EMAIL (opcional)</label>
                        <input className="form-input" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="tu@email.com" />
                      </div>
                      <button className="btn-primary" onClick={loginCliente}>INGRESAR / REGISTRARME</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
                        <div className="cliente-badge">
                          <span>👤</span>
                          <span className="nombre">{clienteActual.nombre}</span>
                          <span className="puntos">⭐ {pts} pts</span>
                          <span style={{ fontSize: '.65rem', padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-display)', color: nivel.color, border: `1.5px solid ${nivel.color}`, background: `${nivel.color}22` }}>
                            {nivel.icon} {nivel.nombre}
                          </span>
                        </div>
                        <button className="btn-logout" onClick={logoutCliente}>CERRAR SESIÓN</button>
                      </div>
                      
                      <div className="admin-tabs" style={{ marginBottom: 16 }}>
                        <div className={`admin-tab ${reservaTab === 'nueva' ? 'active' : ''}`} onClick={() => setReservaTab('nueva')}>NUEVA RESERVA</div>
                        <div className={`admin-tab ${reservaTab === 'mis' ? 'active' : ''}`} onClick={() => setReservaTab('mis')}>MIS RESERVAS</div>
                      </div>
                      
                      {reservaTab === 'nueva' ? (
                        <>
                          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              overflow: 'hidden',
                              border: '2px solid var(--c-fucsia)',
                              boxShadow: '0 0 15px rgba(255,20,147,.4)',
                              flexShrink: 0,
                              background: 'linear-gradient(135deg, #1a1a2e, #16213e)'
                            }}>
                              <img src="/Dexi.jpeg" alt="Dexi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            👩 ELEGÍ TU PROFESIONAL
                          </div>
                          <div className="prof-grid">
                            {profesionales.map(p => (
                              <div
                                key={p.id}
                                className={`prof-card ${p.activa ? '' : 'inactiva'} ${selProf === p.id ? 'selected' : ''}`}
                                onClick={() => p.activa && setSelProf(p.id)}
                              >
                                <div className="prof-avatar">
                                  {p.nombre === 'Dexi' ? (
                                    <img src="/Dexi.jpeg" alt="Dexi" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                  ) : (
                                    p.emoji
                                  )}
                                </div>
                                <div className="prof-nombre">{p.nombre}</div>
                                <div className="prof-espec">{p.especialidad}</div>
                                {!p.activa && <span className="prof-badge-inactiva">NO DISPONIBLE</span>}
                              </div>
                            ))}
                          </div>
                          
                          <div className="divider" />
                          
                          <div className="section-title">📅 ELEGÍ EL DÍA</div>
                          <div className="calendario-nav">
                            <button className="cal-nav-btn" onClick={() => { if (calMes === 0) { setCalMes(11); setCalAnno(calAnno - 1); } else setCalMes(calMes - 1); }}>‹</button>
                            <span className="cal-title">{['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'][calMes]} {calAnno}</span>
                            <button className="cal-nav-btn" onClick={() => { if (calMes === 11) { setCalMes(0); setCalAnno(calAnno + 1); } else setCalMes(calMes + 1); }}>›</button>
                          </div>
                          <div className="cal-grid">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                              <div key={d} className="cal-day-name">{d}</div>
                            ))}
                            {Array.from({ length: new Date(calAnno, calMes, 1).getDay() }).map((_, i) => (
                              <div key={`empty-${i}`} className="cal-day empty" />
                            ))}
                            {Array.from({ length: new Date(calAnno, calMes + 1, 0).getDate() }).map((_, i) => {
                              const d = i + 1;
                              const fecha = `${calAnno}-${String(calMes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                              const fechaD = new Date(calAnno, calMes, d);
                              const hoy = new Date();
                              hoy.setHours(0, 0, 0, 0);
                              const pasado = fechaD < hoy;
                              const bloqueado = bloqueos.some(b => (b.profesional === 'todos' || b.profesional === selProf) && b.fecha === fecha);
                              
                              // Calcular reservas del día
                              const reservasDelDia = selProf ? reservas.filter(r => r.fecha === fecha && r.profesional === selProf) : [];
                              const totalHorarios = HORARIOS.length;
                              const horariosOcupados = reservasDelDia.length;
                              const esDomingo = fechaD.getDay() === 0;
                              
                              // Festivos (ejemplo: 25 dic, 1 ene, etc.)
                              const festivos = ['12-25', '01-01', '05-01', '07-20', '08-07', '12-08'];
                              const esFestivo = festivos.includes(`${String(calMes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
                              
                              // Determinar estado del día
                              let estadoClase = '';
                              if (!pasado && !bloqueado && !esDomingo) {
                                if (esFestivo) {
                                  estadoClase = 'festivo';
                                } else if (horariosOcupados === 0) {
                                  estadoClase = 'disponible'; // Verde - totalmente disponible
                                } else if (horariosOcupados >= totalHorarios) {
                                  estadoClase = 'ocupado'; // Rojo - sin disponibilidad
                                } else {
                                  estadoClase = 'con-reservas'; // Amarillo - con algunas reservas
                                }
                              }
                              
                              return (
                                <div
                                  key={d}
                                  className={`cal-day ${pasado ? 'pasado' : ''} ${bloqueado ? 'bloqueado' : ''} ${esDomingo && !pasado ? 'festivo' : ''} ${estadoClase} ${selFecha === fecha ? 'selected' : ''} ${fechaD.toDateString() === hoy.toDateString() ? 'hoy' : ''}`}
                                  onClick={() => !pasado && !bloqueado && !esDomingo && setSelFecha(fecha)}
                                >
                                  {d}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Leyenda de colores del calendario */}
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 12, 
                            justifyContent: 'center', 
                            marginTop: 12,
                            fontSize: '.7rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(0,255,136,.15)', border: '2px solid rgba(0,255,136,.4)' }}></div>
                              <span style={{ color: 'rgba(255,255,255,.6)' }}>Disponible</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(255,215,0,.15)', border: '2px solid rgba(255,215,0,.4)' }}></div>
                              <span style={{ color: 'rgba(255,255,255,.6)' }}>Con Reservas</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(255,68,68,.15)', border: '2px solid rgba(255,68,68,.4)' }}></div>
                              <span style={{ color: 'rgba(255,255,255,.6)' }}>Sin Disponibilidad</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(155,93,229,.2)', border: '2px solid rgba(155,93,229,.5)' }}></div>
                              <span style={{ color: 'rgba(255,255,255,.6)' }}>Festivos</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(255,140,0,.2)', border: '2px solid rgba(255,140,0,.5)' }}></div>
                              <span style={{ color: 'rgba(255,255,255,.6)' }}>Bloqueados</span>
                            </div>
                          </div>
                          
                          <div className="divider" />
                          
                          <div className="section-title">⏰ ELEGÍ EL HORARIO</div>
                          <div className="horarios-grid">
                            {HORARIOS.map(h => {
                              const ocupado = selProf && reservas.some(r => r.fecha === selFecha && r.hora === h && r.profesional === selProf);
                              return (
                                <div
                                  key={h}
                                  className={`hora-btn ${ocupado ? 'ocupado' : ''} ${selHora === h ? 'selected' : ''}`}
                                  onClick={() => !ocupado && setSelHora(h)}
                                >
                                  {h}
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="divider" />
                          
                          <div className="form-field" style={{ marginBottom: 12 }}>
                            <label>SERVICIO DESEADO</label>
                            <input className="form-input" value={servicioInput} onChange={e => setServicioInput(e.target.value)} placeholder="Ej: Manicura, Podología..." />
                          </div>
                          
                          <button className="btn-primary" onClick={confirmarReserva}>✅ CONFIRMAR RESERVA</button>
                        </>
                      ) : (
                        <>
                          <div className="section-title">📋 MIS RESERVAS</div>
                          {reservas.filter(r => r.cedula === clienteActual.cedula).length === 0 ? (
                            <div className="empty-state"><div className="big">📅</div><div>No tenés reservas aún</div></div>
                          ) : (
                            reservas.filter(r => r.cedula === clienteActual.cedula).sort((a, b) => b.fecha.localeCompare(a.fecha)).map(r => (
                              <div key={r.id} className="reserva-item">
                                <div>
                                  <div className="fecha">{r.fecha} {r.hora}</div>
                                  <div className="prof">{r.profesionalNombre} · {r.servicio || 'Servicio'}</div>
                                </div>
                                <button className="btn-cancelar" onClick={() => cancelarReservaCliente(r.id)}>✕</button>
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* SECCIÓN IA */}
            {currentSec === 'ia' && (
              <div className="section active">
                <div className="section-inner">
                  <div className="ia-container">
                    {/* SUBIR FOTO */}
                    <div className="ia-card">
                      <div className="ia-card-title">📷 SUBÍ UNA FOTO</div>
                      <div 
                        className="upload-zone"
                        onClick={() => document.getElementById('iaFileInput')?.click()}
                        style={{ cursor: 'pointer' }}
                      >
                        {iaImagen ? (
                          <div style={{ position: 'relative' }}>
                            <img 
                              src={iaImagen} 
                              alt="Vista previa" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: 200, 
                                borderRadius: 12,
                                border: '2px solid var(--c-turquesa)'
                              }} 
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); setIaImagen(null); }}
                              style={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                background: 'rgba(255,0,110,.8)', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: 28, 
                                height: 28, 
                                cursor: 'pointer',
                                color: 'white',
                                fontSize: '1rem'
                              }}
                            >✕</button>
                          </div>
                        ) : (
                          <>
                            <div className="upload-icon">📸</div>
                            <p>Tocá para tomar una foto o subir imagen</p>
                            <small>Formatos: JPG, PNG, WEBP</small>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        id="iaFileInput" 
                        accept="image/*" 
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setIaImagen(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    
                    {/* DESCRIPCIÓN */}
                    <div className="ia-card">
                      <div className="ia-card-title">📝 DESCRIBÍ TUS SÍNTOMAS</div>
                      <textarea
                        className="ia-textarea"
                        value={iaSintomas}
                        onChange={e => setIaSintomas(e.target.value)}
                        placeholder="Ej: dolor en el talón, piel seca, callosidades, hongos, uñas amarillas, comezón entre los dedos..."
                      />
                    </div>
                    <button className="btn-primary" onClick={iaAnalizar} disabled={iaLoading}>
                      {iaLoading ? 'ANALIZANDO...' : '🔍 ANALIZAR CON IA'}
                    </button>
                    {iaResultado && (
                      <div className="ia-resultado" style={{ display: 'block' }}>
                        <div className="ia-diag-nombre">{iaResultado.nombre}</div>
                        <div className="ia-confianza-label">NIVEL DE CONFIANZA</div>
                        <div className="ia-progress">
                          <div className="ia-progress-fill" style={{ width: `${iaResultado.confianza}%` }} />
                        </div>
                        <ul className="ia-recs">
                          {iaResultado.recs.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                        <div className="ia-especialista-box">
                          🤖 Recomendamos reservar con: <strong>{iaResultado.especialista}</strong>
                        </div>
                        <div style={{ marginTop: 14 }}>
                          <button className="btn-fucsia btn-primary" onClick={() => { setServicioInput(iaResultado.nombre); goTo('reservas'); }}>📅 RESERVAR CITA</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* SECCIÓN TIENDA */}
            {currentSec === 'tienda' && (
              <div className="section active">
                <div className="section-inner">
                  {!clienteActual && (
                    <div style={{ background: 'rgba(255,20,147,.1)', border: '1px solid rgba(255,20,147,.3)', borderRadius: 16, padding: '12px 18px', fontSize: '.8rem', textAlign: 'center', marginBottom: 16 }}>
                      ⚠️ Iniciá sesión en <strong style={{ color: 'var(--c-turquesa)', cursor: 'pointer' }} onClick={() => goTo('reservas')}>Reservas</strong> para que tus compras sumen puntos.
                    </div>
                  )}
                  
                  <div className="tienda-section-title turquesa">🌊 COLONIAS · FRESCAS</div>
                  <div className="productos-grid">
                    {inventario.filter(p => p.tipo === 'colonia').map(p => (
                      <div key={p.id} className="prod-card" style={{ '--prod-color': 'var(--c-turquesa)' } as React.CSSProperties}>
                        {/* Frasco SVG original */}
                        <div className="prod-bottle" style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: BOTTLE_SVGS[p.svg || ''] || '<span style="font-size:3rem">🧴</span>' }} />
                        <div className="prod-nombre">{p.nombre}</div>
                        <div className="prod-desc">{p.desc}</div>
                        <div className="prod-notas">{p.notas?.map(n => <span key={n} className="prod-nota">{n}</span>)}</div>
                        <div style={{ fontSize: '.65rem', color: p.stock <= 0 ? '#ff4466' : 'rgba(0,245,212,.7)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                          {p.stock <= 0 ? 'Sin stock' : `📦 Stock: ${p.stock}`}
                        </div>
                        <div className="prod-footer">
                          <span className="prod-precio">${p.precio.toLocaleString()}</span>
                          <button className="btn-comprar" disabled={p.stock <= 0} onClick={() => comprar(p.nombre, p.precio, p.tipo)}>
                            {p.stock <= 0 ? 'AGOTADO' : 'COMPRAR'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="tienda-section-title fucsia" style={{ marginTop: 28 }}>🌙 PERFUMES · INTENSOS</div>
                  <div className="productos-grid">
                    {inventario.filter(p => p.tipo === 'perfume').map(p => (
                      <div key={p.id} className="prod-card" style={{ '--prod-color': 'var(--c-fucsia)' } as React.CSSProperties}>
                        {/* Frasco SVG original */}
                        <div className="prod-bottle" style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: BOTTLE_SVGS[p.svg || ''] || '<span style="font-size:3rem">🧴</span>' }} />
                        <div className="prod-nombre">{p.nombre}</div>
                        <div className="prod-desc">{p.desc}</div>
                        <div className="prod-notas">{p.notas?.map(n => <span key={n} className="prod-nota">{n}</span>)}</div>
                        <div style={{ fontSize: '.65rem', color: p.stock <= 0 ? '#ff4466' : 'rgba(0,245,212,.7)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                          {p.stock <= 0 ? 'Sin stock' : `📦 Stock: ${p.stock}`}
                        </div>
                        <div className="prod-footer">
                          <span className="prod-precio">${p.precio.toLocaleString()}</span>
                          <button className="btn-comprar" disabled={p.stock <= 0} onClick={() => comprar(p.nombre, p.precio, p.tipo)}>
                            {p.stock <= 0 ? 'AGOTADO' : 'COMPRAR'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* SECCIÓN DASHBOARD */}
            {currentSec === 'dashboard' && (
              <div className="section active">
                <div className="section-inner">
                  {!clienteActual ? (
                    <div className="empty-state">
                      <div className="big">📊</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '.75rem', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>INICIÁ SESIÓN PARA VER TU PERFIL</div>
                      <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => goTo('reservas')}>IR A RESERVAS →</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div className="cliente-badge">
                          <span>👤</span>
                          <span className="nombre">{clienteActual.nombre}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', padding: '6px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid', color: nivel.color, borderColor: nivel.color, background: `${nivel.color}18` }}>
                          {nivel.icon} {nivel.nombre} · {nivel.descuento}% dto
                        </span>
                      </div>
                      <div className="dash-grid">
                        <div className="dash-card">
                          <div className="dash-card-title">⭐ MIS PUNTOS</div>
                          <div className="dash-big-num">{pts}</div>
                          <div className="dash-big-label">puntos acumulados</div>
                        </div>
                        <div className="dash-card">
                          <div className="dash-card-title">📅 MIS RESERVAS</div>
                          <div className="dash-big-num">{reservas.filter(r => r.cedula === clienteActual.cedula).length}</div>
                          <div className="dash-big-label">total de visitas</div>
                        </div>
                        <div className="dash-card">
                          <div className="dash-card-title">🛍️ MIS COMPRAS</div>
                          <div className="dash-big-num">{compras.filter(c => c.cedula === clienteActual.cedula).length}</div>
                          <div className="dash-big-label">productos comprados</div>
                        </div>
                        <div className="dash-card">
                          <div className="dash-card-title">🎁 TU DESCUENTO</div>
                          <div className="dash-big-num" style={{ color: nivel.color }}>{nivel.descuento}%</div>
                          <div className="dash-big-label">en todos los servicios</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* SECCIÓN JUEGO */}
            {currentSec === 'juego' && (
              <div 
                ref={gameContainerRef}
                className="section active" 
                id="secJuego" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative', 
                  overflow: 'hidden',
                  width: '100%',
                  height: 'calc(100vh - 120px)',
                  minHeight: '400px',
                  cursor: 'none',
                  background: 'transparent'
                }}
              >
                {/* HUD del juego - Score */}
                <div id="gHudScore" style={{ position: 'absolute', top: 10, left: 14, fontFamily: 'Orbitron, sans-serif', fontSize: '0.78rem', color: GCOL.dorado, textShadow: `0 0 12px ${GCOL.dorado}`, letterSpacing: '2px', zIndex: 10, pointerEvents: 'none' }}>⭐ 0</div>
                {/* Wave */}
                <div id="gHudWave" style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: GCOL.turquesa, letterSpacing: '3px', whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none' }}>OLEADA 1</div>
                {/* Lives */}
                <div id="gHudLives" style={{ position: 'absolute', top: 10, right: 14, fontSize: '0.95rem', zIndex: 10, pointerEvents: 'none' }}>❤️❤️❤️</div>
                {/* Salir button */}
                <button 
                  id="gBtnSalir" 
                  style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%) translateY(26px)', background: 'rgba(0,0,0,.6)', border: '1px solid rgba(0,245,212,.5)', color: GCOL.turquesa, padding: '3px 12px', borderRadius: 20, fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem', letterSpacing: 1, cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 20, whiteSpace: 'nowrap' }} 
                  onClick={() => goTo('inicio')}
                >✕ SALIR</button>
                {/* Power icons container */}
                <div id="gPowerIcons" style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10, pointerEvents: 'none' }}></div>
                {/* Cooldown bar */}
                <div id="gCoolWrap" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,.06)', zIndex: 10 }}>
                  <div id="gCoolFill" style={{ height: '100%', width: '0%', background: `linear-gradient(90deg, ${GCOL.fucsia}, ${GCOL.turquesa})` }}></div>
                </div>
                {/* Teleport button */}
                <button 
                  id="gBtnTele" 
                  title="Teletransportación [T]" 
                  style={{ position: 'absolute', bottom: 12, right: 14, width: 40, height: 40, borderRadius: '50%', background: 'rgba(155,93,229,.25)', border: `2px solid ${GCOL.morado}`, color: GCOL.morado, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', zIndex: 20 }}
                >🌀</button>
                {/* Wave announcement */}
                <div id="gWaveAnn" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 900, color: GCOL.dorado, textShadow: `0 0 60px ${GCOL.dorado}`, pointerEvents: 'none', opacity: 0, letterSpacing: 6, transition: 'opacity .4s', whiteSpace: 'nowrap', zIndex: 20 }}>¡COMIENZA!</div>
                {/* Game Over overlay */}
                <div 
                  id="gOver" 
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(14px)', zIndex: 500, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, boxSizing: 'border-box', overflowY: 'auto', pointerEvents: 'all' }}
                >
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(1.2rem, 6vw, 2.5rem)', color: GCOL.fucsia, textShadow: `0 0 40px ${GCOL.fucsia}`, letterSpacing: 4, textAlign: 'center' }}>💀 GAME OVER</div>
                  <div id="gOverScore" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(.85rem, 4vw, 1.3rem)', color: GCOL.dorado, textAlign: 'center' }}>Puntuación: 0</div>
                  <div id="gOverWave" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(.55rem, 2.5vw, .7rem)', color: 'rgba(255,215,0,.6)', textAlign: 'center' }}></div>
                  <div id="gLeaderboard" style={{ marginTop: 8, width: 'min(280px, 90%)' }}></div>
                  <button 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '12px 32px', marginTop: 16 }} 
                    onClick={() => { if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).gameRestart) ((window as unknown as Record<string, unknown>).gameRestart as () => void)(); }}
                  >🔄 REINICIAR</button>
                </div>
              </div>
            )}
            
            {/* SECCIÓN ADMIN */}
            {currentSec === 'admin' && adminActual && (
              <div className="section active">
                <div className="section-inner">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '.7rem', color: 'var(--c-naranja)' }}>👑 {adminActual.usuario}</span>
                    <button className="btn-logout" onClick={() => { setAdminActual(null); sessionStorage.removeItem('dexysAdmin'); goTo('inicio'); }}>CERRAR SESIÓN</button>
                  </div>
                  
                  <div className="admin-tabs">
                    {[
                      { id: 'stats', label: '📊 Dashboard' },
                      { id: 'reservas', label: '📅 Reservas' },
                      { id: 'clientes', label: '👥 Clientes' },
                      { id: 'empleados', label: '👩 Empleados' },
                      { id: 'inventario', label: '📦 Inventario' },
                      { id: 'ventas', label: '💰 Ventas' },
                      { id: 'caja', label: '💵 Caja' },
                      { id: 'servicios', label: '💅 Servicios' },
                      { id: 'proveedores', label: '🚚 Proveedores' },
                      { id: 'cupones', label: '🎟️ Cupones' },
                      { id: 'giftcards', label: '🎁 Gift Cards' },
                      { id: 'fidelidad', label: '⭐ Fidelidad' },
                      { id: 'comisiones', label: '💼 Comisiones' },
                      { id: 'reportes', label: '📄 Reportes' },
                      { id: 'configuracion', label: '⚙️ Config' },
                      { id: 'auditoria', label: '📋 Auditoría' },
                      { id: 'usuarios', label: '🔐 Usuarios' },
                      { id: 'backup', label: '💾 Backup' },
                    ].map(t => (
                      <div key={t.id} className={`admin-tab ${adminTab === t.id ? 'active' : ''}`} onClick={() => setAdminTab(t.id)}>{t.label}</div>
                    ))}
                  </div>
                  
                  {adminTab === 'stats' && (
                    <>
                      <div className="stat-grid">
                        <div className="stat-card"><h4>RESERVAS TOTALES</h4><div className="stat-num">{reservas.length}</div><div className="stat-sub">📅 {reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length} hoy</div></div>
                        <div className="stat-card"><h4>CLIENTES REGISTRADOS</h4><div className="stat-num">{clientes.length}</div><div className="stat-sub">👤 activos</div></div>
                        <div className="stat-card"><h4>VENTAS TIENDA</h4><div className="stat-num">${compras.reduce((s, c) => s + c.precio, 0).toLocaleString()}</div><div className="stat-sub">🛍️ {compras.length} compras</div></div>
                        <div className="stat-card"><h4>STOCK TOTAL</h4><div className="stat-num">{inventario.reduce((s, p) => s + p.stock, 0)}</div><div className="stat-sub">📦 {inventario.filter(p => p.stock <= 3).length} bajo stock</div></div>
                        <div className="stat-card"><h4>PROFESIONALES ACTIVAS</h4><div className="stat-num">{profesionales.filter(p => p.activa).length}/{profesionales.length}</div><div className="stat-sub">👩 disponibles</div></div>
                        <div className="stat-card"><h4>PUNTOS EN CIRCULACIÓN</h4><div className="stat-num">{clientes.reduce((s, c) => s + getPuntos(c.cedula, reservas, compras), 0)}</div><div className="stat-sub">⭐ total sistema</div></div>
                      </div>
                      
                      {/* GRÁFICOS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 20 }}>
                        
                        {/* Gráfico de barras - Reservas por profesional */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>📊 RESERVAS POR PROFESIONAL</h4>
                          <div className="bar-chart">
                            {profesionales.map(p => {
                              const cant = reservas.filter(r => r.profesional === p.id).length;
                              const max = Math.max(...profesionales.map(pro => reservas.filter(r => r.profesional === pro.id).length), 1);
                              const pct = (cant / max) * 100;
                              return (
                                <div key={p.id} className="bar-row">
                                  <span className="bar-label">{p.emoji} {p.nombre}</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                                  </div>
                                  <span className="bar-val">{cant}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Gráfico circular - Niveles de clientes */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>🎯 DISTRIBUCIÓN POR NIVEL</h4>
                          <div className="donut-container">
                            <div className="donut-chart">
                              <svg viewBox="0 0 36 36">
                                {(() => {
                                  const total = clientes.length || 1;
                                  const bronce = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'BRONCE').length;
                                  const plata = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'PLATA').length;
                                  const oro = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'ORO').length;
                                  const diamante = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'DIAMANTE').length;
                                  const p1 = (bronce / total) * 100;
                                  const p2 = (plata / total) * 100;
                                  const p3 = (oro / total) * 100;
                                  const p4 = (diamante / total) * 100;
                                  return (
                                    <>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#cd7f32" strokeWidth="3.8" strokeDasharray={`${p1} ${100-p1}`} strokeDashoffset="25"></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#c0c0c0" strokeWidth="3.8" strokeDasharray={`${p2} ${100-p2}`} strokeDashoffset={25 - p1}></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#ffd700" strokeWidth="3.8" strokeDasharray={`${p3} ${100-p3}`} strokeDashoffset={25 - p1 - p2}></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#b9f2ff" strokeWidth="3.8" strokeDasharray={`${p4} ${100-p4}`} strokeDashoffset={25 - p1 - p2 - p3}></circle>
                                    </>
                                  );
                                })()}
                              </svg>
                              <div className="donut-center">{clientes.length}</div>
                            </div>
                            <div className="donut-legend">
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#cd7f32' }}></span>🥉 Bronce: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'BRONCE').length}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#c0c0c0' }}></span>🥈 Plata: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'PLATA').length}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#ffd700' }}></span>🥇 Oro: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'ORO').length}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#b9f2ff' }}></span>💎 Diamante: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'DIAMANTE').length}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Gráfico de líneas - Últimos 7 días */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>📈 RESERVAS ÚLTIMOS 7 DÍAS</h4>
                          <div className="line-chart">
                            {(() => {
                              const dias = [];
                              for (let i = 6; i >= 0; i--) {
                                const fecha = new Date();
                                fecha.setDate(fecha.getDate() - i);
                                const fechaStr = fecha.toISOString().split('T')[0];
                                const cant = reservas.filter(r => r.fecha === fechaStr).length;
                                dias.push({ fecha: fecha, cant, dia: fecha.toLocaleDateString('es-CO', { weekday: 'short' }) });
                              }
                              const max = Math.max(...dias.map(d => d.cant), 1);
                              return dias.map((d, idx) => (
                                <div key={idx} className="line-col">
                                  <div className="line-bar" style={{ height: `${(d.cant / max) * 100}%` }}>
                                    <span className="line-val">{d.cant}</span>
                                  </div>
                                  <span className="line-label">{d.dia}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                        
                        {/* Gráfico de productos vendidos */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-morado)', marginBottom: 16 }}>🏆 TOP PRODUCTOS VENDIDOS</h4>
                          <div className="top-products">
                            {(() => {
                              const ventasPorProd: Record<string, number> = {};
                              compras.forEach(c => {
                                ventasPorProd[c.producto] = (ventasPorProd[c.producto] || 0) + 1;
                              });
                              const sorted = Object.entries(ventasPorProd).sort((a, b) => b[1] - a[1]).slice(0, 5);
                              const max = sorted[0]?.[1] || 1;
                              return sorted.map(([prod, cant], idx) => (
                                <div key={prod} className="top-row">
                                  <span className="top-rank">#{idx + 1}</span>
                                  <span className="top-name">{prod}</span>
                                  <div className="top-bar-track">
                                    <div className="top-bar-fill" style={{ width: `${(cant / max) * 100}%` }}></div>
                                  </div>
                                  <span className="top-val">{cant}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'reservas' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>RESERVAS TOTALES</h4><div className="stat-num">{reservas.length}</div><div className="stat-sub">📅 todas</div></div>
                        <div className="stat-card"><h4>PARA HOY</h4><div className="stat-num">{reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length}</div><div className="stat-sub">📆 hoy</div></div>
                        <div className="stat-card"><h4>ESTE MES</h4><div className="stat-num">{reservas.filter(r => r.fecha.startsWith(new Date().toISOString().slice(0, 7))).length}</div><div className="stat-sub">🗓️ {new Date().toLocaleDateString('es-CO', { month: 'long' })}</div></div>
                        <div className="stat-card"><h4>CONFIRMADAS</h4><div className="stat-num">{reservas.filter(r => r.estado === 'confirmada' || r.estado === 'Confirmada').length}</div><div className="stat-sub">✅ aprobadas</div></div>
                      </div>

                      {/* GRÁFICOS DE RESERVAS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Reservas por hora */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>⏰ RESERVAS POR HORA</h4>
                          <div className="line-chart">
                            {(() => {
                              const horas = HORARIOS.map(h => ({ hora: h, cant: reservas.filter(r => r.hora === h).length }));
                              const max = Math.max(...horas.map(h => h.cant), 1);
                              return horas.map((h, idx) => (
                                <div key={idx} className="line-col">
                                  <div className="line-bar" style={{ height: `${(h.cant / max) * 100}%`, background: 'linear-gradient(180deg, var(--c-fucsia), var(--c-morado))' }}>
                                    <span className="line-val">{h.cant}</span>
                                  </div>
                                  <span className="line-label">{h.hora}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Reservas por día de la semana */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>📅 RESERVAS POR DÍA</h4>
                          <div className="bar-chart">
                            {(() => {
                              const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                              const porDia = dias.map((d, i) => ({ dia: d, cant: reservas.filter(r => new Date(r.fecha).getDay() === i).length }));
                              const max = Math.max(...porDia.map(d => d.cant), 1);
                              return porDia.map((d) => (
                                <div key={d.dia} className="bar-row">
                                  <span className="bar-label">{d.dia}</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(d.cant / max) * 100}%` }}></div>
                                  </div>
                                  <span className="bar-val">{d.cant}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="admin-section-title">PRÓXIMAS RESERVAS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>FECHA</th><th>CLIENTE</th><th>PROFESIONAL</th><th>SERVICIO</th><th>ESTADO</th></tr></thead>
                          <tbody>
                            {reservas.filter(r => r.fecha >= new Date().toISOString().split('T')[0]).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 20).map(r => (
                              <tr key={r.id}>
                                <td>{r.fecha} {r.hora}</td>
                                <td>{r.cliente}</td>
                                <td>{r.profesionalNombre}</td>
                                <td>{r.servicio || '—'}</td>
                                <td><span className="badge-ok">{r.estado}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'clientes' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>TOTAL CLIENTES</h4><div className="stat-num">{clientes.length}</div><div className="stat-sub">👥 registrados</div></div>
                        <div className="stat-card"><h4>CLIENTES ACTIVOS</h4><div className="stat-num">{clientes.filter(c => reservas.some(r => r.cedula === c.cedula)).length}</div><div className="stat-sub">✨ con reservas</div></div>
                        <div className="stat-card"><h4>NUEVOS ESTE MES</h4><div className="stat-num">{clientes.filter(c => c.fechaReg?.startsWith(new Date().toISOString().slice(0, 7))).length}</div><div className="stat-sub">📅 {new Date().toLocaleDateString('es-CO', { month: 'long' })}</div></div>
                        <div className="stat-card"><h4>PROMEDIO PUNTOS</h4><div className="stat-num">{clientes.length > 0 ? Math.round(clientes.reduce((s, c) => s + getPuntos(c.cedula, reservas, compras), 0) / clientes.length) : 0}</div><div className="stat-sub">⭐ por cliente</div></div>
                      </div>

                      {/* GRÁFICOS DE CLIENTES */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Crecimiento de clientes */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>📈 CRECIMIENTO DE CLIENTES</h4>
                          <div className="line-chart">
                            {(() => {
                              const meses = [];
                              for (let i = 5; i >= 0; i--) {
                                const fecha = new Date();
                                fecha.setMonth(fecha.getMonth() - i);
                                const mesStr = fecha.toISOString().slice(0, 7);
                                const nuevos = clientes.filter(c => c.fechaReg?.startsWith(mesStr)).length;
                                meses.push({ mes: fecha.toLocaleDateString('es-CO', { month: 'short' }), nuevos });
                              }
                              const max = Math.max(...meses.map(m => m.nuevos), 1);
                              return meses.map((m, idx) => (
                                <div key={idx} className="line-col">
                                  <div className="line-bar" style={{ height: `${(m.nuevos / max) * 100}%`, background: 'linear-gradient(180deg, var(--c-turquesa), var(--c-morado))' }}>
                                    <span className="line-val">{m.nuevos}</span>
                                  </div>
                                  <span className="line-label">{m.mes}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Top clientes por puntos */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>🏆 TOP 5 CLIENTES</h4>
                          <div className="top-products">
                            {(() => {
                              const clientesPuntos = clientes.map(c => ({ nombre: c.nombre, puntos: getPuntos(c.cedula, reservas, compras), nivel: getNivel(getPuntos(c.cedula, reservas, compras)) }));
                              const sorted = clientesPuntos.sort((a, b) => b.puntos - a.puntos).slice(0, 5);
                              const max = sorted[0]?.puntos || 1;
                              return sorted.map((c, idx) => (
                                <div key={idx} className="top-row">
                                  <span className="top-rank">#{idx + 1}</span>
                                  <span className="top-name">{c.nombre}</span>
                                  <div className="top-bar-track">
                                    <div className="top-bar-fill" style={{ width: `${(c.puntos / max) * 100}%`, background: c.nivel.color }}></div>
                                  </div>
                                  <span className="top-val">{c.puntos}pts</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="admin-section-title">CLIENTES REGISTRADOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>CÉDULA</th><th>NOMBRE</th><th>TELÉFONO</th><th>EMAIL</th><th>RESERVAS</th><th>PUNTOS</th><th>NIVEL</th></tr></thead>
                          <tbody>
                            {clientes.map(c => {
                              const p = getPuntos(c.cedula, reservas, compras);
                              const n = getNivel(p);
                              return (
                                <tr key={c.cedula}>
                                  <td>{c.cedula}</td>
                                  <td>{c.nombre}</td>
                                  <td>{c.telefono || '—'}</td>
                                  <td>{c.email || '—'}</td>
                                  <td>{reservas.filter(r => r.cedula === c.cedula).length}</td>
                                  <td>{p}</td>
                                  <td><span style={{ color: n.color, fontFamily: 'var(--font-display)', fontSize: '.6rem' }}>{n.icon} {n.nombre}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'profesionales' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>TOTAL PROFESIONALES</h4><div className="stat-num">{profesionales.length}</div><div className="stat-sub">👩 en equipo</div></div>
                        <div className="stat-card"><h4>ACTIVAS</h4><div className="stat-num" style={{ color: 'var(--c-turquesa)' }}>{profesionales.filter(p => p.activa).length}</div><div className="stat-sub">✅ disponibles</div></div>
                        <div className="stat-card"><h4>INACTIVAS</h4><div className="stat-num" style={{ color: 'var(--c-fucsia)' }}>{profesionales.filter(p => !p.activa).length}</div><div className="stat-sub">⏸️ pausa</div></div>
                        <div className="stat-card"><h4>TOTAL RESERVAS</h4><div className="stat-num">{reservas.length}</div><div className="stat-sub">📅 asignadas</div></div>
                      </div>

                      {/* GRÁFICOS DE PROFESIONALES */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Reservas por profesional */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>📊 RENDIMIENTO POR PROFESIONAL</h4>
                          <div className="bar-chart">
                            {profesionales.map(p => {
                              const cant = reservas.filter(r => r.profesional === p.id).length;
                              const max = Math.max(...profesionales.map(pro => reservas.filter(r => r.profesional === pro.id).length), 1);
                              return (
                                <div key={p.id} className="bar-row">
                                  <span className="bar-label">{p.emoji} {p.nombre}</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(cant / max) * 100}%` }}></div>
                                  </div>
                                  <span className="bar-val">{cant}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Distribución de carga */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-morado)', marginBottom: 16 }}>🎯 DISTRIBUCIÓN DE CARGA</h4>
                          <div className="donut-container">
                            <div className="donut-chart">
                              <svg viewBox="0 0 36 36">
                                {(() => {
                                  const datos = profesionales.map(p => ({ nombre: p.nombre, cant: reservas.filter(r => r.profesional === p.id).length }));
                                  const total = Math.max(datos.reduce((s, d) => s + d.cant, 0), 1);
                                  const colors = ['#ff1493', '#00f5d4', '#9b5de5', '#ffd700', '#00b4d8'];
                                  let offset = 25;
                                  return datos.map((d, i) => {
                                    const pct = (d.cant / total) * 100;
                                    return <circle key={i} className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="3.8" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={offset}></circle>;
                                    offset -= pct;
                                  });
                                })()}
                              </svg>
                              <div className="donut-center">{reservas.length}</div>
                            </div>
                            <div className="donut-legend">
                              {profesionales.map((p, i) => {
                                const cant = reservas.filter(r => r.profesional === p.id).length;
                                const colors = ['#ff1493', '#00f5d4', '#9b5de5', '#ffd700', '#00b4d8'];
                                return (
                                  <div key={p.id} className="legend-item"><span className="legend-dot" style={{ background: colors[i % colors.length] }}></span>{p.nombre}: {cant}</div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-section-title">GESTIÓN DE PROFESIONALES</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>ESPECIALIDAD</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {profesionales.map(p => (
                              <tr key={p.id}>
                                <td>{p.emoji} {p.nombre}</td>
                                <td>{p.especialidad}</td>
                                <td><span className={p.activa ? 'badge-ok' : 'badge-err'}>{p.activa ? '✓ ACTIVA' : '✕ INACTIVA'}</span></td>
                                <td>
                                  <button className={`admin-btn ${p.activa ? 'admin-btn-red' : 'admin-btn-green'}`} onClick={() => toggleProfActiva(p.id)}>
                                    {p.activa ? 'Desactivar' : 'Activar'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'inventario' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>TOTAL PRODUCTOS</h4><div className="stat-num">{inventario.length}</div><div className="stat-sub">📦 en catálogo</div></div>
                        <div className="stat-card"><h4>STOCK TOTAL</h4><div className="stat-num">{inventario.reduce((s, p) => s + p.stock, 0)}</div><div className="stat-sub">📋 unidades</div></div>
                        <div className="stat-card"><h4>STOCK BAJO</h4><div className="stat-num" style={{ color: 'var(--c-fucsia)' }}>{inventario.filter(p => p.stock <= 3).length}</div><div className="stat-sub">⚠️ reposición</div></div>
                        <div className="stat-card"><h4>VALOR INVENTARIO</h4><div className="stat-num">${inventario.reduce((s, p) => s + (p.precio * p.stock), 0).toLocaleString()}</div><div className="stat-sub">💰 estimado</div></div>
                      </div>

                      {/* GRÁFICOS DE INVENTARIO */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Stock por producto */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>📦 STOCK POR PRODUCTO</h4>
                          <div className="bar-chart">
                            {(() => {
                              const max = Math.max(...inventario.map(p => p.stock), 1);
                              return inventario.slice(0, 7).map(p => (
                                <div key={p.id} className="bar-row">
                                  <span className="bar-label" style={{ fontSize: '.7rem' }}>{p.nombre.slice(0, 12)}</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(p.stock / max) * 100}%`, background: p.stock <= 3 ? 'var(--c-fucsia)' : 'var(--c-turquesa)' }}></div>
                                  </div>
                                  <span className="bar-val">{p.stock}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Productos por tipo */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-morado)', marginBottom: 16 }}>🏷️ PRODUCTOS POR TIPO</h4>
                          <div className="donut-container">
                            <div className="donut-chart">
                              <svg viewBox="0 0 36 36">
                                {(() => {
                                  const tipos: Record<string, number> = {};
                                  inventario.forEach(p => { tipos[p.tipo] = (tipos[p.tipo] || 0) + 1; });
                                  const entries = Object.entries(tipos);
                                  const total = entries.reduce((s, [, v]) => s + v, 1);
                                  const colors = ['#ff1493', '#00f5d4', '#9b5de5', '#ffd700'];
                                  let offset = 25;
                                  return entries.map(([tipo, val], i) => {
                                    const pct = (val / total) * 100;
                                    const circle = <circle key={tipo} className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="3.8" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={offset}></circle>;
                                    offset -= pct;
                                    return circle;
                                  });
                                })()}
                              </svg>
                              <div className="donut-center">{inventario.length}</div>
                            </div>
                            <div className="donut-legend">
                              {(() => {
                                const tipos: Record<string, number> = {};
                                inventario.forEach(p => { tipos[p.tipo] = (tipos[p.tipo] || 0) + 1; });
                                const colors = ['#ff1493', '#00f5d4', '#9b5de5', '#ffd700'];
                                return Object.entries(tipos).map(([tipo, cant], i) => (
                                  <div key={tipo} className="legend-item"><span className="legend-dot" style={{ background: colors[i % colors.length] }}></span>{tipo}: {cant}</div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-section-title">INVENTARIO DE PRODUCTOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>TIPO</th><th>PRECIO</th><th>STOCK</th></tr></thead>
                          <tbody>
                            {inventario.map(p => (
                              <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td><span className="badge-ok">{p.tipo}</span></td>
                                <td>${p.precio.toLocaleString()}</td>
                                <td style={{ color: p.stock <= 0 ? '#ff4466' : p.stock <= 3 ? '#ffd700' : '#00f5d4', fontFamily: 'var(--font-display)' }}>{p.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'ventas' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>TOTAL VENTAS</h4><div className="stat-num">${compras.reduce((s, c) => s + c.precio, 0).toLocaleString()}</div></div>
                        <div className="stat-card"><h4>COMPRAS TOTALES</h4><div className="stat-num">{compras.length}</div></div>
                        <div className="stat-card"><h4>PROMEDIO/COMPRA</h4><div className="stat-num">${compras.length > 0 ? Math.round(compras.reduce((s, c) => s + c.precio, 0) / compras.length).toLocaleString() : '0'}</div></div>
                        <div className="stat-card"><h4>MAYOR VENTA</h4><div className="stat-num">${compras.length > 0 ? Math.max(...compras.map(c => c.precio)).toLocaleString() : '0'}</div></div>
                      </div>

                      {/* GRÁFICOS DE VENTAS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Gráfico de ventas por mes */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>📊 VENTAS POR MES</h4>
                          <div className="line-chart">
                            {(() => {
                              const meses = [];
                              for (let i = 5; i >= 0; i--) {
                                const fecha = new Date();
                                fecha.setMonth(fecha.getMonth() - i);
                                const mesStr = fecha.toISOString().slice(0, 7);
                                const ventasMes = compras.filter(c => c.fecha?.startsWith(mesStr));
                                const total = ventasMes.reduce((s, c) => s + c.precio, 0);
                                meses.push({ mes: fecha.toLocaleDateString('es-CO', { month: 'short' }), total, cant: ventasMes.length });
                              }
                              const max = Math.max(...meses.map(m => m.total), 1);
                              return meses.map((m, idx) => (
                                <div key={idx} className="line-col">
                                  <div className="line-bar" style={{ height: `${(m.total / max) * 100}%`, background: 'linear-gradient(180deg, var(--c-dorado), var(--c-fucsia))' }}>
                                    <span className="line-val">${m.total >= 1000 ? Math.round(m.total/1000) + 'k' : m.total}</span>
                                  </div>
                                  <span className="line-label">{m.mes}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Gráfico de ventas por tipo */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-morado)', marginBottom: 16 }}>🏷️ VENTAS POR CATEGORÍA</h4>
                          <div className="donut-container">
                            <div className="donut-chart">
                              <svg viewBox="0 0 36 36">
                                {(() => {
                                  const tipos: Record<string, number> = {};
                                  compras.forEach(c => { tipos[c.tipo] = (tipos[c.tipo] || 0) + c.precio; });
                                  const entries = Object.entries(tipos);
                                  const total = entries.reduce((s, [, v]) => s + v, 1);
                                  const colors = ['#ff1493', '#00f5d4', '#9b5de5', '#ffd700', '#00b4d8'];
                                  let offset = 25;
                                  return entries.map(([tipo, val], i) => {
                                    const pct = (val / total) * 100;
                                    const circle = <circle key={tipo} className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="3.8" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={offset}></circle>;
                                    offset -= pct;
                                    return circle;
                                  });
                                })()}
                              </svg>
                              <div className="donut-center">${compras.reduce((s, c) => s + c.precio, 0).toLocaleString()}</div>
                            </div>
                            <div className="donut-legend">
                              {(() => {
                                const tipos: Record<string, number> = {};
                                compras.forEach(c => { tipos[c.tipo] = (tipos[c.tipo] || 0) + 1; });
                                const colors = ['#ff1493', '#00f5d4', '#9b5de5', '#ffd700', '#00b4d8'];
                                return Object.entries(tipos).map(([tipo, cant], i) => (
                                  <div key={tipo} className="legend-item"><span className="legend-dot" style={{ background: colors[i % colors.length] }}></span>{tipo}: {cant}</div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-section-title">HISTORIAL DE VENTAS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>FECHA</th><th>CLIENTE</th><th>PRODUCTO</th><th>TIPO</th><th>PRECIO</th></tr></thead>
                          <tbody>
                            {compras.slice(0, 30).map(c => (
                              <tr key={c.id}>
                                <td>{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                                <td>{c.clienteNombre}</td>
                                <td>{c.producto}</td>
                                <td><span className="badge-ok">{c.tipo}</span></td>
                                <td style={{ color: 'var(--c-dorado)' }}>${c.precio.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {adminTab === 'caja' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card" style={{ background: cajaActual ? 'linear-gradient(135deg, rgba(0,245,212,.15), rgba(0,200,150,.1))' : 'linear-gradient(135deg, rgba(255,0,110,.15), rgba(200,0,80,.1))' }}>
                          <h4>ESTADO CAJA</h4>
                          <div className="stat-num" style={{ color: cajaActual ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>{cajaActual ? 'ABIERTA' : 'CERRADA'}</div>
                          <div className="stat-sub">{cajaActual ? `Desde ${new Date(cajaActual.horaApertura).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` : 'Sin abrir hoy'}</div>
                        </div>
                        <div className="stat-card">
                          <h4>MONTO INICIAL</h4>
                          <div className="stat-num">${(cajaActual?.montoInicial || 0).toLocaleString()}</div>
                          <div className="stat-sub">💵 Efectivo inicial</div>
                        </div>
                        <div className="stat-card">
                          <h4>INGRESOS HOY</h4>
                          <div className="stat-num" style={{ color: 'var(--c-turquesa)' }}>${transaccionesHoy.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').reduce((s, t) => s + t.monto, 0).toLocaleString()}</div>
                          <div className="stat-sub">📈 + {transaccionesHoy.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').length} movimientos</div>
                        </div>
                        <div className="stat-card">
                          <h4>EGRESOS HOY</h4>
                          <div className="stat-num" style={{ color: 'var(--c-fucsia)' }}>${transaccionesHoy.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0).toLocaleString()}</div>
                          <div className="stat-sub">📉 - {transaccionesHoy.filter(t => t.tipo === 'egreso').length} movimientos</div>
                        </div>
                      </div>

                      {/* GRÁFICOS DE CAJA */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Balance semanal */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>📊 BALANCE ÚLTIMOS 7 DÍAS</h4>
                          <div className="line-chart">
                            {(() => {
                              const dias = [];
                              for (let i = 6; i >= 0; i--) {
                                const fecha = new Date();
                                fecha.setDate(fecha.getDate() - i);
                                const fechaStr = fecha.toISOString().split('T')[0];
                                const transDia = transacciones.filter(t => t.fecha?.startsWith(fechaStr));
                                const ingresos = transDia.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').reduce((s, t) => s + t.monto, 0);
                                const egresos = transDia.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0);
                                dias.push({ dia: fecha.toLocaleDateString('es-CO', { weekday: 'short' }), balance: ingresos - egresos, ingresos, egresos });
                              }
                              const maxBal = Math.max(...dias.map(d => Math.abs(d.balance)), 1);
                              return dias.map((d, idx) => (
                                <div key={idx} className="line-col">
                                  <div className="line-bar" style={{ height: `${(Math.abs(d.balance) / maxBal) * 100}%`, background: d.balance >= 0 ? 'linear-gradient(180deg, var(--c-turquesa), var(--c-morado))' : 'linear-gradient(180deg, var(--c-fucsia), #ff6b6b)' }}>
                                    <span className="line-val">{d.balance >= 0 ? '+' : ''}{d.balance >= 1000 ? Math.round(d.balance/1000) + 'k' : d.balance}</span>
                                  </div>
                                  <span className="line-label">{d.dia}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Métodos de pago */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-morado)', marginBottom: 16 }}>💳 MÉTODOS DE PAGO</h4>
                          <div className="bar-chart">
                            {(() => {
                              const metodos: Record<string, number> = {};
                              transacciones.forEach(t => { metodos[t.metodo] = (metodos[t.metodo] || 0) + t.monto; });
                              const entries = Object.entries(metodos);
                              const max = Math.max(...entries.map(([, v]) => v), 1);
                              const colors: Record<string, string> = { efectivo: '#ffd700', tarjeta: '#00f5d4', transferencia: '#9b5de5', otro: '#ff1493' };
                              return entries.map(([metodo, monto]) => (
                                <div key={metodo} className="bar-row">
                                  <span className="bar-label">{metodo.charAt(0).toUpperCase() + metodo.slice(1)}</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(monto / max) * 100}%`, background: colors[metodo] || 'var(--c-turquesa)' }}></div>
                                  </div>
                                  <span className="bar-val">${monto.toLocaleString()}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      {!cajaActual ? (
                        <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 24, textAlign: 'center' }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.7rem', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>🔓 ABRIR CAJA DEL DÍA</h4>
                          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="form-field" style={{ marginBottom: 0 }}>
                              <label>MONTO INICIAL</label>
                              <input
                                className="form-input"
                                type="number"
                                value={montoApertura}
                                onChange={e => setMontoApertura(Number(e.target.value))}
                                placeholder="0"
                                style={{ width: 150, textAlign: 'center', fontSize: '1.2rem' }}
                              />
                            </div>
                            <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={abrirCaja}>🔓 ABRIR CAJA</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Panel de movimientos */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>
                            {/* Agregar movimiento */}
                            <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20 }}>
                              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>➕ NUEVO MOVIMIENTO</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    className={`btn-primary ${nuevaTransaccion.tipo === 'ingreso' ? '' : 'btn-outline'}`}
                                    style={{ flex: 1, padding: '8px 12px', fontSize: '.75rem', background: nuevaTransaccion.tipo === 'ingreso' ? 'var(--c-turquesa)' : 'transparent', borderColor: 'var(--c-turquesa)', color: nuevaTransaccion.tipo === 'ingreso' ? 'black' : 'var(--c-turquesa)' }}
                                    onClick={() => setNuevaTransaccion({ ...nuevaTransaccion, tipo: 'ingreso' })}
                                  >
                                    📈 INGRESO
                                  </button>
                                  <button
                                    className={`btn-primary ${nuevaTransaccion.tipo === 'egreso' ? '' : 'btn-outline'}`}
                                    style={{ flex: 1, padding: '8px 12px', fontSize: '.75rem', background: nuevaTransaccion.tipo === 'egreso' ? 'var(--c-fucsia)' : 'transparent', borderColor: 'var(--c-fucsia)', color: nuevaTransaccion.tipo === 'egreso' ? 'white' : 'var(--c-fucsia)' }}
                                    onClick={() => setNuevaTransaccion({ ...nuevaTransaccion, tipo: 'egreso' })}
                                  >
                                    📉 EGRESO
                                  </button>
                                </div>
                                <input
                                  className="form-input"
                                  type="number"
                                  placeholder="Monto"
                                  value={nuevaTransaccion.monto || ''}
                                  onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, monto: Number(e.target.value) })}
                                />
                                <input
                                  className="form-input"
                                  placeholder="Descripción"
                                  value={nuevaTransaccion.descripcion}
                                  onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, descripcion: e.target.value })}
                                />
                                <select
                                  className="form-input"
                                  value={nuevaTransaccion.metodo}
                                  onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, metodo: e.target.value as TransaccionCaja['metodo'] })}
                                  style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}
                                >
                                  <option value="efectivo">💵 Efectivo</option>
                                  <option value="tarjeta">💳 Tarjeta</option>
                                  <option value="transferencia">🏦 Transferencia</option>
                                  <option value="otro">📋 Otro</option>
                                </select>
                                <button className="btn-primary" onClick={agregarMovimiento}>
                                  {nuevaTransaccion.tipo === 'ingreso' ? '✅ REGISTRAR INGRESO' : '✅ REGISTRAR EGRESO'}
                                </button>
                              </div>
                            </div>

                            {/* Cerrar caja */}
                            <div style={{ background: 'linear-gradient(135deg, rgba(255,0,110,.1), rgba(138,43,226,.1))', border: '1px solid rgba(255,0,110,.2)', borderRadius: 'var(--r-card)', padding: 20 }}>
                              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>🔒 CERRAR CAJA</h4>
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: 8 }}>
                                  <span style={{ color: 'rgba(255,255,255,.6)' }}>Monto inicial:</span>
                                  <span>${cajaActual.montoInicial.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: 8 }}>
                                  <span style={{ color: 'rgba(255,255,255,.6)' }}>+ Ingresos:</span>
                                  <span style={{ color: 'var(--c-turquesa)' }}>${transaccionesHoy.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').reduce((s, t) => s + t.monto, 0).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: 8 }}>
                                  <span style={{ color: 'rgba(255,255,255,.6)' }}>- Egresos:</span>
                                  <span style={{ color: 'var(--c-fucsia)' }}>${transaccionesHoy.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0).toLocaleString()}</span>
                                </div>
                                <div style={{ height: 1, background: 'rgba(255,255,255,.1)', margin: '12px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', fontWeight: 'bold' }}>
                                  <span>Total esperado:</span>
                                  <span style={{ color: 'var(--c-dorado)' }}>${(cajaActual.montoInicial + transaccionesHoy.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').reduce((s, t) => s + t.monto, 0) - transaccionesHoy.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0)).toLocaleString()}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input
                                  className="form-input"
                                  type="number"
                                  placeholder="Monto real en caja"
                                  value={montoCierre || ''}
                                  onChange={e => setMontoCierre(Number(e.target.value))}
                                  style={{ flex: 1 }}
                                />
                                <button className="btn-primary" style={{ background: 'var(--c-fucsia)', whiteSpace: 'nowrap' }} onClick={cerrarCaja}>🔒 CERRAR</button>
                              </div>
                            </div>
                          </div>

                          {/* Historial de transacciones */}
                          <div className="admin-section-title">📋 MOVIMIENTOS DE HOY</div>
                          <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto' }}>
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>HORA</th>
                                  <th>TIPO</th>
                                  <th>DESCRIPCIÓN</th>
                                  <th>MÉTODO</th>
                                  <th>MONTO</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transaccionesHoy.length === 0 ? (
                                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin movimientos</td></tr>
                                ) : transaccionesHoy.map(t => (
                                  <tr key={t.id}>
                                    <td>{new Date(t.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                      <span className="badge-ok" style={{
                                        background: t.tipo === 'apertura' ? 'var(--c-morado)' :
                                          t.tipo === 'ingreso' || t.tipo === 'venta' ? 'var(--c-turquesa)' :
                                            t.tipo === 'egreso' ? 'var(--c-fucsia)' : 'var(--c-dorado)'
                                      }}>
                                        {t.tipo.toUpperCase()}
                                      </span>
                                    </td>
                                    <td>{t.descripcion}</td>
                                    <td>
                                      {t.metodo === 'efectivo' ? '💵' : t.metodo === 'tarjeta' ? '💳' : t.metodo === 'transferencia' ? '🏦' : '📋'}
                                    </td>
                                    <td style={{ color: t.tipo === 'egreso' ? 'var(--c-fucsia)' : 'var(--c-turquesa)', fontWeight: 'bold' }}>
                                      {t.tipo === 'egreso' ? '-' : '+'}${t.monto.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                      {/* Historial de cajas */}
                      {cajas.length > 0 && (
                        <>
                          <div className="admin-section-title" style={{ marginTop: 24 }}>📚 HISTORIAL DE CAJAS</div>
                          <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>FECHA</th>
                                  <th>ESTADO</th>
                                  <th>APERTURA</th>
                                  <th>CIERRE</th>
                                  <th>MONTO INICIAL</th>
                                  <th>MONTO FINAL</th>
                                  <th>DIFERENCIA</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cajas.slice(-10).reverse().map(c => {
                                  const transCaja = transacciones.filter(t => t.cajaId === c.id);
                                  const ingresos = transCaja.filter(t => t.tipo === 'ingreso' || t.tipo === 'venta').reduce((s, t) => s + t.monto, 0);
                                  const egresos = transCaja.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0);
                                  const esperado = c.montoInicial + ingresos - egresos;
                                  const diferencia = (c.montoFinal || 0) - esperado;
                                  return (
                                    <tr key={c.id}>
                                      <td>{c.fecha}</td>
                                      <td>
                                        <span className="badge-ok" style={{ background: c.estado === 'abierta' ? 'var(--c-turquesa)' : 'rgba(255,255,255,.2)' }}>
                                          {c.estado.toUpperCase()}
                                        </span>
                                      </td>
                                      <td>{new Date(c.horaApertura).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                                      <td>{c.horaCierre ? new Date(c.horaCierre).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                      <td>${c.montoInicial.toLocaleString()}</td>
                                      <td>{c.montoFinal ? `$${c.montoFinal.toLocaleString()}` : '-'}</td>
                                      <td style={{ color: diferencia >= 0 ? 'var(--c-turquesa)' : 'var(--c-fucsia)', fontWeight: 'bold' }}>
                                        {c.montoFinal ? `${diferencia >= 0 ? '+' : ''}$${diferencia.toLocaleString()}` : '-'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {adminTab === 'empleados' && (
                    <>
                      <div className="admin-section-title">👩 GESTIÓN DE EMPLEADOS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                        <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>➕ NUEVO EMPLEADO</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input className="form-input" placeholder="Nombre" value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input className="form-input" placeholder="Especialidad" value={nuevoEmpleado.especialidad} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, especialidad: e.target.value })} style={{ flex: 1 }} />
                              <select className="form-input" value={nuevoEmpleado.emoji} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, emoji: e.target.value })} style={{ width: 60, background: 'rgba(255,255,255,.06)', color: 'white' }}>
                                <option value="👩">👩</option><option value="💁">💁</option><option value="🙆">🙆</option><option value="🧑">🧑</option><option value="👨">👨</option>
                              </select>
                            </div>
                            <select className="form-input" value={nuevoEmpleado.rol} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, rol: e.target.value as Empleado['rol'] })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value="profesional">Profesional</option>
                              <option value="asistente">Asistente</option>
                              <option value="recepcionista">Recepcionista</option>
                              <option value="gerente">Gerente</option>
                            </select>
                            <input className="form-input" placeholder="Teléfono" value={nuevoEmpleado.telefono} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Comisión %</label>
                                <input className="form-input" type="number" value={nuevoEmpleado.comision} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, comision: Number(e.target.value) })} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Salario Base</label>
                                <input className="form-input" type="number" value={nuevoEmpleado.salarioBase} onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, salarioBase: Number(e.target.value) })} />
                              </div>
                            </div>
                            <button className="btn-primary" onClick={agregarEmpleado}>AGREGAR EMPLEADO</button>
                          </div>
                        </div>
                      </div>
                      <div className="admin-section-title">📋 LISTA DE EMPLEADOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>AVATAR</th><th>NOMBRE</th><th>ESPECIALIDAD</th><th>ROL</th><th>COMISIÓN</th><th>TELÉFONO</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
                          <tbody>
                            {empleados.map(e => (
                              <tr key={e.id}>
                                <td style={{ fontSize: '1.5rem' }}>{e.emoji}</td>
                                <td>{e.nombre}</td>
                                <td>{e.especialidad}</td>
                                <td><span className="badge-ok">{e.rol}</span></td>
                                <td style={{ color: 'var(--c-dorado)' }}>{e.comision}%</td>
                                <td>{e.telefono || '-'}</td>
                                <td><span className="badge-ok" style={{ background: e.activa ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>{e.activa ? 'ACTIVO' : 'INACTIVO'}</span></td>
                                <td>
                                  <button className="btn-icon" onClick={() => actualizarEmpleado(e.id, { activa: !e.activa })} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer', marginRight: 4 }}>✏️</button>
                                  <button className="btn-icon" onClick={() => eliminarEmpleado(e.id)} style={{ background: 'rgba(255,0,110,.2)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}>🗑️</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {adminTab === 'proveedores' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>PROVEEDORES ACTIVOS</h4><div className="stat-num">{proveedores.filter(p => p.activo).length}</div></div>
                        <div className="stat-card"><h4>ÓRDENES PENDIENTES</h4><div className="stat-num">{ordenesCompra.filter(o => o.estado === 'pendiente').length}</div></div>
                        <div className="stat-card"><h4>TOTAL ÓRDENES</h4><div className="stat-num">${ordenesCompra.reduce((s, o) => s + o.total, 0).toLocaleString()}</div></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>➕ NUEVO PROVEEDOR</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input className="form-input" placeholder="Nombre empresa" value={nuevoProveedor.nombre} onChange={e => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })} />
                            <input className="form-input" placeholder="Contacto" value={nuevoProveedor.contacto} onChange={e => setNuevoProveedor({ ...nuevoProveedor, contacto: e.target.value })} />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input className="form-input" placeholder="Teléfono" value={nuevoProveedor.telefono} onChange={e => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })} style={{ flex: 1 }} />
                              <input className="form-input" placeholder="Email" value={nuevoProveedor.email} onChange={e => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })} style={{ flex: 1 }} />
                            </div>
                            <input className="form-input" placeholder="Dirección" value={nuevoProveedor.direccion} onChange={e => setNuevoProveedor({ ...nuevoProveedor, direccion: e.target.value })} />
                            <input className="form-input" placeholder="Categoría" value={nuevoProveedor.categoria} onChange={e => setNuevoProveedor({ ...nuevoProveedor, categoria: e.target.value })} />
                            <textarea className="form-input" placeholder="Notas" value={nuevoProveedor.notas} onChange={e => setNuevoProveedor({ ...nuevoProveedor, notas: e.target.value })} rows={2} />
                            <button className="btn-primary" onClick={agregarProveedor}>AGREGAR PROVEEDOR</button>
                          </div>
                        </div>
                        <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>📦 NUEVA ORDEN DE COMPRA</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <select className="form-input" value={nuevaOrden.proveedorId} onChange={e => setNuevaOrden({ ...nuevaOrden, proveedorId: Number(e.target.value) })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value={0}>Seleccionar proveedor</option>
                              {proveedores.filter(p => p.activo).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            <button className="btn-primary" style={{ background: 'var(--c-fucsia)' }} onClick={crearOrdenCompra}>CREAR ORDEN</button>
                          </div>
                        </div>
                      </div>
                      <div className="admin-section-title">📋 PROVEEDORES</div>
                      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>CONTACTO</th><th>TELÉFONO</th><th>EMAIL</th><th>CATEGORÍA</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {proveedores.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin proveedores registrados</td></tr> : proveedores.map(p => (
                              <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td>{p.contacto || '-'}</td>
                                <td>{p.telefono}</td>
                                <td>{p.email}</td>
                                <td>{p.categoria || '-'}</td>
                                <td><span className="badge-ok" style={{ background: p.activo ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>{p.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                                <td><button onClick={() => eliminarProveedor(p.id)} style={{ background: 'rgba(255,0,110,.2)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}>🗑️</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-section-title">📦 ÓRDENES DE COMPRA</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>FECHA</th><th>PROVEEDOR</th><th>ITEMS</th><th>TOTAL</th><th>ESTADO</th></tr></thead>
                          <tbody>
                            {ordenesCompra.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin órdenes de compra</td></tr> : ordenesCompra.map(o => (
                              <tr key={o.id}>
                                <td>{new Date(o.fecha).toLocaleDateString('es-CO')}</td>
                                <td>{o.proveedorNombre}</td>
                                <td>{o.items.length} productos</td>
                                <td style={{ color: 'var(--c-dorado)' }}>${o.total.toLocaleString()}</td>
                                <td><span className="badge-ok" style={{ background: o.estado === 'pendiente' ? 'var(--c-dorado)' : o.estado === 'recibida' ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>{o.estado.toUpperCase()}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {adminTab === 'cupones' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>CUPONES ACTIVOS</h4><div className="stat-num">{cupones.filter(c => c.activo).length}</div></div>
                        <div className="stat-card"><h4>TOTAL USOS</h4><div className="stat-num">{cupones.reduce((s, c) => s + c.usosActuales, 0)}</div></div>
                      </div>
                      <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20, marginBottom: 20, maxWidth: 400 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>🎟️ CREAR CUPÓN</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input className="form-input" placeholder="CÓDIGO" value={nuevoCupon.codigo} onChange={e => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value.toUpperCase() })} style={{ flex: 1, textTransform: 'uppercase' }} />
                            <button onClick={() => setNuevoCupon({ ...nuevoCupon, codigo: generarCodigoCupon() })} style={{ background: 'var(--c-morado)', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}>🎲</button>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input className="form-input" type="number" placeholder="Descuento" value={nuevoCupon.descuento || ''} onChange={e => setNuevoCupon({ ...nuevoCupon, descuento: Number(e.target.value) })} style={{ flex: 1 }} />
                            <select className="form-input" value={nuevoCupon.tipoDescuento} onChange={e => setNuevoCupon({ ...nuevoCupon, tipoDescuento: e.target.value as 'porcentaje' | 'fijo' })} style={{ width: 120, background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value="porcentaje">% descuento</option>
                              <option value="fijo">$ fijo</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Inicio</label>
                              <input className="form-input" type="date" value={nuevoCupon.fechaInicio} onChange={e => setNuevoCupon({ ...nuevoCupon, fechaInicio: e.target.value })} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Fin</label>
                              <input className="form-input" type="date" value={nuevoCupon.fechaFin} onChange={e => setNuevoCupon({ ...nuevoCupon, fechaFin: e.target.value })} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Usos máximos</label>
                              <input className="form-input" type="number" value={nuevoCupon.usosMaximos} onChange={e => setNuevoCupon({ ...nuevoCupon, usosMaximos: Number(e.target.value) })} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Mínimo compra</label>
                              <input className="form-input" type="number" value={nuevoCupon.minimoCompra || ''} onChange={e => setNuevoCupon({ ...nuevoCupon, minimoCompra: Number(e.target.value) })} />
                            </div>
                          </div>
                          <button className="btn-primary" onClick={agregarCupon}>CREAR CUPÓN</button>
                        </div>
                      </div>
                      <div className="admin-section-title">📋 CUPONES ACTIVOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>CÓDIGO</th><th>DESCUENTO</th><th>VIGENCIA</th><th>USOS</th><th>MÍN COMPRA</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {cupones.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin cupones creados</td></tr> : cupones.map(c => (
                              <tr key={c.id}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--c-turquesa)' }}>{c.codigo}</td>
                                <td style={{ color: 'var(--c-dorado)' }}>{c.tipoDescuento === 'porcentaje' ? `${c.descuento}%` : `$${c.descuento.toLocaleString()}`}</td>
                                <td>{c.fechaInicio} - {c.fechaFin}</td>
                                <td>{c.usosActuales}/{c.usosMaximos}</td>
                                <td>{c.minimoCompra ? `$${c.minimoCompra.toLocaleString()}` : '-'}</td>
                                <td><span className="badge-ok" style={{ background: c.activo ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>{c.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                                <td>
                                  <button onClick={() => toggleCupon(c.id)} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer', marginRight: 4 }}>🔄</button>
                                  <button onClick={() => eliminarCupon(c.id)} style={{ background: 'rgba(255,0,110,.2)', border: 'none', borderRadius: 4, padding: 4, cursor: 'pointer' }}>🗑️</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {adminTab === 'giftcards' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>GIFT CARDS ACTIVAS</h4><div className="stat-num">{giftCards.filter(g => g.activa).length}</div></div>
                        <div className="stat-card"><h4>SALDO TOTAL</h4><div className="stat-num">${giftCards.filter(g => g.activa).reduce((s, g) => s + g.saldoActual, 0).toLocaleString()}</div></div>
                      </div>
                      <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20, marginBottom: 20, maxWidth: 400 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>🎁 CREAR GIFT CARD</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Saldo inicial</label>
                            <input className="form-input" type="number" value={nuevaGiftCard.saldoInicial || ''} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, saldoInicial: Number(e.target.value) })} />
                          </div>
                          <input className="form-input" placeholder="Nombre comprador (opcional)" value={nuevaGiftCard.comprador} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, comprador: e.target.value })} />
                          <input className="form-input" placeholder="Nombre destinatario (opcional)" value={nuevaGiftCard.destinatario} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, destinatario: e.target.value })} />
                          <div>
                            <label style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Fecha vencimiento (opcional)</label>
                            <input className="form-input" type="date" value={nuevaGiftCard.fechaVencimiento} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, fechaVencimiento: e.target.value })} />
                          </div>
                          <button className="btn-primary" style={{ background: 'var(--c-dorado)', color: 'black' }} onClick={crearGiftCard}>🎁 CREAR GIFT CARD</button>
                        </div>
                      </div>
                      <div className="admin-section-title">📋 GIFT CARDS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>CÓDIGO</th><th>SALDO INICIAL</th><th>SALDO ACTUAL</th><th>COMPRADOR</th><th>DESTINATARIO</th><th>VENCIMIENTO</th><th>ESTADO</th></tr></thead>
                          <tbody>
                            {giftCards.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin gift cards creadas</td></tr> : giftCards.map(g => (
                              <tr key={g.id}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--c-dorado)' }}>{g.codigo}</td>
                                <td>${g.saldoInicial.toLocaleString()}</td>
                                <td style={{ color: g.saldoActual > 0 ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>${g.saldoActual.toLocaleString()}</td>
                                <td>{g.comprador || '-'}</td>
                                <td>{g.destinatario || '-'}</td>
                                <td>{new Date(g.fechaVencimiento).toLocaleDateString('es-CO')}</td>
                                <td><span className="badge-ok" style={{ background: g.activa ? 'var(--c-turquesa)' : 'var(--c-fucsia)' }}>{g.activa ? 'ACTIVA' : 'AGOTADA'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {adminTab === 'comisiones' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>COMISIONES PENDIENTES</h4><div className="stat-num" style={{ color: 'var(--c-dorado)' }}>${getTotalComisionesPendientes().toLocaleString()}</div></div>
                        <div className="stat-card"><h4>TOTAL REGISTROS</h4><div className="stat-num">{comisiones.length}</div></div>
                        <div className="stat-card"><h4>PAGADAS</h4><div className="stat-num">{comisiones.filter(c => c.pagada).length}</div></div>
                      </div>

                      {/* GRÁFICOS DE COMISIONES */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Comisiones por empleado */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>💰 COMISIONES POR EMPLEADO</h4>
                          <div className="bar-chart">
                            {empleados.filter(e => e.rol === 'profesional').map(emp => {
                              const comsEmp = comisiones.filter(c => c.empleadoId === emp.id);
                              const total = comsEmp.reduce((s, c) => s + c.comision, 0);
                              const max = Math.max(...empleados.filter(e => e.rol === 'profesional').map(e => comisiones.filter(c => c.empleadoId === e.id).reduce((s, c) => s + c.comision, 0)), 1);
                              return (
                                <div key={emp.id} className="bar-row">
                                  <span className="bar-label">{emp.emoji} {emp.nombre}</span>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{ width: `${(total / max) * 100}%`, background: 'linear-gradient(90deg, var(--c-dorado), var(--c-fucsia))' }}></div>
                                  </div>
                                  <span className="bar-val">${total.toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Estado de comisiones */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>📊 ESTADO DE COMISIONES</h4>
                          <div className="donut-container">
                            <div className="donut-chart">
                              <svg viewBox="0 0 36 36">
                                {(() => {
                                  const pagadas = comisiones.filter(c => c.pagada).reduce((s, c) => s + c.comision, 0);
                                  const pendientes = comisiones.filter(c => !c.pagada).reduce((s, c) => s + c.comision, 0);
                                  const total = Math.max(pagadas + pendientes, 1);
                                  const p1 = (pagadas / total) * 100;
                                  return (
                                    <>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#00f5d4" strokeWidth="3.8" strokeDasharray={`${p1} ${100-p1}`} strokeDashoffset="25"></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#ffd700" strokeWidth="3.8" strokeDasharray={`${100-p1} ${p1}`} strokeDashoffset={25 - p1}></circle>
                                    </>
                                  );
                                })()}
                              </svg>
                              <div className="donut-center">${comisiones.reduce((s, c) => s + c.comision, 0).toLocaleString()}</div>
                            </div>
                            <div className="donut-legend">
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#00f5d4' }}></span>✅ Pagadas: ${comisiones.filter(c => c.pagada).reduce((s, c) => s + c.comision, 0).toLocaleString()}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#ffd700' }}></span>⏳ Pendientes: ${comisiones.filter(c => !c.pagada).reduce((s, c) => s + c.comision, 0).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="admin-section-title">💼 RESUMEN POR EMPLEADO</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                        {empleados.filter(e => e.rol === 'profesional').map(emp => {
                          const comsEmp = getComisionesPorEmpleado(emp.id);
                          const pendiente = comsEmp.filter(c => !c.pagada).reduce((s, c) => s + c.comision, 0);
                          return (
                            <div key={emp.id} style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: '1.5rem' }}>{emp.emoji}</span>
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{emp.nombre}</div>
                                  <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)' }}>{emp.comision}% comisión</div>
                                </div>
                              </div>
                              <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.6)' }}>Servicios: {comsEmp.length}</div>
                              <div style={{ fontSize: '1.1rem', color: 'var(--c-dorado)', fontWeight: 'bold' }}>Pendiente: ${pendiente.toLocaleString()}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="admin-section-title">📋 HISTORIAL DE COMISIONES</div>
                      <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>FECHA</th><th>EMPLEADO</th><th>SERVICIO</th><th>VENTA</th><th>%</th><th>COMISIÓN</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {comisiones.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin comisiones registradas</td></tr> : comisiones.slice(-50).reverse().map(c => (
                              <tr key={c.id}>
                                <td>{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                                <td>{c.empleadoNombre}</td>
                                <td>{c.servicio}</td>
                                <td>${c.montoVenta.toLocaleString()}</td>
                                <td>{c.porcentaje}%</td>
                                <td style={{ color: 'var(--c-dorado)', fontWeight: 'bold' }}>${c.comision.toLocaleString()}</td>
                                <td><span className="badge-ok" style={{ background: c.pagada ? 'var(--c-turquesa)' : 'var(--c-dorado)' }}>{c.pagada ? 'PAGADA' : 'PENDIENTE'}</span></td>
                                <td>
                                  {!c.pagada && (
                                    <button onClick={() => marcarComisionPagada(c.id)} style={{ background: 'var(--c-turquesa)', color: 'black', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: '.7rem' }}>PAGAR</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {adminTab === 'bloqueos' && (
                    <>
                      <div className="admin-section-title">BLOQUEAR DÍAS</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>PROFESIONAL</label>
                          <select className="form-input" value={bloquearProf} onChange={e => setBloquearProf(e.target.value)} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                            <option value="todos">TODAS</option>
                            {profesionales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                        </div>
                        <div className="form-field">
                          <label>FECHA</label>
                          <input className="form-input" type="date" value={bloquearFecha} onChange={e => setBloquearFecha(e.target.value)} />
                        </div>
                        <div className="form-field">
                          <label>MOTIVO</label>
                          <input className="form-input" value={bloquearMotivo} onChange={e => setBloquearMotivo(e.target.value)} placeholder="Ej: Feriado" />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarBloqueo}>BLOQUEAR</button>
                      </div>
                      
                      <div className="admin-section-title">BLOQUEOS ACTIVOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>PROFESIONAL</th><th>FECHA</th><th>MOTIVO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {bloqueos.length === 0 ? (
                              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin bloqueos activos</td></tr>
                            ) : bloqueos.map(b => (
                              <tr key={b.id}>
                                <td>{b.profesionalNombre}</td>
                                <td>{b.fecha}</td>
                                <td>{b.motivo}</td>
                                <td><button className="admin-btn admin-btn-red" onClick={() => eliminarBloqueo(b.id)}>🗑 Eliminar</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'reportes' && (
                    <>
                      <div className="admin-section-title">📊 EXPORTAR REPORTES</div>
                      <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20, marginBottom: 20 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
                          <div className="form-field" style={{ flex: 1, minWidth: 150 }}>
                            <label>TIPO DE REPORTE</label>
                            <select className="form-input" value={reporteTipo} onChange={e => setReporteTipo(e.target.value as typeof reporteTipo)} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value="reservas">📅 Reservas</option>
                              <option value="clientes">👥 Clientes</option>
                              <option value="ventas">💰 Ventas</option>
                              <option value="inventario">📦 Inventario</option>
                            </select>
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 150 }}>
                            <label>FORMATO</label>
                            <select className="form-input" value={reporteFormato} onChange={e => setReporteFormato(e.target.value as typeof reporteFormato)} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value="csv">📄 CSV (Excel)</option>
                              <option value="json">📋 JSON</option>
                            </select>
                          </div>
                          <button className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} onClick={generarReporte}>
                            📥 DESCARGAR
                          </button>
                        </div>
                      </div>
                      
                      <div className="stat-grid">
                        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setReporteTipo('reservas'); }}>
                          <h4>RESERVAS</h4>
                          <div className="stat-num">{reservas.length}</div>
                          <div className="stat-sub">registros exportables</div>
                        </div>
                        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setReporteTipo('clientes'); }}>
                          <h4>CLIENTES</h4>
                          <div className="stat-num">{clientes.length}</div>
                          <div className="stat-sub">registros exportables</div>
                        </div>
                        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setReporteTipo('ventas'); }}>
                          <h4>VENTAS</h4>
                          <div className="stat-num">{compras.length}</div>
                          <div className="stat-sub">registros exportables</div>
                        </div>
                        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => { setReporteTipo('inventario'); }}>
                          <h4>INVENTARIO</h4>
                          <div className="stat-num">{inventario.length}</div>
                          <div className="stat-sub">productos</div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'configuracion' && (
                    <>
                      <div className="admin-section-title">⚙️ CONFIGURACIÓN DEL SISTEMA</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 16 }}>INFORMACIÓN DEL NEGOCIO</h4>
                          <div className="form-field">
                            <label>NOMBRE</label>
                            <input className="form-input" value={config.nombreNegocio} onChange={e => setConfig({...config, nombreNegocio: e.target.value})} />
                          </div>
                          <div className="form-field">
                            <label>DIRECCIÓN</label>
                            <input className="form-input" value={config.direccion} onChange={e => setConfig({...config, direccion: e.target.value})} />
                          </div>
                          <div className="form-field">
                            <label>TELÉFONO</label>
                            <input className="form-input" value={config.telefono} onChange={e => setConfig({...config, telefono: e.target.value})} />
                          </div>
                          <div className="form-field">
                            <label>EMAIL</label>
                            <input className="form-input" type="email" value={config.email} onChange={e => setConfig({...config, email: e.target.value})} />
                          </div>
                        </div>
                        
                        <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 20 }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>HORARIOS</h4>
                          <div className="form-field">
                            <label>HORA APERTURA</label>
                            <input className="form-input" type="time" value={config.horaApertura} onChange={e => setConfig({...config, horaApertura: e.target.value})} />
                          </div>
                          <div className="form-field">
                            <label>HORA CIERRE</label>
                            <input className="form-input" type="time" value={config.horaCierre} onChange={e => setConfig({...config, horaCierre: e.target.value})} />
                          </div>
                          <div className="form-field">
                            <label>MENSAJE BIENVENIDA</label>
                            <textarea className="form-input" style={{ minHeight: 60, resize: 'vertical' }} value={config.mensajeBienvenida} onChange={e => setConfig({...config, mensajeBienvenida: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                        <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }} onClick={guardarConfig}>
                          💾 GUARDAR CAMBIOS
                        </button>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'auditoria' && (
                    <>
                      <div className="admin-section-title">📋 REGISTRO DE ACTIVIDAD</div>
                      <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)' }}>
                          Total: <strong style={{ color: 'var(--c-turquesa)' }}>{auditLog.length}</strong> registros
                        </span>
                        <button className="admin-btn admin-btn-blue" onClick={() => { setAuditLog([]); LS.set('auditLog', []); showToast('Registro limpiado'); }}>
                          🗑 Limpiar registro
                        </button>
                      </div>
                      <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>FECHA</th>
                              <th>USUARIO</th>
                              <th>ACCIÓN</th>
                              <th>DETALLE</th>
                              <th>TIPO</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLog.length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 30 }}>Sin actividad registrada</td></tr>
                            ) : auditLog.slice(0, 50).map(log => (
                              <tr key={log.id}>
                                <td style={{ fontSize: '.7rem' }}>{new Date(log.fecha).toLocaleString('es-CO')}</td>
                                <td>{log.usuario}</td>
                                <td><strong>{log.accion}</strong></td>
                                <td style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.6)' }}>{log.detalle}</td>
                                <td>
                                  <span className={`badge-${log.tipo === 'reserva' ? 'ok' : log.tipo === 'venta' ? 'warn' : log.tipo === 'admin' ? 'err' : 'ok'}`}>
                                    {log.tipo}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'servicios' && (
                    <>
                      <div className="admin-section-title">💅 GESTIÓN DE SERVICIOS</div>
                      <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                          <div className="form-field" style={{ flex: 2, minWidth: 150 }}>
                            <label>NOMBRE</label>
                            <input className="form-input" value={nuevoServicio.nombre} onChange={e => setNuevoServicio({...nuevoServicio, nombre: e.target.value})} placeholder="Nombre del servicio" />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 100 }}>
                            <label>PRECIO</label>
                            <input className="form-input" type="number" value={nuevoServicio.precio || ''} onChange={e => setNuevoServicio({...nuevoServicio, precio: parseInt(e.target.value) || 0})} />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 80 }}>
                            <label>DURACIÓN (min)</label>
                            <input className="form-input" type="number" value={nuevoServicio.duracion} onChange={e => setNuevoServicio({...nuevoServicio, duracion: parseInt(e.target.value) || 30})} />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
                            <label>CATEGORÍA</label>
                            <select className="form-input" value={nuevoServicio.categoria} onChange={e => setNuevoServicio({...nuevoServicio, categoria: e.target.value})} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value="manicura">💅 Manicura</option>
                              <option value="podologia">🦶 Podología</option>
                              <option value="facial">🧖 Facial</option>
                              <option value="otros">✨ Otros</option>
                            </select>
                          </div>
                          <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={agregarServicio}>AGREGAR</button>
                        </div>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>CATEGORÍA</th><th>PRECIO</th><th>DURACIÓN</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {servicios.map(s => (
                              <tr key={s.id}>
                                <td>{s.nombre}</td>
                                <td><span className="badge-ok">{s.categoria}</span></td>
                                <td style={{ color: 'var(--c-turquesa)' }}>${s.precio.toLocaleString()}</td>
                                <td>{s.duracion} min</td>
                                <td><button className="admin-btn admin-btn-red" onClick={() => eliminarServicio(s.id)}>🗑</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'promociones' && (
                    <>
                      <div className="admin-section-title">🎁 PROMOCIONES Y DESCUENTOS</div>
                      <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                          <div className="form-field" style={{ flex: 2, minWidth: 150 }}>
                            <label>NOMBRE</label>
                            <input className="form-input" value={nuevaPromo.nombre} onChange={e => setNuevaPromo({...nuevaPromo, nombre: e.target.value})} placeholder="Ej: 2x1 Manicuras" />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 80 }}>
                            <label>DESCUENTO %</label>
                            <input className="form-input" type="number" value={nuevaPromo.descuento} onChange={e => setNuevaPromo({...nuevaPromo, descuento: parseInt(e.target.value) || 0})} />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
                            <label>DESDE</label>
                            <input className="form-input" type="date" value={nuevaPromo.fechaInicio} onChange={e => setNuevaPromo({...nuevaPromo, fechaInicio: e.target.value})} />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 120 }}>
                            <label>HASTA</label>
                            <input className="form-input" type="date" value={nuevaPromo.fechaFin} onChange={e => setNuevaPromo({...nuevaPromo, fechaFin: e.target.value})} />
                          </div>
                          <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={agregarPromocion}>CREAR</button>
                        </div>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>DESCUENTO</th><th>VIGENCIA</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {promociones.length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin promociones activas</td></tr>
                            ) : promociones.map(p => (
                              <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td style={{ color: 'var(--c-dorado)' }}>{p.descuento}%</td>
                                <td>{p.fechaInicio} → {p.fechaFin}</td>
                                <td><span className={p.activa ? 'badge-ok' : 'badge-err'}>{p.activa ? '✓ ACTIVA' : '✕ INACTIVA'}</span></td>
                                <td><button className={`admin-btn ${p.activa ? 'admin-btn-red' : 'admin-btn-green'}`} onClick={() => togglePromocion(p.id)}>{p.activa ? 'Desactivar' : 'Activar'}</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'horarios' && (
                    <>
                      <div className="admin-section-title">🕐 HORARIOS DEL NEGOCIO</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                          <div key={dia} style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.7rem', letterSpacing: 2, color: dia === 'Domingo' ? 'var(--c-fucsia)' : 'var(--c-turquesa)', marginBottom: 10 }}>{dia.toUpperCase()}</div>
                            {dia === 'Domingo' ? (
                              <span className="badge-err">CERRADO</span>
                            ) : (
                              <div style={{ fontSize: '.85rem', color: 'white' }}>{config.horaApertura} - {config.horaCierre}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 'var(--r-card)', padding: 14, fontSize: '.78rem', color: 'rgba(255,255,255,.7)' }}>
                        💡 Para cambiar los horarios generales, andá a <strong style={{ color: 'var(--c-dorado)' }}>⚙️ Config</strong>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'fidelidad' && (
                    <>
                      <div className="admin-section-title">⭐ PROGRAMA DE FIDELIDAD</div>
                      <div className="stat-grid">
                        <div className="stat-card"><h4>PUNTOS EN CIRCULACIÓN</h4><div className="stat-num">{clientes.reduce((s, c) => s + getPuntos(c.cedula, reservas, compras), 0)}</div><div className="stat-sub">⭐ total sistema</div></div>
                        <div className="stat-card"><h4>CLIENTES BRONCE</h4><div className="stat-num">{clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'BRONCE').length}</div><div className="stat-sub">🥉 nivel básico</div></div>
                        <div className="stat-card"><h4>CLIENTES PLATA</h4><div className="stat-num">{clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'PLATA').length}</div><div className="stat-sub">🥈 50+ puntos</div></div>
                        <div className="stat-card"><h4>CLIENTES ORO</h4><div className="stat-num">{clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'ORO').length}</div><div className="stat-sub">🥇 150+ puntos</div></div>
                        <div className="stat-card"><h4>CLIENTES DIAMANTE</h4><div className="stat-num">{clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'DIAMANTE').length}</div><div className="stat-sub">💎 300+ puntos</div></div>
                      </div>

                      {/* GRÁFICOS DE FIDELIDAD */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 20, marginBottom: 20 }}>
                        {/* Distribución de niveles */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-dorado)', marginBottom: 16 }}>🏆 DISTRIBUCIÓN POR NIVEL</h4>
                          <div className="donut-container">
                            <div className="donut-chart">
                              <svg viewBox="0 0 36 36">
                                {(() => {
                                  const total = clientes.length || 1;
                                  const bronce = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'BRONCE').length;
                                  const plata = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'PLATA').length;
                                  const oro = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'ORO').length;
                                  const diamante = clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'DIAMANTE').length;
                                  const p1 = (bronce / total) * 100;
                                  const p2 = (plata / total) * 100;
                                  const p3 = (oro / total) * 100;
                                  const p4 = (diamante / total) * 100;
                                  return (
                                    <>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#cd7f32" strokeWidth="3.8" strokeDasharray={`${p1} ${100-p1}`} strokeDashoffset="25"></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#c0c0c0" strokeWidth="3.8" strokeDasharray={`${p2} ${100-p2}`} strokeDashoffset={25 - p1}></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#ffd700" strokeWidth="3.8" strokeDasharray={`${p3} ${100-p3}`} strokeDashoffset={25 - p1 - p2}></circle>
                                      <circle className="donut-segment" cx="18" cy="18" r="15.9" fill="transparent" stroke="#b9f2ff" strokeWidth="3.8" strokeDasharray={`${p4} ${100-p4}`} strokeDashoffset={25 - p1 - p2 - p3}></circle>
                                    </>
                                  );
                                })()}
                              </svg>
                              <div className="donut-center">{clientes.length}</div>
                            </div>
                            <div className="donut-legend">
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#cd7f32' }}></span>🥉 Bronce: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'BRONCE').length}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#c0c0c0' }}></span>🥈 Plata: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'PLATA').length}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#ffd700' }}></span>🥇 Oro: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'ORO').length}</div>
                              <div className="legend-item"><span className="legend-dot" style={{ background: '#b9f2ff' }}></span>💎 Diamante: {clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'DIAMANTE').length}</div>
                            </div>
                          </div>
                        </div>

                        {/* Top clientes por puntos */}
                        <div className="chart-card">
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 16 }}>⭐ TOP 5 CLIENTES FIELES</h4>
                          <div className="top-products">
                            {(() => {
                              const clientesPuntos = clientes.map(c => ({ nombre: c.nombre, puntos: getPuntos(c.cedula, reservas, compras), nivel: getNivel(getPuntos(c.cedula, reservas, compras)) }));
                              const sorted = clientesPuntos.sort((a, b) => b.puntos - a.puntos).slice(0, 5);
                              const max = sorted[0]?.puntos || 1;
                              return sorted.map((c, idx) => (
                                <div key={idx} className="top-row">
                                  <span className="top-rank">#{idx + 1}</span>
                                  <span className="top-name">{c.nombre}</span>
                                  <div className="top-bar-track">
                                    <div className="top-bar-fill" style={{ width: `${(c.puntos / max) * 100}%`, background: c.nivel.color }}></div>
                                  </div>
                                  <span className="top-val">{c.puntos}pts</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                        {[
                          { icon: '🥉', nombre: 'BRONCE', rango: '0-49 pts', descuento: '3%', color: '#cd7f32' },
                          { icon: '🥈', nombre: 'PLATA', rango: '50-149 pts', descuento: '5%', color: '#c0c0c0' },
                          { icon: '🥇', nombre: 'ORO', rango: '150-299 pts', descuento: '10%', color: '#ffd700' },
                          { icon: '💎', nombre: 'DIAMANTE', rango: '300+ pts', descuento: '15%', color: '#b9f2ff' },
                        ].map(n => (
                          <div key={n.nombre} style={{ background: 'var(--c-blanco05)', border: `2px solid ${n.color}`, borderRadius: 'var(--r-card)', padding: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem' }}>{n.icon}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.7rem', letterSpacing: 3, color: n.color }}>{n.nombre}</div>
                            <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{n.rango}</div>
                            <div style={{ fontSize: '.85rem', color: 'var(--c-turquesa)', marginTop: 8 }}>{n.descuento} descuento</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'usuarios' && (
                    <>
                      <div className="admin-section-title">🔐 USUARIOS ADMINISTRADORES</div>
                      <div style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                          <div className="form-field" style={{ flex: 1, minWidth: 150 }}>
                            <label>USUARIO</label>
                            <input className="form-input" value={nuevoAdminUser} onChange={e => setNuevoAdminUser(e.target.value)} placeholder="Nuevo usuario" />
                          </div>
                          <div className="form-field" style={{ flex: 1, minWidth: 150 }}>
                            <label>CONTRASEÑA</label>
                            <input className="form-input" type="password" value={nuevoAdminPass} onChange={e => setNuevoAdminPass(e.target.value)} placeholder="Contraseña" />
                          </div>
                          <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={agregarAdminUser}>CREAR</button>
                        </div>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>USUARIO</th><th>ROL</th><th>TIPO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {adminUsers.map(u => (
                              <tr key={u.usuario}>
                                <td>{u.usuario}</td>
                                <td><span className="badge-ok">{u.rol}</span></td>
                                <td><span className={u.tipo === 'default' ? 'badge-warn' : 'badge-ok'}>{u.tipo || 'custom'}</span></td>
                                <td>
                                  {u.tipo !== 'default' && (
                                    <button className="admin-btn admin-btn-red" onClick={() => eliminarAdminUser(u.usuario)}>🗑</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'backup' && (
                    <>
                      <div className="admin-section-title">💾 BACKUP Y RESTAURACIÓN</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        <div style={{ background: 'linear-gradient(135deg, rgba(0,245,212,.1), rgba(58,134,255,.1))', border: '1px solid rgba(0,245,212,.3)', borderRadius: 'var(--r-card)', padding: 24, textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', marginBottom: 10 }}>📤</div>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.75rem', letterSpacing: 2, color: 'var(--c-turquesa)', marginBottom: 8 }}>EXPORTAR BACKUP</h4>
                          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>Descarga todos los datos del sistema en un archivo JSON</p>
                          <button className="btn-primary" onClick={crearBackup}>DESCARGAR BACKUP</button>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, rgba(255,20,147,.1), rgba(155,93,229,.1))', border: '1px solid rgba(255,20,147,.3)', borderRadius: 'var(--r-card)', padding: 24, textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', marginBottom: 10 }}>📥</div>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.75rem', letterSpacing: 2, color: 'var(--c-fucsia)', marginBottom: 8 }}>IMPORTAR BACKUP</h4>
                          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>Restaura datos desde un archivo de backup anterior</p>
                          <label className="btn-primary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                            SELECCIONAR ARCHIVO
                            <input type="file" accept=".json" onChange={importarBackup} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                      <div style={{ marginTop: 20, background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 'var(--r-card)', padding: 14, fontSize: '.78rem', color: 'rgba(255,255,255,.7)' }}>
                        ⚠️ <strong>Advertencia:</strong> Al importar un backup, los datos actuales serán reemplazados. Asegurate de hacer una copia de seguridad antes.
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'notificaciones' && (
                    <>
                      <div className="admin-section-title">🔔 CONFIGURACIÓN DE NOTIFICACIONES</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                        {[
                          { id: 'nuevaReserva', label: 'Nuevas reservas', desc: 'Notificar cuando se crea una reserva' },
                          { id: 'cancelacion', label: 'Cancelaciones', desc: 'Notificar cuando se cancela una reserva' },
                          { id: 'nuevoCliente', label: 'Nuevos clientes', desc: 'Notificar cuando se registra un cliente' },
                          { id: 'bajoStock', label: 'Stock bajo', desc: 'Notificar cuando un producto tiene stock bajo' },
                          { id: 'recordatorio', label: 'Recordatorios', desc: 'Recordatorio de reservas próximas' },
                          { id: 'promocion', label: 'Promociones', desc: 'Notificar promociones activas' },
                        ].map(n => (
                          <div key={n.id} style={{ background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'white' }}>{n.label}</div>
                              <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)' }}>{n.desc}</div>
                            </div>
                            <label className="switch">
                              <input type="checkbox" defaultChecked />
                              <span className="slider"></span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'estadisticas' && (
                    <>
                      <div className="admin-section-title">📈 ESTADÍSTICAS AVANZADAS</div>
                      <div className="stat-grid">
                        <div className="stat-card"><h4>RESERVAS ESTE MES</h4><div className="stat-num">{reservas.filter(r => r.fecha.startsWith(new Date().toISOString().slice(0, 7))).length}</div><div className="stat-sub">📅 {new Date().toLocaleDateString('es-CO', { month: 'long' })}</div></div>
                        <div className="stat-card"><h4>INGRESOS MES</h4><div className="stat-num">${compras.filter(c => c.fecha.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, c) => s + c.precio, 0).toLocaleString()}</div><div className="stat-sub">💰 ventas tienda</div></div>
                        <div className="stat-card"><h4>CLIENTES NUEVOS MES</h4><div className="stat-num">{clientes.filter(c => c.fechaReg?.startsWith(new Date().toISOString().slice(0, 7))).length}</div><div className="stat-sub">👤 registrados</div></div>
                        <div className="stat-card"><h4>PROMEDIO RESERVAS/DÍA</h4><div className="stat-num">{reservas.length > 0 ? (reservas.length / 30).toFixed(1) : '0'}</div><div className="stat-sub">📊 último mes</div></div>
                        <div className="stat-card"><h4>TICKET PROMEDIO</h4><div className="stat-num">${compras.length > 0 ? Math.round(compras.reduce((s, c) => s + c.precio, 0) / compras.length).toLocaleString() : '0'}</div><div className="stat-sub">🛒 por compra</div></div>
                        <div className="stat-card"><h4>TASA OCUPACIÓN</h4><div className="stat-num">{reservas.length > 0 ? Math.min(100, Math.round((reservas.filter(r => r.fecha >= new Date().toISOString().split('T')[0]).length / 50) * 100)) : 0}%</div><div className="stat-sub">📊 estimado</div></div>
                      </div>
                      <div style={{ marginTop: 20, background: 'var(--c-blanco05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--r-card)', padding: 16 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.65rem', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 12 }}>TOP PROFESIONALES</h4>
                        {profesionales.map(p => {
                          const cant = reservas.filter(r => r.profesional === p.id).length;
                          const pct = reservas.length > 0 ? Math.round((cant / reservas.length) * 100) : 0;
                          return (
                            <div key={p.id} style={{ marginBottom: 10 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 4 }}>
                                <span>{p.emoji} {p.nombre}</span>
                                <span style={{ color: 'var(--c-turquesa)' }}>{cant} reservas ({pct}%)</span>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,.08)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ background: 'linear-gradient(90deg, var(--c-fucsia), var(--c-turquesa))', width: `${pct}%`, height: '100%', borderRadius: 3 }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CHAT FLOTANTE */}
      <button id="chatBtn" onClick={() => setChatOpen(!chatOpen)}>
        💬
        <span className="chat-dot" />
      </button>
      
      {chatOpen && (
        <div id="chatWindow" className="open">
          <div className="chat-header">
            <div className="chat-header-avatar">💅</div>
            <div className="chat-header-info">
              <div className="chat-header-name">Dexi IA</div>
              <div className="chat-header-status">En línea</div>
            </div>
            <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.length === 0 && (
              <div className="chat-msg bot">
                <div className="chat-bubble">¡Hola! 💅 Soy Dexi IA, tu asistente virtual. ¿En qué puedo ayudarte hoy?</div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">{m.content}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-msg bot">
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviarChat()}
              placeholder="Escribí tu mensaje..."
            />
            <button className="chat-send" onClick={enviarChat} disabled={chatLoading || !chatInput.trim()}>➤</button>
          </div>
        </div>
      )}
      
      {/* MODAL ADMIN LOGIN */}
      {modalAdmin && (
        <div id="modalAdmin" className="show">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setModalAdmin(false)}>✕</button>
            <h2>👑 ACCESO ADMIN</h2>
            <div className="form-field">
              <label>USUARIO</label>
              <input className="form-input" value={adminUser} onChange={e => setAdminUser(e.target.value)} placeholder="Usuario" />
            </div>
            <div className="form-field">
              <label>CONTRASEÑA</label>
              <input className="form-input" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn-primary" onClick={adminDoLogin}>INGRESAR</button>
            <div className="cred-hint">Demo: Dro / dro2026</div>
          </div>
        </div>
      )}
      
      {/* TOAST */}
      {toast && (
        <div id="toast" className={`show ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
