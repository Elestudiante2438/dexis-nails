import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `Sos la asistente virtual de Dexi's Nails, un salón de belleza cósmico y elegante.
Tu nombre es Dexi IA. Respondés en español, de forma amable, breve y con personalidad cósmica ✨.

IMPORTANTE: Tu función es SOLAMENTE informar y responder preguntas frecuentes. NO podés hacer reservas ni gestionar turnos.
Para reservar, el usuario debe ir a la sección RESERVA del menú principal.

INFORMACIÓN DEL SALÓN:
- Nombre: Dexi's Nails
- Servicios: Manicura básica ($25.000), Manicura con diseños ($35.000), Semipermanente ($35.000), Press On ($40.000), Base Rubber ($15.000)
- Podología: Integral ($45.000), Pedicure tradicional ($35.000), Terapia con parafina ($30.000)
- Facial: Limpieza básica ($40.000), Limpieza profunda ($65.000)
- Adicionales: Retiro de cutículas ($12.000), Diseño por uña ($5.000 c/u), Reflexología podal ($25.000)
- Tienda: Colonias y perfumes árabes (desde $42.500 hasta $95.000)
- Horario: Lunes a Sábado 9:00–18:00, Domingo cerrado
- Profesionales: Dexi (Podología & Manicura), Valentina (Manicura & Diseños), Carolina (Parafina & Facial)
- Programa de fidelidad: Bronce (0-49 pts), Plata (50-149), Oro (150-299), Diamante (300+)
- 10 puntos por reserva, 5 puntos por compra en tienda

REGLAS:
- Respondés solo sobre el salón, servicios, precios, horarios y cuidado de uñas/pies/piel
- Si alguien quiere reservar, indicale que vaya a la sección RESERVA en el menú
- Sos cálida, profesional y usás emojis con moderación 💅✨
- Máximo 3-4 oraciones por respuesta. Sé concisa.
- Nunca inventes precios ni servicios que no están listados`;

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Respuestas predefinidas como respaldo
function getSmartResponse(message: string): string | null {
  const msg = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Saludos
  if (msg.match(/\b(hola|buenos dias|buenas tardes|buenas noches|hey|hi)\b/)) {
    return '💫 ¡Hola! Soy Dexi IA, tu asistente virtual. ¿En qué puedo ayudarte? Puedo informarte sobre nuestros servicios, precios, horarios y ayudarte con reservas. 💅✨';
  }
  
  // Manicura
  if (msg.includes('manicura') || msg.includes('manicure') || msg.includes('uñas') || msg.includes('unas')) {
    return '💅 Tenemos varios servicios de manicura:\n\n• Manicura tradicional: $25.000 (30 min)\n• Manicura con diseños: $35.000 (45 min)\n• Semipermanente: $35.000 (45 min)\n• Press On: $40.000 (30 min)\n• Base Rubber: $15.000 (15 min)\n\n¿Te gustaría reservar? Ve a la sección RESERVA ✨';
  }
  
  // Podología
  if (msg.includes('podo') || msg.includes('pies') || msg.includes('pedicure') || msg.includes('pedicura')) {
    return '🦶 Nuestros servicios de podología:\n\n• Podología integral: $45.000 (45 min)\n• Pedicure tradicional: $35.000 (40 min)\n• Terapia con parafina: $30.000 (30 min)\n\nDexi es nuestra especialista en podología. ¿Querés reservar? 💅';
  }
  
  // Facial
  if (msg.includes('facial') || msg.includes('cara') || msg.includes('limpieza')) {
    return '🧖 Nuestros servicios faciales:\n\n• Limpieza facial básica: $40.000 (45 min)\n• Limpieza facial profunda: $65.000 (60 min)\n\nCarolina es nuestra especialista en faciales. ¿Te gustaría reservar? ✨';
  }
  
  // Precios
  if (msg.includes('precio') || msg.includes('costo') || msg.includes('cuanto') || msg.includes('cuánto') || msg.includes('vale')) {
    return '💰 Nuestros precios:\n\n💅 MANICURA:\n• Tradicional: $25.000\n• Con diseños: $35.000\n• Semipermanente: $35.000\n\n🦶 PODOLOGÍA:\n• Integral: $45.000\n• Pedicure: $35.000\n\n🧖 FACIAL:\n• Básica: $40.000\n• Profunda: $65.000\n\n¿Querés reservar algún servicio? 💅';
  }
  
  // Horarios
  if (msg.includes('horario') || msg.includes('hora') || msg.includes('abren') || msg.includes('cierran') || msg.includes('atienden')) {
    return '🕐 Nuestros horarios:\n\n• Lunes a Sábado: 9:00 a 18:00\n• Domingo: CERRADO\n\n¡Te esperamos! ¿Querés reservar un turno? 💅✨';
  }
  
  // Profesionales
  if (msg.includes('profesional') || msg.includes('quien') || msg.includes('quién') || msg.includes('trabajan') || msg.includes('equipo') || msg.includes('dexi') || msg.includes('valentina') || msg.includes('carolina')) {
    return '👩 Nuestro equipo:\n\n• **Dexi** - Podología & Manicura\n• **Valentina** - Manicura & Diseños\n• **Carolina** - Parafina & Facial\n\n¡Todas son excelentes profesionales! ¿Con quién te gustaría reservar? 💅✨';
  }
  
  // Perfumes/Tienda
  if (msg.includes('perfume') || msg.includes('colonia') || msg.includes('tienda') || msg.includes('arabe') || msg.includes('árabe')) {
    return '🌸 En nuestra tienda tenemos perfumes y colonias árabes:\n\n• Colonias frescas desde $42.500\n• Perfumes intensos desde $87.900\n\nMarcas: Agua de Oriente, Brisas de Dubai, Flor de Azahar, Oud Silver, Rose Noir y más. ¡Visitá la sección TIENDA! 🛍️✨';
  }
  
  // Reservar
  if (msg.includes('reserv') || msg.includes('turno') || msg.includes('cita') || msg.includes('agenda')) {
    return '📅 Para reservar un turno, por favor ve a la sección RESERVA en el menú principal. Ahí podrás:\n\n1. Iniciar sesión con tu nombre y cédula\n2. Elegir la profesional\n3. Seleccionar día y hora\n4. Confirmar tu reserva\n\nYo solo puedo informarte, no puedo hacer reservas directamente. 💅✨';
  }
  
  // Fidelidad/Puntos
  if (msg.includes('punto') || msg.includes('fidelidad') || msg.includes('descuento') || msg.includes('nivel') || msg.includes('bronce') || msg.includes('plata') || msg.includes('oro') || msg.includes('diamante')) {
    return '⭐ Programa de Fidelidad:\n\n🥉 BRONCE (0-49 pts): 3% descuento\n🥈 PLATA (50-149 pts): 5% descuento\n🥇 ORO (150-299 pts): 10% descuento\n💎 DIAMANTE (300+ pts): 15% descuento\n\nGanás 10 pts por reserva y 5 pts por compra en tienda. ¡Sumá puntos con cada visita! 💅✨';
  }
  
  // Agradecimientos
  if (msg.includes('gracias') || msg.includes('genial') || msg.includes('perfecto') || msg.includes('excelente') || msg.includes('ok') || msg.includes('listo')) {
    return '💫 ¡De nada! Si tenés más preguntas, estoy acá para ayudarte. ¡Que tengas un día maravilloso! 💅✨';
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    // Obtener el último mensaje del usuario
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    const userContent = lastUserMessage?.content || '';
    
    // Intentar usar el LLM primero
    try {
      const zai = await getZai();
      
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: SYSTEM_PROMPT
          },
          ...messages.slice(-12),
        ],
        thinking: { type: 'disabled' }
      });
      
      const reply = completion.choices[0]?.message?.content;
      if (reply) {
        return NextResponse.json({ reply });
      }
    } catch (llmError) {
      console.log('LLM no disponible, usando respuestas predefinidas');
    }
    
    // Si el LLM falla, usar respuestas predefinidas
    const smartReply = getSmartResponse(userContent);
    if (smartReply) {
      return NextResponse.json({ reply: smartReply });
    }
    
    // Respuesta por defecto
    return NextResponse.json({ 
      reply: '💫 Soy Dexi IA, tu asistente virtual. Puedo ayudarte con:\n\n• Servicios y precios\n• Horarios de atención\n• Información sobre profesionales\n• Programa de fidelidad\n• Perfumes y colonias\n\n¿Sobre qué tema me consultás? 💅✨' 
    });
  } catch (error) {
    console.error('Error en chat API:', error);
    return NextResponse.json({ 
      reply: '💫 Soy Dexi IA, tu asistente virtual. Puedo ayudarte con:\n\n• Servicios y precios\n• Horarios de atención\n• Información sobre profesionales\n• Programa de fidelidad\n• Perfumes y colonias\n\n¿Sobre qué tema me consultás? 💅✨' 
    });
  }
}
