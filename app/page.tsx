'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import PricingModal from '@/components/Tarifs';
import LoginModal from '@/components/Login';
import InscriptionModal from '@/components/Inscription';
import FonctionnalitesModal from '@/components/Fonctionnalites';

export default function Home() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);
  const [showFonctionnalitesModal, setShowFonctionnalitesModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <main>
      {/* Fond décoratif */}
      <div className="background-glow"></div>

      <div className="container">
        {/* Navigation */}
        <nav>
          <div className="logo">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="32" height="32" style={{ marginRight: '8px' }}>
              <defs>
                <style>{`.cls-1{fill:#4285f4;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:#669df6;}`}</style>
              </defs>
              <g>
                <polygon className="cls-1" points="16.64 15.13 17.38 13.88 20.91 13.88 22 12 19.82 8.25 16.75 8.25 15.69 6.39 14.5 6.39 14.5 5.13 16.44 5.13 17.5 7 19.09 7 16.9 3.25 12.63 3.25 12.63 8.25 14.36 8.25 15.09 9.5 12.63 9.5 12.63 12 14.89 12 15.94 10.13 18.75 10.13 19.47 11.38 16.67 11.38 15.62 13.25 12.63 13.25 12.63 17.63 16.03 17.63 15.31 18.88 12.63 18.88 12.63 20.75 16.9 20.75 20.18 15.13 18.09 15.13 17.36 16.38 14.5 16.38 14.5 15.13 16.64 15.13"></polygon>
                <polygon className="cls-2" points="7.36 15.13 6.62 13.88 3.09 13.88 2 12 4.18 8.25 7.25 8.25 8.31 6.39 9.5 6.39 9.5 5.13 7.56 5.13 6.5 7 4.91 7 7.1 3.25 11.38 3.25 11.38 8.25 9.64 8.25 8.91 9.5 11.38 9.5 11.38 12 9.11 12 8.06 10.13 5.25 10.13 4.53 11.38 7.33 11.38 8.38 13.25 11.38 13.25 11.38 17.63 7.97 17.63 8.69 18.88 11.38 18.88 11.38 20.75 7.1 20.75 3.82 15.13 5.91 15.13 6.64 16.38 9.5 16.38 9.5 15.13 7.36 15.13"></polygon>
              </g>
            </svg>
            QuizIA
          </div>
          <div className="nav-links">
            <button onClick={() => setShowFonctionnalitesModal(true)}>Fonctionnalités</button>
            <button onClick={() => setShowPricingModal(true)}>Tarifs</button>
            <Link href="/login" className="btn-secondary" onClick={(e) => { e.preventDefault(); setShowLoginModal(true); }}>Connexion</Link>
            <Link href="/register" className="btn-primary" onClick={(e) => { e.preventDefault(); setShowInscriptionModal(true); }}>S&apos;inscrire</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <h1>
            Apprenez plus vite avec <br />
            <span className="gradient-text">L&apos;Intelligence Artificielle</span>
          </h1>
          <p>
            Transformez n&apos;importe quel cours, PDF ou note en quiz interactif instantanément. 
            Laissez l&apos;IA tester vos connaissances et combler vos lacunes.
          </p>
          <div className="cta-group">
            <Link href="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
              Commencer gratuitement
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          
          {/* Card 1 */}
          <div className="card">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Génération par IA
            </h3>
            <p>Ne perdez plus de temps à créer des fiches. L&apos;IA analyse vos cours et génère des questions pertinentes pour vous tester.</p>
          </div>

          {/* Card 2 */}
          <div className="card">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Importez vos Cours
            </h3>
            <p>PDF, Word ou texte brut. Uploadez vos propres documents et laissez QuizIA les transformer en sessions dentraînement.</p>
          </div>

          {/* Card 3 */}
          <div className="card">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Mode Challenge
            </h3>
            <p>Le mode Coach Brutal vous pousse dans vos retranchements. Identifiez vos faiblesses avant le jour j.</p>
          </div>

        </section>
        
        <footer>
          <p>&copy; 2025 QuizIA</p>
        </footer>
      </div>

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToInscription={() => {
          setShowLoginModal(false);
          setShowInscriptionModal(true);
        }}
      />
      <InscriptionModal 
        isOpen={showInscriptionModal} 
        onClose={() => setShowInscriptionModal(false)}
        onSwitchToLogin={() => {
          setShowInscriptionModal(false);
          setShowLoginModal(true);
        }}
      />
      <FonctionnalitesModal 
        isOpen={showFonctionnalitesModal} 
        onClose={() => setShowFonctionnalitesModal(false)} 
      />
    </main>
  );
}