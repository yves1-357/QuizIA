import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les conversations d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 });
    }


    type ChatConversation = Awaited<ReturnType<typeof prisma.chatConversation.findMany>>[number];
    const conversations: ChatConversation[] = await prisma.chatConversation.findMany({
      where: { 
        userId,
        type: 'chat'  // Seulement les conversations du chatbot
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Parser les messages JSON (gérer les null)
    const conversationsWithParsedMessages = conversations.map(conv => ({
      ...conv,
      messages: conv.messages ? JSON.parse(conv.messages) : []
    }));

    return NextResponse.json(conversationsWithParsedMessages);
  } catch (error) {
    console.error('Erreur GET conversations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 });
    }

    const { title, model, messages } = await request.json();

    const conversation = await prisma.chatConversation.create({
      data: {
        userId,
        title,
        model,
        type: 'chat',
        messages: JSON.stringify(messages)
      }
    });

    return NextResponse.json({
      ...conversation,
      messages: conversation.messages ? JSON.parse(conversation.messages) : []
    });
  } catch (error) {
    console.error('Erreur POST conversation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une conversation
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 });
    }

    const { id, title, model, messages } = await request.json();

    const conversation = await prisma.chatConversation.update({
      where: { 
        id,
        userId // Sécurité : s'assurer que c'est la conversation de l'utilisateur
      },
      data: {
        title,
        model,
        messages: JSON.stringify(messages)
      }
    });

    return NextResponse.json({
      ...conversation,
      messages: conversation.messages ? JSON.parse(conversation.messages) : []
    });
  } catch (error: unknown) {
    // Log détaillé pour debug
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: string; message?: string }).code === 'string' &&
      (
        (error as { code?: string }).code === '26000' ||
        (typeof (error as { message?: string }).message === 'string' &&
          (error as { message?: string }).message!.includes('prepared statement'))
      )
    ) {
      console.error('Erreur prepared statement (retry automatique en cours):', (error as { message?: string }).message);
    } else {
      console.error('Erreur PUT conversation:', error);
    }
    return NextResponse.json({
      error: 'Erreur serveur',
      details:
        process.env.NODE_ENV === 'development' &&
        typeof error === 'object' &&
        error !== null &&
        'message' in error
          ? (error as { message?: string }).message
          : undefined,
    }, { status: 500 });
  }
}

// DELETE - Supprimer une conversation
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.chatConversation.delete({
      where: { 
        id,
        userId // Sécurité : s'assurer que c'est la conversation de l'utilisateur
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(' Erreur DELETE conversation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
