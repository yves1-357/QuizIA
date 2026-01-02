/**
 * Données mock pour l'application
 * À remplacer plus tard par des appels API
 */

// Étapes du parcours utilisateur (landing page)

// 5 etapes affichées sur la landing
export const USER_JOURNEY = [
  { 
    step: 1, 
    title: "Diagnostic", 
    desc: "Scan complet de vos compétences actuelles." 
  },
  { 
    step: 2, 
    title: "Personnalisation", 
    desc: "L'IA génère votre arbre de connaissances unique." 
  },
  { 
    step: 3, 
    title: "Immersion", 
    desc: "Exercices ciblés sur vos zones de progression." 
  },
  { 
    step: 4, 
    title: "Feedback", 
    desc: "Correction neuronale instantanée." 
  },
  { 
    step: 5, 
    title: "Maîtrise", 
    desc: "Validation des acquis et passage au niveau supérieur." 
  }
];

// Matières disponibles (dashboard) avec progression
export const SUBJECTS = [
  { 
    id: 'math', 
    name: 'Mathématiques', 
    color: 'text-blue-400', 
    level: 2, 
    progress: 45, 
    next: "Polynômes" 
  },
  { 
    id: 'phys', 
    name: 'Physique', 
    color: 'text-purple-400', 
    level: 1, 
    progress: 10, 
    next: "Mécanique" 
  },
  { 
    id: 'eng', 
    name: 'Anglais', 
    color: 'text-emerald-400', 
    level: 3, 
    progress: 75, 
    next: "Business" 
  },
];

// Liste des matières pour la landing page
export const SUBJECT_LIST = [
  { label: "Mathématiques (Algèbre, Analyse)" },
  { label: "Physique & Chimie" },
  { label: "Langues Vivantes (Anglais, Espagnol)" },
  { label: "Histoire & Géographie" },
];