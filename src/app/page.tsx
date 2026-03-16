'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

// ═══════════════════════════════════════════════════
// DEXI'S NAILS — Experiencia Cósmica
// Recreación fiel de la página original
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

interface Servicio {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  duracion: number;
  descripcion?: string;
  activo: boolean;
}

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  productos?: string;
  notas?: string;
}

interface Cupon {
  id: number;
  codigo: string;
  descuento: number;
  tipo: 'porcentaje' | 'fijo';
  usosMax: number;
  usosActuales: number;
  fechaExpira: string;
  activo: boolean;
}

interface GiftCard {
  id: number;
  codigo: string;
  saldo: number;
  comprador?: string;
  destinatario?: string;
  fechaCompra: string;
  fechaExpira?: string;
  activa: boolean;
}

interface CajaMovimiento {
  id: number;
  tipo: 'apertura' | 'cierre' | 'ingreso' | 'egreso';
  monto: number;
  concepto?: string;
  fecha: string;
  responsable: string;
}

interface AuditoriaLog {
  id: number;
  usuario: string;
  accion: string;
  modulo: string;
  detalle?: string;
  fecha: string;
}

interface Empleado {
  id: number;
  nombre: string;
  emoji: string;
  especialidad: string;
  activa: boolean;
  telefono?: string;
  email?: string;
  comision: number;
  horario?: string;
  fechaIngreso?: string;
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

// ── NUEVOS TIPOS PARA MÓDULOS DE ADMIN ──
interface Servicio {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  duracion: number;
  descripcion?: string;
  activo: boolean;
}

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono?: string;
  email?: string;
  productos: string[];
  activo: boolean;
}

interface Cupon {
  id: number;
  codigo: string;
  descuento: number;
  tipo: 'porcentaje' | 'fijo';
  vigencia: string;
  usosMax: number;
  usosActuales: number;
  activo: boolean;
}

interface GiftCard {
  id: number;
  codigo: string;
  saldo: number;
  comprador?: string;
  destinatario?: string;
  fechaCompra: string;
  fechaVencimiento?: string;
  activa: boolean;
}

interface CajaMovimiento {
  id: number;
  tipo: 'apertura' | 'cierre' | 'ingreso' | 'egreso';
  monto: number;
  concepto: string;
  responsable: string;
  fecha: string;
  detalle?: string;
}

interface Comision {
  id: number;
  profesionalId: number;
  profesionalNombre: string;
  servicio: string;
  montoServicio: number;
  porcentaje: number;
  comision: number;
  fecha: string;
  pagada: boolean;
}

interface AuditoriaLog {
  id: number;
  usuario: string;
  accion: string;
  modulo: string;
  detalle: string;
  fecha: string;
  ip?: string;
}

interface ConfigSistema {
  nombreNegocio: string;
  direccion: string;
  telefono: string;
  email: string;
  horarioApertura: string;
  horarioCierre: string;
  moneda: string;
  iva: number;
  tema: string;
}

// ── DATOS BASE ──
const PROFESIONALES_DEFAULT: Profesional[] = [
  { id: 1, nombre: 'Dexi', emoji: '👩', especialidad: 'Podología & Manicura', activa: true },
  { id: 2, nombre: 'Valentina', emoji: '💁', especialidad: 'Manicura & Diseños', activa: true },
  { id: 3, nombre: 'Carolina', emoji: '🙆', especialidad: 'Parafina & Facial', activa: true },
];

