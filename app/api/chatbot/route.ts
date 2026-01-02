import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Interfaces pour pdf2json
interface PDFTextRun {
  T?: string;
}

interface PDFText {
  R?: PDFTextRun[];
}

interface PDFPage {
  Texts?: PDFText[];
}

interface PDFData {
  Pages?: PDFPage[];
}

// Interface pour les contenus multimodaux
interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

type ContentPart = TextContent | ImageContent;

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'openai/gpt-4o-mini', files = [], userId } = await request.json();

    console.log('📁 Fichiers reçus:', files.length);
    
    // Identifier les types de fichiers
    const pdfFiles = files.filter((f: { type: string }) => f.type === 'application/pdf');
    const imageFiles = files.filter((f: { type: string }) => f.type.startsWith('image/'));
    
    console.log('📄 PDFs:', pdfFiles.length, '| 🖼️ Images:', imageFiles.length);

    // Extraire le texte des PDFs avec pdf2json
    let pdfTexts = '';
    
    if (pdfFiles.length > 0) {
      const PDFParser = (await import('pdf2json')).default;
      
      for (const pdfFile of pdfFiles) {
        try {
          console.log('🔄 Extraction PDF:', pdfFile.name);
          
          // Convertir base64 en buffer
          const base64Data = pdfFile.data.split(',')[1] || pdfFile.data;
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Parser le PDF
          const pdfParser = new PDFParser();
          
          const pdfText = await new Promise<string>((resolve, reject) => {
            let extractedText = '';
            
            pdfParser.on('pdfParser_dataReady', (pdfData: PDFData) => {
              try {
                // Extraire le texte de chaque page
                if (pdfData.Pages) {
                  pdfData.Pages.forEach((page, pageIndex) => {
                    extractedText += `\n\n--- Page ${pageIndex + 1} ---\n`;
                    if (page.Texts) {
                      page.Texts.forEach((text) => {
                        if (text.R) {
                          text.R.forEach((run) => {
                            if (run.T) {
                              extractedText += decodeURIComponent(run.T) + ' ';
                            }
                          });
                        }
                      });
                    }
                  });
                }
                resolve(extractedText);
              } catch (error) {
                reject(error);
              }
            });
            
            pdfParser.on('pdfParser_dataError', (error: unknown) => {
              reject(error);
            });
            
            pdfParser.parseBuffer(buffer);
          });
          
          console.log('PDF extrait:', pdfText.length, 'caractères');
          pdfTexts += `\n\n📄 **Contenu de "${pdfFile.name}":**\n${pdfText}\n`;
          
        } catch (error) {
          console.error('Erreur extraction PDF:', error);
          pdfTexts += `\n\nImpossible de lire "${pdfFile.name}". Essaie de prendre des captures d'écran ou copie le texte manuellement.\n`;
        }
      }
    }

    // Préparer les messages avec images et texte extrait des PDFs
    const formattedMessages = messages.map((msg: { role: string; content: string }, index: number) => {
      // Si c'est le dernier message utilisateur et qu'il y a des fichiers
      if (msg.role === 'user' && index === messages.length - 1 && files.length > 0) {
        let textContent = msg.content || 'Analyse le contenu ci-dessous.';
        
        // Ajouter le texte extrait des PDFs
        if (pdfTexts) {
          textContent += pdfTexts;
        }
        
        console.log('💬 Message avec', imageFiles.length, 'images et texte PDF');
        
        if (imageFiles.length > 0) {
          // Construire le contenu multimodal avec images
          const contentParts: ContentPart[] = [
            {
              type: 'text',
              text: textContent
            }
          ];
          
          // Ajouter les images
          imageFiles.forEach((file: { data: string; name: string }) => {
            console.log('🖼️ Ajout image:', file.name);
            contentParts.push({
              type: 'image_url',
              image_url: {
                url: file.data
              }
            });
          });
          
          return {
            role: 'user',
            content: contentParts
          };
        } else {
          // Seulement du texte (avec PDFs extraits)
          return {
            role: 'user',
            content: textContent
          };
        }
      }
      
      return msg;
    });

    const hasPDF = pdfFiles.length > 0;
    const hasImages = imageFiles.length > 0;
    
    const systemPrompt = (hasPDF || hasImages)
      ? `Tu es un assistant pédagogique expert avec capacité d'analyse visuelle${hasPDF ? ' et de documents' : ''}. Tu aides les étudiants avec leurs questions dans tous les domaines.

Règles importantes:
${hasImages ? '- Analyse attentivement les images fournies\n' : ''}${hasPDF ? '- Analyse le texte extrait du PDF et réponds aux questions basées sur son contenu\n' : ''}- Réponds de manière claire et pédagogique
- Utilise des exemples concrets${hasPDF ? ' tirés du document' : ''}${hasImages ? ' de l\'image' : ''}
- Encourage l'étudiant
- Rajoute des emojis pertinents pour rendre la conversation plus engageante
- Si la question est hors sujet (pas liée aux études), redirige poliment
- Réponds en français, sauf pour les questions sur l'anglais
- Sois concis mais complet`
      : `Tu es un assistant pédagogique expert. Tu aides les étudiants avec leurs questions dans tous les domaines.

Règles importantes:
- Réponds de manière claire et pédagogique
- Utilise des exemples concrets
- Encourage l'étudiant
- Rajoute des emojis pertinents pour rendre la conversation plus engageante
- Si la question est hors sujet (pas liée aux études), redirige poliment vers les matières
- Réponds en français, sauf pour les questions sur l'anglais
- Sois concis mais complet`;

    console.log('Envoi à', model, '| PDFs extraits:', hasPDF, '| Images:', hasImages);

    // Appel NON-STREAMING pour obtenir les vrais tokens
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...formattedMessages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false // NON-STREAMING pour avoir usage
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const fullResponse = data.choices[0].message.content;
    const tokensIn = data.usage?.prompt_tokens || 0;
    const tokensOut = data.usage?.completion_tokens || 0;

    // Sauvegarder SEULEMENT les tokens pour le budget (pas la conversation complète)
    // Les conversations sont gérées par /api/chat-conversations
    if (userId && fullResponse) {
      try {
        await prisma.chatConversation.create({
          data: {
            userId: userId,
            model: model,
            tokensIn: tokensIn,
            tokensOut: tokensOut,
            type: 'chat_usage', // Type différent pour ne pas créer de doublons
            title: null, // Pas de titre pour les entrées de budget
            messages: null,
          },
        });
        console.log(`✅ Tokens enregistrés pour budget: ${tokensIn} in, ${tokensOut} out`);
      } catch (dbError) {
        console.error('❌ Erreur sauvegarde tokens:', dbError);
      }
    }

    // Simuler le streaming pour le client (envoyer mot par mot)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Envoyer la réponse mot par mot pour simuler le streaming
          const words = fullResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`));
            // Petit délai pour simuler le streaming
            await new Promise(resolve => setTimeout(resolve, 30));
          }
          controller.close();
        } catch (error) {
          console.error('Erreur streaming simulé:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Erreur API chatbot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
