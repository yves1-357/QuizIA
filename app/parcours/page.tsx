'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/tableau-de-bord/sidebar';
import DashboardHeader from '@/components/tableau-de-bord/DashboardHeader';

type NiveauType = 'Lycée' | 'Bachelor' | 'Master' | 'Tous';

interface SubjectData {
  name: string;
  icon: string;
  color: string;
  id: string;
  currentLevel: number;
  maxLevel: number;
  levels: {
    level: number;
    status: 'completed' | 'in-progress' | 'locked';
    progression: number;
    type: NiveauType;
  }[];
}

export default function Parcours() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; id: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  });
  const [filter, setFilter] = useState<NiveauType>('Tous');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const subjects = useMemo(() => {
    if (!user) return [];

    const subjectsConfig = [
      { name: 'Mathématiques', icon: '⚡', color: 'bleu', id: 'math-1' },
      { name: 'Physique', icon: '🎯', color: 'violet', id: 'phys-1' },
      { name: 'Anglais', icon: '📖', color: 'vert', id: 'eng-1' },
      { name: 'Chimie', icon: '⚗️', color: 'orange', id: 'chem-1' },
      { name: 'Français', icon: '📝', color: 'rose', id: 'fr-1' },
      { name: 'Économie', icon: '💰', color: 'jaune', id: 'eco-1' },
      { name: 'Histoire', icon: '📜', color: 'marron', id: 'hist-1' },
      { name: 'Géopolitique', icon: '🌍', color: 'cyan', id: 'geo-1' }
    ];

    return subjectsConfig.map(subject => {
      const levels = [];
      let currentLevel = 1;
      
      // Détecter le choix académique de l'utilisateur pour cette matière
      const choixAcademiqueKey = `${user.id}_${subject.name}_choixAcademique`;
      const choixAcademique = localStorage.getItem(choixAcademiqueKey); // 'lycee', 'universite', 'master'
      
      // Mapper les IDs vers les labels de filtre
      const academicMapping: Record<string, NiveauType> = {
        'lycee': 'Lycée',
        'universite': 'Bachelor',
        'master': 'Master'
      };
      
      const detectedAcademic = choixAcademique ? academicMapping[choixAcademique] || 'Lycée' : 'Lycée';
      
      for (let level = 1; level <= 4; level++) {
        // On charge les données depuis localStorage (format standard)
        const questionsKey = `${user.id}_${subject.name}_${level}_questions`;
        const indexKey = `${user.id}_${subject.name}_${level}_currentIndex`;
        
        const questions = localStorage.getItem(questionsKey);
        const currentIndex = localStorage.getItem(indexKey);
        
        let status: 'completed' | 'in-progress' | 'locked' = 'locked';
        let progression = 0;
        const type: NiveauType = detectedAcademic;
        
        if (questions && currentIndex !== null) {
          const questionsArray = JSON.parse(questions);
          const index = parseInt(currentIndex);
          progression = Math.round(((index + 1) / questionsArray.length) * 100);
          
          if (progression === 100) {
            status = 'completed';
            currentLevel = level + 1;
          } else {
            status = 'in-progress';
            currentLevel = level;
          }
        } else if (level === 1) {
          // Niveau 1 toujours débloqué
          status = 'in-progress';
        } else if (level === currentLevel) {
          status = 'in-progress';
        }

        levels.push({ level, status, progression, type });
      }

      return {
        ...subject,
        currentLevel: Math.min(currentLevel, 4),
        maxLevel: 4,
        levels
      };
    });
  }, [user]);

  useEffect(() => {
    // On applique ici le thème sauvegardé au chargement
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleSubject = (subjectName: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectName)) {
      newExpanded.delete(subjectName);
    } else {
      newExpanded.add(subjectName);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleStartLevel = (subjectName: string, subjectId: string, level: number) => {
    // Sauvegarder les paramètres dans sessionStorage pour ouvrir le quiz
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('openQuiz', JSON.stringify({ name: subjectName, id: subjectId, level }));
    }
    // Rediriger vers le dashboard
    router.push('/dashboard');
  };

  const filteredSubjects = !user ? [] : subjects
    .filter(subject => {
      // Vérifier si la matière a au moins un niveau avec progression
      const hasProgress = subject.levels.some(l => l.status !== 'locked');
      if (!hasProgress) {
        return false; // Ne pas afficher les matières non commencées
      }
      
      if (filter === 'Tous') {
        return true;
      }
      
      // Pour les filtres académiques (Lycée, Bachelor, Master),
      // vérifier si la matière a un choix académique correspondant
      const choixAcademiqueKey = `${user.id}_${subject.name}_choixAcademique`;
      const choixAcademique = localStorage.getItem(choixAcademiqueKey);
      
      if (!choixAcademique) {
        // Pas de choix académique : ne pas afficher dans les filtres académiques
        return false;
      }
      
      // Mapper le choix académique vers le filtre correspondant
      const academicMapping: Record<string, NiveauType> = {
        'lycee': 'Lycée',
        'universite': 'Bachelor',
        'master': 'Master'
      };
      
      const detectedAcademic = academicMapping[choixAcademique];
      
      // Afficher uniquement si le filtre académique correspond exactement au choix de l'utilisateur
      return detectedAcademic === filter;
    })
    .map(subject => ({
      ...subject,
      levels: subject.levels // Tous les niveaux d'une matière ont le même type académique
    }));

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="dashboard-main">
        
        <div className="parcours-container">
          <div className="parcours-header">
            <div>
              <h1 className="parcours-title">Mon Parcours</h1>
              <p className="parcours-subtitle">Suivez votre progression et débloquez de nouveaux niveaux</p>
            </div>

            <div className="parcours-filters">
              <button 
                className={`filter-btn ${filter === 'Tous' ? 'active' : ''}`}
                onClick={() => setFilter('Tous')}
              >
                Tous
              </button>
              <button 
                className={`filter-btn ${filter === 'Lycée' ? 'active' : ''}`}
                onClick={() => setFilter('Lycée')}
              >
                🎓 Lycée
              </button>
              <button 
                className={`filter-btn ${filter === 'Bachelor' ? 'active' : ''}`}
                onClick={() => setFilter('Bachelor')}
              >
                🎯 Bachelor
              </button>
              <button 
                className={`filter-btn ${filter === 'Master' ? 'active' : ''}`}
                onClick={() => setFilter('Master')}
              >
                👨‍🎓 Master
              </button>
            </div>
          </div>

          <div className="parcours-subjects">
            {filteredSubjects.map(subject => {
              const isExpanded = expandedSubjects.has(subject.name);
              // Calculer le pourcentage global en incluant la progression des niveaux en cours
              const totalProgress = subject.levels.reduce((sum, l) => {
                if (l.status === 'completed') return sum + 100;
                if (l.status === 'in-progress') return sum + l.progression;
                return sum;
              }, 0);
              const totalLevels = subject.levels.length;
              const overallProgress = totalLevels > 0 ? Math.round(totalProgress / totalLevels) : 0;

              return (
                <div key={subject.name} className="parcours-subject-card">
                  <div 
                    className="parcours-subject-header"
                    onClick={() => toggleSubject(subject.name)}
                  >
                    <div className="parcours-subject-info">
                      <div className={`parcours-subject-icon ${subject.color}`}>
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="parcours-subject-name">{subject.name}</h3>
                        <p className="parcours-subject-level">
                          Niveau actuel : {subject.currentLevel} / {subject.maxLevel}
                        </p>
                      </div>
                    </div>

                    <div className="parcours-subject-stats">
                      <div className="parcours-progress-circle">
                        <svg width="60" height="60">
                          <circle
                            cx="30"
                            cy="30"
                            r="26"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="30"
                            cy="30"
                            r="26"
                            fill="none"
                            stroke="var(--accent-primary)"
                            strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallProgress / 100)}`}
                            transform="rotate(-90 30 30)"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="progress-percentage">{overallProgress}%</span>
                      </div>
                      
                      <svg 
                        className={`parcours-chevron ${isExpanded ? 'expanded' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="parcours-levels-timeline">
                      {subject.levels.map(levelData => (
                        <div 
                          key={levelData.level}
                          className={`timeline-level ${levelData.status}`}
                        >
                          <div className="timeline-connector"></div>
                          
                          <div className="timeline-icon">
                            {levelData.status === 'completed' && '✓'}
                            {levelData.status === 'in-progress' && '🔄'}
                            {levelData.status === 'locked' && '🔒'}
                          </div>

                          <div className="timeline-content">
                            <div className="timeline-header">
                              <h4 className="timeline-level-title">Niveau {levelData.level}</h4>
                              <span className="timeline-badge">{levelData.type}</span>
                            </div>

                            {levelData.status === 'in-progress' && (
                              <div className="timeline-progress-bar">
                                <div 
                                  className="timeline-progress-fill"
                                data-progress={levelData.progression}
                                ></div>
                                <span className="timeline-progress-text">{levelData.progression}%</span>
                              </div>
                            )}

                            <div className="timeline-actions">
                              {levelData.status === 'completed' && (
                                <button 
                                  className="timeline-btn secondary"
                                  onClick={() => handleStartLevel(subject.name, subject.id, levelData.level)}
                                >
                                  Revoir
                                </button>
                              )}
                              {levelData.status === 'in-progress' && (
                                <button 
                                  className="timeline-btn primary"
                                  onClick={() => handleStartLevel(subject.name, subject.id, levelData.level)}
                                >
                                  {levelData.progression > 0 ? 'Continuer' : 'Commencer'}
                                </button>
                              )}
                              {levelData.status === 'locked' && (
                                <button className="timeline-btn locked" disabled>
                                  Verrouillé
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
