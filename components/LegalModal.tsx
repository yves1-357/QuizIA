'use client';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <h2>Informations Légales</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="legal-modal-content">
          <div className="legal-section">
            <h3>📜 Mentions Légales</h3>
            <div className="legal-card">
              <p><strong>Nom du site :</strong> QuizIA</p>
              <p><strong>Email : </strong>contact@quizia.com</p>
              <p><strong>Éditeur :</strong> QuizIA Platform</p>
              <p><strong>Nature :</strong> Plateforme éducative d&#39;apprentissage assistée par IA</p>
              <p><strong>Hébergement :</strong> Vercel Inc. / Supabase (base de données)</p>
              <p className="legal-note">
                QuizIA est une plateforme éducative utilisant l&#39;intelligence artificielle générative 
                via OpenRouter pour générer des exercices et fournir une assistance pédagogique.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h3>🔒 Confidentialité</h3>
            <div className="legal-card">
              <h4>Données collectées :</h4>
              <ul>
                <li>Informations de compte (nom, email, mot de passe crypté)</li>
                <li>Historique des quiz et exercices (questions, réponses, scores)</li>
                <li>Conversations avec l&#39;assistant IA (messages, fichiers attachés)</li>
                <li>Progression pédagogique (niveaux, matières, taux de réussite)</li>
                <li>Préférences utilisateur (thème, modèle IA sélectionné)</li>
              </ul>
              <h4>Base légale du traitement :</h4>
              <ul>
                <li>Consentement explicite lors de l&#39;inscription</li>
                <li>Exécution du contrat (fourniture des services éducatifs)</li>
                <li>Intérêt légitime (amélioration de la plateforme)</li>
              </ul>
              <h4>Utilisation des données :</h4>
              <ul>
                <li>Personnalisation de l&#39;expérience d&#39;apprentissage</li>
                <li>Suivi de la progression pédagogique</li>
                <li>Génération de contenus éducatifs via IA (OpenRouter)</li>
                <li>Amélioration des services et de l&#39;algorithme pédagogique</li>
                <li>Communication liée au service</li>
              </ul>
              <h4>Partage des données :</h4>
              <ul>
                <li><strong>OpenRouter (USA) :</strong> Messages du chatbot pour générer les réponses IA</li>
                <li><strong>Supabase (EU/USA) :</strong> Hébergement de la base de données</li>
                <li><strong>Vercel :</strong> Hébergement de l&#39;application</li>
                <li>Aucun partage à des fins marketing ou publicitaires</li>
              </ul>
              <h4>Durée de conservation :</h4>
              <ul>
                <li>Données de compte : tant que le compte est actif</li>
                <li>Historique des quiz : conservé pour le suivi pédagogique</li>
                <li>Conversations IA : conservées jusqu&#39;à suppression par l&#39;utilisateur</li>
                <li>Après suppression du compte : 30 jours puis suppression définitive</li>
              </ul>
              <h4>Sécurité :</h4>
              <p>
                Vos données sont stockées de manière sécurisée avec chiffrement en transit (HTTPS) 
                et au repos. Les mots de passe sont cryptés (bcrypt). Accès limité aux données 
                par authentification stricte.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h3>⚖️ Vos Droits (RGPD)</h3>
            <div className="legal-card">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d&#39;accès :</strong> Consulter toutes vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos informations</li>
                <li><strong>Droit à l&#39;effacement :</strong> Supprimer votre compte et données</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                <li><strong>Droit d&#39;opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
              </ul>
              <p>
                Pour exercer vos droits, contactez-nous à : <strong>contact@quizia.com</strong>
              </p>
              <p className="legal-note">
                Vous avez également le droit de déposer une plainte auprès de la CNIL 
                (Commission Nationale de l&#39;Informatique et des Libertés) si vous estimez 
                que vos droits ne sont pas respectés.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h3>🍪 Cookies</h3>
            <div className="legal-card">
              <h4>Cookies utilisés :</h4>
              <ul>
                <li><strong>LocalStorage :</strong> Stockage de votre session utilisateur et de vos préférences</li>
                <li><strong>Cookies essentiels :</strong> Authentification et fonctionnement du site</li>
              </ul>
              <h4>Types de données stockées localement :</h4>
              <ul>
                <li>Session utilisateur (connexion)</li>
                <li>Préférences de thème (clair/sombre)</li>
                <li>Progression en cours des quiz</li>
                <li>Historique des conversations IA</li>
              </ul>
              <p className="legal-note">
                Aucun cookie de tracking publicitaire n&#39;est utilisé. Tous les cookies sont 
                nécessaires au bon fonctionnement de QuizIA.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h3>⚠️ Avertissement sur l&#39;IA</h3>
            <div className="legal-card legal-warning">
              <p>
                QuizIA utilise l&#39;intelligence artificielle générative (OpenRouter) pour générer 
                du contenu pédagogique et des réponses. L&#39;IA peut commettre des erreurs, 
                des inexactitudes ou fournir des informations incomplètes.
              </p>
              <p>
                <strong>Il est fortement recommandé de :</strong>
              </p>
              <ul>
                <li>Vérifier les informations importantes auprès de sources fiables</li>
                <li>Croiser les réponses avec vos cours et manuels</li>
                <li>Consulter un enseignant en cas de doute</li>
                <li>Ne pas se fier uniquement à l&#39;IA pour des décisions importantes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
