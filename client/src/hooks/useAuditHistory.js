import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hubcheck-audit-history';
const MAX_HISTORY = 20;

export function useAuditHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addAudit = useCallback((results) => {
    setHistory(prev => {
      const newEntry = {
        id: Date.now(),
        hubId: results.hubId,
        healthScore: results.healthScore,
        timestamp: results.lastRun,
        stats: results.stats,
        categoryScores: results.categories.map(c => ({
          id: c.id,
          name: c.name,
          score: c.score
        }))
      };
      return [newEntry, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const getScoreTrend = useCallback((hubId) => {
    const hubHistory = history.filter(h => h.hubId === hubId);
    if (hubHistory.length < 2) return null;

    const latest = hubHistory[0].healthScore;
    const previous = hubHistory[1].healthScore;
    const change = latest - previous;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change),
      previousScore: previous
    };
  }, [history]);

  return { history, addAudit, clearHistory, getScoreTrend };
}
