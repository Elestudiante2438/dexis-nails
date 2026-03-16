import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS SIMPLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type Seccion = 'inicio' | 'precios' | 'reservas' | 'ia' | 'tienda' | 'dashboard' | 'juego' | 'admin';

export type AdminSeccion = 
  | 'dashboard' | 'clientes' | 'profesionales' | 'proveedores' 
  | 'inventario' | 'ordenes' | 'servicios' | 'reservas' 
  | 'ventas' | 'caja' | 'marketing' | 'cupones' 
  | 'giftcards' | 'reportes' | 'configuracion';

interface DexisState {
  // Navegación
  seccionActual: Seccion;
  setSeccion: (sec: Seccion) => void;
  adminSeccion: AdminSeccion;
  setAdminSeccion: (sec: AdminSeccion) => void;
  
  // Formateo
  formatearPrecio: (precio: number) => string;
  generarCodigo: (prefijo: string) => string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORE PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useDexisStore = create<DexisState>()(
  persist(
    (set) => ({
      // Navegación
      seccionActual: 'inicio',
      setSeccion: (sec) => set({ seccionActual: sec }),
      adminSeccion: 'dashboard',
      setAdminSeccion: (sec) => set({ adminSeccion: sec }),
      
      // Formateo
      formatearPrecio: (precio) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(precio);
      },
      
      generarCodigo: (prefijo) => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefijo}-${timestamp}-${random}`;
      },
    }),
    {
      name: 'dexis-nails-storage',
      partialize: (state) => ({
        seccionActual: state.seccionActual,
        adminSeccion: state.adminSeccion,
      }),
    }
  )
);