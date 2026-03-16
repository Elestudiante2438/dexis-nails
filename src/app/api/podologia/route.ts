import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ 
        diagnostico: 'No se recibió ninguna imagen para analizar.' 
      }, { status: 400 });
    }

    // Usar VLM para analizar la imagen
    const response = await fetch('https://api.zukijourney.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZUKI_API_KEY || process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente especializado en podología y cuidado de los pies para un salón de belleza llamado Dexi's Nails. 
            Tu trabajo es analizar imágenes de pies y proporcionar diagnósticos preliminares orientativos.
            
            IMPORTANTE: Siempre aclara que este diagnóstico es orientativo y no sustituye una consulta médica profesional.
            
            En tu respuesta incluye:
            1. **Análisis visual**: Describe lo que observas en la imagen de forma objetiva
            2. **Posible condición**: Si detectas algo, menciona la posible condición (hongos, callos, uña encarnada, juanete, etc.)
            3. **Recomendaciones**: Sugerencias de cuidado y tratamiento
            4. **Servicios sugeridos**: Qué servicios de Dexi's Nails podrían ayudar (pedicultura, podología integral, spa de pies, etc.)
            5. **Cuándo consultar**: Indica señales de alarma que requieren atención médica
            
            Si la imagen no muestra claramente los pies o no puedes analizarla, indícalo amablemente.
            
            Responde en español, de forma clara y amable, usando emojis para hacer la respuesta más amigable.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Por favor analiza esta imagen de mis pies y dame un diagnóstico preliminar:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const diagnostico = data.choices?.[0]?.message?.content || 'No se pudo generar un diagnóstico. Por favor intenta con otra imagen.';

    return NextResponse.json({ diagnostico });
  } catch (error) {
    console.error('Error en diagnóstico podológico:', error);
    
    // Diagnóstico de respaldo más detallado
    const diagnosticoRespaldo = `🦶 **Análisis de IA - Dexi's Nails**

⚠️ No pude procesar la imagen completamente. Aquí hay algunas recomendaciones generales:

**Cuidados básicos para tus pies:**
• Hidratar diariamente con crema especializada
• Usar calzado cómodo y transpirable
• Mantener las uñas cortas y limpias
• Revisar los pies regularmente

**Servicios que ofrecemos:**
• 🦶 Podología Integral - $45.000
• 💅 Pedicultura Básica - $30.000
• 🧖 Spa de Pies - $40.000

**Señales de alarma (consulta médica):**
• Dolor intenso o persistente
• Enrojecimiento con calor
• Secreciones o mal olor
• Cambios drásticos de color

📅 Te recomendamos agendar una cita con nuestra especialista para una evaluación presencial.`;

    return NextResponse.json({ diagnostico: diagnosticoRespaldo });
  }
}