'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiCall {
  date: string;
  user: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  type: string;
}

interface BudgetData {
  total: number;
  consumed: number;
  remaining: number;
  percentage: number;
}

interface Stats {
  totalTokensIn: number;
  totalTokensOut: number;
  totalCalls: number;
  avgCostPerCall: number;
  activeUsers: number;
  mostUsedModel: string;
}

interface ChartDataPoint {
  day: string;
  cost: number;
}

interface Projection {
  daysRemaining: number;
  avgDailyCost: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; id: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [budgetData, setBudgetData] = useState<BudgetData>({
    total: 2.00,
    consumed: 0,
    remaining: 2.00,
    percentage: 0
  });
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTokensIn: 0,
    totalTokensOut: 0,
    totalCalls: 0,
    avgCostPerCall: 0,
    activeUsers: 0,
    mostUsedModel: 'gpt-4o-mini'
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [projection, setProjection] = useState<Projection>({
    daysRemaining: 0,
    avgDailyCost: 0
  });

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    router.push('/');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // On vérifie bien l'authentification admin
      const adminAuth = localStorage.getItem('adminAuth');
      const adminEmail = localStorage.getItem('adminEmail');
      
      if (!adminAuth || adminAuth !== 'true' || !adminEmail) {
        router.push('/');
        return;
      }
      
      setAdminEmail(adminEmail);
      setIsAuthenticated(true);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    loadRealData();

    const interval = setInterval(() => {
      loadRealData();
    }, 10000); // On rafraîchit toutes les 10 secondes

