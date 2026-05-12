import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Analizar imagen de pies con VLM
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.image) {
      return NextResponse.json(
        { error: 'Imagen es requerida' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `Eres un asistente experto en podología para el salón de belleza "Dexi's Nails". 
Analiza esta imagen de pies y proporciona un diagnóstico preliminar profesional.

IMPORTANTE: Este es un análisis preliminar y NO reemplaza una consulta médica profesional.

Responde SOLO en formato JSON con esta estructura:
{
  "diagnostico": "Nombre del diagnóstico principal",
  "confianza": 85,
  "descripcion": "Descripción detallada de lo que observas",
  "sintomas": ["síntoma 1", "síntoma 2"],
  "recomendaciones": [
    "Recomendación 1",
    "Recomendación 2"
  ],
  "tratamientosSugeridos": [
    "Tratamiento sugerido 1"
  ],
  "serviciosRecomendados": [
    {"nombre": "Servicio", "razon": "Por qué lo recomiendas"}
  ],
  "nivelUrgencia": "BAJO|MEDIO|ALTO",
  "requiereMedico": true|false,
  "notas": "Notas adicionales importantes"
}

Si la imagen no es clara o no muestra pies, responde con:
{
  "diagnostico": "Imagen no clara",
  "confianza": 0,
  "descripcion": "No se puede analizar la imagen. Por favor toma una foto más clara.",
  "sintomas": [],
  "recomendaciones": ["Tomar una foto con mejor iluminación", "Asegurarse de que los pies estén bien visibles"],
  "tratamientosSugeridos": [],
  "serviciosRecomendados": [],
  "nivelUrgencia": "BAJO",
  "requiereMedico": false,
  "notas": "Vuelve a intentar con una mejor foto"
}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: data.image // Puede ser URL o base64
              }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const content = response.choices[0]?.message?.content;

    // Intentar parsear el JSON de la respuesta
    let analisis;
    try {
      // Limpiar la respuesta si viene con markdown
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analisis = JSON.parse(cleanContent);
    } catch {
      // Si no se puede parsear, crear estructura básica
      analisis = {
        diagnostico: 'Análisis completado',
        confianza: 70,
        descripcion: content,
        sintomas: [],
        recomendaciones: ['Consultar con un especialista para mayor detalle'],
        tratamientosSugeridos: [],
        serviciosRecomendados: [],
        nivelUrgencia: 'BAJO',
        requiereMedico: false,
        notas: 'Respuesta del modelo: ' + content?.substring(0, 200)
      };
    }

    return NextResponse.json({
      success: true,
      analisis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analizando imagen:', error);
    return NextResponse.json(
      { error: 'Error analizando la imagen. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
