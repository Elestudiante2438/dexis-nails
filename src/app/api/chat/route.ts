import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Respuestas inteligentes basadas en patrones (sin necesidad de API externa)
function generateResponse(message: string, datosReserva: Record<string, string>): { reply: string; datosReserva: Record<string, string>; reservaGuardada?: boolean; codigoReserva?: string } {
  const msg = message.toLowerCase().trim();
  
  // Extraer datos del mensaje
  const nuevosDatos = extractReservationData(message);
  const reservaActual = { ...datosReserva, ...nuevosDatos };
  
  // Detectar intención del usuario
  const esSaludo = /^(hola|buenos\s*d[ií]as|buenas\s*tardes|buenas\s*noches|hey|hi|hello)/i.test(msg);
  const esConsultaServicios = /(?:servicios?|qué\s*(?:tienen|ofrecen)|cu[aá]les\s*son|precios|cu[aá]nto\s*cuesta)/i.test(msg);
  const esConsultaProductos = /(?:colonia|colonias|perfume|perfumes|producto|productos)/i.test(msg);
  const esConsultaHorario = /(?:horario|hora|cuando|cuándo|abierto|abren|cierran)/i.test(msg);
  const esConsultaUbicacion = /(?:direcci[oó]n|ubicaci[oó]n|d[oó]nde|dire|ubicacion)/i.test(msg);
  const esReserva = /(?:reservar|cita|turno|agendar|quiero|necesito|pedicure|manicura|facial|podolog)/i.test(msg);
  
  // Saludo inicial
  if (esSaludo) {
    return {
      reply: '¡Hola! 💅 Soy Dexi, la dueña del salón. ¿En qué puedo ayudarte hoy? Puedo informarte sobre servicios, precios, productos o ayudarte a hacer una reserva.',
      datosReserva: reservaActual
    };
  }
  
  // Consulta de servicios
  if (esConsultaServicios) {
    return {
      reply: `📋 **Nuestros Servicios:**

**💅 Manicura:**
• Manicura básica: $25.000
• Manicura con diseños: $35.000
• Semipermanente: $35.000
• Press On: $40.000

**🦶 Podología:**
• Podología integral: $45.000
• Pedicure tradicional: $35.000
• Terapia con parafina: $30.000

**✨ Facial:**
• Limpieza básica: $40.000
• Limpieza profunda: $65.000

¿Te gustaría reservar alguno?`,
      datosReserva: reservaActual
    };
  }
  
  // Consulta de productos
  if (esConsultaProductos) {
    return {
      reply: `🧴 **Colonias:**
• Agua de Oriente: $45.900
• Brisas de Dubai: $49.900
• Flor de Azahar: $42.500

💎 **Perfumes:**
• La Bestia Negra: $89.900
• Oud Silver: $95.000
• Rose Noir: $92.500
• Amber Gold: $87.900

¿Te interesa alguno en particular?`,
      datosReserva: reservaActual
    };
  }
  
  // Consulta de horario
  if (esConsultaHorario) {
    return {
      reply: `🕐 **Horario de Atención:**
Lunes a Sábado: 9:00 AM - 6:00 PM
Domingo: Cerrado

📍 Estamos en: Carrera 15 #10-23, Centro

¿Querés hacer una reserva?`,
      datosReserva: reservaActual
    };
  }
  
  // Consulta de ubicación
  if (esConsultaUbicacion) {
    return {
      reply: `📍 **Nuestra Ubicación:**
Carrera 15 #10-23, Centro

🕐 Horario: Lunes a Sábado de 9:00 AM a 6:00 PM

¡Te esperamos! 💅`,
      datosReserva: reservaActual
    };
  }
  
  // Si está haciendo una reserva
  if (esReserva || reservaActual.servicio || Object.keys(datosReserva).length > 0) {
    
    // Verificar si ya tiene servicio detectado
    if (!reservaActual.servicio) {
      // Detectar servicio del mensaje
      if (/pedicure|pedicura/i.test(msg)) {
        reservaActual.servicio = 'Pedicure tradicional';
      } else if (/podolog/i.test(msg)) {
        reservaActual.servicio = 'Podología integral';
      } else if (/manicura/i.test(msg)) {
        reservaActual.servicio = 'Manicura Tradicional';
      } else if (/facial/i.test(msg)) {
        reservaActual.servicio = 'Limpieza facial básica';
      } else if (/semi/i.test(msg)) {
        reservaActual.servicio = 'Semipermanente';
      }
    }
    
    // Construir lista de datos que faltan
    const faltantes: string[] = [];
    if (!reservaActual.nombre) faltantes.push('tu nombre');
    if (!reservaActual.telefono) faltantes.push('tu teléfono');
    if (!reservaActual.fecha) faltantes.push('la fecha');
    if (!reservaActual.hora) faltantes.push('la hora');
    
    if (!reservaActual.servicio) {
      return {
        reply: '¿Qué servicio te gustaría reservar? Tenemos:\n\n• Pedicure tradicional ($35.000)\n• Podología integral ($45.000)\n• Manicura ($25.000)\n• Facial ($40.000)\n• Semipermanente ($35.000)',
        datosReserva: reservaActual
      };
    }
    
    if (faltantes.length > 0) {
      if (faltantes.length === 1) {
        return {
          reply: `Perfecto, ya tengo el servicio: ${reservaActual.servicio}. Solo necesito ${faltantes[0]}.`,
          datosReserva: reservaActual
        };
      } else {
        return {
          reply: `Perfecto, servicio: ${reservaActual.servicio}. Para continuar necesito:\n${faltantes.map(f => `• ${f}`).join('\n')}`,
          datosReserva: reservaActual
        };
      }
    }
    
    // Si tiene todos los datos, confirmar
    const tieneTodos = reservaActual.nombre && reservaActual.telefono && reservaActual.servicio && reservaActual.fecha && reservaActual.hora;
    
    if (tieneTodos) {
      return {
        reply: `¡Excelente! Confirmá tu reserva:

📋 **Reserva:**
• Nombre: ${reservaActual.nombre}
• Teléfono: ${reservaActual.telefono}
• Servicio: ${reservaActual.servicio}
• Fecha: ${reservaActual.fecha}
• Hora: ${reservaActual.hora}

¡Te esperamos! 💅✨`,
        datosReserva: {},
        reservaGuardada: true,
        codigoReserva: `R${Date.now().toString(36).toUpperCase()}`
      };
    }
  }
  
  // Respuesta por defecto
  return {
    reply: '¡Hola! 💅 Soy Dexi. Puedo ayudarte con:\n\n• Servicios y precios\n• Productos (colonias y perfumes)\n• Horarios\n• Reservas\n\n¿En qué puedo ayudarte?',
    datosReserva: reservaActual
  };
}

