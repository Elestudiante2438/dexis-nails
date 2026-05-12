import { NextRequest, NextResponse } from 'next/server';

const DIAGNOSTICO_PROMPT = `Sos un asistente de diagnóstico podológico y de uñas para Dexi's Nails.
Analizás la imagen y/o los síntomas descritos y proporcionás un diagnóstico orientativo.

INSTRUCCIONES:
1. Si hay una imagen, analízala detalladamente buscando:
   - Coloración de uñas
   - Estado de la piel
   - Signos de hongos
   - Callosidades
   - Uñas encarnadas
   - Sequedad
   - Otros problemas visibles

2. Con base en el análisis y los síntomas descritos:
   - Proporcioná un diagnóstico probable
   - Un nivel de confianza (porcentaje)
   - Recomendaciones de cuidado
   - Qué profesional del salón puede ayudar

PROFESIONALES DISPONIBLES:
- Dexi: Especialista en Podología & Manicura
- Valentina: Especialista en Manicura & Diseños
- Carolina: Especialista en Parafina & Facial

RESPONDER EN ESTE FORMATO JSON:
{
  "diagnostico": "Nombre del diagnóstico probable",
  "confianza": 75,
  "recomendaciones": [
    "Recomendación 1",
    "Recomendación 2",
    "Recomendación 3"
  ],
  "especialista": "Nombre del profesional recomendado"
}

IMPORTANTE:
- Si el problema parece grave (infección severa, dolor intenso, etc.), indicar que debe consultar un médico
- Ser honesto sobre las limitaciones del diagnóstico virtual
- No recetar medicamentos, solo dar recomendaciones de cuidado general`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sintomas, imagen } = body;

    if (!sintomas && !imagen) {
      return NextResponse.json({ error: 'Se requieren síntomas o imagen' }, { status: 400 });
    }

    // Si hay imagen, usar VLM para análisis
    if (imagen) {
      const { VLM } = await import('z-ai-web-dev-sdk');
      
      const response = await VLM.chat({
        messages: [
          { 
            role: 'user', 
            content: [
              { type: 'text', text: `${DIAGNOSTICO_PROMPT}\n\nSíntomas adicionales del cliente: ${sintomas || 'No proporcionados'}\n\nAnalizá esta imagen y proporcioná el diagnóstico en formato JSON.` },
              { type: 'image_url', image_url: imagen }
            ]
          }
        ],
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 800,
      });

      const content = response.choices?.[0]?.message?.content || '';
      
      // Intentar parsear el JSON de la respuesta
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json(result);
        }
      } catch {
        // Si no se puede parsear, devolver respuesta estructurada
      }

      // Fallback: extraer información de la respuesta
      return NextResponse.json({
        diagnostico: 'Análisis completado',
        confianza: 70,
        recomendaciones: [
          'Mantener buena higiene de pies y uñas',
          'Usar calzado cómodo y transpirable',
          'Hidratar la piel regularmente',
          'Consultar con un profesional para evaluación presencial'
        ],
        especialista: 'Dexi',
        respuestaCompleta: content
      });
    }

    // Si solo hay síntomas, usar LLM
    const { LLM } = await import('z-ai-web-dev-sdk');
    
    const response = await LLM.chat({
      messages: [
        { role: 'system', content: DIAGNOSTICO_PROMPT },
        { role: 'user', content: `Síntomas: ${sintomas}\n\nProporcioná el diagnóstico en formato JSON.` }
      ],
      model: 'claude-3-5-haiku-20241022',
      maxTokens: 600,
    });

    const content = response.choices?.[0]?.message?.content || '';
    
    // Intentar parsear el JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json(result);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      diagnostico: 'Evaluación de síntomas',
      confianza: 60,
      recomendaciones: [
        'Basado en los síntomas descritos, te recomendamos una evaluación presencial',
        'Mantener la zona limpia e hidratada',
        'Evitar calzado ajustado mientras dure la molestia'
      ],
      especialista: 'Dexi'
    });

  } catch (error) {
    console.error('Error en diagnóstico:', error);
    return NextResponse.json({
      diagnostico: 'Error en el análisis',
      confianza: 0,
      recomendaciones: [
        'Por favor, intentá de nuevo más tarde',
        'Si el problema persiste, contactanos directamente'
      ],
      especialista: 'Dexi'
    });
  }
}
