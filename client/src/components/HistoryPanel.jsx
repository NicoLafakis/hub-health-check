import React from 'react';
import { X, TrendingUp, TrendingDown, Minus, Trash2, Clock, BarChart3 } from 'lucide-react';
import { useAuditHistory } from '../hooks/useAuditHistory';

function getScoreColor(score) {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-amber-500';
  return 'text-rose-500';
}

function TrendBadge({ trend }) {
  if (!trend) return null;

  const { direction, change } = trend;

  if (direction === 'up') {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
        <TrendingUp className="w-3 h-3" />
        +{change}
      </span>
    );
  }

  if (direction === 'down') {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-rose-500">
        <TrendingDown className="w-3 h-3" />
        -{change}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
      <Minus className="w-3 h-3" />
      No change
    </span>
  );
}

export default function HistoryPanel({ isOpen, onClose }) {
  const { history, clearHistory, getScoreTrend } = useAuditHistory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl animate-in-up overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-hubspot-orange/10 rounded-xl">
              <Clock className="w-5 h-5 text-hubspot-orange" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Audit History</h2>
              <p className="text-xs text-slate-400">{history.length} audits recorded</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No History Yet</h3>
              <p className="text-sm text-slate-400">Run your first audit to start tracking trends</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((audit, index) => {
                const trend = index < history.length - 1 ? getScoreTrend(audit.hubId) : null;

                return (
                  <div
                    key={audit.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">
                          Hub {audit.hubId}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(audit.healthScore)}`}>
                            {audit.healthScore}
                          </span>
                          <TrendBadge trend={trend} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(audit.timestamp).toLocaleDateString()} at{' '}
                        {new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Category scores */}
                    <div className="flex flex-wrap gap-2">
                      {audit.categoryScores.map(cat => (
                        <span
                          key={cat.id}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                            cat.score >= 85
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                              : cat.score >= 70
                              ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                          }`}
                        >
                          {cat.name}: {cat.score}%
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{audit.stats?.totalContacts?.toLocaleString()} contacts</span>
                      <span>{audit.stats?.totalCompanies?.toLocaleString()} companies</span>
                      <span>{audit.stats?.totalDeals?.toLocaleString()} deals</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