    return () => clearInterval(interval);
  }, [router]);

  const loadRealData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      
      setBudgetData(data.budget);
      setStats(data.stats);
      setApiCalls(data.apiCalls);
      setChartData(data.chartData);
      setProjection(data.projection);
    } catch (error) {
      console.error('Erreur de chargement des stats:', error);
    }
  };

  const getAlertStatus = () => {
    if (budgetData.percentage < 50) return 'ok';
    if (budgetData.percentage < 80) return 'warning';
    return 'critical';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <Link href="/" className="admin-logo">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <defs>
                <style>{`.cls-1{fill:#4285f4;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2{fill:#669df6;}`}</style>
              </defs>
              <g>
                <polygon className="cls-1" points="16.64 15.13 17.38 13.88 20.91 13.88 22 12 19.82 8.25 16.75 8.25 15.69 6.39 14.5 6.39 14.5 5.13 16.44 5.13 17.5 7 19.09 7 16.9 3.25 12.63 3.25 12.63 8.25 14.36 8.25 15.09 9.5 12.63 9.5 12.63 12 14.89 12 15.94 10.13 18.75 10.13 19.47 11.38 16.67 11.38 15.62 13.25 12.63 13.25 12.63 17.63 16.03 17.63 15.31 18.88 12.63 18.88 12.63 20.75 16.9 20.75 20.18 15.13 18.09 15.13 17.36 16.38 14.5 16.38 14.5 15.13 16.64 15.13"></polygon>
                <polygon className="cls-2" points="7.36 15.13 6.62 13.88 3.09 13.88 2 12 4.18 8.25 7.25 8.25 8.31 6.39 9.5 6.39 9.5 5.13 7.56 5.13 6.5 7 4.91 7 7.1 3.25 11.38 3.25 11.38 8.25 9.64 8.25 8.91 9.5 11.38 9.5 11.38 12 9.11 12 8.06 10.13 5.25 10.13 4.53 11.38 7.33 11.38 8.38 13.25 11.38 13.25 11.38 17.63 7.97 17.63 8.69 18.88 11.38 18.88 11.38 20.75 7.1 20.75 3.82 15.13 5.91 15.13 6.64 16.38 9.5 16.38 9.5 15.13 7.36 15.13"></polygon>
              </g>
            </svg>
            <span>QuizIA Admin</span>
          </Link>
          
          <div className="admin-user-info">
            <div className="admin-email-badge">
              
              <span className="admin-current-email">{adminEmail}</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn" title="Déconnexion">
            
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          <div className="admin-header-section">
            <h1 className="admin-title">Monitoring API & Budget</h1>
            <p className="admin-subtitle">Surveillance en temps réel de la consommation OpenRouter</p>
          </div>

          <div className="budget-overview">
            <div className="budget-card">
              <div className="budget-icon">💰</div>
              <div className="budget-info">
                <span className="budget-label">Budget Total</span>
                <span className="budget-value">{budgetData.total.toFixed(2)}€</span>
              </div>
            </div>
            <div className="budget-card consumed">
              <div className="budget-icon">📉</div>
              <div className="budget-info">
                <span className="budget-label">Consommé</span>
                <span className="budget-value">
                  {budgetData.consumed.toFixed(2)}€ <span className="budget-percent">({budgetData.percentage.toFixed(1)}%)</span>
                </span>
              </div>
            </div>
            <div className="budget-card remaining">
              <div className="budget-icon">✅</div>
              <div className="budget-info">
                <span className="budget-label">Restant</span>
                <span className="budget-value">{budgetData.remaining.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <h2 className="section-title">📈 Graphique de consommation par jour</h2>
            <div className="chart-container">
              <div className="chart-y-axis">
                <span>2.00€</span>
                <span>1.50€</span>
                <span>1.00€</span>
                <span>0.50€</span>
                <span>0.20€</span>
                <span>0.15€</span>
                <span>0.10€</span>
                <span>0.00€</span>
              </div>
              <div className="chart-area">
                {chartData.length > 0 ? (
                  chartData.map((point, idx) => {
                    const maxCost = Math.max(...chartData.map(p => p.cost), 0.01);
                    const height = (point.cost / maxCost) * 100;
                    return (
                      <div key={idx} className="chart-bar" style={{ height: `${height}%` }}>
                        <div className="chart-point">●</div>
                        <span className="chart-label">{point.day}</span>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>

          <div className="admin-section">
            <h2 className="section-title">📜 Historique des appels API</h2>
            <div className="api-table-wrapper">
              <table className="api-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Modèle</th>
                    <th>Tok In</th>
                    <th>Tok Out</th>
                    <th>Coût</th>
                  </tr>
                </thead>
                <tbody>
                  {apiCalls.map((call, idx) => (
                    <tr key={idx}>
                      <td>{call.date}</td>
                      <td>{call.user}</td>
                      <td>
                        <span className={`type-badge ${call.type}`}>
                          {call.type === 'chat' || call.type === 'chat_usage' ? '💬' : 
                           call.type === 'quiz_generation' ? '📝' : 
                           call.type === 'quiz_analysis' ? '✅' : '❓'}
                          {call.type === 'chat' || call.type === 'chat_usage' ? 'Chat' : 
                           call.type === 'quiz_generation' ? 'Quiz' : 
                           call.type === 'quiz_analysis' ? 'Analyse' : call.type}
                        </span>
                      </td>
                      <td>{call.model}</td>
                      <td>{call.tokensIn.toLocaleString()}</td>
                      <td>{call.tokensOut.toLocaleString()}</td>
                      <td className="cost">{call.cost.toFixed(3)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-grid-2col">
            <div className="admin-section stats-section">
              <h2 className="section-title">📊 Statistiques clés</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total tokens utilisés</span>
                  <div className="stat-tokens">
                    <span>Input : <strong>{stats.totalTokensIn.toLocaleString()}</strong></span>
                    <span>Output : <strong>{stats.totalTokensOut.toLocaleString()}</strong></span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-label">💬 Nombre total d&apos;appels</span>
                  <span className="stat-value">{stats.totalCalls}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">💰 Coût moyen/appel</span>
                  <span className="stat-value">{stats.avgCostPerCall.toFixed(3)}€</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">👥 Utilisateurs actifs</span>
                  <span className="stat-value">{stats.activeUsers}</span>
                </div>
              </div>
            </div>

            <div className="admin-section model-section">
              <h2 className="section-title">🤖 Modèle le plus utilisé : {stats.mostUsedModel.replace('openai/', '').replace('anthropic/', '')}</h2>
              <div className="model-content">
                <div className="model-why">
                  <h3>✅ Pourquoi ce modèle ?</h3>
                  <ul>
                    <li>Coût : 0.015€/1K tokens (input)</li>
                    <li>Performance : Excellent pour education</li>
                    <li>Latence : &lt;2s (streaming)</li>
                    <li>Multimodal : Images + PDF</li>
                  </ul>
                </div>
                <div className="model-comparison">
                  <h3>📊 Comparaison avec alternatives :</h3>
                  <ul>
                    <li><strong>GPT-4o :</strong> 5x plus cher, overkill</li>
                    <li><strong>Claude 3.5 :</strong> Bon mais 3x plus cher</li>
                    <li><strong>Llama 3 :</strong> Gratuit mais moins précis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-section alerts-section">
            <h2 className="section-title">⚠️ Alertes actives</h2>
            <div className="alerts-grid">
              <div className={`alert-item status-${getAlertStatus() === 'ok' ? 'ok' : 'inactive'}`}>
                <div className="alert-icon">🟢</div>
                <div className="alert-content">
                  <span className="alert-label">Budget</span>
                  <span className="alert-text">OK ({budgetData.percentage.toFixed(1)}% utilisé)</span>
                </div>
              </div>
              <div className={`alert-item status-${getAlertStatus() === 'warning' ? 'warning' : 'inactive'}`}>
                <div className="alert-icon">🟡</div>
                <div className="alert-content">
                  <span className="alert-label">Attention</span>
                  <span className="alert-text">Approche des 50%</span>
                </div>
              </div>
              <div className={`alert-item status-${getAlertStatus() === 'critical' ? 'critical' : 'inactive'}`}>
                <div className="alert-icon">🔴</div>
                <div className="alert-content">
                  <span className="alert-label">Critique</span>
                  <span className="alert-text">&gt;80% du budget</span>
                </div>
              </div>
            </div>
            <div className="projection-box">
              <h3>📊 Projection :</h3>
              <p>Au rythme actuel &rarr; <strong>
                {projection.daysRemaining > 0 
                  ? `Budget épuisé dans ${projection.daysRemaining} jour${projection.daysRemaining > 1 ? 's' : ''}`
                  : 'Pas assez de données pour la projection'}
              </strong></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
