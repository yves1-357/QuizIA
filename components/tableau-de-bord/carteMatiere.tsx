'use client';

interface CarteMatiereProps {
  icon: string;
  nom: string;
  prochain: string;
  niveau: number;
  progression: number;
  couleur: string;
}

export default function CarteMatiere({ icon, nom, prochain, niveau, progression, couleur }: CarteMatiereProps) {
  return (
    <div className="carte-matiere">
      <div className="matiere-header">
        <div className={`matiere-icon ${couleur}`}>
          {icon}
        </div>
        <div className="matiere-niveau">
          <span className="niveau-label">NIVEAU</span>
          <span className="niveau-numero">{niveau}</span>
        </div>
      </div>

      <h3 className="matiere-nom">{nom}</h3>
      <p className="matiere-prochain">Prochain : {prochain}</p>

      <div className="matiere-progression">
        <div className="progression-bar">
          <div 
            className="progression-fill" 
            style={{ width: `${progression}%` }}
          ></div>
        </div>
        <span className="progression-text">{progression}%</span>
      </div>
    </div>
  );
}
