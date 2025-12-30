import React, { useState, useEffect } from 'react';
import { Search, Database, Users, Briefcase, Building2, CheckCircle2 } from 'lucide-react';

const phases = [
  { id: 'connect', label: 'Connecting to HubSpot', icon: Database },
  { id: 'contacts', label: 'Analyzing contacts', icon: Users },
  { id: 'companies', label: 'Analyzing companies', icon: Building2 },
  { id: 'deals', label: 'Analyzing deals', icon: Briefcase },
  { id: 'calculate', label: 'Calculating scores', icon: CheckCircle2 },
];

export default function LoadingState({ phase }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    // Progress through phases based on the phase prop
    if (phase?.includes('Connecting') || phase?.includes('Validating')) {
      setCurrentPhaseIndex(0);
    } else if (phase?.includes('contacts')) {
      setCurrentPhaseIndex(1);
    } else if (phase?.includes('companies')) {
      setCurrentPhaseIndex(2);
    } else if (phase?.includes('deals')) {
      setCurrentPhaseIndex(3);
    } else if (phase?.includes('Calculating') || phase?.includes('scores')) {
      setCurrentPhaseIndex(4);
    }
  }, [phase]);

  return (
    <div className="h-[65vh] flex flex-col items-center justify-center text-center animate-in">
      {/* Animated Spinner */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-700 rounded-full" />
        <div className="absolute inset-0 border-4 border-hubspot-orange rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-hubspot-orange to-rose-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
        Scanning Your Portal
      </h3>

      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed mb-8">
        {phase || 'Connecting to HubSpot API...'}
      </p>

      {/* Progress Steps */}
      <div className="w-full max-w-sm">
        <div className="space-y-3">
          {phases.map((p, index) => {
            const Icon = p.icon;
            const isActive = index === currentPhaseIndex;
            const isComplete = index < currentPhaseIndex;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-hubspot-orange/10 dark:bg-hubspot-orange/20 border border-hubspot-orange/20'
                    : isComplete
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 opacity-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-hubspot-orange text-white animate-pulse'
                      : isComplete
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-hubspot-orange'
                      : isComplete
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {p.label}
                </span>
                {isActive && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-hubspot-orange rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fun fact */}
      <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 max-w-xs">
        Did you know? The average HubSpot portal has 15% duplicate contacts.
      </p>
    </div>
  );
}
