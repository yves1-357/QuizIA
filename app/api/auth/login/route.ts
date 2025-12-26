import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('CONNEXION - Email:', email);
    console.log('CONNEXION - Mot de passe reçu (longueur):', password?.length);
    console.log('CONNEXION - Mot de passe reçu:', password);

    // Validation des champs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('Recherche utilisateur avec email:', email);
    console.log('Utilisateur trouvé:', user ? 'OUI' : 'NON');

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    console.log(' Vérification du mot de passe...');
    console.log('Hash stocké:', user.password.substring(0, 20) + '...');
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Mot de passe valide:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Ne pas retourner le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Créer une session simple (vous pourrez améliorer avec NextAuth plus tard)
    const response = NextResponse.json(
      { 
        message: 'Connexion réussie',
        user: userWithoutPassword 
      },
      { status: 200 }
    );

    // Créer un cookie de session simple
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la connexion' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
