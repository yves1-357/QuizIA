import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer toutes les progressions de l'utilisateur


    type UserTopicProgress = Awaited<ReturnType<typeof prisma.userTopicProgress.findMany>>[number];
    type ProgressionWithTopicAndSubject = UserTopicProgress & {
      topic: {
        subject: {
          name: string;
        };
      };
    };
    const progressions: ProgressionWithTopicAndSubject[] = await prisma.userTopicProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        currentLevel: 'desc',
      },
    });

    // Grouper par matière et récupérer le niveau max et la progression max
    const subjectProgress: Record<string, { level: number; progression: number; subjectName: string }> = {};

    progressions.forEach((prog) => {
      const subjectName = prog.topic.subject.name;
      const currentLevel = prog.currentLevel;
      const currentProgression = prog.successRate || 0;

      if (!subjectProgress[subjectName] || subjectProgress[subjectName].level < currentLevel) {
        subjectProgress[subjectName] = {
          level: currentLevel,
          progression: currentProgression,
          subjectName,
        };
      }
    });

    return NextResponse.json({ progressions: subjectProgress });
  } catch (error) {
    console.error('Erreur récupération progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
