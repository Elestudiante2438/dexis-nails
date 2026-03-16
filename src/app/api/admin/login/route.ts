import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Contraseña hasheada simple para demo
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await db.adminUser.findUnique({
      where: { email },
    });

    // Si no existe, crear admin por defecto
    if (!user) {
      if (email === 'admin@dexisnails.com' && password === ADMIN_PASSWORD) {
        const newUser = await db.adminUser.create({
          data: {
            email: 'admin@dexisnails.com',
            password: ADMIN_PASSWORD,
            nombre: 'Administrador',
            rol: 'SUPER_ADMIN',
            activo: true,
          },
        });
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json({ 
          user: userWithoutPassword,
          message: 'Login exitoso' 
        });
      }
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña (simple para demo)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si está activo
    if (!user.activo) {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login exitoso' 
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Crear usuario admin inicial si no existe
export async function GET() {
  try {
    const existingAdmin = await db.adminUser.findFirst();
    
    if (!existingAdmin) {
      const admin = await db.adminUser.create({
        data: {
          email: 'admin@dexisnails.com',
          password: 'admin123',
          nombre: 'Administrador',
          rol: 'SUPER_ADMIN',
          activo: true,
        },
      });

      return NextResponse.json({ 
        message: 'Usuario admin creado',
        email: 'admin@dexisnails.com',
        password: 'admin123'
      });
    }

    return NextResponse.json({ 
      message: 'Usuarios ya existen',
      count: await db.adminUser.count()
    });
  } catch (error) {
    console.error('Error creando admin inicial:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}