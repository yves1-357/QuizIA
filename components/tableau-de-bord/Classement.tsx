'use client';

export default function Classement() {
  const topUsers = [
    { rang: 1, nom: 'User_100', xp: 1900 },
    { rang: 2, nom: 'User_101', xp: 1800 },
    { rang: 3, nom: 'User_102', xp: 1700 }
  ];

  return (
    <div className="classement-section">
      <div className="classement-header">
        <span>🏆</span>
        <h3>Classement</h3>
      </div>

      <div className="classement-liste">
        {topUsers.map((user) => (
          <div key={user.rang} className="classement-item">
            <span className="classement-rang">#{user.rang}</span>
            <span className="classement-nom">{user.nom}</span>
            <span className="classement-xp">{user.xp} XP</span>
          </div>
        ))}
      </div>

      <button className="btn-voir-tout">Voir tout</button>
    </div>
  );
}
