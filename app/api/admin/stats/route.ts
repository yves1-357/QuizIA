import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Coûts par modèle (par 1M tokens)
const MODEL_COSTS = {
  'gpt-4o': { input: 2.5, output: 10.0 },
  'openai/gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  'anthropic/claude-3.5-haiku': { input: 0.25, output: 1.25 }
};

export async function GET() {
  try {
    console.log('📊 Début récupération stats admin...');
    
    // Récupérer toutes les conversations
    type ChatConversation = Awaited<ReturnType<typeof prisma.chatConversation.findMany>>[number];
    const conversations: ChatConversation[] = await prisma.chatConversation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limiter aux 100 dernières
    });
    
    console.log(`✅ ${conversations.length} conversations récupérées`);

    // Calculer les statistiques
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCost = 0;
    const userSet = new Set<string>();
    const dailyCosts: { [key: string]: number } = {};
    
    const apiCalls = conversations.map((conv) => {
      const tokensIn = conv.tokensIn || 0;
      const tokensOut = conv.tokensOut || 0;
      const model = conv.model || 'gpt-4o-mini';
      
      // Calculer le coût
      const modelCost = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['gpt-4o-mini'];
      const cost = (tokensIn * modelCost.input + tokensOut * modelCost.output) / 1000000;
      
      totalTokensIn += tokensIn;
      totalTokensOut += tokensOut;
      totalCost += cost;
      userSet.add(conv.userId);
      
      // Agréger par jour
      const date = new Date(conv.createdAt);
      const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      dailyCosts[dayKey] = (dailyCosts[dayKey] || 0) + cost;
      
      return {
        date: date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
        user: conv.userId.substring(0, 8),
        model: model,
        tokensIn,
        tokensOut,
        cost: parseFloat(cost.toFixed(4)),
        type: conv.type || 'chat'
      };
    });

    // Préparer les données du graphique (7 derniers jours)
    const today = new Date();
    const chartData = [];
    const daysOfWeek = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = daysOfWeek[date.getDay()];
      
      // Calculer le coût pour ce jour
      const dayConversations = conversations.filter(conv => {
        const convDate = new Date(conv.createdAt);
        return convDate.toDateString() === date.toDateString();
      });
      
      const dayCost = dayConversations.reduce((sum, conv) => {
        const tokensIn = conv.tokensIn || 0;
        const tokensOut = conv.tokensOut || 0;
        const model = conv.model || 'gpt-4o-mini';
        const modelCost = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['gpt-4o-mini'];
        return sum + (tokensIn * modelCost.input + tokensOut * modelCost.output) / 1000000;
      }, 0);
      
      chartData.push({
        day: dayName,
        cost: parseFloat(dayCost.toFixed(3))
      });
    }

    // Budget
    const TOTAL_BUDGET = 2.00;
    const consumed = parseFloat(totalCost.toFixed(3));
    const remaining = parseFloat((TOTAL_BUDGET - consumed).toFixed(3));
    const percentage = parseFloat(((consumed / TOTAL_BUDGET) * 100).toFixed(1));

    // Calculer le modèle le plus utilisé
    const modelUsage: { [key: string]: number } = {};
    conversations.forEach(conv => {
      const model = conv.model || 'gpt-4o-mini';
      modelUsage[model] = (modelUsage[model] || 0) + 1;
    });
    const mostUsedModel = Object.keys(modelUsage).reduce((a, b) => 
      modelUsage[a] > modelUsage[b] ? a : b, 'gpt-4o-mini'
    );

    // Calculer la projection
    const daysWithData = conversations.length > 0 ? 
      Math.ceil((Date.now() - new Date(conversations[conversations.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const avgDailyCost = consumed / Math.max(daysWithData, 1);
    const daysRemaining = avgDailyCost > 0 ? Math.ceil(remaining / avgDailyCost) : 999;

    return NextResponse.json({
      budget: {
        total: TOTAL_BUDGET,
        consumed,
        remaining,
        percentage
      },
      stats: {
        totalTokensIn,
        totalTokensOut,
        totalCalls: conversations.length,
        avgCostPerCall: conversations.length > 0 ? parseFloat((totalCost / conversations.length).toFixed(4)) : 0,
        activeUsers: userSet.size,
        mostUsedModel: mostUsedModel
      },
      apiCalls: apiCalls.slice(0, 10), // Limiter à 10 derniers appels
      chartData,
      projection: {
        daysRemaining,
        avgDailyCost: parseFloat(avgDailyCost.toFixed(4))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
