import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subject, level, model, academicLevel, questionCount } = await request.json();

    // Mapper le niveau académique vers une description
    const academicLevelMap: Record<string, string> = {
      'lycee': 'niveau secondaire (lycée/humanités)',
      'universite': 'niveau universitaire (bachelier/licence)',
      'master': 'niveau master (études avancées)',
    };

    const academicDescription = academicLevelMap[academicLevel] || 'niveau général';

    // Adapter la difficulté selon le niveau
    let difficultyInstruction = '';
    if (level === 1) {
      difficultyInstruction = 'Questions fondamentales et concepts de base';
    } else if (level === 2) {
      difficultyInstruction = 'Questions intermédiaires avec application des concepts, plus complexes que le niveau 1';
    } else if (level === 3) {
      difficultyInstruction = 'Questions avancées nécessitant réflexion et combinaison de concepts, nettement plus difficiles';
    } else {
      difficultyInstruction = `Questions très avancées et complexes de niveau ${level}, augmentation significative de la difficulté`;
    }

    const prompt = `Tu es un professeur expert en ${subject}. Génère exactement ${questionCount} questions de ${academicDescription} pour évaluer les connaissances d'un étudiant.

Règles importantes:
- Adapte la complexité et les concepts au ${academicDescription}
- Niveau de difficulté du quiz : ${level}
- Difficulté requise : ${difficultyInstruction}
- IMPORTANT : Les questions doivent être progressivement PLUS DIFFICILES à chaque niveau
- Les questions doivent correspondre aux programmes typiques de ${academicDescription}

Pour chaque question, fournis:
1. La question claire et précise
2. 4 options de réponse (A, B, C, D)
3. La réponse correcte

Format JSON STRICT (aucun texte avant ou après):
{
  "questions": [
    {
      "question": "Question ici?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option correcte exacte"
    }
  ]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'QuizIA',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter error:', errorData);
      return NextResponse.json(
        { error: 'Erreur API OpenRouter', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse le JSON de la réponse
    let parsedContent;
    try {
      // Chercher le JSON dans la réponse (au cas où il y a du texte avant/après)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        parsedContent = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      console.log('Contenu reçu:', content);
      return NextResponse.json(
        { error: 'Format de réponse invalide', content },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: parsedContent.questions,
      model: model,
    });

  } catch (error: any) {
    console.error('Erreur génération quiz:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
