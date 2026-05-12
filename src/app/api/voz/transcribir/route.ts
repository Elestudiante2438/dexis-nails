import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST - Transcribir audio a texto (Speech-to-Text)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.audio) {
      return NextResponse.json(
        { error: 'Audio es requerido (base64)' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Transcribir audio
    const response = await zai.audio.asr.create({
      file_base64: data.audio.replace(/^data:audio\/\w+;base64,/, '')
    });

    return NextResponse.json({
      success: true,
      texto: response.text
    });
  } catch (error) {
    console.error('Error transcribiendo audio:', error);
    return NextResponse.json(
      { error: 'Error transcribiendo audio' },
      { status: 500 }
    );
  }
}
