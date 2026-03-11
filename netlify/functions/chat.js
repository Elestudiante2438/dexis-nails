// netlify/functions/chat.js
// Proxy seguro entre el navegador y la API de Anthropic
// La API key NUNCA se expone al navegador

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

REGLAS MUY IMPORTANTES:
- Respondés solo sobre el salón, servicios, precios, reservas y cuidado de uñas/pies/piel
- Sos cálida, profesional y usás emojis con moderación 💅✨
- Máximo 3-4 oraciones por respuesta. Sé concisa.
- Si la clienta tiene una queja, problema con un servicio, o pregunta muy específica que no podés resolver, respondé exactamente esto (sin cambiar nada):
  "ESCALAR_WHATSAPP: [el mensaje de la clienta]"
- Ejemplos de cuando ESCALAR:
  * "me quedó mal la uña"
  * "quiero hablar con Dexi directamente"  
  * "tuve un problema en mi última visita"
  * preguntas sobre descuentos especiales o negociaciones
  * quejas o reclamos
- Nunca inventes precios ni servicios que no están listados arriba`;

export default async (event) => {
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { messages, clienteNombre } = JSON.parse(event.body);

    // Llamada a Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5', // Haiku = más barato y rápido para chat
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-12)
      })
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      throw new Error('Respuesta inválida de Anthropic');
    }

    const reply = data.content[0].text;

    // Detectar si hay que escalar a WhatsApp
    if (reply.startsWith('ESCALAR_WHATSAPP:')) {
      const mensajeOriginal = reply.replace('ESCALAR_WHATSAPP:', '').trim();
      
      // Enviar WhatsApp via CallMeBot
      await notificarWhatsApp(mensajeOriginal, clienteNombre);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: `Entiendo tu consulta 💅 Voy a avisarle a Dexi directamente para que te contacte pronto. ¡En breve te responde! ✨`,
          escalado: true
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, escalado: false })
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno', detalle: err.message })
    };
  }
};

async function notificarWhatsApp(mensajeCliente, clienteNombre) {
  try {
    const numero = process.env.WHATSAPP_NUMERO; // Sin + ni espacios, ej: 573206196500
    const apiKey = process.env.CALLMEBOT_APIKEY;
    
    if (!numero || !apiKey) {
      console.log('WhatsApp no configurado aún');
      return;
    }

    const nombre = clienteNombre || 'Una clienta';
    const texto = `💅 *Dexi's Nails - Chat*\n\n*${nombre}* necesita tu atención:\n\n"${mensajeCliente}"\n\n_Respondé directamente por WhatsApp a la clienta._`;
    
    const url = `https://api.callmebot.com/whatsapp.php?phone=${numero}&text=${encodeURIComponent(texto)}&apikey=${apiKey}`;
    
    await fetch(url);
    console.log('WhatsApp enviado a', numero);
  } catch (e) {
    console.error('Error WhatsApp:', e);
  }
}
