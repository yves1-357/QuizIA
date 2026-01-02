import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, subjectId, subject, level, questions, answers, model } = await request.json();

    // Récupérer l'utilisateur pour obtenir son nom
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    const userName = user?.name || 'Utilisateur';

    // Calculer le score
    let correctCount = 0;
    questions.forEach((q: Question, index: number) => {
      if (q.correctAnswer === answers[index]) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    
    // Seuils de réussite variables selon le niveau
    let passingScore = 70; // Par défaut
    if (level === 1) {
      passingScore = 50;
    } else if (level === 2) {
      passingScore = 60;
    } else if (level === 3) {
      passingScore = 80;
    } else if (level >= 4) {
      passingScore = 95;
    }
    
    const passed = score >= passingScore;

    // Créer le prompt pour l'IA
    const analysisPrompt = `Tu es un professeur en ${subject}. Un étudiant vient de terminer un quiz de niveau ${level}.

Score: ${correctCount}/${totalQuestions} (${score}%)

Questions et réponses:
${questions.map((q: Question, i: number) => `
Q${i + 1}: ${q.question}
Réponse de l'étudiant: ${answers[i]}
Réponse correcte: ${q.correctAnswer}
${q.correctAnswer === answers[i] ? '✓ Correct' : '✗ Incorrect'}
`).join('\n')}

Fournis un feedback personnalisé en 2-3 phrases:
1. Félicite les points forts
2. Identifie les domaines à améliorer
3. ${passed ? 'Encourage pour le niveau suivant' : 'Motive à réessayer'}

Sois encourageant et constructif.`;

    // Appeler l'IA pour le feedback
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            content: analysisPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    const aiData = await aiResponse.json();
    const feedback = aiData.choices[0].message.content;

    // Sauvegarder dans ChatConversation pour le suivi du budget
    const tokensIn = aiData.usage?.prompt_tokens || 0;
    const tokensOut = aiData.usage?.completion_tokens || 0;

    try {
      await prisma.chatConversation.create({
        data: {
          userId: userId,
          model: model,
          tokensIn: tokensIn,
          tokensOut: tokensOut,
          type: 'quiz_analysis',
        },
      });
    } catch (dbError) {
      console.error('Erreur sauvegarde ChatConversation:', dbError);
      // On continue même si l'enregistrement échoue
    }

    // Trouver ou créer le sujet
    let subjectRecord = await prisma.subject.findFirst({
      where: { name: subject },
    });

    if (!subjectRecord) {
      subjectRecord = await prisma.subject.create({
        data: {
          name: subject,
          description: `Cours de ${subject}`,
          icon: subject === 'Mathématiques' ? '⚡' : subject === 'Physique' ? '🎯' : '📖',
        },
      });
    }

    // Trouver ou créer le topic pour ce niveau
    let topic = await prisma.topic.findFirst({
      where: {
        subjectId: subjectRecord.id,
        name: `Niveau ${level}`,
      },
    });

    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          subjectId: subjectRecord.id,
          name: `Niveau ${level}`,
          description: `Niveau ${level} - ${subject}`,
          order: level,
          userId: userId,
          userName: userName,
        },
      });
    }

    // Mettre à jour ou créer la progression
    const existingProgress = await prisma.userTopicProgress.findUnique({
      where: {
        userId_topicId: {
          userId: userId,
          topicId: topic.id,
        },
      },
    });

    if (existingProgress) {
      // Si l'utilisateur réussit, on augmente le niveau SEULEMENT
      // Si l'utilisateur échoue, on garde le même niveau pour réessayer
      const newLevel = passed ? level + 1 : level;
      
      await prisma.userTopicProgress.update({
        where: {
          userId_topicId: {
            userId: userId,
            topicId: topic.id,
          },
        },
        data: {
          userName: userName,
          subjectName: subject,
          currentLevel: newLevel,
          exercisesCount: existingProgress.exercisesCount + totalQuestions,
          correctCount: existingProgress.correctCount + correctCount,
          successRate: score,
          isMastered: passed,
          masteredAt: passed ? new Date() : existingProgress.masteredAt,
          updatedAt: new Date(),
        },
      });
    } else {
      // Premier essai : on reste au niveau actuel sauf si réussi
      await prisma.userTopicProgress.create({
        data: {
          userId: userId,
          topicId: topic.id,
          userName: userName,
          subjectName: subject,
          currentLevel: passed ? level + 1 : level,
          exercisesCount: totalQuestions,
          correctCount: correctCount,
          successRate: score,
          isMastered: passed,
          masteredAt: passed ? new Date() : null,
        },
      });
    }

    // Sauvegarder l'historique des exercices
    for (let i = 0; i < questions.length; i++) {
      await prisma.exerciseHistory.create({
        data: {
          userId: userId,
          topicId: topic.id,
          userName: userName,
          level: level,
          question: questions[i].question,
          userAnswer: answers[i],
          correctAnswer: questions[i].correctAnswer,
          isCorrect: questions[i].correctAnswer === answers[i],
          aiFeedback: i === questions.length - 1 ? feedback : null,
        },
      });
    }

    // Si le niveau est réussi, créer le topic suivant
    if (passed) {
      const nextLevel = level + 1;
      const nextTopicExists = await prisma.topic.findFirst({
        where: {
          subjectId: subjectRecord.id,
          name: `Niveau ${nextLevel}`,
        },
      });

      if (!nextTopicExists) {
        await prisma.topic.create({
          data: {
            subjectId: subjectRecord.id,
            name: `Niveau ${nextLevel}`,
            description: `Niveau ${nextLevel} - ${subject}`,
            order: nextLevel,
            userId: userId,
            userName: userName,
          },
        });
      }
    }

    return NextResponse.json({
      score,
      correctCount,
      totalQuestions,
      passed,
      feedback,
      nextLevel: passed ? level + 1 : level,
    });

  } catch (error: unknown) {
    console.error('Erreur analyse quiz:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
