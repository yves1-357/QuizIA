import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  try {
    const { messages, conversationId } = await request.json();
    
    // Extraire userId du conversationId (format: userId_recommendation_timestamp)
    const userId = conversationId?.split('_')[0];

    // Appel NON-STREAMING pour obtenir les vrais tokens
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'QuizIA',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages,
        temperature: 0.8,
        max_tokens: 100,
        stream: false, // NON-STREAMING
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = data.choices[0].message.content;
    const tokensIn = data.usage?.prompt_tokens || 0;
    const tokensOut = data.usage?.completion_tokens || 0;

    // Sauvegarder dans ChatConversation avec les VRAIS tokens
    if (userId && fullResponse) {
      try {
        await prisma.chatConversation.create({
          data: {
            userId: userId,
            model: 'gpt-4o-mini',
            tokensIn: tokensIn,
            tokensOut: tokensOut,
            type: 'chat',
            title: 'Recommandation IA',
            messages: JSON.stringify(messages),
          },
        });
        console.log(`Recommandation sauvegardée: ${tokensIn} in, ${tokensOut} out`);
      } catch (dbError) {
        console.error('Erreur sauvegarde:', dbError);
      }
    }

    // Simuler le streaming pour le client (format 0:"content")
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const words = fullResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            controller.enqueue(encoder.encode(`0:"${word}"\n`));
            await new Promise(resolve => setTimeout(resolve, 30));
          }
          controller.close();
        } catch (error) {
          console.error('Erreur streaming simulé:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Erreur API chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
