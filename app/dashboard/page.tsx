'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/tableau-de-bord/sidebar';
import DashboardHeader from '@/components/tableau-de-bord/DashboardHeader';
import SerieEnCours from '@/components/tableau-de-bord/SerieEnCours';
import CarteMatiere from '@/components/tableau-de-bord/carteMatiere';
import Classement from '@/components/tableau-de-bord/Classement';
import QuizModal from '@/components/QuizModal';
import LegalModal from '@/components/LegalModal';

export default function Dashboard() {
  const router = useRouter();
  const [user, _setUser] = useState<{ name: string; email: string; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState({ name: '', id: '', level: 1 });
  const [subjectProgress, setSubjectProgress] = useState<Record<string, { level: number; progression: number }>>({});
  const [tempProgress, setTempProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      _setUser(JSON.parse(userStr));
    }
    setIsLoading(false);
  }, []);

  const loadTempProgress = useCallback(() => {
    if (typeof window === 'undefined' || !user) return;
    
    const subjects = ['Mathématiques', 'Physique', 'Anglais', 'Chimie', 'Français', 'Économie', 'Histoire', 'Géopolitique'];
    const temp: Record<string, number> = {};
    
    subjects.forEach(subject => {
      // Chercher pour tous les niveaux possibles
      for (let level = 1; level <= 4; level++) {
        const questionsKey = `${user?.id}_${subject}_${level}_questions`;
        const indexKey = `${user?.id}_${subject}_${level}_currentIndex`;
        
        const questions = localStorage.getItem(questionsKey);
        const currentIndex = localStorage.getItem(indexKey);
        
        if (questions && currentIndex !== null) {
          const questionsArray = JSON.parse(questions);
          const index = parseInt(currentIndex);
          // Recalculer le pourcentage dynamiquement
          const calculatedPercentage = Math.round(((index + 1) / questionsArray.length) * 100);
          temp[subject] = calculatedPercentage;
          console.log(`Updated ${subject}: ${index + 1}/${questionsArray.length} = ${calculatedPercentage}%`);
          break; // Prendre le premier trouvé
        }
      }
    });
    
    setTempProgress(temp);
  }, [user]);

  const fetchUserProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/progress?userId=${user.id}`);
      const data = await response.json();
      if (data.progressions) {
        setSubjectProgress(data.progressions);
      }
    } catch (error) {
      console.error('Erreur chargement progression:', error);
    }
  }, [user]);

  useEffect(() => {
     // eslint-disable-next-line react-hooks/exhaustive-deps
    if (isLoading) return;
    
    if (!user) {
      router.push('/');
    } else {
      // Charger les progressions de l'utilisateur
      fetchUserProgress();
      // Charger les progressions temporaires en cours
      loadTempProgress();
      
      // Vérifier si on doit ouvrir le quiz (depuis la page Parcours)
      const openQuizData = sessionStorage.getItem('openQuiz');
      if (openQuizData) {
        const quizData = JSON.parse(openQuizData);
        setSelectedSubject(quizData);
        setShowQuizModal(true);
        sessionStorage.removeItem('openQuiz');
      }
    }

    // Écouter les changements du localStorage pour mettre à jour en temps réel
    const handleStorageUpdate = () => {
      loadTempProgress();
    };

    // Événement pour les autres onglets
    window.addEventListener('storage', handleStorageUpdate);
    
    // Événement personnalisé pour le même onglet
    window.addEventListener('localStorageUpdated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('localStorageUpdated', handleStorageUpdate);
    };
  }, [router, user, fetchUserProgress, loadTempProgress]);

  useEffect(() => {
    // On applique le thème sauvegardé au chargement
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleSubjectClick = (name: string, id: string, level: number) => {
    setSelectedSubject({ name, id, level });
    setShowQuizModal(true);
  };

  const handleContinueFromSerie = (subject: string, level: number) => {
    // On détermine l'ID du sujet (très important)
    const subjectIds: Record<string, string> = {
      'Mathématiques': 'math-1',
      'Physique': 'phys-1',
      'Anglais': 'eng-1',
      'Chimie': 'chem-1',
      'Français': 'fr-1',
      'Économie': 'eco-1',
      'Histoire': 'hist-1',
      'Géopolitique': 'geo-1'
    };
    
    handleSubjectClick(subject, subjectIds[subject] || 'math-1', level);
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="dashboard-main">
        <DashboardHeader userName={user.name} />

        {/* Série en cours */}
        <SerieEnCours onContinue={handleContinueFromSerie} userId={user.id} />

        {/* Mes Matières */}
        <section className="section-matieres">
          <h2 className="section-title">Mes Matières</h2>
          
          <div className="matieres-slider">
            <button className="slider-btn slider-btn-prev" onClick={() => {
              const slider = document.querySelector('.matieres-grid');
              if (slider) slider.scrollBy({ left: -320, behavior: 'smooth' });
            }}>
              ‹
            </button>
            
            <div className="matieres-grid">
              <div onClick={() => handleSubjectClick('Mathématiques', 'math-1', subjectProgress['Mathématiques']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="⚡"
                  nom="Mathématiques"
                  prochain={`Niveau ${subjectProgress['Mathématiques']?.level || 1}`}
                  niveau={subjectProgress['Mathématiques']?.level || 1}
                  progression={tempProgress['Mathématiques'] !== undefined ? tempProgress['Mathématiques'] : (subjectProgress['Mathématiques']?.progression || 0)}
                  couleur="bleu"
                />
              </div>
              
              <div onClick={() => handleSubjectClick('Physique', 'phys-1', subjectProgress['Physique']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="🎯"
                  nom="Physique"
                  prochain={`Niveau ${subjectProgress['Physique']?.level || 1}`}
                  niveau={subjectProgress['Physique']?.level || 1}
                  progression={tempProgress['Physique'] !== undefined ? tempProgress['Physique'] : (subjectProgress['Physique']?.progression || 0)}
                  couleur="violet"
                />
              </div>
              
              <div onClick={() => handleSubjectClick('Anglais', 'eng-1', subjectProgress['Anglais']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="📖"
                  nom="Anglais"
                  prochain={`Niveau ${subjectProgress['Anglais']?.level || 1}`}
                  niveau={subjectProgress['Anglais']?.level || 1}
                  progression={tempProgress['Anglais'] !== undefined ? tempProgress['Anglais'] : (subjectProgress['Anglais']?.progression || 0)}
                  couleur="vert"
                />
              </div>

              <div onClick={() => handleSubjectClick('Chimie', 'chem-1', subjectProgress['Chimie']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="⚗️"
                  nom="Chimie"
                  prochain={`Niveau ${subjectProgress['Chimie']?.level || 1}`}
                  niveau={subjectProgress['Chimie']?.level || 1}
                  progression={tempProgress['Chimie'] !== undefined ? tempProgress['Chimie'] : (subjectProgress['Chimie']?.progression || 0)}
                  couleur="orange"
                />
              </div>

              <div onClick={() => handleSubjectClick('Français', 'fr-1', subjectProgress['Français']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="📝"
                  nom="Français"
                  prochain={`Niveau ${subjectProgress['Français']?.level || 1}`}
                  niveau={subjectProgress['Français']?.level || 1}
                  progression={tempProgress['Français'] !== undefined ? tempProgress['Français'] : (subjectProgress['Français']?.progression || 0)}
                  couleur="rose"
                />
              </div>

              <div onClick={() => handleSubjectClick('Économie', 'eco-1', subjectProgress['Économie']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="💰"
                  nom="Économie"
                  prochain={`Niveau ${subjectProgress['Économie']?.level || 1}`}
                  niveau={subjectProgress['Économie']?.level || 1}
                  progression={tempProgress['Économie'] !== undefined ? tempProgress['Économie'] : (subjectProgress['Économie']?.progression || 0)}
                  couleur="jaune"
                />
              </div>

              <div onClick={() => handleSubjectClick('Histoire', 'hist-1', subjectProgress['Histoire']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="📜"
                  nom="Histoire"
                  prochain={`Niveau ${subjectProgress['Histoire']?.level || 1}`}
                  niveau={subjectProgress['Histoire']?.level || 1}
                  progression={tempProgress['Histoire'] !== undefined ? tempProgress['Histoire'] : (subjectProgress['Histoire']?.progression || 0)}
                  couleur="marron"
                />
              </div>

              <div onClick={() => handleSubjectClick('Géopolitique', 'geo-1', subjectProgress['Géopolitique']?.level || 1)} style={{ cursor: 'pointer' }}>
                <CarteMatiere
                  icon="🌍"
                  nom="Géopolitique"
                  prochain={`Niveau ${subjectProgress['Géopolitique']?.level || 1}`}
                  niveau={subjectProgress['Géopolitique']?.level || 1}
                  progression={tempProgress['Géopolitique'] !== undefined ? tempProgress['Géopolitique'] : (subjectProgress['Géopolitique']?.progression || 0)}
                  couleur="cyan"
                />
              </div>
            </div>

            <button className="slider-btn slider-btn-next" onClick={() => {
              const slider = document.querySelector('.matieres-grid');
              if (slider) slider.scrollBy({ left: 320, behavior: 'smooth' });
            }}>
              ›
            </button>
          </div>
        </section>

        {/* Profil + Classement */}
        <div className="dashboard-bottom">
          <div className="profil-card chatbot-card" onClick={() => router.push('/chatbot')}>
            <div className="profil-avatar">
              <div className="avatar-circle chatbot-avatar">
                🤖
              </div>
            </div>
            <div className="profil-info">
              <h3>Assistant IA</h3>
              <span className="profil-badge">Poser une question</span>
            </div>
          </div>

          <Classement />
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <p className="footer-text">
              QuizIA utilise l&#39;IA générative (OpenRouter), il peut commettre des erreurs. 
              Il est recommandé de vérifier les informations importantes. 
              <button 
                className="footer-link" 
                onClick={() => setShowLegalModal(true)}
              >
                Voir les préférences en matière de cookies
              </button>
            </p>
          </div>
        </footer>
      </main>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        subject={selectedSubject.name}
        subjectId={selectedSubject.id}
        userId={user.id}
        currentLevel={selectedSubject.level}
      />

      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />
    </div>
  );
}