const HORARIOS = ['9:00', '9:45', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45'];

const ADMIN_DEFAULT: AdminUser[] = [
  { usuario: 'Dario', clave: 'dario2026', rol: 'admin', tipo: 'default' },
  { usuario: 'Antonio', clave: 'antonio2026', rol: 'admin', tipo: 'default' },
  { usuario: 'Decsi', clave: 'decsi2026', rol: 'admin', tipo: 'default' },
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

const SERVICIOS_DEFAULT: Servicio[] = [
  { id: 1, nombre: 'Manicura tradicional', categoria: 'Manicura', precio: 25000, duracion: 30, descripcion: 'Corte, limado y esmaltado clásico', activo: true },
  { id: 2, nombre: 'Manicura con diseños', categoria: 'Manicura', precio: 35000, duracion: 45, descripcion: 'Arte en uñas y diseños personalizados', activo: true },
  { id: 3, nombre: 'Semipermanente', categoria: 'Manicura', precio: 35000, duracion: 45, descripcion: 'Duración 2-3 semanas', activo: true },
  { id: 4, nombre: 'Press On', categoria: 'Manicura', precio: 40000, duracion: 30, descripcion: 'Uñas postizas personalizadas', activo: true },
  { id: 5, nombre: 'Podología integral', categoria: 'Podología', precio: 45000, duracion: 45, descripcion: 'Tratamiento completo de pies', activo: true },
  { id: 6, nombre: 'Pedicure tradicional', categoria: 'Podología', precio: 35000, duracion: 40, descripcion: 'Corte, limado e hidratación', activo: true },
  { id: 7, nombre: 'Terapia con parafina', categoria: 'Spa', precio: 30000, duracion: 30, descripcion: 'Hidratación profunda', activo: true },
  { id: 8, nombre: 'Limpieza facial básica', categoria: 'Facial', precio: 40000, duracion: 45, descripcion: 'Higiene profunda', activo: true },
  { id: 9, nombre: 'Limpieza facial profunda', categoria: 'Facial', precio: 65000, duracion: 60, descripcion: 'Exfoliación y mascarilla premium', activo: true },
];

const PROVEEDORES_DEFAULT: Proveedor[] = [
  { id: 1, nombre: 'Perfumes Árabes SAS', contacto: 'Ahmed Hassan', telefono: '+57 300 123 4567', email: 'ahmed@perfumesarabes.com', productos: ['Perfumes', 'Colonias'], activo: true },
  { id: 2, nombre: 'Esmaltes Pro', contacto: 'María García', telefono: '+57 310 987 6543', email: 'maria@esmaltespro.com', productos: ['Esmaltes', 'Secadores'], activo: true },
  { id: 3, nombre: 'Cosméticos Elite', contacto: 'Carlos López', telefono: '+57 320 555 1234', email: 'carlos@cosmeticoselite.com', productos: ['Cremas', 'Lociones'], activo: true },
];

const CONFIG_DEFAULT: ConfigSistema = {
  nombreNegocio: "Dexi's Nails",
  direccion: 'Calle 123 #45-67, Bogotá',
  telefono: '+57 300 123 4567',
  email: 'contacto@dexisnails.com',
  horarioApertura: '9:00',
  horarioCierre: '18:00',
  moneda: 'COP',
  iva: 19,
  tema: 'cosmico',
};

// ── FESTIVOS COLOMBIA 2025 ──
const FESTIVOS_2025 = [
  '2025-01-01', // Año Nuevo
  '2025-01-06', // Reyes Magos
  '2025-03-24', // San José
  '2025-04-17', // Jueves Santo
  '2025-04-18', // Viernes Santo
  '2025-05-01', // Día del Trabajo
  '2025-05-02', // Ascensión del Señor
  '2025-06-02', // Corpus Christi
  '2025-06-23', // Sagrado Corazón
  '2025-06-30', // San Pedro y San Pablo
  '2025-07-20', // Día de la Independencia
  '2025-08-07', // Batalla de Boyacá
  '2025-08-18', // Asunción de la Virgen
  '2025-10-13', // Día de la Raza
  '2025-11-03', // Todos los Santos
  '2025-11-17', // Independencia de Cartagena
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad
];

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
// COMPONENTE DEL JUEGO
// ═══════════════════════════════════════════════════

const GCOL = {
  fucsia: '#ff1493',
  turquesa: '#00f5d4',
  morado: '#9b5de5',
  dorado: '#ffd700',
  azul: '#00b4d8',
};

const SHIP_SPEED = 5.5;
const BULLET_SPEED = 14;
const SHIP_COOLDOWN = 150;

const POWER_DEFS = [
  { type: 'triple', icon: '🔱', color: '#ffd700', label: 'Triple Disparo', duration: 8000 },
  { type: 'shield', icon: '🛡️', color: '#00b4d8', label: 'Escudo', duration: 6000 },
  { type: 'speed', icon: '⚡', color: '#00f5d4', label: 'Turbo', duration: 6000 },
  { type: 'rapid', icon: '🔥', color: '#ff1493', label: 'Disparo Rápido', duration: 7000 },
];

function GameSection({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gameRef = useRef<{
    running: boolean;
    animId: number | null;
    ship: { x: number; y: number; rot: number; radius: number; invincible: boolean; invTimer: number; blinkTimer: number };
    mouse: { x: number; y: number };
    bullets: Array<{ x: number; y: number; vx: number; vy: number; life: number; r: number; color: string }>;
    enemies: Array<any>;
    particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; color: string }>;
    stars: Array<{ x: number; y: number; r: number; a: number; twinkle: number; speed: number }>;
    score: number;
    lives: number;
    wave: number;
    waveTimer: number;
    waveState: string;
    spawnQueue: Array<any>;
    spawnTimer: number;
    lastShot: number;
    powers: Array<{ type: string; timer: number; maxTimer: number }>;
    powerDrops: Array<any>;
    keys: Record<string, boolean>;
    touchDir: { x: number; y: number };
    frameCount: number;
    shake: number;
    teleportCd: number;
    W: number;
    H: number;
    touchTarget: { x: number; y: number } | null;
    enemyBullets: Array<any>;
    shooting: boolean;
    joystickActive: boolean;
    joystickStart: { x: number; y: number } | null;
    joystickCurrent: { x: number; y: number } | null;
  } | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [waveAnn, setWaveAnn] = useState('');
  const [activePowers, setActivePowers] = useState<Array<{ type: string; icon: string; color: string; pct: number }>>([]);
  const [teleportReady, setTeleportReady] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);

  // Helper functions - defined before useEffect
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const hasPower = (t: string) => gameRef.current?.powers.some(p => p.type === t) || false;

  const particleBurst = (x: number, y: number, color: string, count = 12, spread = 50) => {
    if (!gameRef.current) return;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), spd = rand(1, spread / 15);
      gameRef.current.particles.push({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        life: rand(20, 50), maxLife: 50, r: rand(2, 6), color,
      });
    }
  };

  // Audio functions
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playSound = (type: 'shoot' | 'explosion' | 'hit' | 'powerup' | 'gameover' | 'wave') => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      switch (type) {
        case 'shoot':
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'explosion':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'hit':
          osc.type = 'square';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'powerup':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        case 'gameover':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.8);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        case 'wave':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
          osc.frequency.exponentialRampToValueAtTime(990, now + 0.3);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
      }
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  const buildWave = (w: number) => {
    if (!gameRef.current) return;
    const queue: any[] = [];
    const base = 4 + w * 2;

    for (let i = 0; i < base; i++) {
      const size = w < 3 ? 'big' : Math.random() < 0.4 ? 'big' : 'medium';
      queue.push({ type: 'asteroid', size, delay: i * 380 });
    }

    if (w >= 2) {
      const fc = Math.min(2 + w, 8);
      for (let i = 0; i < fc; i++) queue.push({ type: 'formation', index: i, total: fc, delay: 1300 + i * 160 });
    }

    if (w >= 3) {
      const kc = Math.min(w - 1, 6);
      for (let i = 0; i < kc; i++) queue.push({ type: 'kamikaze', delay: 2300 + i * 550 });
    }

    gameRef.current.spawnQueue = queue;
    gameRef.current.spawnTimer = 0;
    gameRef.current.waveState = 'announcing';
    gameRef.current.waveTimer = 130;
  };

  const spawnEnemy = (spec: any) => {
    if (!gameRef.current) return;
    const { W, H, ship } = gameRef.current;
    let x: number, y: number;
    const side = Math.floor(rand(0, 4));
    if (side === 0) { x = rand(0, W); y = -70; }
    else if (side === 1) { x = W + 70; y = rand(0, H); }
    else if (side === 2) { x = rand(0, W); y = H + 70; }
    else { x = -70; y = rand(0, H); }

    const wave = gameRef.current.wave;

    if (spec.type === 'asteroid') {
      const sz: Record<string, { r: number; hp: number; pts: number; spd: number }> = {
        big: { r: 30, hp: 3, pts: 100, spd: 0.9 },
        medium: { r: 20, hp: 2, pts: 60, spd: 1.3 },
        small: { r: 12, hp: 1, pts: 30, spd: 1.8 },
      };
      const s = sz[spec.size || 'big'];
      gameRef.current.enemies.push({
        type: 'asteroid', x, y, radius: s.r + rand(-3, 3),
        hp: s.hp, maxHp: s.hp, pts: s.pts,
        speed: s.spd * (1 + (wave - 1) * 0.1),
        rot: rand(0, Math.PI * 2), rotSpd: rand(-0.025, 0.025),
        color: ['#c0c0c0', '#a9a9a9', '#808080', '#696969'][Math.floor(rand(0, 4))],
        craters: Array.from({ length: Math.floor(rand(2, 5)) }, () => ({ x: rand(-s.r * 0.5, s.r * 0.5), y: rand(-s.r * 0.5, s.r * 0.5), r: rand(s.r * 0.1, s.r * 0.3) })),
        size: spec.size || 'big', ai: 'chase',
      });
    } else if (spec.type === 'kamikaze') {
      const spd = 3.5 + wave * 0.15;
      const dx = ship.x - x, dy = ship.y - y;
      const len = Math.hypot(dx, dy) || 1;
      gameRef.current.enemies.push({
        type: 'kamikaze', x, y,
        vx: dx / len * spd, vy: dy / len * spd,
        radius: 10, hp: 1, maxHp: 1, pts: 50,
        speed: spd, rot: Math.atan2(dy, dx),
        rotSpd: 0, color: GCOL.fucsia, ai: 'kamikaze',
      });
    }
  };

  const shoot = () => {
    if (!gameRef.current?.running) return;
    const cd = hasPower('rapid') ? SHIP_COOLDOWN * 0.4 : SHIP_COOLDOWN;
    if (Date.now() - gameRef.current.lastShot < cd) return;
    gameRef.current.lastShot = Date.now();

    playSound('shoot');

    const { ship, mouse } = gameRef.current;
    const dx = mouse.x - ship.x, dy = mouse.y - ship.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len, ny = dy / len;

    gameRef.current.bullets.push({
      x: ship.x + nx * 36, y: ship.y + ny * 36,
      vx: nx * BULLET_SPEED, vy: ny * BULLET_SPEED,
      life: 80, r: hasPower('triple') ? 5 : 4,
      color: hasPower('rapid') ? GCOL.fucsia : GCOL.turquesa,
    });

    if (hasPower('triple')) {
      const base = Math.atan2(ny, nx);
      gameRef.current.bullets.push({
        x: ship.x + Math.cos(base + 0.25) * 36, y: ship.y + Math.sin(base + 0.25) * 36,
        vx: Math.cos(base + 0.25) * BULLET_SPEED, vy: Math.sin(base + 0.25) * BULLET_SPEED,
        life: 80, r: 5, color: GCOL.turquesa,
      });
      gameRef.current.bullets.push({
        x: ship.x + Math.cos(base - 0.25) * 36, y: ship.y + Math.sin(base - 0.25) * 36,
        vx: Math.cos(base - 0.25) * BULLET_SPEED, vy: Math.sin(base - 0.25) * BULLET_SPEED,
        life: 80, r: 5, color: GCOL.turquesa,
      });
    }
  };

  const teleport = () => {
    if (!gameRef.current?.running || gameRef.current.teleportCd > 0) return;

    const { ship, W, H, enemies } = gameRef.current;
    particleBurst(ship.x, ship.y, GCOL.morado, 24, 90);

    let nx: number, ny: number, attempts = 0;
    do {
      nx = rand(40, W - 40);
      ny = rand(40, H - 40);
      attempts++;
    } while (attempts < 20 && enemies.some(e => Math.hypot(e.x - nx, e.y - ny) < 100));

    ship.x = nx;
    ship.y = ny;
    ship.invincible = true;
    ship.invTimer = 60;
    ship.blinkTimer = 0;

    particleBurst(ship.x, ship.y, GCOL.turquesa, 24, 90);
    gameRef.current.teleportCd = 300;
  };

  const hitEnemy = (j: number) => {
    const g = gameRef.current;
    if (!g) return;
    const en = g.enemies[j];
    if (!en) return;
    en.hp--;
    g.shake = Math.min(g.shake + 2, 10);
    particleBurst(en.x, en.y, en.color, 6, 30);
    if (en.hp > 0) return;

    // Dead
    particleBurst(en.x, en.y, en.color, 18, 80);
    playSound('explosion');
    g.score += en.pts;
    setScore(g.score);
    g.enemies.splice(j, 1);

    // Drop power
    if (Math.random() < 0.28) {
      const def = POWER_DEFS[Math.floor(rand(0, POWER_DEFS.length))];
      g.powerDrops.push({ ...def, x: en.x, y: en.y, vy: -1.5, life: 360, maxLife: 360, bob: rand(0, Math.PI * 2) });
    }

    // Split asteroids
    if (en.type === 'asteroid' && en.size === 'big') {
      for (let k = 0; k < 2; k++) {
        g.enemies.push({
          type: 'asteroid', x: en.x + rand(-20, 20), y: en.y + rand(-20, 20),
          radius: 20 + rand(-3, 3), hp: 2, maxHp: 2, pts: 60,
          speed: en.speed * 1.4, rot: rand(0, Math.PI * 2), rotSpd: rand(-0.03, 0.03),
          color: '#808080', craters: [], size: 'medium', ai: 'chase',
        });
      }
    }
  };

  const shipHit = (enemyIdx: number) => {
    const g = gameRef.current;
    if (!g || g.ship.invincible) return;
    g.lives--;
    setLives(g.lives);
    playSound('hit');
    g.shake = 15;
    particleBurst(g.ship.x, g.ship.y, GCOL.fucsia, 25, 90);
    if (enemyIdx >= 0 && g.enemies[enemyIdx]) g.enemies.splice(enemyIdx, 1);
    if (g.lives <= 0) {
      g.running = false;
      setGameOver(true);
      playSound('gameover');
      return;
    }
    g.ship.invincible = true;
    g.ship.invTimer = 180;
    g.ship.blinkTimer = 0;
  };

  const update = () => {
    const g = gameRef.current;
    if (!g?.running) return;

    g.frameCount++;
    g.shake = Math.max(0, g.shake - 0.6);

    // Wave announcing
    if (g.waveState === 'announcing') {
      if (--g.waveTimer <= 0) g.waveState = 'spawning';
      return;
    }

    // Spawn queue
    if (g.waveState === 'spawning' && g.spawnQueue.length > 0) {
      g.spawnTimer++;
      while (g.spawnQueue.length && g.spawnTimer >= g.spawnQueue[0].delay / 16.6) {
        spawnEnemy(g.spawnQueue.shift());
      }
      if (g.spawnQueue.length === 0) g.waveState = 'playing';
    }

    // Next wave
    if (g.waveState === 'playing' && g.enemies.length === 0 && g.spawnQueue.length === 0) {
      g.wave++;
      setWave(g.wave);
      setWaveAnn(`OLEADA ${g.wave}`);
      playSound('wave');
      setTimeout(() => setWaveAnn(''), 1800);
      buildWave(g.wave);
      return;
    }

    // Ship movement
    let dx = 0, dy = 0;
    if (g.keys['ArrowUp'] || g.keys['KeyW']) dy -= SHIP_SPEED;
    if (g.keys['ArrowDown'] || g.keys['KeyS']) dy += SHIP_SPEED;
    if (g.keys['ArrowLeft'] || g.keys['KeyA']) dx -= SHIP_SPEED;
    if (g.keys['ArrowRight'] || g.keys['KeyD']) dx += SHIP_SPEED;

    // Joystick movement
    if (g.touchDir.x !== 0 || g.touchDir.y !== 0) {
      dx += g.touchDir.x * SHIP_SPEED;
      dy += g.touchDir.y * SHIP_SPEED;
    }

    // Continuous shooting on mobile
    if (g.shooting && g.frameCount % 10 === 0) {
      shoot();
    }

    const spd = hasPower('speed') ? 1.65 : 1;
    const margin = 28;
    g.ship.x += dx * spd;
    g.ship.y += dy * spd;

    // Wrap around
    if (g.ship.x < -margin) g.ship.x = g.W + margin;
    if (g.ship.x > g.W + margin) g.ship.x = -margin;
    if (g.ship.y < -margin) g.ship.y = g.H + margin;
    if (g.ship.y > g.H + margin) g.ship.y = -margin;

    if (dx || dy) {
      g.ship.rot = Math.atan2(dy, dx) + Math.PI / 2;
      const len = Math.hypot(dx, dy) || 1;
      g.mouse.x = g.ship.x + (dx / len) * 200;
      g.mouse.y = g.ship.y + (dy / len) * 200;
    } else {
      const mx = g.mouse.x - g.ship.x, my = g.mouse.y - g.ship.y;
      if (Math.hypot(mx, my) > 20) g.ship.rot = Math.atan2(my, mx) + Math.PI / 2;
    }

    // Invincibility
    if (g.ship.invincible) {
      g.ship.blinkTimer++;
      if (--g.ship.invTimer <= 0) {
        g.ship.invincible = false;
        g.ship.invTimer = 0;
      }
    }

    // Teleport cooldown
    if (g.teleportCd > 0) {
      g.teleportCd--;
      setTeleportReady(g.teleportCd === 0);
    }

    // Power timers
    g.powers = g.powers.filter(p => {
      p.timer -= 16.6;
      return p.timer > 0;
    });

    // Update active powers display
    if (g.frameCount % 6 === 0) {
      setActivePowers(g.powers.map(p => {
        const def = POWER_DEFS.find(d => d.type === p.type)!;
        return { type: p.type, icon: def.icon, color: def.color, pct: Math.round(p.timer / p.maxTimer * 100) };
      }));
    }

    // Power drops
    for (let i = g.powerDrops.length - 1; i >= 0; i--) {
      const d = g.powerDrops[i];
      d.y += d.vy;
      d.vy = lerp(d.vy, 0, 0.05);
      d.life--;
      d.bob += 0.06;
      if (d.life <= 0) { g.powerDrops.splice(i, 1); continue; }
      if (Math.hypot(d.x - g.ship.x, d.y - g.ship.y) < g.ship.radius + 16) {
        g.powers = g.powers.filter(p => p.type !== d.type);
        g.powers.push({ type: d.type, timer: d.duration, maxTimer: d.duration });
        particleBurst(d.x, d.y, d.color, 18, 60);
        playSound('powerup');
        g.powerDrops.splice(i, 1);
      }
    }

    // Bullets
    for (let i = g.bullets.length - 1; i >= 0; i--) {
      const b = g.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < -40 || b.x > g.W + 40 || b.y < -40 || b.y > g.H + 40) {
        g.bullets.splice(i, 1);
        continue;
      }
      for (let j = g.enemies.length - 1; j >= 0; j--) {
        const en = g.enemies[j];
        if (Math.hypot(b.x - en.x, b.y - en.y) < b.r + en.radius) {
          g.bullets.splice(i, 1);
          hitEnemy(j);
          break;
        }
      }
    }

    // Enemies
    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const en = g.enemies[i];
      if (en.ai === 'chase') {
        const dx2 = g.ship.x - en.x, dy2 = g.ship.y - en.y;
        const len = Math.hypot(dx2, dy2) || 1;
        en.x += dx2 / len * en.speed;
        en.y += dy2 / len * en.speed;
        en.rot += en.rotSpd;
      } else if (en.ai === 'kamikaze') {
        en.x += en.vx;
        en.y += en.vy;
        en.rot = Math.atan2(en.vy, en.vx);
        if (en.x < -90 || en.x > g.W + 90 || en.y < -90 || en.y > g.H + 90) {
          g.enemies.splice(i, 1);
          continue;
        }
      }

      // Collision with ship
      if (!g.ship.invincible && Math.hypot(en.x - g.ship.x, en.y - g.ship.y) < en.radius + g.ship.radius - 8) {
        if (hasPower('shield')) {
          g.powers = g.powers.filter(p => p.type !== 'shield');
          particleBurst(g.ship.x, g.ship.y, GCOL.azul, 20, 70);
        } else {
          shipHit(i);
        }
      }
    }

    // Enemy bullets
    for (let i = g.enemyBullets.length - 1; i >= 0; i--) {
      const b = g.enemyBullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0 || b.x < -20 || b.x > g.W + 20 || b.y < -20 || b.y > g.H + 20) {
        g.enemyBullets.splice(i, 1);
        continue;
      }
      if (!g.ship.invincible && Math.hypot(b.x - g.ship.x, b.y - g.ship.y) < g.ship.radius + b.r) {
        if (hasPower('shield')) {
          g.powers = g.powers.filter(p => p.type !== 'shield');
          particleBurst(g.ship.x, g.ship.y, GCOL.azul, 20, 70);
        } else {
          shipHit(-1);
        }
        g.enemyBullets.splice(i, 1);
      }
    }

    // Particles
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const p = g.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.life--;
      if (p.life <= 0) g.particles.splice(i, 1);
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    const g = gameRef.current;
    if (!canvas || !g) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { W, H, ship, stars, particles, bullets, enemies, powerDrops, enemyBullets, mouse, frameCount } = g;

    ctx.save();
    if (g.shake > 0) ctx.translate(rand(-g.shake, g.shake), rand(-g.shake, g.shake));

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(3,4,14,0.08)';
    ctx.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(frameCount * s.speed + s.twinkle));
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Power drops
    powerDrops.forEach(d => {
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
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText(d.icon, 0, 1);
      ctx.restore();
    });

    // Particles
    particles.forEach(p => {
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
    bullets.forEach(b => {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Enemies
    enemies.forEach(en => {
      ctx.save();
      ctx.translate(en.x, en.y);
      ctx.rotate(en.rot);
      ctx.shadowBlur = 18;
      ctx.shadowColor = en.color;

      if (en.ai === 'chase' || en.type === 'asteroid') {
        ctx.fillStyle = en.color;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          const noise = 0.72 + 0.28 * Math.sin(a * 3.7 + en.rot * 0.5 + en.radius * 0.3);
          const r = en.radius * noise;
          i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (en.maxHp > 1) {
          const bw = en.radius * 2.2, bh = 5, by = en.radius + 8;
          ctx.fillStyle = 'rgba(0,0,0,.5)';
          ctx.fillRect(-bw / 2, by, bw, bh);
          const ratio = en.hp / en.maxHp;
          ctx.fillStyle = ratio > 0.5 ? GCOL.turquesa : ratio > 0.25 ? GCOL.dorado : GCOL.fucsia;
          ctx.fillRect(-bw / 2, by, bw * ratio, bh);
        }
      } else if (en.ai === 'kamikaze') {
        ctx.fillStyle = GCOL.fucsia;
        ctx.beginPath();
        ctx.moveTo(0, -en.radius);
        ctx.lineTo(-en.radius * 0.7, en.radius * 0.7);
        ctx.lineTo(0, en.radius * 0.3);
        ctx.lineTo(en.radius * 0.7, en.radius * 0.7);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // Ship
    if (!(ship.invincible && Math.floor(ship.blinkTimer / 8) % 2 === 0)) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.rot);
      ctx.shadowBlur = 25;
      ctx.shadowColor = hasPower('shield') ? GCOL.azul : GCOL.turquesa;

      if (hasPower('shield')) {
        ctx.globalAlpha = 0.3 + 0.15 * Math.sin(frameCount * 0.15);
        ctx.strokeStyle = GCOL.azul;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, ship.radius + 12, 0, Math.PI * 2);
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

      ctx.restore();
    }

    // Crosshair
    ctx.save();
    ctx.strokeStyle = 'rgba(0,245,212,.7)';
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = GCOL.turquesa;
    ctx.beginPath();
    ctx.moveTo(mouse.x - 15, mouse.y);
    ctx.lineTo(mouse.x - 5, mouse.y);
    ctx.moveTo(mouse.x + 5, mouse.y);
    ctx.lineTo(mouse.x + 15, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 15);
    ctx.lineTo(mouse.x, mouse.y - 5);
    ctx.moveTo(mouse.x, mouse.y + 5);
    ctx.lineTo(mouse.x, mouse.y + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Joystick indicator
    if (g.joystickActive && g.joystickStart && g.joystickCurrent) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,245,212,.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(g.joystickStart.x, g.joystickStart.y, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(g.joystickCurrent.x, g.joystickCurrent.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,245,212,.3)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Play video
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    const W = container.offsetWidth || window.innerWidth;
    const H = container.offsetHeight || window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Generate stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
    }));

    gameRef.current = {
      running: true,
      animId: null,
      ship: { x: W / 2, y: H / 2, rot: -Math.PI / 2, radius: 22, invincible: false, invTimer: 0, blinkTimer: 0 },
      mouse: { x: W / 2, y: H / 2 - 100 },
      bullets: [],
      enemies: [],
      particles: [],
      stars,
      score: 0,
      lives: 3,
      wave: 1,
      waveTimer: 130,
      waveState: 'announcing',
      spawnQueue: [],
      spawnTimer: 0,
      lastShot: 0,
      powers: [],
      powerDrops: [],
      keys: {},
      touchDir: { x: 0, y: 0 },
      frameCount: 0,
      shake: 0,
      teleportCd: 0,
      W,
      H,
      touchTarget: null,
      enemyBullets: [],
      shooting: false,
      joystickActive: false,
      joystickStart: null,
      joystickCurrent: null,
    };

    // Initialize first wave after mount
    requestAnimationFrame(() => {
      setWaveAnn('¡COMIENZA!');
      playSound('wave');
      setTimeout(() => setWaveAnn(''), 1800);
      buildWave(1);
    });

    // Key handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current?.running) return;
      gameRef.current.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'Space') shoot();
      if (e.code === 'KeyT') teleport();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameRef.current) gameRef.current.keys[e.code] = false;
    };

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameRef.current || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      gameRef.current.mouse.x = e.clientX - rect.left;
      gameRef.current.mouse.y = e.clientY - rect.top;
    };
    const handleMouseDown = () => shoot();

    // Touch handlers with joystick
    const handleTouchStart = (e: TouchEvent) => {
      if (!gameRef.current || !canvas) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const tx = touch.clientX - rect.left;
      const ty = touch.clientY - rect.top;

      // Left half = joystick zone
      if (tx < W / 2) {
        gameRef.current.joystickActive = true;
        gameRef.current.joystickStart = { x: tx, y: ty };
        gameRef.current.joystickCurrent = { x: tx, y: ty };
      } else {
        // Right half = shoot zone
        gameRef.current.shooting = true;
        gameRef.current.mouse.x = tx;
        gameRef.current.mouse.y = ty;
        shoot();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gameRef.current || !canvas) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const tx = touch.clientX - rect.left;
      const ty = touch.clientY - rect.top;

      if (gameRef.current.joystickActive) {
        gameRef.current.joystickCurrent = { x: tx, y: ty };
        const dx = tx - (gameRef.current.joystickStart?.x || tx);
        const dy = ty - (gameRef.current.joystickStart?.y || ty);
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          gameRef.current.touchDir.x = dx / dist;
          gameRef.current.touchDir.y = dy / dist;
        } else {
          gameRef.current.touchDir.x = 0;
          gameRef.current.touchDir.y = 0;
        }
      } else if (tx >= W / 2) {
        gameRef.current.mouse.x = tx;
        gameRef.current.mouse.y = ty;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameRef.current) return;
      e.preventDefault();
      
      // Check if any touch remains
      if (e.touches.length === 0) {
        gameRef.current.joystickActive = false;
        gameRef.current.joystickStart = null;
        gameRef.current.joystickCurrent = null;
        gameRef.current.touchDir.x = 0;
        gameRef.current.touchDir.y = 0;
        gameRef.current.shooting = false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Game loop
    const tick = () => {
      if (!gameRef.current || !canvas) return;
      update();
      render();
      if (gameRef.current.running) {
        gameRef.current.animId = requestAnimationFrame(tick);
      }
    };
    gameRef.current.animId = requestAnimationFrame(tick);

    return () => {
      if (gameRef.current?.animId) cancelAnimationFrame(gameRef.current.animId);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [onExit]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        overflow: 'hidden',
        background: '#03040e',
      }}
    >
      <video
        ref={videoRef}
        src="/Universo.mp4"
        loop
        playsInline
        muted={videoMuted}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.6,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          cursor: 'crosshair',
        }}
      />
      {/* HUD */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 10, left: 14, fontFamily: 'Orbitron, sans-serif', fontSize: '0.78rem', color: GCOL.dorado, textShadow: `0 0 12px ${GCOL.dorado}`, letterSpacing: 2 }}>⭐ {score}</div>
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: GCOL.turquesa, letterSpacing: 3, whiteSpace: 'nowrap' }}>OLEADA {wave}</div>
        <div style={{ position: 'absolute', top: 10, right: 14, fontSize: '0.95rem' }}>{'❤️'.repeat(Math.max(0, lives))}</div>
        <button
          onClick={() => setVideoMuted(!videoMuted)}
          style={{
            position: 'absolute', top: 10, right: 70,
            background: 'rgba(0,0,0,.6)', border: `1px solid ${videoMuted ? 'rgba(255,255,255,.3)' : GCOL.turquesa}`, color: videoMuted ? 'rgba(255,255,255,.5)' : GCOL.turquesa,
            width: 28, height: 28, borderRadius: '50%', fontSize: '0.8rem',
            cursor: 'pointer', pointerEvents: 'all', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={videoMuted ? 'Activar sonido' : 'Silenciar'}
        >{videoMuted ? '🔇' : '🔊'}</button>
        <button
          onClick={onExit}
          style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%) translateY(26px)',
            background: 'rgba(0,0,0,.6)', border: '1px solid rgba(0,245,212,.5)', color: GCOL.turquesa,
            padding: '3px 12px', borderRadius: 20, fontFamily: 'Orbitron, sans-serif', fontSize: '0.48rem',
            letterSpacing: 1, cursor: 'pointer', pointerEvents: 'all', zIndex: 20, whiteSpace: 'nowrap',
          }}
        >✕ SALIR</button>
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, pointerEvents: 'none' }}>
          {activePowers.map(p => (
            <div key={p.type} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,.5)', border: `1px solid ${p.color}`, borderRadius: 20, padding: '3px 8px', fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: p.color }}>
              {p.icon}
              <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,.15)', borderRadius: 2 }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={teleport}
          disabled={!teleportReady}
          title={teleportReady ? 'Teletransportación [T]' : 'Recargando...'}
          style={{
            position: 'absolute', bottom: 12, right: 14, width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(155,93,229,.25)', border: `2px solid ${GCOL.morado}`, color: GCOL.morado,
            fontSize: '1.1rem', cursor: teleportReady ? 'pointer' : 'not-allowed', pointerEvents: 'all',
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: teleportReady ? 1 : 0.4,
            zIndex: 20,
          }}
        >🌀</button>
        {waveAnn && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 900,
            color: GCOL.dorado, textShadow: `0 0 60px ${GCOL.dorado}`, letterSpacing: 6, whiteSpace: 'nowrap', zIndex: 20,
          }}>{waveAnn}</div>
        )}
      </div>
      {/* Game Over */}
      {gameOver && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,.88)', backdropFilter: 'blur(14px)',
          zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: 20,
        }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(1.2rem, 6vw, 2.5rem)', color: GCOL.fucsia, textShadow: `0 0 40px ${GCOL.fucsia}`, letterSpacing: 4 }}>💀 GAME OVER</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(0.85rem, 4vw, 1.3rem)', color: GCOL.dorado }}>Puntuación: {score}</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(0.55rem, 2.5vw, 0.7rem)', color: 'rgba(255,215,0,.6)' }}>Oleada {wave}</div>
          <button
            onClick={() => { setGameOver(false); setScore(0); setLives(3); setWave(1); }}
            style={{ marginTop: 16, background: 'linear-gradient(135deg, var(--c-turquesa), var(--c-fucsia))', border: 'none', borderRadius: 25, padding: '12px 32px', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: 'white', cursor: 'pointer', pointerEvents: 'all' }}
          >JUGAR DE NUEVO</button>
          <button onClick={onExit} style={{ marginTop: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 20, padding: '8px 24px', fontFamily: 'Orbitron, sans-serif', fontSize: '0.6rem', color: 'white', cursor: 'pointer', pointerEvents: 'all' }}>SALIR</button>
        </div>
      )}
    </div>
  );
}

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
      return a ? JSON.parse(a) : null;
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
  
  // ── NUEVOS ESTADOS PARA MÓDULOS DE ADMIN ──
  const [servicios, setServicios] = useState<Servicio[]>(() => LS.get('servicios', SERVICIOS_DEFAULT));
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => LS.get('proveedores', PROVEEDORES_DEFAULT));
  const [cupones, setCupones] = useState<Cupon[]>(() => LS.get('cupones', []));
  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => LS.get('giftCards', []));
  const [cajaMovimientos, setCajaMovimientos] = useState<CajaMovimiento[]>(() => LS.get('cajaMovimientos', []));
  const [comisiones, setComisiones] = useState<Comision[]>(() => LS.get('comisiones', []));
  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaLog[]>(() => LS.get('auditoriaLogs', []));
  const [config, setConfig] = useState<ConfigSistema>(() => LS.get('config', CONFIG_DEFAULT));
  
  // UI States
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [modalAdmin, setModalAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState('stats');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
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
  const [iaResultado, setIaResultado] = useState<{
    nombre: string;
    confianza: number;
    recs: string[];
    especialista: string;
  } | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaImage, setIaImage] = useState<string | null>(null);
  const [iaImageLoading, setIaImageLoading] = useState(false);
  
  // Admin panel states
  const [bloquearProf, setBloquearProf] = useState('todos');
  const [bloquearFecha, setBloquearFecha] = useState('');
  const [bloquearMotivo, setBloquearMotivo] = useState('');
  
  // Estados para formularios admin
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', categoria: 'manicura', precio: 0, duracion: 30, descripcion: '' });
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: '', contacto: '', telefono: '', email: '', productos: '' });
  const [nuevoCupon, setNuevoCupon] = useState({ codigo: '', descuento: 0, tipo: 'porcentaje' as const, usosMax: 1, fechaExpira: '' });
  const [nuevaGiftCard, setNuevaGiftCard] = useState({ saldo: 50000, comprador: '', destinatario: '' });
  const [movimientoCaja, setMovimientoCaja] = useState({ tipo: 'ingreso' as const, monto: 0, concepto: '' });
  const [nuevoAdminUser, setNuevoAdminUser] = useState({ usuario: '', clave: '', rol: 'admin' });
  
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
  
  // Análisis de imagen con VLM
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setIaImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);
  
  const iaAnalizarImagen = useCallback(async () => {
    if (!iaImage) {
      showToast('Sube una foto primero', 'error');
      return;
    }
    
    setIaImageLoading(true);
    
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: iaImage,
          prompt: 'Eres un especialista en podología y manicura. Analiza esta imagen de pies, uñas o manos. Identifica posibles condiciones como: hongos, pie de atleta, callosidades, uñas encarnadas, piel seca, grietas, verrugas, problemas de cutícula, infecciones. Responde SOLO en formato JSON: {"nombre":"diagnóstico principal","confianza":75,"recs":["recomendación 1","recomendación 2","recomendación 3"],"especialista":"nombre del especialista recomendado"}. Si no puedes identificar claramente algo, sugiere consulta general.'
        }),
      });
      
      const data = await res.json();
      
      if (data.result) {
        // Parse the result if it's a string
        let parsed = data.result;
        if (typeof data.result === 'string') {
          const jsonMatch = data.result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        }
        
        setIaResultado({
          nombre: parsed.nombre || 'Análisis de imagen',
          confianza: parsed.confianza || 70,
          recs: parsed.recs || ['Consulta con especialista recomendada'],
          especialista: parsed.especialista || 'Dexi (Podología)',
        });
      } else {
        showToast('No se pudo analizar la imagen', 'error');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      showToast('Error al analizar la imagen', 'error');
    }
    
    setIaImageLoading(false);
  }, [iaImage, showToast]);
  
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
          messages: [...chatMessages, { role: 'user', content: userMsg }],
          clienteNombre: clienteActual?.nombre,
        }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '💫 Hola! Soy Dexi IA, tu asistente virtual. ¿En qué puedo ayudarte?' }]);
    }
    setChatLoading(false);
  }, [chatInput, chatLoading, chatMessages, clienteActual]);
  
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
  
  // Funciones de auditoría
  const registrarAuditoria = useCallback((accion: string, modulo: string, detalle?: string) => {
    if (!adminActual) return;
    const log: AuditoriaLog = {
      id: Date.now(),
      usuario: adminActual.usuario,
      accion,
      modulo,
      detalle,
      fecha: new Date().toISOString(),
    };
    const nuevos = [...auditoriaLogs, log];
    setAuditoriaLogs(nuevos);
    LS.set('auditoriaLogs', nuevos);
  }, [adminActual, auditoriaLogs]);
  
  // Funciones de Servicios
  const agregarServicio = useCallback(() => {
    if (!nuevoServicio.nombre) return showToast('Ingresa el nombre del servicio', 'error');
    const srv: Servicio = {
      id: Date.now(),
      ...nuevoServicio,
      activo: true,
    };
    const nuevos = [...servicios, srv];
    setServicios(nuevos);
    LS.set('servicios', nuevos);
    setNuevoServicio({ nombre: '', categoria: 'manicura', precio: 0, duracion: 30, descripcion: '' });
    registrarAuditoria('Crear', 'Servicios', srv.nombre);
    showToast('✅ Servicio agregado');
  }, [nuevoServicio, servicios, showToast, registrarAuditoria]);
  
  const toggleServicioActivo = useCallback((id: number) => {
    const nuevos = servicios.map(s => s.id === id ? { ...s, activo: !s.activo } : s);
    setServicios(nuevos);
    LS.set('servicios', nuevos);
    showToast('Estado actualizado');
  }, [servicios, showToast]);
  
  const eliminarServicio = useCallback((id: number) => {
    const srv = servicios.find(s => s.id === id);
    const nuevos = servicios.filter(s => s.id !== id);
    setServicios(nuevos);
    LS.set('servicios', nuevos);
    registrarAuditoria('Eliminar', 'Servicios', srv?.nombre);
    showToast('Servicio eliminado');
  }, [servicios, showToast, registrarAuditoria]);
  
  // Funciones de Proveedores
  const agregarProveedor = useCallback(() => {
    if (!nuevoProveedor.nombre) return showToast('Ingresa el nombre del proveedor', 'error');
    const prov: Proveedor = {
      id: Date.now(),
      ...nuevoProveedor,
    };
    const nuevos = [...proveedores, prov];
    setProveedores(nuevos);
    LS.set('proveedores', nuevos);
    setNuevoProveedor({ nombre: '', contacto: '', telefono: '', email: '', productos: '' });
    registrarAuditoria('Crear', 'Proveedores', prov.nombre);
    showToast('✅ Proveedor agregado');
  }, [nuevoProveedor, proveedores, showToast, registrarAuditoria]);
  
  const eliminarProveedor = useCallback((id: number) => {
    const nuevos = proveedores.filter(p => p.id !== id);
    setProveedores(nuevos);
    LS.set('proveedores', nuevos);
    registrarAuditoria('Eliminar', 'Proveedores');
    showToast('Proveedor eliminado');
  }, [proveedores, showToast, registrarAuditoria]);
  
  // Funciones de Cupones
  const agregarCupon = useCallback(() => {
    if (!nuevoCupon.codigo) return showToast('Ingresa el código del cupón', 'error');
    const cup: Cupon = {
      id: Date.now(),
      ...nuevoCupon,
      usosActuales: 0,
      activo: true,
    };
    const nuevos = [...cupones, cup];
    setCupones(nuevos);
    LS.set('cupones', nuevos);
    setNuevoCupon({ codigo: '', descuento: 0, tipo: 'porcentaje', usosMax: 1, fechaExpira: '' });
    registrarAuditoria('Crear', 'Cupones', cup.codigo);
    showToast('✅ Cupón creado');
  }, [nuevoCupon, cupones, showToast, registrarAuditoria]);
  
  const toggleCuponActivo = useCallback((id: number) => {
    const nuevos = cupones.map(c => c.id === id ? { ...c, activo: !c.activo } : c);
    setCupones(nuevos);
    LS.set('cupones', nuevos);
    showToast('Estado actualizado');
  }, [cupones, showToast]);
  
  // Funciones de Gift Cards
  const agregarGiftCard = useCallback(() => {
    const codigo = 'GIFT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const gc: GiftCard = {
      id: Date.now(),
      codigo,
      ...nuevaGiftCard,
      fechaCompra: new Date().toISOString(),
      activa: true,
    };
    const nuevos = [...giftCards, gc];
    setGiftCards(nuevos);
    LS.set('giftcards', nuevos);
    setNuevaGiftCard({ saldo: 50000, comprador: '', destinatario: '' });
    registrarAuditoria('Crear', 'Gift Cards', gc.codigo);
    showToast(`✅ Gift Card: ${codigo}`);
  }, [nuevaGiftCard, giftCards, showToast, registrarAuditoria]);
  
  // Funciones de Caja
  const agregarMovimientoCaja = useCallback(() => {
    if (!adminActual) return;
    const mov: CajaMovimiento = {
      id: Date.now(),
      ...movimientoCaja,
      fecha: new Date().toISOString(),
      responsable: adminActual.usuario,
    };
    const nuevos = [...cajaMovimientos, mov];
    setCajaMovimientos(nuevos);
    LS.set('cajaMovimientos', nuevos);
    setMovimientoCaja({ tipo: 'ingreso', monto: 0, concepto: '' });
    registrarAuditoria(mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1), 'Caja', mov.concepto);
    showToast('✅ Movimiento registrado');
  }, [movimientoCaja, cajaMovimientos, adminActual, showToast, registrarAuditoria]);
  
  // Calcular saldo de caja
  const calcularSaldoCaja = useCallback(() => {
    return cajaMovimientos.reduce((saldo, m) => {
      if (m.tipo === 'apertura' || m.tipo === 'ingreso') return saldo + m.monto;
      return saldo - m.monto;
    }, 0);
  }, [cajaMovimientos]);
  
  // Funciones de Comisiones
  const calcularComisiones = useCallback(() => {
    const nuevasComisiones: Comision[] = [];
    const porcentajeComision = 15; // 15% de comisión
    
    reservas.forEach(r => {
      const servicio = servicios.find(s => s.nombre.toLowerCase().includes(r.servicio?.toLowerCase() || ''));
      if (servicio) {
        const comisionMonto = Math.round(servicio.precio * porcentajeComision / 100);
        nuevasComisiones.push({
          id: Date.now() + Math.random(),
          profesionalId: r.profesional,
          profesionalNombre: r.profesionalNombre,
          servicio: r.servicio || 'Servicio',
          montoServicio: servicio.precio,
          porcentaje: porcentajeComision,
          comision: comisionMonto,
          fecha: r.fecha,
          pagada: false,
        });
      }
    });
    
    setComisiones(nuevasComisiones);
    LS.set('comisiones', nuevasComisiones);
    registrarAuditoria('Calcular', 'Comisiones', `${nuevasComisiones.length} comisiones`);
    showToast(`✅ ${nuevasComisiones.length} comisiones calculadas`);
  }, [reservas, servicios, showToast, registrarAuditoria]);
  
  const pagarComision = useCallback((id: number) => {
    const nuevas = comisiones.map(c => c.id === id ? { ...c, pagada: true } : c);
    setComisiones(nuevas);
    LS.set('comisiones', nuevas);
    registrarAuditoria('Pagar', 'Comisiones', `ID: ${id}`);
    showToast('Comisión marcada como pagada');
  }, [comisiones, showToast, registrarAuditoria]);
  
  // Funciones de Admin Users
  const agregarAdminUser = useCallback(() => {
    if (!nuevoAdminUser.usuario || !nuevoAdminUser.clave) {
      return showToast('Completa usuario y clave', 'error');
    }
    if (adminUsers.some(u => u.usuario === nuevoAdminUser.usuario)) {
      return showToast('El usuario ya existe', 'error');
    }
    const user: AdminUser = {
      ...nuevoAdminUser,
      tipo: 'custom',
    };
    const nuevos = [...adminUsers, user];
    setAdminUsers(nuevos);
    LS.set('adminUsers', nuevos.filter(u => u.tipo === 'custom'));
    setNuevoAdminUser({ usuario: '', clave: '', rol: 'admin' });
    registrarAuditoria('Crear', 'Usuarios', user.usuario);
    showToast('✅ Usuario creado');
  }, [nuevoAdminUser, adminUsers, showToast, registrarAuditoria]);
  
  const eliminarAdminUser = useCallback((usuario: string) => {
    const nuevos = adminUsers.filter(u => u.usuario !== usuario || u.tipo === 'default');
    setAdminUsers(nuevos);
    LS.set('adminUsers', nuevos.filter(u => u.tipo === 'custom'));
    registrarAuditoria('Eliminar', 'Usuarios', usuario);
    showToast('Usuario eliminado');
  }, [adminUsers, showToast, registrarAuditoria]);
  
  // Funciones de Config
  const guardarConfig = useCallback(() => {
    LS.set('config', config);
    registrarAuditoria('Actualizar', 'Configuración');
    showToast('✅ Configuración guardada');
  }, [config, showToast, registrarAuditoria]);
  
  // Funciones de Backup
  const exportarBackup = useCallback(() => {
    const backup = {
      fecha: new Date().toISOString(),
      profesionales,
      reservas,
      clientes,
      compras,
      bloqueos,
      inventario,
      servicios,
      proveedores,
      cupones,
      giftCards,
      cajaMovimientos,
      auditoriaLogs,
      config,
      adminUsers: adminUsers.filter(u => u.tipo === 'custom'),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dexis-nails-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    registrarAuditoria('Exportar', 'Backup');
    showToast('✅ Backup descargado');
  }, [profesionales, reservas, clientes, compras, bloqueos, inventario, servicios, proveedores, cupones, giftCards, cajaMovimientos, auditoriaLogs, config, adminUsers, showToast, registrarAuditoria]);
  
  const importarBackup = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string);
        if (backup.profesionales) { setProfesionales(backup.profesionales); LS.set('profesionales', backup.profesionales); }
        if (backup.reservas) { setReservas(backup.reservas); LS.set('reservas', backup.reservas); }
        if (backup.clientes) { setClientes(backup.clientes); LS.set('clientes', backup.clientes); }
        if (backup.compras) { setCompras(backup.compras); LS.set('compras', backup.compras); }
        if (backup.bloqueos) { setBloqueos(backup.bloqueos); LS.set('bloqueos', backup.bloqueos); }
        if (backup.inventario) { setInventario(backup.inventario); LS.set('inventario', backup.inventario); }
        if (backup.servicios) { setServicios(backup.servicios); LS.set('servicios', backup.servicios); }
        if (backup.proveedores) { setProveedores(backup.proveedores); LS.set('proveedores', backup.proveedores); }
        if (backup.cupones) { setCupones(backup.cupones); LS.set('cupones', backup.cupones); }
        if (backup.giftCards) { setGiftCards(backup.giftCards); LS.set('giftcards', backup.giftCards); }
        if (backup.cajaMovimientos) { setCajaMovimientos(backup.cajaMovimientos); LS.set('cajaMovimientos', backup.cajaMovimientos); }
        if (backup.auditoriaLogs) { setAuditoriaLogs(backup.auditoriaLogs); LS.set('auditoriaLogs', backup.auditoriaLogs); }
        if (backup.config) { setConfig(backup.config); LS.set('config', backup.config); }
        if (backup.adminUsers) { setAdminUsers([...ADMIN_DEFAULT, ...backup.adminUsers]); LS.set('adminUsers', backup.adminUsers); }
        registrarAuditoria('Importar', 'Backup');
        showToast('✅ Backup restaurado');
      } catch {
        showToast('Error al leer el archivo', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [showToast, registrarAuditoria]);
  
  // Función para exportar reportes
  const exportarReporte = useCallback((tipo: string) => {
    let data: unknown[] = [];
    let filename = '';
    
    switch (tipo) {
      case 'reservas':
        data = reservas;
        filename = 'reservas';
        break;
      case 'clientes':
        data = clientes.map(c => ({
          ...c,
          puntos: getPuntos(c.cedula, reservas, compras),
          nivel: getNivel(getPuntos(c.cedula, reservas, compras)).nombre,
        }));
        filename = 'clientes';
        break;
      case 'ventas':
        data = compras;
        filename = 'ventas';
        break;
      case 'caja':
        data = cajaMovimientos;
        filename = 'caja';
        break;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dexis-nails-${filename}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    registrarAuditoria('Exportar', 'Reportes', tipo);
    showToast('✅ Reporte descargado');
  }, [reservas, clientes, compras, cajaMovimientos, showToast, registrarAuditoria]);
  
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
              { sec: 'inicio', icon: '✨', label: 'INICIO', color: 'var(--c-fucsia)' },
              { sec: 'precios', icon: '💅', label: 'PRECIOS', color: 'var(--c-fucsia)' },
              { sec: 'reservas', icon: '📅', label: 'RESERVA', color: 'var(--c-turquesa)' },
              { sec: 'ia', icon: '🤖', label: 'IA', color: 'var(--c-morado)' },
              { sec: 'tienda', icon: '🛍️', label: 'TIENDA', color: 'var(--c-dorado)' },
              { sec: 'dashboard', icon: '📊', label: 'MI PERFIL', color: 'var(--c-dorado)' },
              { sec: 'juego', icon: '🚀', label: 'JUGAR', color: 'var(--c-azul)' },
              { sec: 'admin', icon: '👑', label: 'ADMIN', color: 'var(--c-azul)' },
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
          <div id="mainPanel" style={{
            borderColor: currentSec === 'inicio' ? 'rgba(255,20,147,.3)' :
              currentSec === 'reservas' ? 'rgba(0,245,212,.3)' :
              currentSec === 'ia' ? 'rgba(155,93,229,.3)' :
              currentSec === 'tienda' ? 'rgba(255,215,0,.3)' : 'rgba(255,255,255,.08)',
          } as React.CSSProperties}>
            
            {/* SECCIÓN INICIO */}
            {currentSec === 'inicio' && (
              <div className="section active" id="secInicio">
                <div className="section-inner">
                  <div className="inicio-container">
                    {/* VIDEO/LOGO DEXI */}
                    <div className="inicio-video-wrapper">
                      <video
                        className="inicio-video"
                        autoPlay
                        playsInline
                        controls
                      >
                        <source src="/Dexi.mp4" type="video/mp4" />
                      </video>
                      <div className="inicio-video-overlay" />
                    </div>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="inicio-content">
                      {clienteActual ? (
                        <div className="inicio-bienvenida">
                          <div className="ib-avatar">💅</div>
                          <div className="ib-text">
                            <h2>Hola, {clienteActual.nombre.split(' ')[0]} ✨</h2>
                            <p>Qué bueno tenerte de vuelta</p>
                            <div className="ib-nivel" style={{ color: nivel.color, borderColor: nivel.color, background: `${nivel.color}18` }}>
                              {nivel.icon} {nivel.nombre} · {nivel.descuento}% descuento
                            </div>
                            <div className="ib-stats">
                              <div className="ib-stat"><span className="val">{pts}</span><span className="lbl">PUNTOS</span></div>
                              <div className="ib-stat"><span className="val">{reservas.filter(r => r.cedula === clienteActual.cedula).length}</span><span className="lbl">VISITAS</span></div>
                              <div className="ib-stat"><span className="val">{compras.filter(c => c.cedula === clienteActual.cedula).length}</span><span className="lbl">COMPRAS</span></div>
                            </div>
                            <a 
                              href={`https://wa.me/573151445041?text=Hola!%20Soy%20${clienteActual.nombre.split(' ')[0]}%20y%20quiero%20información`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inicio-whatsapp"
                            >
                              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              CONTACTAR POR WHATSAPP
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="inicio-welcome">
                          <h1 className="inicio-title">Dexi&apos;s Nails</h1>
                          <p className="inicio-subtitle">EXPERIENCIA CÓSMICA</p>
                          <p className="inicio-desc">
                            Manicura · Podología · Facial · Perfumes árabes · Diagnóstico con IA
                          </p>
                          <button className="inicio-cta" onClick={() => goTo('reservas')}>
                            RESERVAR TURNO →
                          </button>
                          <a 
                            href="https://wa.me/573151445041?text=Hola!%20Quiero%20información%20sobre%20sus%20servicios" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inicio-whatsapp"
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            CONTÁCTANOS POR WHATSAPP
                          </a>
                        </div>
                      )}
                    </div>

                    {/* GRID INFERIOR */}
                    <div className="inicio-grid">
                      <div className="inicio-card inicio-equipo">
                        <div className="inicio-card-header">
                          <span className="inicio-card-icon">👩</span>
                          <span className="inicio-card-title">EQUIPO HOY</span>
                        </div>
                        <div className="inicio-card-body">
                          {profesionales.map(p => (
                            <div key={p.id} className="prof-mini">
                              <span className="pm-avatar">{p.emoji}</span>
                              <div className="pm-info">
                                <div className="pm-nombre">{p.nombre}</div>
                                <div className="pm-espec">{p.especialidad}</div>
                              </div>
                              <div className="pm-dot" style={{ background: p.activa ? 'var(--c-turquesa)' : 'rgba(255,0,110,.5)' }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="inicio-card inicio-horario">
                        <div className="inicio-card-header">
                          <span className="inicio-card-icon">🕐</span>
                          <span className="inicio-card-title">HORARIOS</span>
                        </div>
                        <div className="inicio-card-body">
                          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d, i) => (
                            <div key={d} className="ih-row" style={i === new Date().getDay() - 1 ? { background: 'rgba(0,245,212,.05)', borderRadius: 8, padding: '6px 8px' } : {}}>
                              <span className="dia" style={i === new Date().getDay() - 1 ? { color: 'var(--c-turquesa)' } : {}}>{d}{i === new Date().getDay() - 1 ? ' ←' : ''}</span>
                              {i === 6 ? <span className="cerrado">CERRADO</span> : <span className="hora">9:00 – 18:00</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="inicio-card inicio-trabajos">
                        <div className="inicio-card-header">
                          <span className="inicio-card-icon">✨</span>
                          <span className="inicio-card-title">NUESTROS TRABAJOS</span>
                        </div>
                        <div className="inicio-card-body">
                          <div className="trabajos-grid">
                            {[{ e: '💅', bg: 'rgba(255,20,147,.15)' }, { e: '🌸', bg: 'rgba(255,105,180,.15)' }, { e: '✨', bg: 'rgba(255,215,0,.15)' }, { e: '💎', bg: 'rgba(185,242,255,.15)' }, { e: '🌹', bg: 'rgba(255,0,70,.15)' }, { e: '🦋', bg: 'rgba(100,149,237,.15)' }, { e: '🌙', bg: 'rgba(138,43,226,.15)' }, { e: '⭐', bg: 'rgba(255,200,0,.15)' }].map((t, i) => (
                              <div key={i} className="trabajo-item" style={{ background: t.bg }} onClick={() => goTo('precios')}>{t.e}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                      {/* HEADER CLIENTE MEJORADO */}
                      <div className="cliente-info-header">
                        <div className="cliente-info-left">
                          <div className="cliente-avatar">💅</div>
                          <div className="cliente-datos">
                            <div className="cliente-nombre">{clienteActual.nombre.split(' ')[0]}</div>
                            <div className="cliente-nivel-row">
                              <span className="cliente-puntos">⭐ {pts} puntos</span>
                              <span className="cliente-nivel" style={{ color: nivel.color, borderColor: nivel.color, background: `${nivel.color}18` }}>
                                {nivel.icon} {nivel.nombre}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="cliente-info-right">
                          <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)' }}>{nivel.descuento}% descuento</span>
                          <button className="btn-logout" onClick={logoutCliente}>CERRAR SESIÓN</button>
                        </div>
                      </div>

                      <div className="admin-tabs" style={{ marginBottom: 16 }}>
                        <div className={`admin-tab ${reservaTab === 'nueva' ? 'active' : ''}`} onClick={() => setReservaTab('nueva')}>NUEVA RESERVA</div>
                        <div className={`admin-tab ${reservaTab === 'mis' ? 'active' : ''}`} onClick={() => setReservaTab('mis')}>MIS RESERVAS</div>
                      </div>
                      
                      {reservaTab === 'nueva' ? (
                        <>
                          <div className="section-title">👩 ELEGÍ TU PROFESIONAL</div>
                          <div className="prof-grid">
                            {profesionales.map(p => (
                              <div
                                key={p.id}
                                className={`prof-card ${p.activa ? '' : 'inactiva'} ${selProf === p.id ? 'selected' : ''}`}
                                onClick={() => p.activa && setSelProf(p.id)}
                              >
                                <div className="prof-avatar">
                                  {p.id === 1 ? (
                                    <img src="/Dexi.jpeg" alt="Dexi" className="prof-avatar-img" />
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
                          <div className="calendario-leyenda">
                            <div className="leyenda-item"><span className="leyenda-dot disponible"></span> Disponible</div>
                            <div className="leyenda-item"><span className="leyenda-dot reservado"></span> Reservado</div>
                            <div className="leyenda-item"><span className="leyenda-dot completo"></span> Completo</div>
                            <div className="leyenda-item"><span className="leyenda-dot bloqueado"></span> Bloqueado</div>
                            <div className="leyenda-item"><span className="leyenda-dot festivo"></span> Festivo</div>
                            <div className="leyenda-item"><span className="leyenda-dot finde"></span> Fin de semana</div>
                            <div className="leyenda-item"><span className="leyenda-dot pasado"></span> Pasado</div>
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
                              const esFinde = fechaD.getDay() === 0 || fechaD.getDay() === 6; // Domingo o Sábado
                              const festivo = FESTIVOS_2025.includes(fecha);
                              const reservasDelDia = selProf ? reservas.filter(r => r.fecha === fecha && r.profesional === selProf) : [];
                              const horasReservadas = reservasDelDia.map(r => r.hora);
                              const horasOcupadas = HORARIOS.filter(h => horasReservadas.includes(h)).length;
                              const diaCompleto = horasOcupadas >= HORARIOS.length;
                              const tieneReservas = horasOcupadas > 0 && !diaCompleto;
                              const bloqueado = bloqueos.some(b => (b.profesional === 'todos' || b.profesional === selProf) && b.fecha === fecha);
                              
                              let dayClass = 'cal-day';
                              if (pasado) dayClass += ' pasado';
                              else if (bloqueado) dayClass += ' bloqueado';
                              else if (festivo) dayClass += ' festivo';
                              else if (diaCompleto) dayClass += ' completo';
                              else if (tieneReservas) dayClass += ' reservado';
                              else if (esFinde) dayClass += ' finde';
                              else dayClass += ' disponible';
                              
                              if (selFecha === fecha) dayClass += ' selected';
                              if (fechaD.toDateString() === hoy.toDateString()) dayClass += ' hoy';
                              
                              return (
                                <div
                                  key={d}
                                  className={dayClass}
                                  onClick={() => !pasado && !bloqueado && !diaCompleto && setSelFecha(fecha)}
                                  title={festivo ? '🎉 Festivo' : diaCompleto ? '🔴 Día completo' : tieneReservas ? `📅 ${horasOcupadas} reservas` : bloqueado ? '🚫 Bloqueado por profesional' : pasado ? '⏰ Día pasado' : '✅ Disponible'}
                                >
                                  {d}
                                </div>
                              );
                            })}
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
                    {/* Subir foto */}
                    <div className="ia-card">
                      <div className="ia-card-title">📷 SUBÍ UNA FOTO</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ 
                          border: '2px dashed rgba(155,93,229,.4)', 
                          borderRadius: 16, 
                          padding: 24, 
                          textAlign: 'center', 
                          cursor: 'pointer',
                          transition: 'all .2s',
                          background: iaImage ? 'rgba(155,93,229,.08)' : 'transparent'
                        }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            style={{ display: 'none' }} 
                          />
                          {iaImage ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <img src={iaImage} alt="Foto subida" style={{ maxWidth: 200, maxHeight: 150, borderRadius: 12, border: '2px solid var(--c-morado)' }} />
                              <span style={{ fontSize: '.75rem', color: 'var(--c-morado)' }}>✓ Foto cargada - Click para cambiar</span>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📸</div>
                              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem' }}>Click para subir foto</div>
                              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '.7rem', marginTop: 4 }}>Toma una foto de tus pies, uñas o manos</div>
                            </>
                          )}
                        </label>
                        <button 
                          className="btn-primary" 
                          onClick={iaAnalizarImagen} 
                          disabled={iaImageLoading || !iaImage}
                          style={{ background: 'linear-gradient(135deg, var(--c-morado), var(--c-fucsia))' }}
                        >
                          {iaImageLoading ? 'ANALIZANDO FOTO...' : '🔍 ANALIZAR FOTO CON IA'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Divisor */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
                      <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.7rem', fontFamily: 'var(--font-display)' }}>O ESCRIBÍ TUS SÍNTOMAS</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
                    </div>
                    
                    {/* Texto de síntomas */}
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
              <GameSection onExit={() => goTo('inicio')} />
            )}
            
            {/* SECCIÓN ADMIN */}
            {currentSec === 'admin' && adminActual && (
              <div className="section active">
                <div className="section-inner">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '.7rem', color: 'var(--c-azul)' }}>👑 {adminActual.usuario}</span>
                    <button className="btn-logout" onClick={() => { setAdminActual(null); sessionStorage.removeItem('dexysAdmin'); goTo('inicio'); }}>CERRAR SESIÓN</button>
                  </div>
                  
                  <div className="admin-tabs" style={{ flexWrap: 'wrap' }}>
                    {[
                      { id: 'stats', label: '📊 Dashboard' },
                      { id: 'reservas', label: '📅 Reservas' },
                      { id: 'clientes', label: '👥 Clientes' },
                      { id: 'profesionales', label: '👩 Empleados' },
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
                      { id: 'config', label: '⚙️ Config' },
                      { id: 'auditoria', label: '📋 Auditoría' },
                      { id: 'usuarios', label: '🔐 Usuarios' },
                      { id: 'backup', label: '💾 Backup' },
                    ].map(t => (
                      <div key={t.id} className={`admin-tab ${adminTab === t.id ? 'active' : ''}`} onClick={() => setAdminTab(t.id)}>{t.label}</div>
                    ))}
                  </div>
                  
                  {adminTab === 'stats' && (
                    <>
                      {/* Estadísticas principales */}
                      <div className="stat-grid">
                        <div className="stat-card"><h4>RESERVAS TOTALES</h4><div className="stat-num">{reservas.length}</div><div className="stat-sub">📅 {reservas.filter(r => r.fecha === new Date().toISOString().split('T')[0]).length} hoy</div></div>
                        <div className="stat-card"><h4>CLIENTES REGISTRADOS</h4><div className="stat-num">{clientes.length}</div><div className="stat-sub">👤 activos</div></div>
                        <div className="stat-card"><h4>VENTAS TIENDA</h4><div className="stat-num">${compras.reduce((s, c) => s + c.precio, 0).toLocaleString()}</div><div className="stat-sub">🛍️ {compras.length} compras</div></div>
                        <div className="stat-card"><h4>STOCK TOTAL</h4><div className="stat-num">{inventario.reduce((s, p) => s + p.stock, 0)}</div><div className="stat-sub">📦 {inventario.filter(p => p.stock <= 3).length} bajo stock</div></div>
                        <div className="stat-card"><h4>PROFESIONALES ACTIVAS</h4><div className="stat-num">{profesionales.filter(p => p.activa).length}/{profesionales.length}</div><div className="stat-sub">👩 disponibles</div></div>
                        <div className="stat-card"><h4>PUNTOS EN CIRCULACIÓN</h4><div className="stat-num">{clientes.reduce((s, c) => s + getPuntos(c.cedula, reservas, compras), 0)}</div><div className="stat-sub">⭐ total sistema</div></div>
                      </div>
                      
                      {/* Gráficos */}
                      <div className="charts-grid">
                        {/* Reservas por mes */}
                        <div className="chart-card">
                          <h3 className="chart-title">📅 RESERVAS POR MES</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                              { mes: 'Ene', reservas: reservas.filter(r => r.fecha.startsWith('2025-01')).length },
                              { mes: 'Feb', reservas: reservas.filter(r => r.fecha.startsWith('2025-02')).length },
                              { mes: 'Mar', reservas: reservas.filter(r => r.fecha.startsWith('2025-03')).length },
                              { mes: 'Abr', reservas: reservas.filter(r => r.fecha.startsWith('2025-04')).length },
                              { mes: 'May', reservas: reservas.filter(r => r.fecha.startsWith('2025-05')).length },
                              { mes: 'Jun', reservas: reservas.filter(r => r.fecha.startsWith('2025-06')).length },
                              { mes: 'Jul', reservas: reservas.filter(r => r.fecha.startsWith('2025-07')).length },
                              { mes: 'Ago', reservas: reservas.filter(r => r.fecha.startsWith('2025-08')).length },
                              { mes: 'Sep', reservas: reservas.filter(r => r.fecha.startsWith('2025-09')).length },
                              { mes: 'Oct', reservas: reservas.filter(r => r.fecha.startsWith('2025-10')).length },
                              { mes: 'Nov', reservas: reservas.filter(r => r.fecha.startsWith('2025-11')).length },
                              { mes: 'Dic', reservas: reservas.filter(r => r.fecha.startsWith('2025-12')).length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} />
                              <Bar dataKey="reservas" fill="#00f5d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Ventas por mes */}
                        <div className="chart-card">
                          <h3 className="chart-title">💰 VENTAS TIENDA POR MES</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={[
                              { mes: 'Ene', ventas: compras.filter(c => c.fecha.startsWith('2025-01')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Feb', ventas: compras.filter(c => c.fecha.startsWith('2025-02')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Mar', ventas: compras.filter(c => c.fecha.startsWith('2025-03')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Abr', ventas: compras.filter(c => c.fecha.startsWith('2025-04')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'May', ventas: compras.filter(c => c.fecha.startsWith('2025-05')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Jun', ventas: compras.filter(c => c.fecha.startsWith('2025-06')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Jul', ventas: compras.filter(c => c.fecha.startsWith('2025-07')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Ago', ventas: compras.filter(c => c.fecha.startsWith('2025-08')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Sep', ventas: compras.filter(c => c.fecha.startsWith('2025-09')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Oct', ventas: compras.filter(c => c.fecha.startsWith('2025-10')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Nov', ventas: compras.filter(c => c.fecha.startsWith('2025-11')).reduce((s, c) => s + c.precio, 0) },
                              { mes: 'Dic', ventas: compras.filter(c => c.fecha.startsWith('2025-12')).reduce((s, c) => s + c.precio, 0) },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ventas']} />
                              <Area type="monotone" dataKey="ventas" stroke="#ff1493" fill="rgba(255,20,147,0.3)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Servicios más solicitados */}
                        <div className="chart-card">
                          <h3 className="chart-title">💅 SERVICIOS POPULARES</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Manicura', value: reservas.filter(r => r.servicio?.toLowerCase().includes('manicura')).length, color: '#00f5d4' },
                                  { name: 'Podología', value: reservas.filter(r => r.servicio?.toLowerCase().includes('podo') || r.servicio?.toLowerCase().includes('pedic')).length, color: '#ff1493' },
                                  { name: 'Facial', value: reservas.filter(r => r.servicio?.toLowerCase().includes('facial')).length, color: '#ffd700' },
                                  { name: 'Spa/Parafina', value: reservas.filter(r => r.servicio?.toLowerCase().includes('parafina') || r.servicio?.toLowerCase().includes('spa')).length, color: '#9b5de5' },
                                  { name: 'Otros', value: reservas.filter(r => !r.servicio || (r.servicio && !r.servicio.toLowerCase().includes('manicura') && !r.servicio.toLowerCase().includes('podo') && !r.servicio.toLowerCase().includes('pedic') && !r.servicio.toLowerCase().includes('facial') && !r.servicio.toLowerCase().includes('parafina') && !r.servicio.toLowerCase().includes('spa'))).length, color: '#3a86ff' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {[ '#00f5d4', '#ff1493', '#ffd700', '#9b5de5', '#3a86ff' ].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Profesionales con más reservas */}
                        <div className="chart-card">
                          <h3 className="chart-title">👩 PROFESIONALES TOP</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={profesionales.map(p => ({
                              nombre: p.nombre,
                              reservas: reservas.filter(r => r.profesional === p.id).length
                            })).sort((a, b) => b.reservas - a.reservas)} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis type="number" stroke="#888" fontSize={10} />
                              <YAxis dataKey="nombre" type="category" stroke="#888" fontSize={10} width={70} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} />
                              <Bar dataKey="reservas" fill="#ffd700" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Productos más vendidos */}
                        <div className="chart-card">
                          <h3 className="chart-title">🛍️ PRODUCTOS MÁS VENDIDOS</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={Object.entries(
                              compras.reduce((acc, c) => {
                                acc[c.producto] = (acc[c.producto] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([producto, count]) => ({ producto, ventas: count }))
                              .sort((a, b) => b.ventas - a.ventas)
                              .slice(0, 6)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="producto" stroke="#888" fontSize={9} angle={-20} textAnchor="end" height={50} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #3a86ff', borderRadius: 8 }} />
                              <Bar dataKey="ventas" fill="#3a86ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Niveles de fidelidad */}
                        <div className="chart-card">
                          <h3 className="chart-title">⭐ NIVELES DE FIDELIDAD</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Bronce', value: clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'BRONCE').length, color: '#cd7f32' },
                                  { name: 'Plata', value: clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'PLATA').length, color: '#c0c0c0' },
                                  { name: 'Oro', value: clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'ORO').length, color: '#ffd700' },
                                  { name: 'Diamante', value: clientes.filter(c => getNivel(getPuntos(c.cedula, reservas, compras)).nombre === 'DIAMANTE').length, color: '#b9f2ff' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {['#cd7f32', '#c0c0c0', '#ffd700', '#b9f2ff'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Caja - Ingresos vs Egresos */}
                        <div className="chart-card">
                          <h3 className="chart-title">💵 MOVIMIENTOS DE CAJA</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={[
                              { mes: 'Ene', ingresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-01') && (m.tipo === 'ingreso' || m.tipo === 'apertura')).reduce((s, m) => s + m.monto, 0), egresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-01') && (m.tipo === 'egreso' || m.tipo === 'cierre')).reduce((s, m) => s + m.monto, 0) },
                              { mes: 'Feb', ingresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-02') && (m.tipo === 'ingreso' || m.tipo === 'apertura')).reduce((s, m) => s + m.monto, 0), egresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-02') && (m.tipo === 'egreso' || m.tipo === 'cierre')).reduce((s, m) => s + m.monto, 0) },
                              { mes: 'Mar', ingresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-03') && (m.tipo === 'ingreso' || m.tipo === 'apertura')).reduce((s, m) => s + m.monto, 0), egresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-03') && (m.tipo === 'egreso' || m.tipo === 'cierre')).reduce((s, m) => s + m.monto, 0) },
                              { mes: 'Abr', ingresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-04') && (m.tipo === 'ingreso' || m.tipo === 'apertura')).reduce((s, m) => s + m.monto, 0), egresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-04') && (m.tipo === 'egreso' || m.tipo === 'cierre')).reduce((s, m) => s + m.monto, 0) },
                              { mes: 'May', ingresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-05') && (m.tipo === 'ingreso' || m.tipo === 'apertura')).reduce((s, m) => s + m.monto, 0), egresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-05') && (m.tipo === 'egreso' || m.tipo === 'cierre')).reduce((s, m) => s + m.monto, 0) },
                              { mes: 'Jun', ingresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-06') && (m.tipo === 'ingreso' || m.tipo === 'apertura')).reduce((s, m) => s + m.monto, 0), egresos: cajaMovimientos.filter(m => m.fecha.startsWith('2025-06') && (m.tipo === 'egreso' || m.tipo === 'cierre')).reduce((s, m) => s + m.monto, 0) },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #9b5de5', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                              <Legend />
                              <Line type="monotone" dataKey="ingresos" stroke="#00f5d4" strokeWidth={2} dot={{ fill: '#00f5d4' }} />
                              <Line type="monotone" dataKey="egresos" stroke="#ff1493" strokeWidth={2} dot={{ fill: '#ff1493' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {adminTab === 'reservas' && (
                    <>
                      {/* Gráficos de reservas */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">⏰ RESERVAS POR HORA</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={HORARIOS.map(h => ({
                              hora: h,
                              cantidad: reservas.filter(r => r.hora === h).length
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="hora" stroke="#888" fontSize={9} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} />
                              <Bar dataKey="cantidad" fill="#00f5d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📅 RESERVAS POR DÍA</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => ({
                              dia: d,
                              cantidad: reservas.filter(r => new Date(r.fecha).getDay() === i).length
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="dia" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                              <Bar dataKey="cantidad" fill="#ff1493" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
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
                      {/* Gráficos de clientes */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">👥 NUEVOS CLIENTES POR MES</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={[
                              { mes: 'Ene', clientes: clientes.filter(c => c.fechaReg?.startsWith('2025-01')).length },
                              { mes: 'Feb', clientes: clientes.filter(c => c.fechaReg?.startsWith('2025-02')).length },
                              { mes: 'Mar', clientes: clientes.filter(c => c.fechaReg?.startsWith('2025-03')).length },
                              { mes: 'Abr', clientes: clientes.filter(c => c.fechaReg?.startsWith('2025-04')).length },
                              { mes: 'May', clientes: clientes.filter(c => c.fechaReg?.startsWith('2025-05')).length },
                              { mes: 'Jun', clientes: clientes.filter(c => c.fechaReg?.startsWith('2025-06')).length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} />
                              <Area type="monotone" dataKey="clientes" stroke="#00f5d4" fill="rgba(0,245,212,0.3)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 CLIENTES POR ACTIVIDAD</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Activos (3+ reservas)', value: clientes.filter(c => reservas.filter(r => r.cedula === c.cedula).length >= 3).length, color: '#00f5d4' },
                                  { name: 'Ocasionales', value: clientes.filter(c => { const n = reservas.filter(r => r.cedula === c.cedula).length; return n > 0 && n < 3; }).length, color: '#ffd700' },
                                  { name: 'Sin reservas', value: clientes.filter(c => reservas.filter(r => r.cedula === c.cedula).length === 0).length, color: '#6b7280' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${value}`}
                              >
                                {['#00f5d4', '#ffd700', '#6b7280'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">LISTADO DE CLIENTES</div>
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
                                  <td style={{ color: 'var(--c-dorado)' }}>{p}</td>
                                  <td style={{ color: n.color, fontFamily: 'var(--font-display)', fontSize: '.6rem' }}>{n.icon} {n.nombre}</td>
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
                      {/* Gráficos de profesionales */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 RENDIMIENTO POR PROFESIONAL</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={profesionales.map(p => ({
                              nombre: p.nombre,
                              reservas: reservas.filter(r => r.profesional === p.id).length,
                              activa: p.activa ? 1 : 0
                            }))} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis type="number" stroke="#888" fontSize={10} />
                              <YAxis dataKey="nombre" type="category" stroke="#888" fontSize={10} width={70} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} />
                              <Bar dataKey="reservas" fill="#ffd700" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">⏰ RESERVAS POR DÍA DE LA SEMANA</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={[
                              { dia: 'Dom', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 0).length },
                              { dia: 'Lun', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 1).length },
                              { dia: 'Mar', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 2).length },
                              { dia: 'Mié', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 3).length },
                              { dia: 'Jue', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 4).length },
                              { dia: 'Vie', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 5).length },
                              { dia: 'Sáb', cantidad: reservas.filter(r => new Date(r.fecha).getDay() === 6).length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="dia" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                              <Line type="monotone" dataKey="cantidad" stroke="#ff1493" strokeWidth={2} dot={{ fill: '#ff1493' }} />
                            </LineChart>
                          </ResponsiveContainer>
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
                      {/* Gráficos de inventario */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">📦 STOCK POR TIPO</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={[
                              { tipo: 'Colonia', stock: inventario.filter(p => p.tipo === 'colonia').reduce((s, p) => s + p.stock, 0) },
                              { tipo: 'Perfume', stock: inventario.filter(p => p.tipo === 'perfume').reduce((s, p) => s + p.stock, 0) },
                              { tipo: 'Esmalte', stock: inventario.filter(p => p.tipo === 'esmalte').reduce((s, p) => s + p.stock, 0) },
                              { tipo: 'Aceite', stock: inventario.filter(p => p.tipo === 'aceite').reduce((s, p) => s + p.stock, 0) },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="tipo" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} />
                              <Bar dataKey="stock" fill="#00f5d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">⚠️ ESTADO DE STOCK</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Stock OK', value: inventario.filter(p => p.stock > 5).length, color: '#00f5d4' },
                                  { name: 'Stock Bajo', value: inventario.filter(p => p.stock > 0 && p.stock <= 5).length, color: '#ffd700' },
                                  { name: 'Sin Stock', value: inventario.filter(p => p.stock <= 0).length, color: '#ff1493' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {['#00f5d4', '#ffd700', '#ff1493'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
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
                        <div className="stat-card"><h4>TICKET PROMEDIO</h4><div className="stat-num">${compras.length ? Math.round(compras.reduce((s, c) => s + c.precio, 0) / compras.length).toLocaleString() : 0}</div></div>
                      </div>
                      
                      {/* Gráficos de ventas */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">🛍️ VENTAS POR TIPO DE PRODUCTO</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Colonias', value: compras.filter(c => c.tipo === 'colonia').reduce((s, c) => s + c.precio, 0), color: '#00f5d4' },
                                  { name: 'Perfumes', value: compras.filter(c => c.tipo === 'perfume').reduce((s, c) => s + c.precio, 0), color: '#ff1493' },
                                  { name: 'Otros', value: compras.filter(c => c.tipo !== 'colonia' && c.tipo !== 'perfume').reduce((s, c) => s + c.precio, 0), color: '#ffd700' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {['#00f5d4', '#ff1493', '#ffd700'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📈 TENDENCIA DE VENTAS</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={[
                              { mes: 'Ene', ventas: compras.filter(c => c.fecha?.startsWith('2025-01')).length },
                              { mes: 'Feb', ventas: compras.filter(c => c.fecha?.startsWith('2025-02')).length },
                              { mes: 'Mar', ventas: compras.filter(c => c.fecha?.startsWith('2025-03')).length },
                              { mes: 'Abr', ventas: compras.filter(c => c.fecha?.startsWith('2025-04')).length },
                              { mes: 'May', ventas: compras.filter(c => c.fecha?.startsWith('2025-05')).length },
                              { mes: 'Jun', ventas: compras.filter(c => c.fecha?.startsWith('2025-06')).length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #3a86ff', borderRadius: 8 }} />
                              <Area type="monotone" dataKey="ventas" stroke="#3a86ff" fill="rgba(58,134,255,0.3)" />
                            </AreaChart>
                          </ResponsiveContainer>
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
                  
                  {/* 💵 CAJA */}
                  {adminTab === 'caja' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(0,180,216,.15), rgba(0,245,212,.1))' }}>
                          <h4>SALDO ACTUAL</h4>
                          <div className="stat-num" style={{ color: 'var(--c-turquesa)' }}>${calcularSaldoCaja().toLocaleString()}</div>
                          <div className="stat-sub">💵 En caja</div>
                        </div>
                        <div className="stat-card"><h4>INGRESOS</h4><div className="stat-num" style={{ color: '#4ade80' }}>+${cajaMovimientos.filter(m => m.tipo === 'ingreso' || m.tipo === 'apertura').reduce((s, m) => s + m.monto, 0).toLocaleString()}</div></div>
                        <div className="stat-card"><h4>EGRESOS</h4><div className="stat-num" style={{ color: '#f87171' }}>-${cajaMovimientos.filter(m => m.tipo === 'egreso' || m.tipo === 'cierre').reduce((s, m) => s + m.monto, 0).toLocaleString()}</div></div>
                      </div>
                      
                      {/* Gráficos de caja */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 INGRESOS VS EGRESOS</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={[
                              { tipo: 'Ingresos', monto: cajaMovimientos.filter(m => m.tipo === 'ingreso' || m.tipo === 'apertura').reduce((s, m) => s + m.monto, 0) },
                              { tipo: 'Egresos', monto: cajaMovimientos.filter(m => m.tipo === 'egreso' || m.tipo === 'cierre').reduce((s, m) => s + m.monto, 0) },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="tipo" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #9b5de5', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                              <Bar dataKey="monto" fill="#9b5de5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📈 EVOLUCIÓN DEL SALDO</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={[
                              { mes: 'Ene', saldo: 0 },
                              { mes: 'Feb', saldo: cajaMovimientos.filter(m => m.fecha?.startsWith('2025-01') || m.fecha?.startsWith('2025-02')).reduce((s, m) => m.tipo === 'ingreso' || m.tipo === 'apertura' ? s + m.monto : s - m.monto, 0) },
                              { mes: 'Mar', saldo: cajaMovimientos.filter(m => m.fecha?.startsWith('2025-0') || m.fecha?.startsWith('2025-03')).reduce((s, m) => m.tipo === 'ingreso' || m.tipo === 'apertura' ? s + m.monto : s - m.monto, 0) },
                              { mes: 'Abr', saldo: cajaMovimientos.filter(m => m.fecha?.startsWith('2025-0')).reduce((s, m) => m.tipo === 'ingreso' || m.tipo === 'apertura' ? s + m.monto : s - m.monto, 0) },
                              { mes: 'May', saldo: cajaMovimientos.filter(m => m.fecha?.startsWith('2025-0')).reduce((s, m) => m.tipo === 'ingreso' || m.tipo === 'apertura' ? s + m.monto : s - m.monto, 0) },
                              { mes: 'Jun', saldo: calcularSaldoCaja() },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="mes" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                              <Line type="monotone" dataKey="saldo" stroke="#00f5d4" strokeWidth={2} dot={{ fill: '#00f5d4' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">NUEVO MOVIMIENTO</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>TIPO</label>
                          <select className="form-input" value={movimientoCaja.tipo} onChange={e => setMovimientoCaja({ ...movimientoCaja, tipo: e.target.value as any })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                            <option value="apertura">🔓 Apertura</option>
                            <option value="ingreso">💰 Ingreso</option>
                            <option value="egreso">💸 Egreso</option>
                            <option value="cierre">🔒 Cierre</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label>MONTO</label>
                          <input className="form-input" type="number" value={movimientoCaja.monto || ''} onChange={e => setMovimientoCaja({ ...movimientoCaja, monto: parseFloat(e.target.value) || 0 })} placeholder="0" />
                        </div>
                        <div className="form-field">
                          <label>CONCEPTO</label>
                          <input className="form-input" value={movimientoCaja.concepto} onChange={e => setMovimientoCaja({ ...movimientoCaja, concepto: e.target.value })} placeholder="Descripción..." />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarMovimientoCaja}>REGISTRAR</button>
                      </div>
                      
                      <div className="admin-section-title">HISTORIAL DE CAJA</div>
                      <div style={{ overflowX: 'auto', maxHeight: 300 }}>
                        <table className="admin-table">
                          <thead><tr><th>FECHA</th><th>TIPO</th><th>CONCEPTO</th><th>MONTO</th><th>RESPONSABLE</th></tr></thead>
                          <tbody>
                            {cajaMovimientos.slice(-20).reverse().map(m => (
                              <tr key={m.id}>
                                <td>{new Date(m.fecha).toLocaleString('es-CO')}</td>
                                <td><span className={`badge-${m.tipo === 'ingreso' || m.tipo === 'apertura' ? 'ok' : 'err'}`}>{m.tipo.toUpperCase()}</span></td>
                                <td>{m.concepto || '—'}</td>
                                <td style={{ color: m.tipo === 'ingreso' || m.tipo === 'apertura' ? '#4ade80' : '#f87171' }}>
                                  {m.tipo === 'ingreso' || m.tipo === 'apertura' ? '+' : '-'}${m.monto.toLocaleString()}
                                </td>
                                <td>{m.responsable}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 💅 SERVICIOS */}
                  {adminTab === 'servicios' && (
                    <>
                      {/* Gráficos de servicios */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 SERVICIOS POR CATEGORÍA</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Manicura', value: servicios.filter(s => s.categoria.toLowerCase().includes('manicura')).length, color: '#ff1493' },
                                  { name: 'Podología', value: servicios.filter(s => s.categoria.toLowerCase().includes('podo')).length, color: '#00f5d4' },
                                  { name: 'Facial', value: servicios.filter(s => s.categoria.toLowerCase().includes('facial')).length, color: '#ffd700' },
                                  { name: 'Spa', value: servicios.filter(s => s.categoria.toLowerCase().includes('spa')).length, color: '#9b5de5' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {['#ff1493', '#00f5d4', '#ffd700', '#9b5de5'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">💰 PRECIO PROMEDIO POR CATEGORÍA</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={[
                              { cat: 'Manicura', precio: servicios.filter(s => s.categoria.toLowerCase().includes('manicura')).length ? Math.round(servicios.filter(s => s.categoria.toLowerCase().includes('manicura')).reduce((a, s) => a + s.precio, 0) / servicios.filter(s => s.categoria.toLowerCase().includes('manicura')).length) : 0 },
                              { cat: 'Podología', precio: servicios.filter(s => s.categoria.toLowerCase().includes('podo')).length ? Math.round(servicios.filter(s => s.categoria.toLowerCase().includes('podo')).reduce((a, s) => a + s.precio, 0) / servicios.filter(s => s.categoria.toLowerCase().includes('podo')).length) : 0 },
                              { cat: 'Facial', precio: servicios.filter(s => s.categoria.toLowerCase().includes('facial')).length ? Math.round(servicios.filter(s => s.categoria.toLowerCase().includes('facial')).reduce((a, s) => a + s.precio, 0) / servicios.filter(s => s.categoria.toLowerCase().includes('facial')).length) : 0 },
                              { cat: 'Spa', precio: servicios.filter(s => s.categoria.toLowerCase().includes('spa')).length ? Math.round(servicios.filter(s => s.categoria.toLowerCase().includes('spa')).reduce((a, s) => a + s.precio, 0) / servicios.filter(s => s.categoria.toLowerCase().includes('spa')).length) : 0 },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="cat" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                              <Bar dataKey="precio" fill="#ffd700" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">AGREGAR SERVICIO</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>NOMBRE</label>
                          <input className="form-input" value={nuevoServicio.nombre} onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} placeholder="Nombre del servicio" />
                        </div>
                        <div className="form-field">
                          <label>CATEGORÍA</label>
                          <select className="form-input" value={nuevoServicio.categoria} onChange={e => setNuevoServicio({ ...nuevoServicio, categoria: e.target.value })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                            <option value="manicura">💅 Manicura</option>
                            <option value="podologia">🦶 Podología</option>
                            <option value="facial">🧖 Facial</option>
                            <option value="spa">💆 Spa</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label>PRECIO</label>
                          <input className="form-input" type="number" value={nuevoServicio.precio || ''} onChange={e => setNuevoServicio({ ...nuevoServicio, precio: parseFloat(e.target.value) || 0 })} placeholder="0" />
                        </div>
                        <div className="form-field">
                          <label>DURACIÓN (min)</label>
                          <input className="form-input" type="number" value={nuevoServicio.duracion || ''} onChange={e => setNuevoServicio({ ...nuevoServicio, duracion: parseInt(e.target.value) || 30 })} placeholder="30" />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarServicio}>AGREGAR</button>
                      </div>
                      
                      <div className="admin-section-title">LISTA DE SERVICIOS</div>
                      <div style={{ overflowX: 'auto', maxHeight: 350 }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>CATEGORÍA</th><th>PRECIO</th><th>DURACIÓN</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {servicios.map(s => (
                              <tr key={s.id}>
                                <td>{s.nombre}</td>
                                <td><span className="badge-ok">{s.categoria}</span></td>
                                <td style={{ color: 'var(--c-dorado)' }}>${s.precio.toLocaleString()}</td>
                                <td>{s.duracion} min</td>
                                <td><span className={s.activo ? 'badge-ok' : 'badge-err'}>{s.activo ? '✓ Activo' : '✕ Inactivo'}</span></td>
                                <td>
                                  <button className={`admin-btn ${s.activo ? 'admin-btn-red' : 'admin-btn-green'}`} onClick={() => toggleServicioActivo(s.id)}>{s.activo ? 'Desactivar' : 'Activar'}</button>
                                  <button className="admin-btn admin-btn-red" style={{ marginLeft: 4 }} onClick={() => eliminarServicio(s.id)}>🗑</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 🚚 PROVEEDORES */}
                  {adminTab === 'proveedores' && (
                    <>
                      <div className="admin-section-title">AGREGAR PROVEEDOR</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>NOMBRE</label>
                          <input className="form-input" value={nuevoProveedor.nombre} onChange={e => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })} placeholder="Empresa" />
                        </div>
                        <div className="form-field">
                          <label>CONTACTO</label>
                          <input className="form-input" value={nuevoProveedor.contacto} onChange={e => setNuevoProveedor({ ...nuevoProveedor, contacto: e.target.value })} placeholder="Persona de contacto" />
                        </div>
                        <div className="form-field">
                          <label>TELÉFONO</label>
                          <input className="form-input" value={nuevoProveedor.telefono || ''} onChange={e => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })} placeholder="+57 ..." />
                        </div>
                        <div className="form-field">
                          <label>EMAIL</label>
                          <input className="form-input" value={nuevoProveedor.email || ''} onChange={e => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })} placeholder="email@empresa.com" />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarProveedor}>AGREGAR</button>
                      </div>
                      
                      <div className="admin-section-title">LISTA DE PROVEEDORES</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>NOMBRE</th><th>CONTACTO</th><th>TELÉFONO</th><th>EMAIL</th><th>PRODUCTOS</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {proveedores.map(p => (
                              <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td>{p.contacto}</td>
                                <td>{p.telefono || '—'}</td>
                                <td>{p.email || '—'}</td>
                                <td>{p.productos || '—'}</td>
                                <td><button className="admin-btn admin-btn-red" onClick={() => eliminarProveedor(p.id)}>🗑 Eliminar</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 🎟️ CUPONES */}
                  {adminTab === 'cupones' && (
                    <>
                      {/* Gráficos de cupones */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">🎟️ USO DE CUPONES</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Activos', value: cupones.filter(c => c.activo).length, color: '#00f5d4' },
                                  { name: 'Inactivos', value: cupones.filter(c => !c.activo).length, color: '#6b7280' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {['#00f5d4', '#6b7280'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #00f5d4', borderRadius: 8 }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 TIPO DE DESCUENTO</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={[
                              { tipo: 'Porcentaje', cantidad: cupones.filter(c => c.tipo === 'porcentaje').length },
                              { tipo: 'Monto Fijo', cantidad: cupones.filter(c => c.tipo === 'fijo').length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="tipo" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                              <Bar dataKey="cantidad" fill="#ff1493" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">CREAR CUPÓN</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>CÓDIGO</label>
                          <input className="form-input" value={nuevoCupon.codigo} onChange={e => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value.toUpperCase() })} placeholder="DESCUENTO20" />
                        </div>
                        <div className="form-field">
                          <label>DESCUENTO</label>
                          <input className="form-input" type="number" value={nuevoCupon.descuento || ''} onChange={e => setNuevoCupon({ ...nuevoCupon, descuento: parseFloat(e.target.value) || 0 })} placeholder="20" />
                        </div>
                        <div className="form-field">
                          <label>TIPO</label>
                          <select className="form-input" value={nuevoCupon.tipo} onChange={e => setNuevoCupon({ ...nuevoCupon, tipo: e.target.value as any })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                            <option value="porcentaje">%</option>
                            <option value="fijo">$ Fijo</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label>USOS MÁX</label>
                          <input className="form-input" type="number" value={nuevoCupon.usosMax || ''} onChange={e => setNuevoCupon({ ...nuevoCupon, usosMax: parseInt(e.target.value) || 1 })} placeholder="10" />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarCupon}>CREAR</button>
                      </div>
                      
                      <div className="admin-section-title">CUPONES ACTIVOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>CÓDIGO</th><th>DESCUENTO</th><th>USOS</th><th>EXPIRA</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {cupones.length === 0 ? (
                              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin cupones creados</td></tr>
                            ) : cupones.map(c => (
                              <tr key={c.id}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--c-dorado)' }}>{c.codigo}</td>
                                <td>{c.tipo === 'porcentaje' ? `${c.descuento}%` : `$${c.descuento.toLocaleString()}`}</td>
                                <td>{c.usosActuales}/{c.usosMax}</td>
                                <td>{c.fechaExpira || 'Sin límite'}</td>
                                <td><span className={c.activo ? 'badge-ok' : 'badge-err'}>{c.activo ? '✓ Activo' : '✕ Inactivo'}</span></td>
                                <td><button className={`admin-btn ${c.activo ? 'admin-btn-red' : 'admin-btn-green'}`} onClick={() => toggleCuponActivo(c.id)}>{c.activo ? 'Desactivar' : 'Activar'}</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 🎁 GIFT CARDS */}
                  {adminTab === 'giftcards' && (
                    <>
                      {/* Gráficos de gift cards */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">🎁 ESTADO DE GIFT CARDS</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Activas', value: giftCards.filter(g => g.activa).length, color: '#00f5d4' },
                                  { name: 'Usadas', value: giftCards.filter(g => !g.activa).length, color: '#6b7280' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {['#00f5d4', '#6b7280'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">💰 VALOR TOTAL EN CIRCULACIÓN</h3>
                          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
                              { estado: 'Activas', valor: giftCards.filter(g => g.activa).reduce((s, g) => s + g.saldo, 0) },
                              { estado: 'Canjeadas', valor: giftCards.filter(g => !g.activa).reduce((s, g) => s + g.saldo, 0) },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="estado" stroke="#888" fontSize={10} />
                              <YAxis stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                              <Bar dataKey="valor" fill="#ffd700" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">CREAR GIFT CARD</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>SALDO</label>
                          <input className="form-input" type="number" value={nuevaGiftCard.saldo || ''} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, saldo: parseFloat(e.target.value) || 50000 })} placeholder="50000" />
                        </div>
                        <div className="form-field">
                          <label>COMPRADOR</label>
                          <input className="form-input" value={nuevaGiftCard.comprador || ''} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, comprador: e.target.value })} placeholder="Nombre (opcional)" />
                        </div>
                        <div className="form-field">
                          <label>DESTINATARIO</label>
                          <input className="form-input" value={nuevaGiftCard.destinatario || ''} onChange={e => setNuevaGiftCard({ ...nuevaGiftCard, destinatario: e.target.value })} placeholder="Nombre (opcional)" />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarGiftCard}>CREAR</button>
                      </div>
                      
                      <div className="admin-section-title">GIFT CARDS EMITIDAS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>CÓDIGO</th><th>SALDO</th><th>COMPRADOR</th><th>DESTINATARIO</th><th>FECHA</th><th>ESTADO</th></tr></thead>
                          <tbody>
                            {giftCards.length === 0 ? (
                              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin gift cards creadas</td></tr>
                            ) : giftCards.map(g => (
                              <tr key={g.id}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--c-turquesa)' }}>{g.codigo}</td>
                                <td style={{ color: 'var(--c-dorado)' }}>${g.saldo.toLocaleString()}</td>
                                <td>{g.comprador || '—'}</td>
                                <td>{g.destinatario || '—'}</td>
                                <td>{new Date(g.fechaCompra).toLocaleDateString('es-CO')}</td>
                                <td><span className={g.activa ? 'badge-ok' : 'badge-err'}>{g.activa ? '✓ Activa' : '✕ Usada'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* ⭐ FIDELIDAD */}
                  {adminTab === 'fidelidad' && (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card"><h4>🥉 BRONCE</h4><div className="stat-num">{clientes.filter(c => getPuntos(c.cedula, reservas, compras) < 50).length}</div><div className="stat-sub">0-49 pts</div></div>
                        <div className="stat-card"><h4>🥈 PLATA</h4><div className="stat-num">{clientes.filter(c => { const p = getPuntos(c.cedula, reservas, compras); return p >= 50 && p < 150; }).length}</div><div className="stat-sub">50-149 pts</div></div>
                        <div className="stat-card"><h4>🥇 ORO</h4><div className="stat-num">{clientes.filter(c => { const p = getPuntos(c.cedula, reservas, compras); return p >= 150 && p < 300; }).length}</div><div className="stat-sub">150-299 pts</div></div>
                        <div className="stat-card"><h4>💎 DIAMANTE</h4><div className="stat-num">{clientes.filter(c => getPuntos(c.cedula, reservas, compras) >= 300).length}</div><div className="stat-sub">300+ pts</div></div>
                      </div>
                      
                      {/* Gráficos de fidelidad */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">🏆 TOP 5 CLIENTES POR PUNTOS</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={clientes.sort((a, b) => getPuntos(b.cedula, reservas, compras) - getPuntos(a.cedula, reservas, compras)).slice(0, 5).map(c => ({
                              nombre: c.nombre.split(' ')[0],
                              puntos: getPuntos(c.cedula, reservas, compras)
                            }))} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis type="number" stroke="#888" fontSize={10} />
                              <YAxis dataKey="nombre" type="category" stroke="#888" fontSize={10} width={60} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} />
                              <Bar dataKey="puntos" fill="#ffd700" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 DISTRIBUCIÓN DE NIVELES</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Bronce', value: clientes.filter(c => getPuntos(c.cedula, reservas, compras) < 50).length, color: '#cd7f32' },
                                  { name: 'Plata', value: clientes.filter(c => { const p = getPuntos(c.cedula, reservas, compras); return p >= 50 && p < 150; }).length, color: '#c0c0c0' },
                                  { name: 'Oro', value: clientes.filter(c => { const p = getPuntos(c.cedula, reservas, compras); return p >= 150 && p < 300; }).length, color: '#ffd700' },
                                  { name: 'Diamante', value: clientes.filter(c => getPuntos(c.cedula, reservas, compras) >= 300).length, color: '#b9f2ff' },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {['#cd7f32', '#c0c0c0', '#ffd700', '#b9f2ff'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">REGLAS DEL PROGRAMA</div>
                      <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'grid', gap: 8, fontSize: '.8rem' }}>
                          <div>📌 <strong>10 puntos</strong> por cada reserva completada</div>
                          <div>📌 <strong>5 puntos</strong> por cada $10.000 en compras de tienda</div>
                          <div>📌 Los puntos determinan el nivel y descuento del cliente</div>
                          <div>📌 Los descuentos se aplican automáticamente en servicios</div>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">TOP CLIENTES</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>CLIENTE</th><th>PUNTOS</th><th>NIVEL</th><th>DESCUENTO</th></tr></thead>
                          <tbody>
                            {clientes.sort((a, b) => getPuntos(b.cedula, reservas, compras) - getPuntos(a.cedula, reservas, compras)).slice(0, 10).map(c => {
                              const p = getPuntos(c.cedula, reservas, compras);
                              const n = getNivel(p);
                              return (
                                <tr key={c.cedula}>
                                  <td>{c.nombre}</td>
                                  <td style={{ color: 'var(--c-dorado)' }}>{p}</td>
                                  <td style={{ color: n.color }}>{n.icon} {n.nombre}</td>
                                  <td>{n.descuento}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 💼 COMISIONES */}
                  {adminTab === 'comisiones' && (
                    <>
                      {/* Gráficos de comisiones */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">💰 COMISIONES POR PROFESIONAL</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={profesionales.map(p => {
                              const serviciosRealizados = reservas.filter(r => r.profesional === p.id).length;
                              const comision = Math.round(serviciosRealizados * 5000 * 0.1);
                              return { nombre: p.nombre, comision };
                            })} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis type="number" stroke="#888" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                              <YAxis dataKey="nombre" type="category" stroke="#888" fontSize={10} width={70} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffd700', borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                              <Bar dataKey="comision" fill="#ffd700" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 SERVICIOS REALIZADOS</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={profesionales.map(p => ({
                                  name: p.nombre,
                                  value: reservas.filter(r => r.profesional === p.id).length,
                                  color: p.id === 1 ? '#ff1493' : p.id === 2 ? '#00f5d4' : '#ffd700'
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {profesionales.map((p, i) => (
                                  <Cell key={`cell-${i}`} fill={p.id === 1 ? '#ff1493' : p.id === 2 ? '#00f5d4' : '#ffd700'} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">COMISIONES POR EMPLEADA</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>EMPLEADA</th><th>SERVICIOS REALIZADOS</th><th>VENTAS TIENDA</th><th>COMISIÓN EST.</th></tr></thead>
                          <tbody>
                            {profesionales.map(p => {
                              const serviciosRealizados = reservas.filter(r => r.profesional === p.id).length;
                              const ventasTienda = compras.length; // Simplificado
                              const comision = Math.round(serviciosRealizados * 5000 * 0.1 + ventasTienda * 0.02);
                              return (
                                <tr key={p.id}>
                                  <td>{p.emoji} {p.nombre}</td>
                                  <td>{serviciosRealizados}</td>
                                  <td>${(ventasTienda * 50000).toLocaleString()}</td>
                                  <td style={{ color: 'var(--c-dorado)' }}>${comision.toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 12, fontSize: '.7rem', color: 'rgba(255,255,255,.5)' }}>
                        * Cálculo estimado: 10% de servicios + 2% de ventas de tienda
                      </div>
                    </>
                  )}
                  
                  {/* 📄 REPORTES */}
                  {adminTab === 'reportes' && (
                    <>
                      <div className="admin-section-title">EXPORTAR DATOS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <button style={{ background: 'rgba(0,245,212,.15)', border: '1px solid var(--c-turquesa)', color: '#ffffff', fontWeight: 600, padding: '12px 20px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '1px' }} onClick={() => exportarReporte('reservas')}>📅 Exportar Reservas</button>
                        <button style={{ background: 'rgba(255,20,147,.15)', border: '1px solid var(--c-fucsia)', color: '#ffffff', fontWeight: 600, padding: '12px 20px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '1px' }} onClick={() => exportarReporte('clientes')}>👥 Exportar Clientes</button>
                        <button style={{ background: 'rgba(255,215,0,.15)', border: '1px solid var(--c-dorado)', color: '#ffffff', fontWeight: 600, padding: '12px 20px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '1px' }} onClick={() => exportarReporte('ventas')}>💰 Exportar Ventas</button>
                        <button style={{ background: 'rgba(0,180,216,.15)', border: '1px solid var(--c-azul)', color: '#ffffff', fontWeight: 600, padding: '12px 20px', borderRadius: 50, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '1px' }} onClick={() => exportarReporte('caja')}>💵 Exportar Caja</button>
                      </div>
                      
                      <div className="admin-section-title" style={{ marginTop: 20 }}>RESUMEN GENERAL</div>
                      <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'grid', gap: 12, fontSize: '.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📅 Total reservas:</span><strong>{reservas.length}</strong></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>👥 Clientes registrados:</span><strong>{clientes.length}</strong></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💰 Total ventas:</span><strong>${compras.reduce((s, c) => s + c.precio, 0).toLocaleString()}</strong></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📦 Productos en inventario:</span><strong>{inventario.reduce((s, p) => s + p.stock, 0)}</strong></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>⭐ Puntos en circulación:</span><strong>{clientes.reduce((s, c) => s + getPuntos(c.cedula, reservas, compras), 0)}</strong></div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* ⚙️ CONFIG */}
                  {adminTab === 'config' && (
                    <>
                      <div className="admin-section-title">CONFIGURACIÓN DEL SISTEMA</div>
                      <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
                        <div className="form-field">
                          <label>NOMBRE DEL SALÓN</label>
                          <input className="form-input" value={config.nombreSalon} onChange={e => setConfig({ ...config, nombreSalon: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label>DIRECCIÓN</label>
                          <input className="form-input" value={config.direccion} onChange={e => setConfig({ ...config, direccion: e.target.value })} />
                        </div>
                        <div className="form-field">
                          <label>TELÉFONO</label>
                          <input className="form-input" value={config.telefono} onChange={e => setConfig({ ...config, telefono: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div className="form-field">
                            <label>MONEDA</label>
                            <select className="form-input" value={config.moneda} onChange={e => setConfig({ ...config, moneda: e.target.value })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                              <option value="COP">COP ($)</option>
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                            </select>
                          </div>
                          <div className="form-field">
                            <label>IVA (%)</label>
                            <input className="form-input" type="number" value={config.iva} onChange={e => setConfig({ ...config, iva: parseFloat(e.target.value) || 0 })} />
                          </div>
                        </div>
                        <button className="btn-primary" onClick={guardarConfig}>💾 GUARDAR CONFIGURACIÓN</button>
                      </div>
                    </>
                  )}
                  
                  {/* 📋 AUDITORÍA */}
                  {adminTab === 'auditoria' && (
                    <>
                      {/* Gráficos de auditoría */}
                      <div className="charts-grid" style={{ marginBottom: 16 }}>
                        <div className="chart-card">
                          <h3 className="chart-title">📊 ACTIVIDAD POR MÓDULO</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={[
                              { modulo: 'Reservas', count: auditoriaLogs.filter(l => l.modulo?.toLowerCase().includes('reserva')).length },
                              { modulo: 'Clientes', count: auditoriaLogs.filter(l => l.modulo?.toLowerCase().includes('cliente')).length },
                              { modulo: 'Ventas', count: auditoriaLogs.filter(l => l.modulo?.toLowerCase().includes('venta')).length },
                              { modulo: 'Caja', count: auditoriaLogs.filter(l => l.modulo?.toLowerCase().includes('caja')).length },
                              { modulo: 'Sistema', count: auditoriaLogs.filter(l => !l.modulo || ['config', 'backup', 'usuario'].some(m => l.modulo?.toLowerCase().includes(m))).length },
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="modulo" stroke="#888" fontSize={9} />
                              <YAxis stroke="#888" fontSize={10} />
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #9b5de5', borderRadius: 8 }} />
                              <Bar dataKey="count" fill="#9b5de5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="chart-card">
                          <h3 className="chart-title">👤 ACTIVIDAD POR USUARIO</h3>
                          <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                              <Pie
                                data={Array.from(new Set(auditoriaLogs.map(l => l.usuario))).map(u => ({
                                  name: u,
                                  value: auditoriaLogs.filter(l => l.usuario === u).length
                                })).filter(d => d.value > 0).slice(0, 5)}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {['#ff1493', '#00f5d4', '#ffd700', '#9b5de5', '#3a86ff'].map((color, i) => (
                                  <Cell key={`cell-${i}`} fill={color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ff1493', borderRadius: 8 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="admin-section-title">REGISTRO DE ACTIVIDAD</div>
                      <div style={{ overflowX: 'auto', maxHeight: 400 }}>
                        <table className="admin-table">
                          <thead><tr><th>FECHA</th><th>USUARIO</th><th>ACCIÓN</th><th>MÓDULO</th><th>DETALLE</th></tr></thead>
                          <tbody>
                            {auditoriaLogs.length === 0 ? (
                              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', padding: 20 }}>Sin registros de actividad</td></tr>
                            ) : auditoriaLogs.slice(-50).reverse().map(l => (
                              <tr key={l.id}>
                                <td style={{ fontSize: '.7rem' }}>{new Date(l.fecha).toLocaleString('es-CO')}</td>
                                <td>{l.usuario}</td>
                                <td><span className="badge-ok">{l.accion}</span></td>
                                <td>{l.modulo}</td>
                                <td style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.6)' }}>{l.detalle || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 🔐 USUARIOS */}
                  {adminTab === 'usuarios' && (
                    <>
                      <div className="admin-section-title">CREAR USUARIO ADMIN</div>
                      <div className="admin-form-row">
                        <div className="form-field">
                          <label>USUARIO</label>
                          <input className="form-input" value={nuevoAdminUser.usuario} onChange={e => setNuevoAdminUser({ ...nuevoAdminUser, usuario: e.target.value })} placeholder="nombre_usuario" />
                        </div>
                        <div className="form-field">
                          <label>CONTRASEÑA</label>
                          <input className="form-input" type="password" value={nuevoAdminUser.clave} onChange={e => setNuevoAdminUser({ ...nuevoAdminUser, clave: e.target.value })} placeholder="••••••••" />
                        </div>
                        <div className="form-field">
                          <label>ROL</label>
                          <select className="form-input" value={nuevoAdminUser.rol} onChange={e => setNuevoAdminUser({ ...nuevoAdminUser, rol: e.target.value })} style={{ background: 'rgba(255,255,255,.06)', color: 'white' }}>
                            <option value="admin">👑 Admin</option>
                            <option value="empleado">👩 Empleado</option>
                          </select>
                        </div>
                        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', alignSelf: 'flex-end' }} onClick={agregarAdminUser}>CREAR</button>
                      </div>
                      
                      <div className="admin-section-title">USUARIOS REGISTRADOS</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead><tr><th>USUARIO</th><th>ROL</th><th>TIPO</th><th>ACCIÓN</th></tr></thead>
                          <tbody>
                            {adminUsers.map(u => (
                              <tr key={u.usuario}>
                                <td>{u.usuario}</td>
                                <td><span className="badge-ok">{u.rol}</span></td>
                                <td>{u.tipo === 'default' ? <span style={{ color: 'var(--c-dorado)' }}>⭐ Default</span> : 'Custom'}</td>
                                <td>
                                  {u.tipo !== 'default' && (
                                    <button className="admin-btn admin-btn-red" onClick={() => eliminarAdminUser(u.usuario)}>🗑 Eliminar</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  
                  {/* 💾 BACKUP */}
                  {adminTab === 'backup' && (
                    <>
                      <div className="admin-section-title">RESPALDO DE DATOS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
                        <div style={{ background: 'rgba(0,245,212,.1)', border: '1px solid rgba(0,245,212,.3)', borderRadius: 12, padding: 20 }}>
                          <h4 style={{ marginBottom: 12, color: 'var(--c-turquesa)' }}>📤 EXPORTAR BACKUP</h4>
                          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>
                            Descarga todos los datos del sistema en un archivo JSON.
                          </p>
                          <button className="btn-primary" style={{ background: 'var(--c-turquesa)', color: '#03040e' }} onClick={exportarBackup}>
                            📥 DESCARGAR BACKUP
                          </button>
                        </div>
                        
                        <div style={{ background: 'rgba(255,20,147,.1)', border: '1px solid rgba(255,20,147,.3)', borderRadius: 12, padding: 20 }}>
                          <h4 style={{ marginBottom: 12, color: 'var(--c-fucsia)' }}>📥 IMPORTAR BACKUP</h4>
                          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>
                            Restaura los datos desde un archivo de backup previamente exportado.
                          </p>
                          <input
                            type="file"
                            accept=".json"
                            onChange={importarBackup}
                            style={{ display: 'none' }}
                            id="backup-input"
                          />
                          <button
                            className="btn-primary"
                            style={{ background: 'var(--c-fucsia)' }}
                            onClick={() => document.getElementById('backup-input')?.click()}
                          >
                            📤 SELECCIONAR ARCHIVO
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 12, padding: 16, maxWidth: 600 }}>
                        <h4 style={{ marginBottom: 8, color: 'var(--c-dorado)', fontSize: '.85rem' }}>⚠️ IMPORTANTE</h4>
                        <ul style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.6)', paddingLeft: 16 }}>
                          <li>El backup incluye: profesionales, reservas, clientes, inventario, ventas, configuración, etc.</li>
                          <li>Al importar, los datos actuales serán reemplazados.</li>
                          <li>Se recomienda hacer backup regularmente.</li>
                        </ul>
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
        <img src="/Dexi.jpeg" alt="Dexi IA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        <span className="chat-dot" />
      </button>
      
      {chatOpen && (
        <div id="chatWindow" className="open">
          <div className="chat-header">
            <div className="chat-header-avatar">
              <img src="/Dexi.jpeg" alt="Dexi IA" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
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
            <div className="cred-hint">Demo: Dario / dario2026</div>
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
