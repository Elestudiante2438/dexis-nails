import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Call VLM API
    const response = await fetch('https://api.zukijourney.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZUKI_API_KEY || process.env.NEXT_PUBLIC_ZUKI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Analiza esta imagen y describe lo que ves relacionado con podología o manicura.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VLM API error:', errorText);
      return NextResponse.json({ error: 'Error from VLM API' }, { status: 500 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ result });

  } catch (error) {
    console.error('Vision API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
