'use client';

import { useState, useEffect } from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Feedback {
  score: number;
  passed: boolean;
  feedback: string;
  correctCount: number;
  totalQuestions: number;
  detailedResults: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  subjectId: string;
  userId: string;
  currentLevel: number;
}

export default function QuizModal({ isOpen, onClose, subject, subjectId, userId, currentLevel }: QuizModalProps) {
  const [selectedModel, setSelectedModel] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_showResults, _setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [step, setStep] = useState<'model-selection' | 'academic-level' | 'quiz' | 'results'>('model-selection');

  // Charger les préférences sauvegardées et démarrer directement si niveau > 1
  useEffect(() => {
    if (isOpen) {
      // D'abord, essayer de charger depuis la base de données
      loadSessionFromDB();
    }
  }, [isOpen, currentLevel]);

  const loadSessionFromDB = async () => {
    try {
      const response = await fetch(`/api/quiz/session?userId=${userId}&subject=${encodeURIComponent(subject)}&level=${currentLevel}`);
      const data = await response.json();

      if (data.session) {
        // Session trouvée dans la DB
        setQuestions(data.session.questions);
        setUserAnswers(data.session.answers);
        setCurrentQuestionIndex(data.session.currentIndex);
        setSelectedModel(data.session.model);
        setAcademicLevel(data.session.academicLevel);
        setStep('quiz');
        
        // Synchroniser avec localStorage pour la compatibilité et SerieEnCours
        localStorage.setItem(`${userId}_${subject}_model`, data.session.model);
        localStorage.setItem(`${userId}_${subject}_academicLevel`, data.session.academicLevel);
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_questions`, JSON.stringify(data.session.questions));
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_answers`, JSON.stringify(data.session.answers));
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_currentIndex`, data.session.currentIndex.toString());
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_timestamp`, Date.now().toString());
        
        // Calculer le pourcentage
        const progressPercentage = Math.round(((data.session.currentIndex + 1) / data.session.questions.length) * 100);
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_progress_percentage`, progressPercentage.toString());
        
        // Déclencher l'événement pour mettre à jour SerieEnCours
        window.dispatchEvent(new Event('localStorageUpdated'));
        return;
      }

      // Pas de session en DB, vérifier le localStorage (pour compatibilité)
      const savedQuestions = localStorage.getItem(`${userId}_${subject}_${currentLevel}_questions`);
      const savedAnswers = localStorage.getItem(`${userId}_${subject}_${currentLevel}_answers`);
      const savedIndex = localStorage.getItem(`${userId}_${subject}_${currentLevel}_currentIndex`);
      const savedModel = localStorage.getItem(`${userId}_${subject}_model`);
      const savedAcademicLevel = localStorage.getItem(`${userId}_${subject}_academicLevel`);

      if (savedQuestions && savedAnswers && savedIndex) {
        // Reprendre la session du localStorage
        const questions = JSON.parse(savedQuestions);
        const answers = JSON.parse(savedAnswers);
        const index = parseInt(savedIndex);
        
        setQuestions(questions);
        setUserAnswers(answers);
        setCurrentQuestionIndex(index);
        setSelectedModel(savedModel || '');
        setAcademicLevel(savedAcademicLevel || '');
        setStep('quiz');
        
        // Migrer vers la DB
        if (savedModel && savedAcademicLevel) {
          await saveSessionToDB(questions, answers, index, savedModel, savedAcademicLevel);
        }
        
        // Calculer et sauvegarder le pourcentage de progression
        const totalQuestions = questions.length;
        const progressPercentage = Math.round(((index + 1) / totalQuestions) * 100);
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_progress_percentage`, progressPercentage.toString());
      } else if (currentLevel > 1 && savedModel && savedAcademicLevel) {
        // Niveau > 1 sans session en cours : démarrer directement
        setSelectedModel(savedModel);
        setAcademicLevel(savedAcademicLevel);
        startQuizDirect(savedModel, savedAcademicLevel);
      }
    } catch (error) {
      console.error('Erreur chargement session:', error);
    }
  };

  const saveSessionToDB = async (questions: Question[], answers: string[], currentIndex: number, model: string, academicLevel: string) => {
    try {
      await fetch('/api/quiz/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject,
          level: currentLevel,
          model,
          academicLevel,
          questions,
          answers,
          currentIndex,
        }),
      });
    } catch (error) {
      console.error('Erreur sauvegarde session DB:', error);
    }
  };

  const deleteSessionFromDB = async () => {
    try {
      await fetch(`/api/quiz/session?userId=${userId}&subject=${encodeURIComponent(subject)}&level=${currentLevel}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erreur suppression session DB:', error);
    }
  };

  const startQuizDirect = async (model: string, academic: string) => {
    // Sauvegarder le choix académique
    localStorage.setItem(`${userId}_${subject}_choixAcademique`, academic);
    
    setIsLoading(true);
    setStep('quiz');

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          level: currentLevel,
          model: model,
          academicLevel: academic,
          questionCount: currentLevel === 1 ? 5 : currentLevel * 5,
        }),
      });

      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
        // Sauvegarder dans la DB
        await saveSessionToDB(data.questions, [], 0, model, academic);
        // Sauvegarder les questions pour reprise ultérieure
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_questions`, JSON.stringify(data.questions));
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_answers`, JSON.stringify([]));
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_currentIndex`, '0');
        // Initialiser le pourcentage à 0%
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_progress_percentage`, '0');
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_timestamp`, Date.now().toString());
        // Déclencher un événement pour mettre à jour les autres composants
        window.dispatchEvent(new Event('localStorageUpdated'));
      }
    } catch (error) {
      console.error('Erreur génération questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const models = [
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Plus rapide et précis' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Version allégée pour rapidité' },
    { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', description: 'Léger et très rapide' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Excellent pour l\'analyse' },
    { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek V3.1', description: 'Texte & compréhension générale' },
    { id: 'microsoft/phi-4', name: 'Microsoft Phi-4', description: 'Modèle polyvalent' },
    
  ];

  const academicLevels = [
    { id: 'lycee', name: 'Secondaire (Lycée / Humanités)', description: 'Questions niveau secondaire' },
    { id: 'universite', name: 'Université (Bachelier / Licence)', description: 'Questions niveau universitaire' },
    { id: 'master', name: 'Master', description: 'Questions niveau avancé' },
  ];

  const handleModelSelection = () => {
    if (!selectedModel) return;
    setStep('academic-level');
  };

  const startQuiz = async () => {
    if (!selectedModel || !academicLevel) return;
    
    // Sauvegarder les préférences pour les prochains niveaux
    localStorage.setItem(`${userId}_${subject}_model`, selectedModel);
    localStorage.setItem(`${userId}_${subject}_academicLevel`, academicLevel);
    // Sauvegarder le choix académique pour le filtrage dans Parcours
    localStorage.setItem(`${userId}_${subject}_choixAcademique`, academicLevel);
    
    setIsLoading(true);
    setStep('quiz');

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          level: currentLevel,
          model: selectedModel,
          academicLevel,
          questionCount: currentLevel === 1 ? 5 : currentLevel * 5,
        }),
      });

      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
        // Sauvegarder dans la DB
        await saveSessionToDB(data.questions, [], 0, selectedModel, academicLevel);
        // Sauvegarder les questions pour reprise ultérieure (localStorage pour compatibilité)
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_questions`, JSON.stringify(data.questions));
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_answers`, JSON.stringify([]));
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_currentIndex`, '0');
        // Initialiser le pourcentage à 0%
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_progress_percentage`, '0');
        localStorage.setItem(`${userId}_${subject}_${currentLevel}_timestamp`, Date.now().toString());
        // Déclencher un événement pour mettre à jour les autres composants
        window.dispatchEvent(new Event('localStorageUpdated'));
      }
    } catch (error) {
      console.error('Erreur génération questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    setSelectedAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      // Sauvegarder la progression dans la DB
      await saveSessionToDB(questions, newAnswers, newIndex, selectedModel, academicLevel);
      // Sauvegarder la progression dans localStorage
      localStorage.setItem(`${userId}_${subject}_${currentLevel}_answers`, JSON.stringify(newAnswers));
      localStorage.setItem(`${userId}_${subject}_${currentLevel}_currentIndex`, newIndex.toString());
      // Calculer et sauvegarder le pourcentage de progression
      const progressPercentage = Math.round(((newIndex + 1) / questions.length) * 100);
      localStorage.setItem(`${userId}_${subject}_${currentLevel}_progress_percentage`, progressPercentage.toString());
      // Sauvegarder le timestamp pour savoir quelle est la session la plus récente
      localStorage.setItem(`${userId}_${subject}_${currentLevel}_timestamp`, Date.now().toString());
      // Déclencher un événement pour mettre à jour les autres composants
      window.dispatchEvent(new Event('localStorageUpdated'));
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (answers: string[]) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/quiz/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subjectId,
          subject,
          level: currentLevel,
          academicLevel,
          questions,
          answers,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      setFeedback(data);
      setStep('results');
      // Nettoyer la session sauvegardée car le quiz est terminé
      await deleteSessionFromDB();
      localStorage.removeItem(`${userId}_${subject}_${currentLevel}_questions`);
      localStorage.removeItem(`${userId}_${subject}_${currentLevel}_answers`);
      localStorage.removeItem(`${userId}_${subject}_${currentLevel}_currentIndex`);
      localStorage.removeItem(`${userId}_${subject}_${currentLevel}_progress_percentage`);
      localStorage.removeItem(`${userId}_${subject}_${currentLevel}_timestamp`);
      // Déclencher un événement pour mettre à jour les autres composants
      window.dispatchEvent(new Event('localStorageUpdated'));
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setSelectedModel('');
    setAcademicLevel('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer('');
    _setShowResults(false);
    setFeedback(null);
    setStep('model-selection');
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
    // Recharger uniquement si on vient de terminer un quiz (pour mettre à jour les progressions)
    if (step === 'results') {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}></div>
      <div className="quiz-modal">
        {/* Model Selection */}
        {step === 'model-selection' && (
          <>
            <div className="quiz-modal-header">
              <h2>Choisit un modèle IA</h2>
              <button onClick={handleClose} className="modal-close" aria-label="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="quiz-modal-content">
              <p className="quiz-subject-title">Matière : {subject}</p>
              <p className="quiz-level-info">Niveau {currentLevel} • {currentLevel === 1 ? 5 : currentLevel * 5} questions</p>

              <div className="model-selection-grid">
                {models.map((model) => (
                  <button
                    key={model.id}
                    className={`model-card ${selectedModel === model.id ? 'active' : ''}`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <h3>{model.name}</h3>
                    <p>{model.description}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleModelSelection}
                disabled={!selectedModel}
                className="btn-start-quiz"
              >
                Continuer
              </button>
            </div>
          </>
        )}

        {/* Academic Level Selection */}
        {step === 'academic-level' && (
          <>
            <div className="quiz-modal-header">
              <button onClick={() => setStep('model-selection')} className="btn-back" aria-label="Retour">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h2>Choisit le niveau académique</h2>
              </div>
              <button onClick={handleClose} className="modal-close" aria-label="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="quiz-modal-content">
              <p className="quiz-subject-title">Matière : {subject}</p>
              <p className="quiz-level-info">Les questions seront adaptées à votre niveau d&apos;études</p>

              <div className="academic-level-grid">
                {academicLevels.map((level) => (
                  <button
                    key={level.id}
                    className={`academic-level-card ${academicLevel === level.id ? 'active' : ''}`}
                    onClick={() => setAcademicLevel(level.id)}
                  >
                    <h3>{level.name}</h3>
                    <p>{level.description}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={startQuiz}
                disabled={!academicLevel}
                className="btn-start-quiz"
              >
                Commencer le quiz
              </button>
            </div>
          </>
        )}

        {/* Quiz Questions */}
        {step === 'quiz' && !isLoading && questions.length > 0 && (
          <>
            <div className="quiz-modal-header">
              <div>
                <h2>{subject}</h2>
                <p className="quiz-progress">Question {currentQuestionIndex + 1}/{questions.length}</p>
              </div>
              <button onClick={handleClose} className="modal-close" aria-label="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="quiz-modal-content">
              <div className="question-card">
                <h3>{questions[currentQuestionIndex].question}</h3>
                <div className="answers-grid">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      className={`answer-option ${selectedAnswer === option ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="btn-next-question"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer'}
              </button>
            </div>
          </>
        )}

        {/* Results */}
        {step === 'results' && feedback && (
          <>
            <div className="quiz-modal-header">
              <h2>Résultats</h2>
              <button onClick={handleClose} className="modal-close" aria-label="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="quiz-modal-content">
              <div className="results-summary">
                <div className="score-circle">
                  <span className="score-percentage">{feedback.score}%</span>
                </div>
                <h3>{feedback.passed ? '🎉 Niveau réussi !' : '📚 Continuez à pratiquer'}</h3>
                <p className="score-details">{feedback.correctCount}/{feedback.totalQuestions} réponses correctes</p>
              </div>

              <div className="feedback-section">
                <h4>Feedback de ld&apos;IA</h4>
                <p>{feedback.feedback}</p>
              </div>

              {feedback.passed && (
                <div className="level-unlocked">
                  <p>✨ Niveau {currentLevel + 1} débloqué !</p>
                </div>
              )}

              <div className="results-actions">
                {feedback.passed ? (
                  <>
                    <button onClick={handleClose} className="btn-close-results">
                      Retour au dashboard
                    </button>
                    <button onClick={() => {
                      resetQuiz();
                      // Le dashboard rechargera avec le nouveau niveau
                      window.location.reload();
                    }} className="btn-retry">
                      Continuer vers Niveau {currentLevel + 1}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleClose} className="btn-close-results">
                      Retour au dashboard
                    </button>
                    <button onClick={resetQuiz} className="btn-retry">
                      Réessayer
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="quiz-loading">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        )}
      </div>
    </>
  );
}
