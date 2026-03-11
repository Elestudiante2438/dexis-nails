// netlify/functions/chat.js — formato nuevo Netlify

const SYSTEM_PROMPT = `Sos la asistente virtual de Dexi's Nails, un salón de belleza cósmico y elegante.
Tu nombre es Dexi IA. Respondés en español, de forma amable, breve y con personalidad cósmica ✨.

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
- Respondés solo sobre el salón, servicios, precios, reservas y cuidado de uñas/pies/piel
- Sos cálida, profesional y usás emojis con moderación 💅✨
- Máximo 3-4 oraciones por respuesta. Sé concisa.
- Si la clienta tiene queja, problema o pregunta muy específica que no podés resolver, respondé exactamente:
  "ESCALAR_WHATSAPP: [mensaje de la clienta]"
- Nunca inventes precios ni servicios que no están listados`;

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { messages, clienteNombre } = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Netlify.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-12)
      })
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      throw new Error('Respuesta inválida: ' + JSON.stringify(data));
    }

    const reply = data.content[0].text;

    if (reply.startsWith('ESCALAR_WHATSAPP:')) {
      const mensajeOriginal = reply.replace('ESCALAR_WHATSAPP:', '').trim();
      await notificarWhatsApp(mensajeOriginal, clienteNombre);
      return new Response(JSON.stringify({
        reply: 'Entiendo tu consulta 💅 Voy a avisarle a Dexi para que te contacte pronto. ¡En breve te responde! ✨',
        escalado: true
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ reply, escalado: false }), { status: 200, headers });

  } catch (err) {
    console.error('Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};

async function notificarWhatsApp(mensajeCliente, clienteNombre) {
  try {
    const numero = Netlify.env.get('WHATSAPP_NUMERO');
    const apiKey = Netlify.env.get('CALLMEBOT_APIKEY');
    if (!numero || !apiKey || apiKey === 'pendiente') return;
    const nombre = clienteNombre || 'Una clienta';
    const texto = `💅 *Dexi's Nails*\n\n*${nombre}* necesita atención:\n\n"${mensajeCliente}"`;
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${numero}&text=${encodeURIComponent(texto)}&apikey=${apiKey}`);
  } catch (e) {
    console.error('WhatsApp error:', e.message);
  }
}

export const config = { path: '/api/chat' };
