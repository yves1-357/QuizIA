'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/tableau-de-bord/sidebar';
import DashboardHeader from '@/components/tableau-de-bord/DashboardHeader';
import SerieEnCours from '@/components/tableau-de-bord/SerieEnCours';
import CarteMatiere from '@/components/tableau-de-bord/carteMatiere';
import Classement from '@/components/tableau-de-bord/Classement';
import QuizModal from '@/components/QuizModal';

export default function Dashboard() {
  const router = useRouter();
  const [user, _setUser] = useState<{ name: string; email: string; id: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState({ name: '', id: '', level: 1 });
  const [subjectProgress, setSubjectProgress] = useState<Record<string, { level: number; progression: number }>>({});
  const [tempProgress, setTempProgress] = useState<Record<string, number>>({});

  const loadTempProgress = useCallback(() => {
    if (typeof window === 'undefined' || !user) return;
    
    const subjects = ['Mathématiques', 'Physique', 'Anglais'];
    const temp: Record<string, number> = {};
    
    subjects.forEach(subject => {
      // Chercher pour tous les niveaux possibles
      for (let level = 1; level <= 10; level++) {
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
    if (!user) {
      router.push('/');
    } else {
      // Charger les progressions de l'utilisateur
      fetchUserProgress();
      // Charger les progressions temporaires en cours
      loadTempProgress();
    }

    // Écouter les changements du localStorage pour mettre à jour en temps réel
    const handleStorageUpdate = () => {
      loadTempProgress();
    };

    window.addEventListener('localStorageUpdated', handleStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdated', handleStorageUpdate);
    };
  }, [router, user, fetchUserProgress, loadTempProgress]);

  useEffect(() => {
    // Appliquer le thème sauvegardé au chargement
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
    // Déterminer l'ID du sujet
    const subjectIds: Record<string, string> = {
      'Mathématiques': 'math-1',
      'Physique': 'phys-1',
      'Anglais': 'eng-1'
    };
    
    handleSubjectClick(subject, subjectIds[subject] || 'math-1', level);
  };

  if (!user) {
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
          </div>
        </section>

        {/* Profil + Classement */}
        <div className="dashboard-bottom">
          <div className="profil-card">
            <div className="profil-avatar">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profil-info">
              <h3>{user.name}</h3>
              <span className="profil-badge">Étudiant Premium</span>
            </div>
          </div>

          <Classement />
        </div>
      </main>

      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        subject={selectedSubject.name}
        subjectId={selectedSubject.id}
        userId={user.id}
        currentLevel={selectedSubject.level}
      />
    </div>
  );
}
