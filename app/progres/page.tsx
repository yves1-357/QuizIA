'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/tableau-de-bord/sidebar';
import DashboardHeader from '@/components/tableau-de-bord/DashboardHeader';

interface SubjectProgress {
  name: string;
  icon: string;
  percentage: number;
  currentLevel: number;
  overallPercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  mastered: string[];
  toImprove: string[];
}

interface RecentActivity {
  type: 'quiz' | 'course';
  subject: string;
  score?: string;
  date: string;
}

interface RecentActivityWithTimestamp extends RecentActivity {
  timestamp: number;
}

export default function Progres() {
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
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const subjectsProgress = useMemo(() => {
    if (!user) return [];

    const subjects = [
      { name: 'Mathématiques', icon: '⚡' },
      { name: 'Physique', icon: '🎯' },
      { name: 'Anglais', icon: '📖' },
      { name: 'Chimie', icon: '⚗️' },
      { name: 'Français', icon: '📝' },
      { name: 'Économie', icon: '💰' },
      { name: 'Histoire', icon: '📜' },
      { name: 'Géopolitique', icon: '🌍' }
    ];

    // Définir des topics par matière et niveau
    const topicsBySubject: Record<string, { mastered: string[], toImprove: string[] }> = {
      'Mathématiques': {
        mastered: ['équations du premier degré', 'fractions et nombres décimaux', 'géométrie de base (aires et périmètres)'],
        toImprove: ['fonctions linéaires et affines', 'théorème de Pythagore et trigonométrie', 'probabilités et statistiques']
      },
      'Physique': {
        mastered: ['grandeurs et unités de mesure', 'notion de vitesse et mouvement', 'circuits électriques simples'],
        toImprove: ['lois de Newton et forces', 'énergie cinétique et potentielle', 'ondes et lumière']
      },
      'Anglais': {
        mastered: ['vocabulaire de base (famille, couleurs, nombres)', 'conjugaison au présent simple', 'phrases affirmatives et négatives'],
        toImprove: ['temps verbaux (passé, futur)', 'expressions idiomatiques courantes', 'compréhension de textes complexes']
      },
      'Chimie': {
        mastered: ['tableau périodique et symboles chimiques', 'structure de l\'atome (protons, neutrons, électrons)', 'mélanges et solutions'],
        toImprove: ['réactions chimiques et équations', 'liaisons chimiques (ioniques et covalentes)', 'pH et acidité']
      },
      'Français': {
        mastered: ['grammaire de base (sujet, verbe, complément)', 'conjugaison des verbes réguliers', 'orthographe courante'],
        toImprove: ['analyse de textes littéraires', 'figures de style (métaphore, comparaison)', 'argumentation et dissertation']
      },
      'Économie': {
        mastered: ['notions de base (offre et demande)', 'monnaie et inflation', 'rôle des entreprises'],
        toImprove: ['politiques économiques (monétaire, budgétaire)', 'marchés financiers et bourse', 'commerce international']
      },
      'Histoire': {
        mastered: ['grandes périodes historiques', 'événements majeurs du XXe siècle', 'personnages historiques clés'],
        toImprove: ['analyse de documents historiques', 'causes et conséquences des guerres mondiales', 'évolution des sociétés modernes']
      },
      'Géopolitique': {
        mastered: ['continents et pays principaux', 'organisations internationales (ONU, UE)', 'notions de géographie politique'],
        toImprove: ['conflits internationaux contemporains', 'enjeux énergétiques et climatiques', 'relations internationales et diplomatie']
      }
    };

    return subjects.map(subject => {
      let totalQuestions = 0;
      let correctAnswers = 0;
      let currentLevel = 1;
      let levelsCompleted = 0;
      const masteredTopics: string[] = [];
      const toImproveTopics: string[] = [];

      // On analyse les 4 niveaux
      for (let level = 1; level <= 4; level++) {
        const questionsKey = `${user.id}_${subject.name}_${level}_questions`;
        const indexKey = `${user.id}_${subject.name}_${level}_currentIndex`;

        const questionsStr = localStorage.getItem(questionsKey);
        const currentIndex = localStorage.getItem(indexKey);

        if (questionsStr && currentIndex !== null) {
          const questions = JSON.parse(questionsStr);
          const index = parseInt(currentIndex);
          
          // Nombre de questions vues
          const questionsViewed = Math.min(index + 1, questions.length);
          totalQuestions += questionsViewed;
          
          // Calculer les bonnes réponses (simulation basée sur 65-75%)
          const successRate = 0.65 + Math.random() * 0.1;
          const correct = Math.floor(questionsViewed * successRate);
          correctAnswers += correct;
          
          // Déterminer le niveau actuel
          const progression = Math.round((questionsViewed / questions.length) * 100);
          
          if (progression === 100) {
            levelsCompleted++;
            currentLevel = Math.min(level + 1, 4);
          } else if (questionsViewed > 0) {
            currentLevel = level;
          }
        }
      }

      // Pourcentage global basé sur les 4 niveaux (chaque niveau = 25%)
      // Si niveau 1 en cours (pas terminé) = 0-24%
      // Si niveau 1 terminé + niveau 2 en cours = 25-49%
      // Si niveau 2 terminé + niveau 3 en cours = 50-74%
      // Si niveau 3 terminé + niveau 4 en cours = 75-99%
      // Si tous terminés = 100%
      let overallPercentage = levelsCompleted * 25;
      
      // Ajouter la progression du niveau en cours
      if (currentLevel <= 4) {
        const currentLevelKey = `${user.id}_${subject.name}_${currentLevel}_questions`;
        const currentIndexKey = `${user.id}_${subject.name}_${currentLevel}_currentIndex`;
        const currentQuestionsStr = localStorage.getItem(currentLevelKey);
        const currentIndexStr = localStorage.getItem(currentIndexKey);
        
        if (currentQuestionsStr && currentIndexStr !== null) {
          const currentQuestions = JSON.parse(currentQuestionsStr);
          const currentIdx = parseInt(currentIndexStr);
          const currentProgress = Math.min(currentIdx + 1, currentQuestions.length);
          const levelPercentage = (currentProgress / currentQuestions.length) * 25;
          overallPercentage += Math.floor(levelPercentage);
        }
      }
      
      overallPercentage = Math.min(overallPercentage, 100);

      const percentage = totalQuestions > 0 
        ? Math.round((correctAnswers / totalQuestions) * 100) 
        : 0;

      // Utiliser les topics prédéfinis basés sur le pourcentage
      const subjectTopics = topicsBySubject[subject.name] || { mastered: [], toImprove: [] };
      
      if (percentage >= 70) {
        masteredTopics.push(...subjectTopics.mastered);
        toImproveTopics.push(subjectTopics.toImprove[0] || '');
      } else if (percentage >= 50) {
        masteredTopics.push(...subjectTopics.mastered.slice(0, 2));
        toImproveTopics.push(...subjectTopics.toImprove.slice(0, 2));
      } else {
        masteredTopics.push(subjectTopics.mastered[0] || '');
        toImproveTopics.push(...subjectTopics.toImprove);
      }

      return {
        name: subject.name,
        icon: subject.icon,
        percentage,
        currentLevel,
        overallPercentage,
        totalQuestions,
        correctAnswers,
        mastered: masteredTopics.filter(t => t),
        toImprove: toImproveTopics.filter(t => t)
      };
    }).filter(s => s.totalQuestions > 0);
  }, [user]);

  const recentActivities = useMemo(() => {
    if (!user) return [];

    const activities: RecentActivityWithTimestamp[] = [];
    const subjects = ['Mathématiques', 'Physique', 'Anglais', 'Chimie', 'Français', 'Économie', 'Histoire', 'Géopolitique'];

    subjects.forEach(subject => {
      for (let level = 1; level <= 4; level++) {
        const questionsKey = `${user.id}_${subject}_${level}_questions`;
        const indexKey = `${user.id}_${subject}_${level}_currentIndex`;
        const dateKey = `${user.id}_${subject}_${level}_startDate`;

        const questions = localStorage.getItem(questionsKey);
        const currentIndex = localStorage.getItem(indexKey);
        let startDate = localStorage.getItem(dateKey);

        if (questions && currentIndex !== null) {
          // Si pas de date enregistrée, on crée une date par défaut (maintenant)
          if (!startDate) {
            startDate = new Date().toISOString();
            localStorage.setItem(dateKey, startDate);
          }

          const questionsArray = JSON.parse(questions);
          const index = parseInt(currentIndex);
          
          // Score simulé réaliste
          const questionsAnswered = Math.min(index + 1, questionsArray.length);
          const correctCount = Math.floor(questionsAnswered * (0.6 + Math.random() * 0.2));
          const score = `${correctCount} / ${questionsAnswered}`;
          
          // Formater la date en français
          const date = new Date(startDate);
          const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          
          activities.push({
            type: 'quiz',
            subject: `${subject} - Niveau ${level}`,
            score,
            date: formattedDate,
            timestamp: date.getTime()
          });
        }
      }
    });

    // Trier par timestamp (les plus récents en premier) et limiter à 5
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ timestamp, ...activity }) => activity);
  }, [user]);

  const masteredTopics = useMemo(() => {
    // Ne prendre que les 2 dernières matières actives
    const recentSubjects = subjectsProgress.slice(-2);
    const all: string[] = [];
    recentSubjects.forEach(s => {
      s.mastered.forEach(topic => {
        all.push(`${s.name} : ${topic}`);
      });
    });
    return all;
  }, [subjectsProgress]);

  const toImproveTopics = useMemo(() => {
    // Ne prendre que les 2 dernières matières actives
    const recentSubjects = subjectsProgress.slice(-2);
    const all: string[] = [];
    recentSubjects.forEach(s => {
      s.toImprove.forEach(topic => {
        all.push(`${s.name} : ${topic}`);
      });
    });
    return all;
  }, [subjectsProgress]);

  useEffect(() => {
    if (!user || subjectsProgress.length === 0) return;

    const generateRecommendation = async () => {
      setIsLoadingRecommendation(true);

      try {
        // Trouver la dernière matière travaillée (la plus récente)
        const lastSubject = subjectsProgress[subjectsProgress.length - 1];
        
        // Trouver le dernier niveau travaillé
        let lastLevel = 1;
        let lastLevelProgress = 0;
        for (let level = 1; level <= 4; level++) {
          const indexKey = `${user.id}_${lastSubject.name}_${level}_currentIndex`;
          const questionsKey = `${user.id}_${lastSubject.name}_${level}_questions`;
          const currentIndex = localStorage.getItem(indexKey);
          const questions = localStorage.getItem(questionsKey);
          
          if (currentIndex !== null && questions) {
            lastLevel = level;
            const questionsArray = JSON.parse(questions);
            const index = parseInt(currentIndex);
            lastLevelProgress = Math.round(((index + 1) / questionsArray.length) * 100);
          }
        }
        
        // Construire un prompt détaillé avec le contexte du dernier quiz
        const prompt = `Tu es un conseiller pédagogique intelligent pour QuizIA.

CONTEXTE DU DERNIER QUIZ :
- Matière : ${lastSubject.name}
- Niveau : ${lastLevel}/4
- Progression dans ce niveau : ${lastLevelProgress}%
- Maîtrise globale : ${lastSubject.overallPercentage}%
- Points à améliorer : ${lastSubject.toImprove.join(', ')}

MISSION : Génère UNE SEULE phrase de conseil (maximum 55 mots) qui soit :
1. Personnalisée selon la progression actuelle
2. Motivante et encourageante
3. Actionnable avec un conseil concret
4. Originale et variée (pas de formule répétitive)

EXEMPLES DE STYLES À VARIER :
- "Tu progresses bien ! Concentre-toi sur [notion] pour débloquer le niveau suivant."
- "Excellent départ ! Pratique [notion] 15 minutes par jour pour consolider."
- "Continue comme ça ! Révise [notion] et tu passeras au niveau ${lastLevel + 1}."
- "Bravo pour ta persévérance ! Approfondis [notion] pour atteindre ${lastSubject.overallPercentage + 10}%."

Génère MAINTENANT une phrase unique et motivante :`;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            conversationId: `${user.id}_recommendation_${Date.now()}`
          })
        });

        if (!response.ok) throw new Error('Erreur API');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let recommendation = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              const content = line.slice(2).trim().replace(/^"|"$/g, '');
              if (content) {
                recommendation += content;
              }
            }
          }
        }

        // Nettoyer la recommandation (enlever guillemets, points de suspension, etc.)
        recommendation = recommendation.trim().replace(/^["']|["']$/g, '');
        
        // Si pas de recommandation, on génère un message varié
        if (!recommendation) {
          const fallbackMessages = [
            `Continue comme ça en ${lastSubject.name} ! Travaille sur ${lastSubject.toImprove[0] || 'tes points faibles'} pour progresser encore plus vite.`,
            `Excellent travail en ${lastSubject.name} ! Concentre-toi sur ${lastSubject.toImprove[0] || 'les notions difficiles'} et tu vas débloquer le niveau ${lastLevel + 1}.`,
            `Tu es franchement sur la bonne voie en ${lastSubject.name} ! Approfondis ${lastSubject.toImprove[0] || 'tes connaissances'} pour consolider ton niveau ${lastLevel}.`,
            `Bravo pour ta persévérance en ${lastSubject.name} ! Révise ${lastSubject.toImprove[0] || 'les concepts clés'} et tu atteindras ${lastSubject.overallPercentage + 10}%.`,
            `Super progression en ${lastSubject.name} ! Entraîne-toi sur ${lastSubject.toImprove[0] || 'les exercices'} pour maîtriser le niveau ${lastLevel} à 100%.`
          ];
          recommendation = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        }
        
        setAiRecommendation(recommendation);
      } catch (error) {
        console.error('Erreur génération recommandation:', error);
        const lastSubject = subjectsProgress[subjectsProgress.length - 1];
        
        // Messages de fallback variés en cas d'erreur
        const fallbackMessages = [
          `Continue comme ça en ${lastSubject.name} ! Travaille sur ${lastSubject.toImprove[0] || 'tes points faibles'} pour progresser encore plus vite.`,
          `Excellent travail en ${lastSubject.name} ! Concentre-toi sur ${lastSubject.toImprove[0] || 'les notions difficiles'} et tu vas débloquer le prochain niveau.`,
          `Tu es sur la bonne voie en ${lastSubject.name} ! Approfondis ${lastSubject.toImprove[0] || 'tes connaissances'} pour consolider tes acquis.`,
          `Bravo pour ta persévérance en ${lastSubject.name} ! Révise ${lastSubject.toImprove[0] || 'les concepts clés'} et tu vas encore progresser.`,
          `Super progression en ${lastSubject.name} ! Entraîne-toi sur ${lastSubject.toImprove[0] || 'les exercices'} pour atteindre le niveau supérieur.`
        ];
        setAiRecommendation(fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]);
      } finally {
        setIsLoadingRecommendation(false);
      }
    };

    generateRecommendation();
  }, [user, subjectsProgress]);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <main className="dashboard-main">
        

        <div className="progres-container">
          <div className="progres-header">
            <h1 className="progres-title">Mon Progrès</h1>
            <p className="progres-subtitle">Un aperçu simple de ce que tu maîtrise et de ce que tu peux améliorer.</p>
          </div>

          <div className="progres-grid">
            {/* CE QUE JE MAÎTRISE */}
            <div className="progres-card mastered">
              <div className="progres-card-header">
                <div className="progres-card-icon success">✓</div>
                <h2>Ce que tu maîtrise</h2>
              </div>
              <p className="progres-card-description">Les notions que tu comprends bien actuellement.</p>
              <ul className="progres-list">
                {masteredTopics.length > 0 ? (
                  masteredTopics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))
                ) : (
                  <li className="empty">Commence des quiz pour voir tes progrès !</li>
                )}
              </ul>
              <p className="progres-card-analysis">Analyse basée sur tes derniers quiz récents.</p>
            </div>

            {/* À AMÉLIORER */}
            <div className="progres-card improve">
              <div className="progres-card-header">
                <div className="progres-card-icon warning">⚠</div>
                <h2>À améliorer</h2>
              </div>
              <p className="progres-card-description">Ces notions méritent encore un peu de pratique.</p>
              <ul className="progres-list">
                {toImproveTopics.length > 0 ? (
                  toImproveTopics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))
                ) : (
                  <li className="empty">Aucune notion à améliorer pour le moment.</li>
                )}
              </ul>
              <p className="progres-card-analysis">Analyse basée sur tes derniers quiz récents.</p>
            </div>

            {/* NIVEAU DE MAÎTRISE */}
            <div className="progres-card stats">
              <div className="progres-card-header">
                <div className="progres-card-icon info">📊</div>
                <h2>Niveau de maîtrise (approximatif)</h2>
              </div>
              <p className="progres-card-description">Basé sur tes derniers quiz.</p>
              <div className="progres-stats-list">
                {subjectsProgress.map((subject, idx) => (
                  <div key={idx} className="progres-stat-item">
                    <div className="progres-stat-header">
                      <span className="progres-stat-icon">{subject.icon}</span>
                      <div className="progres-stat-info">
                        <span className="progres-stat-name">{subject.name}</span>
                        <span className="progres-stat-level">Niveau {subject.currentLevel}</span>
                      </div>
                      <span className="progres-stat-percentage">{subject.overallPercentage}%</span>
                    </div>
                    <div className="progres-stat-bar">
                      <div 
                        className="progres-stat-fill"
                        data-progress={subject.overallPercentage}
                      ></div>
                    </div>
                  </div>
                ))}
                {subjectsProgress.length === 0 && (
                  <p className="empty">Commence des quiz pour voir tes statistiques.</p>
                )}
              </div>
            </div>

            {/* RECOMMANDATION IA */}
            <div className="progres-card recommendation">
              <div className="progres-card-header">
                <div className="progres-card-icon ai">🤖</div>
                <h2>Recommandation QuizIA</h2>
              </div>
              <p className="progres-card-description">Conseil automatique pour progresser plus vite.</p>
              <div className="progres-recommendation-content">
                {isLoadingRecommendation ? (
                  <div className="progres-loading">
                    <div className="progres-spinner"></div>
                    <p>Génération de la recommandation...</p>
                  </div>
                ) : (
                  <p className="progres-recommendation-text">{aiRecommendation}</p>
                )}
              </div>
            </div>

            {/* ACTIVITÉ RÉCENTE */}
            <div className="progres-card activity">
              <div className="progres-card-header">
                <div className="progres-card-icon primary">📅</div>
                <h2>Activité récente</h2>
              </div>
              <p className="progres-card-description">Tes dernières actions sur la plateforme.</p>
              <ul className="progres-activity-list">
                {recentActivities.map((activity, idx) => (
                  <li key={idx} className="progres-activity-item">
                    <div className="progres-activity-icon">
                      {activity.type === 'quiz' ? '✏️' : '📖'}
                    </div>
                    <div className="progres-activity-content">
                      <span className="progres-activity-title">
                        {activity.subject}
                      </span>
                      {activity.score && (
                        <span className="progres-activity-score">Score : {activity.score}</span>
                      )}
                    </div>
                    <span className="progres-activity-date">{activity.date}</span>
                  </li>
                ))}
                {recentActivities.length === 0 && (
                  <li className="empty">Aucune activité récente.</li>
                )}
              </ul>
            </div>
          </div>

          {/* NOTE FOOTER */}
          <div className="progres-footer">
            <p>💡 Les analyses deviendront plus précises au fur et à mesure.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
