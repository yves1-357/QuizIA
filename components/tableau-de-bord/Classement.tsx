'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Mood {
  emoji: string;
  label: string;
  response: string;
}

const moods: Mood[] = [
  { emoji: '😄', label: 'Motivé', response: 'Parfait. Utilise cette énergie pour avancer sur quelque chose d\'important.' },
  { emoji: '🙂', label: 'Ça va', response: 'Bon état d\'esprit. Avancer tranquillement aujourd\'hui, c\'est déjà très bien.' },
  { emoji: '😐', label: 'Fatigué', response: 'Même sans grande motivation, chaque petit pas compte et te rapproche de ton objectif.' },
  { emoji: '😓', label: 'Démotivé', response: 'C\'est normal d\'avoir des jours comme ça. Commencer doucement suffit.' },
  { emoji: '😤', label: 'Stressé', response: 'Le stress montre que ce sujet compte pour toi. On va y aller étape par étape.' },
  { emoji: '🤔', label: 'Pensif', response: 'Réfléchir c\'est bien. Maintenant, passons à l\'action ensemble pour avancer concrètement.' },
  { emoji: '😌', label: 'Serein', response: 'Excellente disposition. Tu es prêt à apprendre efficacement et à progresser aujourd\'hui.' },
  { emoji: '😎', label: 'Confiant', response: 'Super attitude. Ta confiance va t\'aider à surmonter les défis qui t\'attendent.' },
  { emoji: '🤓', label: 'Concentré', response: 'Ta concentration est un atout majeur. Profites-en pour approfondir tes connaissances.' },
  { emoji: '💪', label: 'Déterminé', response: 'Cette détermination va te porter loin. Continue avec cette belle énergie.' },
];

export default function Classement() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleStart = () => {
    router.push('/dashboard');
  };

  return (
    <div className="mood-selector-section">
      <div className="mood-header">
        <h3>Comment tu te sens aujourd&apos;hui ?</h3>
        <p className="mood-subtitle">Choisis ce qui te correspond le mieux avant de commencer.</p>
      </div>

      <div className="mood-grid">
        {moods.map((mood) => (
          <button
            key={mood.emoji}
            className={`mood-card ${selectedMood?.emoji === mood.emoji ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(mood)}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>

      <div className="mood-response">
        <p>{selectedMood ? selectedMood.response : "Commence ton bilan d'aujourd'hui"}</p>
      </div>
    </div>
  );
}
