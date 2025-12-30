import React, { useState } from 'react';
import { X, Zap, Target, Clock, TrendingUp, ChevronRight, Lightbulb, CheckCircle2, Rocket, Wrench } from 'lucide-react';
import { generateSmartRecommendations, getActionPlan, getOverallBenchmark } from '../lib/recommendations';

const priorityIcons = {
  critical: Target,
  'quick-win': Zap,
  focus: TrendingUp,
  enhancement: Lightbulb,
  automation: Wrench,
  maintenance: CheckCircle2
};

const priorityColors = {
  critical: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
  'quick-win': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  focus: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  enhancement: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
  automation: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  maintenance: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
};

export default function RecommendationsPanel({ isOpen, onClose, results }) {
  const [activeTab, setActiveTab] = useState('recommendations');

  if (!isOpen || !results) return null;

  const recommendations = generateSmartRecommendations(results);
  const actionPlan = getActionPlan(results);
  const benchmark = getOverallBenchmark(results.healthScore);

  const totalPotentialGain = recommendations.reduce((acc, r) => acc + (r.potentialScoreGain || 0), 0);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl animate-in-up overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-hubspot-orange to-rose-500 rounded-xl shadow-lg">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Smart Recommendations</h2>
                <p className="text-xs text-slate-400">AI-powered insights to improve your score</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Benchmark badge */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{benchmark.emoji}</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{benchmark.tier} Portal</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{benchmark.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Potential gain</p>
              <p className="text-xl font-bold text-emerald-500">+{totalPotentialGain} pts</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-hubspot-orange text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('action-plan')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'action-plan'
                  ? 'bg-hubspot-orange text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              30-Day Action Plan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === 'recommendations' ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const Icon = priorityIcons[rec.priority] || Lightbulb;

                return (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${priorityColors[rec.priority]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-slate-800 dark:text-white">{rec.title}</h3>
                          <span className="text-sm font-bold text-emerald-500">+{rec.potentialScoreGain} pts</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{rec.description}</p>
                      </div>
                    </div>

                    {/* Impact/Effort badges */}
                    <div className="flex gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        rec.impact === 'high' ? 'bg-emerald-100 text-emerald-600' :
                        rec.impact === 'medium' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {rec.impact} impact
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                        rec.effort === 'low' ? 'bg-emerald-100 text-emerald-600' :
                        rec.effort === 'medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {rec.effort} effort
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {rec.actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-hubspot-orange shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{action.text}</span>
                            {action.detail && (
                              <span className="text-slate-400"> - {action.detail}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(actionPlan).map(([week, data]) => (
                <div key={week} className="relative">
                  {/* Timeline connector */}
                  {week !== 'week4' && (
                    <div className="absolute left-[22px] top-12 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600" />
                  )}

                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-full bg-hubspot-orange flex items-center justify-center text-white font-bold shrink-0">
                      {week.replace('week', '')}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-800 dark:text-white">{data.title}</h3>
                        {data.estimatedGain > 0 && (
                          <span className="text-sm font-bold text-emerald-500">+{data.estimatedGain} pts</span>
                        )}
                      </div>
                      {data.tasks.length > 0 ? (
                        <ul className="space-y-2">
                          {data.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-hubspot-orange mt-2 shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No specific tasks - focus on maintenance</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
