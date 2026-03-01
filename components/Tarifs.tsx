interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">Nos Tarifs</h2>
        
        <div className="pricing-grid">
          {/* Plan Gratuit */}
          <div className="pricing-card">
            <h3>Gratuit</h3>
            <div className="price">
              <span className="amount">0€</span>
              <span className="period">/mois</span>
            </div>
            <ul className="features-list">
              <li>✓ 5 quiz par mois</li>
              <li>✓ Upload jusqu&apos;à 10 pages</li>
              <li>✓ Questions basiques</li>
              <li>✗ Mode Coach Brutal</li>
              <li>✗ Statistiques avancées</li>
            </ul>
            <button className="pricing-btn">Commencer</button>
          </div>

          

          {/* Plan Étudiant */}
          <div className="pricing-card">
            <h3>Étudiant</h3>
            <div className="price">
              <span className="amount">5.99€</span>
              <span className="period">/mois</span>
            </div>
            <ul className="features-list">
              <li>✓ 50 quiz par mois</li>
              <li>✓ Upload jusqu&apos;à 100 pages</li>
              <li>✓ Questions avancées</li>
              <li>✓ Mode Coach Brutal</li>
              <li>✗ Statistiques avancées</li>
            </ul>
            <button className="pricing-btn">Choisir Étudiant</button>
          </div>

          {/* Plan Pro */}
          <div className="pricing-card featured">
            <div className="badge">Populaire</div>
            <h3>Pro</h3>
            <div className="price">
              <span className="amount">10.99€</span>
              <span className="period">/mois</span>
            </div>
            <ul className="features-list">
              <li>✓ Quiz illimités</li>
              <li>✓ Upload illimité</li>
              <li>✓ Questions avancées</li>
              <li>✓ Mode Coach Brutal</li>
              <li>✓ Statistiques détaillées</li>
            </ul>
            <button className="pricing-btn primary">Choisir Pro</button>
          </div>

          {/* Plan Etablissement */}
          <div className="pricing-card">
            <h3>Établissement</h3>
            <div className="price">
              <span className="amount">199€</span>
              <span className="period">/mois</span>
            </div>
            <ul className="features-list">
              <li>✓ Tout Premium</li>
              <li>✓ Dashboard prof</li>
              <li>✓ Devoirs assignées</li>
              <li>✓ Mode Coach Brutal</li>
              <li>✓ Statistiques détaillées</li>
              <li>✓ Account manager</li>
              
            </ul>
            <button className="pricing-btn">Choisir Étudiant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
