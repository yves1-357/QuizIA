import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, id: userId } = body;

    console.log('INSCRIPTION - Email:', email);
    console.log('INSCRIPTION - Mot de passe reçu (longueur):', password?.length);
    console.log('INSCRIPTION - Mot de passe reçu:', password);

    // Validation des champs
    if (!email || !password || !name || !userId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('INSCRIPTION - Hash créé:', hashedPassword.substring(0, 20) + '...');

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        name,
        role: 'STUDENT'
      }
    });

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'Inscription réussie',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
