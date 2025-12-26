'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function ProfilModal({ isOpen, onClose, userName }: ProfilModalProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    }
    return 'dark';
  });
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="profil-modal">
        <div className="profil-modal-header">
          <h2>Mon Profil</h2>
          <button onClick={onClose} className="modal-close" aria-label="Fermer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="profil-modal-content">
          {/* User Info */}
          <div className="profil-modal-user">
            <div className="profil-modal-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="profil-modal-name">
              <h3>{userName}</h3>
              <p>Étudiant</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="profil-modal-section">
            <h4>Thème d&apos;affichage</h4>
            <div className="theme-toggle-container">
              <button
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <span>Sombre</span>
              </button>
              <button
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                <span>Clair</span>
              </button>
            </div>
          </div>

          {/* Logout Section */}
          {!showConfirmLogout ? (
            <button onClick={handleLogoutClick} className="profil-modal-logout">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              <span>Se déconnecter</span>
            </button>
          ) : (
            <div className="logout-confirmation">
              <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
              <div className="logout-buttons">
                <button onClick={cancelLogout} className="btn-cancel">
                  Annuler
                </button>
                <button onClick={confirmLogout} className="btn-confirm-logout">
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
