// Cloudflare Pages Function: /api/tts
// Natural Iranian Persian (Farsi) Text-to-Speech via Gemini 3.8 Flash TTS

interface Env {
  GEMINI_API_KEY?: string;
  USERS_KV?: any;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const data = await request.json() as any;
    const { text, clientApiKey, voice = 'Sulafat', style = 'calm and wise Persian recitation' } = data;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'INVALID_INPUT', message: 'Text is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'NO_API_KEY',
          message: 'No Gemini API key available. Please provide API key in app settings or admin portal.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Clean and limit text length for TTS turn
    const cleanText = text.trim().slice(0, 1200);

    const payload = {
      model: 'gemini-3.8-flash-tts',
      input: [
        {
          type: 'user_input',
          content: [
            {
              type: 'text',
              text: cleanText,
              annotations: [
                {
                  type: 'speech_metadata',
                  style
                }
              ]
            }
          ]
        }
      ],
      response_format: {
        type: 'audio'
      },
      generation_config: {
        speech_config: [
          {
            voice
          }
        ]
      }
    };

    const upstreamRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!upstreamRes.ok) {
      const errBody = await upstreamRes.text();
      return new Response(
        JSON.stringify({
          error: 'TTS_UPSTREAM_ERROR',
          status: upstreamRes.status,
          details: errBody
        }),
        { status: upstreamRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const json = await upstreamRes.json() as any;
    
    // Extract base64 audio from steps content
    let audioData: string | null = null;
    let mimeType = 'audio/wav';

    if (json.output_audio?.data) {
      audioData = json.output_audio.data;
    } else if (Array.isArray(json.steps)) {
      for (const step of json.steps) {
        if (Array.isArray(step.content)) {
          for (const item of step.content) {
            if (item.type === 'audio' && item.data) {
              audioData = item.data;
              if (item.mime_type) mimeType = item.mime_type;
              break;
            }
          }
        }
        if (audioData) break;
      }
    }

    if (!audioData) {
      return new Response(
        JSON.stringify({ error: 'NO_AUDIO_RETURNED', message: 'Model returned no audio payload.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        audioBase64: audioData,
        mimeType
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400'
        }
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: err?.message || 'TTS failure' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
