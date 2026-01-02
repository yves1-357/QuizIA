'use client';

import { useState, useEffect } from 'react';

interface FonctionnalitesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FonctionnalitesModal({ isOpen, onClose }: FonctionnalitesModalProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">Fonctionnalités</h2>
        
        <div className="features-modal-content">
          {/* Paramètres */}
          <div className="settings-section">
            <h3 className="settings-title">Paramètres</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Thème d&apos;affichage</h4>
                <p>Choisissez entre le mode clair et sombre</p>
              </div>
              <button onClick={toggleTheme} className="theme-switch">
                {theme === 'dark' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                    <span>Mode clair</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                    <span>Mode sombre</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="features-list-section">
            <h3 className="settings-title">Toutes nos fonctionnalités</h3>
            
            <div className="feature-item">
              <div className="feature-icon">✨</div>
              <div>
                <h4>Quiz IA Personnalisés</h4>
                <p>Génération automatique de questions adaptées à votre niveau</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <div>
                <h4>Import de Documents</h4>
                <p>Uploadez vos PDF, Images ou notes pour créer des quiz instantanément</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <h4>Statistiques Détaillées</h4>
                <p>Suivez votre progression et identifiez vos points faibles</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div>
                <h4>Mode Coach Brutal</h4>
                <p>Entraînement intensif pour maximiser vos résultats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
