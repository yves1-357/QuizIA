# 🎓 QuizIA - L'école sur mesure

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Plateforme d'apprentissage adaptatif alimentée par l'IA. Transformez vos révisions en expérience interactive avec des quiz personnalisés, un chatbot intelligent et un suivi de progression en temps réel.

**🌐 Application en ligne** : [https://quiz-ia-sepia.vercel.app/](https://quiz-ia-sepia.vercel.app/)

---

## 🎯 Qu'est-ce que QuizIA ?

QuizIA est une plateforme éducative qui utilise l'intelligence artificielle pour révolutionner la manière dont les étudiants apprennent. Fini les fiches de révision fastidieuses et les quiz génériques - l'IA génère automatiquement des questions adaptées à votre niveau et vous accompagne dans votre progression.

### 💡 Le problème résolu

- **Perte de temps** : Créer des fiches de révision manuellement prend des heures
- **Manque de personnalisation** : Les quiz traditionnels ne s'adaptent pas à votre niveau réel
- **Pas de feedback** : Difficile de savoir précisément où sont vos lacunes
- **Coût élevé** : Les cours particuliers coûtent 60-80€/heure
- **Motivation difficile** : L'apprentissage seul manque de gamification

### ✨ La solution QuizIA

Une plateforme intelligente qui génère des quiz sur mesure, vous corrige instantanément avec des explications pédagogiques, et adapte la difficulté selon vos performances. Le tout pour une fraction du coût d'un cours particulier.

---

## ✨ Fonctionnalités

### Pour les étudiants

- ✅ **Génération de quiz par IA** : 20 questions adaptées à votre niveau (Lycée, Bachelor, Master)
- ✅ **8 matières disponibles** : Mathématiques, Physique, Chimie, Anglais, Français, Économie, Histoire, Géopolitique
- ✅ **Progression gamifiée** : 4 niveaux débloquables par matière
- ✅ **Feedback instantané** : Corrections détaillées avec explications
- ✅ **Chatbot multimodal** : Upload de PDF, images et documents
- ✅ **Statistiques détaillées** : Taux de réussite, historique, graphiques
- ✅ **Mode adaptatif** : Difficulté croissante selon vos performances

### Pour les administrateurs

- 📊 **Dashboard de monitoring** : Suivi des coûts tokens en temps réel
- 📈 **Analytics avancées** : Utilisateurs actifs, appels API, modèles utilisés
- 💰 **Gestion du budget IA** : Alertes automatiques (50%, 80%)
- 📉 **Graphiques temporels** : Consommation sur 7 jours
- 🔍 **Logs détaillés** : Chaque appel API avec coût précis

### Modèles IA disponibles

| Modèle | Coût ($/1M tokens) | Use Case |
|--------|-------------------|----------|
| GPT-4o-mini ⭐ | $0.15/$0.60 | Quiz standard (défaut) |
| GPT-4o | $2.50/$10.00 | Niveau Master avancé |
| Claude 3.5 Haiku | $0.25/$1.25 | Chatbot rapide |
| Claude 3.5 Sonnet | $3.00/$15.00 | Analyse documents |
| Microsoft Phi-4 | Gratuit | Expérimentation |
| Qwen2.5 VL 7B | Gratuit | Vision + texte |

---

## 🛠️ Stack technique

### Frontend
- **Next.js 16.1.1** (App Router, React 19.2.0)
- **TypeScript 5**
- **Tailwind CSS 4** (styling moderne)
- **React Markdown** (affichage réponses IA)
- **Recharts** (graphiques de progression)
- **Lucide React** (icônes)

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM 6.19.0** (type-safe DB access)
- **bcryptjs** (hash passwords)
- **Zod** (validation runtime)

### Base de données
- **PostgreSQL 15** (Supabase)
- **Prisma Migrate** (versioning schéma)
- **pgbouncer** (connection pooling)

### API IA
- **OpenRouter** (gateway multi-modèles)
- **Streaming SSE** (réponses en temps réel)

### DevOps
- **GitHub Actions** (CI/CD)
- **Vercel** (hosting + CDN global)
- **Supabase** (DB managée)

---

## 🎮 Comment ça marche ?

### 1️⃣ Inscription et choix des matières

Créez votre compte en quelques secondes et choisissez parmi **8 matières** :
- 📐 **Mathématiques** : Algèbre, analyse, géométrie
- ⚡ **Physique** : Mécanique, électricité, thermodynamique
- ⚗️ **Chimie** : Organique, minérale, réactions
- 🇬🇧 **Anglais** : Grammaire, vocabulaire, compréhension
- 📝 **Français** : Littérature, grammaire, dissertation
- 💰 **Économie** : Micro, macro, finance
- 📜 **Histoire** : Périodes, événements, personnages
- 🌍 **Géopolitique** : Relations internationales, actualité

### 2️⃣ Sélection du niveau académique

Adaptez l'expérience à votre parcours :
- 🎓 **Lycée** : Questions niveau baccalauréat
- 🎯 **Bachelor/Licence** : Niveau universitaire 1er cycle
- 🚀 **Master** : Questions avancées et problématiques complexes

### 3️⃣ Génération de quiz par IA

L'intelligence artificielle crée **20 questions uniques** adaptées à votre niveau. Plusieurs modèles disponibles :
- **GPT-4o-mini** ⭐ (recommandé) : Équilibre parfait qualité/rapidité
- **GPT-4o** : Pour les questions très complexes
- **Claude 3.5 Haiku** : Rapide et efficace
- **Claude 3.5 Sonnet** : Idéal pour analyser vos documents
- **Modèles gratuits** : Phi-4, Qwen2.5 pour l'expérimentation

### 4️⃣ Répondre et progresser

- ✅ **Feedback instantané** : Savoir immédiatement si c'est correct
- 📖 **Explications détaillées** : Comprendre vos erreurs
- 📊 **Score en direct** : Suivre votre progression question par question
- 🎯 **Difficulté adaptative** : Les questions s'ajustent selon vos réponses

### 5️⃣ Débloquage de niveaux

- **Niveau 1** : Concepts fondamentaux (toujours accessible)
- **Niveau 2** : Débloqué après 70% de réussite au niveau 1
- **Niveau 3** : Questions intermédiaires et applications
- **Niveau 4** : Niveau expert avec problématiques avancées

### 🤖 Chatbot IA multimodal

Besoin d'aide ? Le chatbot intelligent peut :
- 📄 **Analyser vos PDF** : Upload vos cours et posez des questions
- 🖼️ **Comprendre les images** : Spectres, graphiques, schémas
- 💬 **Expliquer simplement** : Reformulation avec exemples concrets
- 🔄 **Converser naturellement** : Streaming en temps réel

### 📈 Suivi de progression

Visualisez votre évolution avec :
- **Graphiques interactifs** : Taux de réussite par matière
- **Historique complet** : Toutes vos sessions sauvegardées
- **Points forts/faibles** : Identification automatique des lacunes
- **Recommandations IA** : Conseils personnalisés pour progresser
- **Séries en cours** : Reprendre là où vous vous êtes arrêté

---

## 👥 Pour qui est QuizIA ?

### 🎓 Lycéens 
Préparez votre baccalauréat avec des quiz ciblés sur les matières clés. Révisez à votre rythme, 24/7.

### 📚 Étudiants universitaires 
Approfondissez vos connaissances en Bachelor ou Master. Questions adaptées au niveau universitaire.

### 💼 Apprenants en reconversion
Besoin de réviser des bases ou d'apprendre une nouvelle matière ? QuizIA s'adapte à tous les niveaux.

### 👨‍🏫 Enseignants
Utilisez le dashboard admin pour suivre la consommation IA et optimiser les coûts.

---

## 💰 Modèle économique

QuizIA utilise des modèles IA à **coût optimisé** :

| Action | Coût réel | Fréquence |
|--------|-----------|-----------|
| Quiz 20 questions | **$0.001** | 5/semaine |
| Message chatbot | **$0.0001** | 20/semaine |
| Analyse PDF (10 pages) | **$0.001** | 2/semaine |

**Coût moyen par utilisateur** : ~$0.04/mois (4 centimes !)

### 📊 Dashboard administrateur

Pour les gestionnaires de plateforme :
- 💵 **Suivi budget en temps réel** : Consommation vs budget total
- 📈 **Analytics détaillées** : Utilisateurs actifs, modèles utilisés
- ⚠️ **Alertes automatiques** : Notification à 50% et 80% du budget
- 📉 **Graphiques 7 jours** : Visualisation de la consommation
- 🔍 **Logs complets** : Chaque appel API avec coût précis

---

## 🔒 Sécurité et conformité

### RGPD compliant

- ✅ **Données minimales** : Seulement email, nom et mot de passe (hashé)
- ✅ **Droit à l'oubli** : Suppression complète du compte possible
- ✅ **Transparence** : Politique de confidentialité claire
- ✅ **Consentement explicite** : Checkbox lors de l'inscription

### AI Act (Règlement UE)

- ✅ **Transparence IA** : Mention "Généré par IA" sur tous les contenus
- ✅ **Modèle affiché** : L'utilisateur sait quel modèle génère ses questions
- ✅ **Traçabilité** : Logs de toutes les interactions IA

### Sécurité technique

- 🔐 **Passwords hashés** : bcrypt avec 10 rounds
- 🍪 **Cookies sécurisés** : httpOnly, sameSite protection
- 🔒 **SSL/TLS** : Chiffrement de bout en bout
- 🛡️ **SQL Injection** : Protection via Prisma ORM

---

## 📊 Statistiques du projet

- 📁 **8 tables** en base de données
- 🎯 **20 questions** par quiz (personnalisables)
- 🌐 **8 matières** disponibles
- 🏆 **4 niveaux** de difficulté par matière
- 💰 **$0.001** coût moyen par quiz
- ⚡ **< 3 secondes** pour générer un quiz
- 🤖 **6 modèles IA** au choix
- 📱 **100% responsive** sur tous les appareils

---


## 🚀 Déploiement & Performance

- **CDN global** : Temps de chargement < 2s partout dans le monde
- **Edge Functions** : API Routes déployées au plus proche des utilisateurs
- **Optimisation images** : Compression automatique via Next.js Image
- **Caching intelligent** : Sessions sauvegardées pour reprise instantanée
- **Progressive Web App** : Installable sur mobile (PWA - prévu)

---


## 🎓 Équipe et crédits

**Développé par** [yves1-357](https://github.com/yves1-357) (https://github.com/RandyKoke) - Janvier 2026

**🔗 Repository GitHub** : [QuizIA](https://github.com/yves1-357/QuizIA.git)

## �📄 License

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

<div align="center">

**🎓 QuizIA - Révolutionnez votre apprentissage avec l'IA**

[🌐 Essayer maintenant](https://quiz-ia-sepia.vercel.app/) | [📖 Documentation](#) | [🐛 Signaler un bug](https://github.com/yves1-357/QuizIA/issues)

*Janvier 2026 - Made with ❤️ and 🤖*

</div>