// Función para extraer datos de reserva
function extractReservationData(text: string): Record<string, string> {
  const data: Record<string, string> = {};
  const palabrasNoNombre = [
    'el', 'la', 'los', 'las', 'y', 'o', 'de', 'del', 'en', 'por', 'para', 'con',
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
    'pedicure', 'manicura', 'facial', 'podologia', 'servicio', 'reservar', 'cita'
  ];
  
  // Teléfono (10 dígitos empezando por 3)
  const telMatch = text.match(/\b(3\d{9})\b/);
  if (telMatch) {
    data.telefono = telMatch[1];
  }
  
  // Nombre (2 palabras capitalizadas)
  const nombreMatch = text.match(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)\b/);
  if (nombreMatch && !palabrasNoNombre.includes(nombreMatch[1].toLowerCase())) {
    data.nombre = `${nombreMatch[1]} ${nombreMatch[2]}`;
  }
  
  // Hora
  const horaMatch = text.match(/(?:a\s*)?las?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (horaMatch) {
    let h = parseInt(horaMatch[1]);
    if (horaMatch[3]?.toLowerCase() === 'pm' && h < 12) h += 12;
    if (h >= 9 && h <= 18) {
      data.hora = `${String(h).padStart(2, '0')}:${horaMatch[2] || '00'}`;
    }
  }
  
  // Fecha
  const hoy = new Date();
  if (/hoy/i.test(text)) {
    data.fecha = hoy.toISOString().split('T')[0];
  } else if (/mañana/i.test(text)) {
    const m = new Date(hoy);
    m.setDate(m.getDate() + 1);
    data.fecha = m.toISOString().split('T')[0];
  } else {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    for (let i = 0; i < 7; i++) {
      if (new RegExp(dias[i], 'i').test(text)) {
        const diff = (i - hoy.getDay() + 7) % 7 || 7;
        const f = new Date(hoy);
        f.setDate(f.getDate() + diff);
        data.fecha = f.toISOString().split('T')[0];
        break;
      }
    }
  }
  
  // Servicio
  if (/pedicure|pedicura/i.test(text)) data.servicio = 'Pedicure tradicional';
  else if (/podolog/i.test(text)) data.servicio = 'Podología integral';
  else if (/manicura/i.test(text)) data.servicio = 'Manicura Tradicional';
  else if (/facial/i.test(text)) data.servicio = 'Limpieza facial básica';
  else if (/semi/i.test(text)) data.servicio = 'Semipermanente';
  
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, mensaje, datosReserva } = body;
    
    const mensajeTexto = mensaje || (messages && messages.length > 0 ? messages[messages.length - 1]?.content : '');
    const contextoActual = datosReserva || {};
    
    // Generar respuesta local
    const resultado = generateResponse(mensajeTexto, contextoActual);
    
    // Si hay reserva completa, guardar en BD
    if (resultado.reservaGuardada && resultado.codigoReserva) {
      try {
        const reserva = datosReserva || {};
        let cliente = await db.cliente.findFirst({
          where: { telefono: reserva.telefono }
        });
        
        if (!cliente && reserva.nombre && reserva.telefono) {
          cliente = await db.cliente.create({
            data: {
              nombre: reserva.nombre,
              telefono: reserva.telefono,
              puntosFidelidad: 10,
            }
          });
        }
        
        if (cliente) {
          let servicio = await db.servicio.findFirst({
            where: { nombre: reserva.servicio }
          });
          
          await db.reserva.create({
            data: {
              codigo: resultado.codigoReserva,
              clienteId: cliente.id,
              servicioId: servicio?.id,
              fecha: reserva.fecha,
              horaInicio: reserva.hora,
              estado: 'CONFIRMADA',
              precioOriginal: servicio?.precio,
              precioFinal: servicio?.precio,
              notas: `Via chat. Servicio: ${reserva.servicio}`,
            }
          });
        }
      } catch (e) {
        console.error('Error guardando reserva:', e);
      }
    }
    
    return NextResponse.json({
      success: true,
      reply: resultado.reply,
      datosReserva: resultado.datosReserva,
      reservaGuardada: resultado.reservaGuardada,
      codigoReserva: resultado.codigoReserva
    });
    
  } catch (error) {
    console.error('Error en chat:', error);
    return NextResponse.json({
      success: false,
      reply: '💫 ¡Hola! Soy Dexi. ¿En qué puedo ayudarte?'
    });
  }
}
