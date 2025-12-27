import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les conversations d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID manquant' }, { status: 401 });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    // Parser les messages JSON
    const conversationsWithParsedMessages = conversations.map(conv => ({
      ...conv,
      messages: JSON.parse(conv.messages)
    }));

    return NextResponse.json(conversationsWithParsedMessages);
  } catch (error) {
    console.error('❌ Erreur GET conversations:', error);
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
        messages: JSON.stringify(messages)
      }
    });

    return NextResponse.json({
      ...conversation,
      messages: JSON.parse(conversation.messages)
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
      messages: JSON.parse(conversation.messages)
    });
  } catch (error) {
    console.error('Erreur PUT conversation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
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
