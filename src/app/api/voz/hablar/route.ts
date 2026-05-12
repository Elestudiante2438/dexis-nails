import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Convertir texto a audio (Text-to-Speech)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.texto) {
      return NextResponse.json(
        { error: 'Texto es requerido' },
        { status: 400 }
      );
    }

    // Limitar texto a 1024 caracteres (limitación del API)
    const texto = data.texto.substring(0, 1024);

    const zai = await ZAI.create();

    // Generar audio con voz femenina
    const response = await zai.audio.tts.create({
      input: texto,
      voice: 'chuichui', // Voz femenina animada
      speed: data.speed || 1.0,
      response_format: 'wav',
      stream: false,
    });

    // Obtener buffer de audio
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // Retornar audio como respuesta
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generando audio:', error);
    return NextResponse.json(
      { error: 'Error generando audio' },
      { status: 500 }
    );
  }
}
