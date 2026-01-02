import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Nettoyer les conversations dupliquées (anciennes entrées créées par /api/chatbot)
export async function POST() {
  try {
    // Supprimer les anciennes conversations de type 'chat' qui ont été créées par /api/chatbot
    // (celles qui ont messages non-null mais qui sont des doublons)

    type ChatConversation = Awaited<ReturnType<typeof prisma.chatConversation.findMany>>[number];
    const allChats: ChatConversation[] = await prisma.chatConversation.findMany({
      where: { type: 'chat' },
      orderBy: { createdAt: 'asc' }
    });

    // Grouper par userId et title
    const grouped = new Map<string, Array<typeof allChats[number]>>();
    
    allChats.forEach(chat => {
      const key = `${chat.userId}_${chat.title}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(chat);
    });

    let deletedCount = 0;

    // Pour chaque groupe, garder seulement le plus récent
    for (const [key, chats] of grouped) {
      if (chats.length > 1) {
        // Trier par updatedAt (plus récent en dernier)
        chats.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        
        // Supprimer tous sauf le dernier
        for (let i = 0; i < chats.length - 1; i++) {
          await prisma.chatConversation.delete({
            where: { id: chats[i].id }
          });
          deletedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `${deletedCount} conversations dupliquées supprimées`
    });
  } catch (error) {
    console.error('Erreur nettoyage:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
