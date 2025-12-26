'use client';

import { useEffect, useState, useCallback } from 'react';

interface SerieEnCoursProps {
  onContinue?: (subject: string, level: number) => void;
  userId?: string;
}

interface CurrentSession {
  subject: string;
  level: number;
  currentIndex: number;
  totalQuestions: number;
  percentage: number;
  icon: string;
}

export default function SerieEnCours({ onContinue, userId }: SerieEnCoursProps) {
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);

  const detectCurrentSession = useCallback(() => {
    if (typeof window === 'undefined' || !userId) return;

    const subjects = [
      { name: 'Mathématiques', icon: '⚡' },
      { name: 'Physique', icon: '🎯' },
      { name: 'Anglais', icon: '📖' }
    ];

    // Chercher la session la plus récente
    let mostRecentSession: CurrentSession | null = null;
    let mostRecentTime = 0;

    subjects.forEach(({ name, icon }) => {
      for (let level = 1; level <= 10; level++) {
        const questionsKey = `${userId}_${name}_${level}_questions`;
        const indexKey = `${userId}_${name}_${level}_currentIndex`;
        const timestampKey = `${userId}_${name}_${level}_timestamp`;

        const questions = localStorage.getItem(questionsKey);
        const currentIndex = localStorage.getItem(indexKey);
        const timestamp = localStorage.getItem(timestampKey);

        if (questions && currentIndex !== null && timestamp) {
          const questionsArray = JSON.parse(questions);
          const index = parseInt(currentIndex);
          const remainingQuestions = questionsArray.length - index;
          const sessionTime = parseInt(timestamp);
          // Recalculer le pourcentage dynamiquement
          const calculatedPercentage = Math.round(((index + 1) / questionsArray.length) * 100);

          if (remainingQuestions > 0 && sessionTime > mostRecentTime) {
            mostRecentTime = sessionTime;
            mostRecentSession = {
              subject: name,
              level,
              currentIndex: index,
              totalQuestions: questionsArray.length,
              percentage: calculatedPercentage,
              icon
            };
          }
        }
      }
    });

    setCurrentSession(mostRecentSession);
  }, [userId]);

  useEffect(() => {
     // eslint-disable-next-line react-hooks/exhaustive-deps
    detectCurrentSession();
    
    // Écouter les changements avec un CustomEvent pour le même onglet
    const handleStorageChange = () => {
      detectCurrentSession();
    };

    // Événement pour les autres onglets
    window.addEventListener('storage', handleStorageChange);
    
    // Événement personnalisé pour le même onglet
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, [userId, detectCurrentSession]);

  const handleContinue = () => {
    if (currentSession && onContinue) {
      onContinue(currentSession.subject, currentSession.level);
    }
  };

  if (!currentSession) {
    return (
      <div className="serie-en-cours">
        <div className="serie-badge">
          <span>🎯</span>
          <span>Aucune série en cours</span>
        </div>

        <div className="serie-content">
          <div className="serie-info">
            <h2>Commencez une nouvelle série</h2>
            <p>Choisissez une matière ci-dessous pour débuter votre apprentissage.</p>
          </div>
        </div>
      </div>
    );
  }

  const remainingExercises = currentSession.totalQuestions - currentSession.currentIndex;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (currentSession.percentage / 100) * circumference;

  return (
    <div className="serie-en-cours">
      <div className="serie-badge">
        <span>🔥</span>
        <span>Série en cours</span>
      </div>

      <div className="serie-content">
        <div className="serie-info">
          <h2>Reprendre {currentSession.subject} {currentSession.icon}</h2>
         <p>Le  module &quot;Niveau {currentSession.level}&quot; vous attend. Plus que {remainingExercises} exercice{remainingExercises > 1 ? 's' : ''} pour valider le niveau.</p>
          
          <button type="button" className="btn-continue" onClick={handleContinue}>
            Continuer
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        <div className="serie-score">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-circle-bg"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="9"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
            />
            <circle
              className="progress-ring-circle"
              stroke="#FFD700"
              strokeWidth="9"
              fill="transparent"
              r="50"
              cx="60"
              cy="60"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{currentSession.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
