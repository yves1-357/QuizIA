import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Récupérer les emails admin depuis les variables d'environnement
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Vérifier si l'email est dans la liste et le mot de passe est correct
    if (adminEmails.includes(email) && password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        message: 'Authentification réussie' 
      });
    } else {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erreur auth admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
