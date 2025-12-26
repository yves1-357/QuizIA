import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer la session en cours de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Si subject et level sont fournis, récupérer la session spécifique
    if (subject && level) {
      const session = await prisma.quizSession.findUnique({
        where: {
          userId_subject_level: {
            userId,
            subject,
            level: parseInt(level),
          },
        },
      });

      if (session) {
        return NextResponse.json({
          session: {
            ...session,
            questions: JSON.parse(session.questions),
            answers: JSON.parse(session.answers),
          },
        });
      }

      return NextResponse.json({ session: null });
    }

    // Sinon, récupérer la session la plus récente
    const session = await prisma.quizSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (session) {
      return NextResponse.json({
        session: {
          ...session,
          questions: JSON.parse(session.questions),
          answers: JSON.parse(session.answers),
        },
      });
    }

    return NextResponse.json({ session: null });
  } catch (error: any) {
    console.error('Erreur récupération session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder/Mettre à jour la session
export async function POST(request: NextRequest) {
  try {
    const { userId, subject, level, model, academicLevel, questions, answers, currentIndex } = await request.json();

    if (!userId || !subject || level === undefined) {
      return NextResponse.json(
        { error: 'userId, subject et level requis' },
        { status: 400 }
      );
    }

    // Vérifier si une session existe déjà
    const existingSession = await prisma.quizSession.findUnique({
      where: {
        userId_subject_level: {
          userId,
          subject,
          level,
        },
      },
    });

    let session;

    if (existingSession) {
      // Mettre à jour la session existante
      session = await prisma.quizSession.update({
        where: {
          userId_subject_level: {
            userId,
            subject,
            level,
          },
        },
        data: {
          questions: JSON.stringify(questions),
          answers: JSON.stringify(answers),
          currentIndex: currentIndex || 0,
          model,
          academicLevel,
        },
      });
    } else {
      // Créer une nouvelle session
      session = await prisma.quizSession.create({
        data: {
          userId,
          subject,
          level,
          model,
          academicLevel,
          questions: JSON.stringify(questions),
          answers: JSON.stringify(answers),
          currentIndex: currentIndex || 0,
        },
      });
    }

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('Erreur sauvegarde session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');

    if (!userId || !subject || !level) {
      return NextResponse.json(
        { error: 'userId, subject et level requis' },
        { status: 400 }
      );
    }

    await prisma.quizSession.delete({
      where: {
        userId_subject_level: {
          userId,
          subject,
          level: parseInt(level),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur suppression session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
