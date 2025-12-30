import React, { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 85) return { text: 'text-emerald-500', stroke: '#10B981' };
  if (score >= 70) return { text: 'text-amber-500', stroke: '#F59E0B' };
  return { text: 'text-rose-500', stroke: '#EF4444' };
}

export default function ScoreGauge({ score, previousScore, size = 'large', showTrend = true }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = getScoreColor(score);

  useEffect(() => {
    // Animate the score counting up
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (animatedScore / 100) * circumference;
  const trend = previousScore ? score - previousScore : null;

  const sizeClasses = {
    large: 'w-32 h-32',
    medium: 'w-24 h-24',
    small: 'w-16 h-16'
  };

  const fontClasses = {
    large: 'text-4xl',
    medium: 'text-2xl',
    small: 'text-lg'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className={`${sizeClasses[size]} transform -rotate-90`}>
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="44%"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100 dark:text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="44%"
          stroke={colors.stroke}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${colors.stroke}40)`
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${fontClasses[size]} font-black ${colors.text}`}>
          {animatedScore}
        </span>
        {size !== 'small' && (
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        )}
      </div>

      {/* Trend indicator */}
      {showTrend && trend !== null && size === 'large' && (
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          trend > 0
            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
            : trend < 0
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {trend > 0 ? (
            <>
              <TrendingUp className="w-3 h-3" />
              +{trend}
            </>
          ) : trend < 0 ? (
            <>
              <TrendingDown className="w-3 h-3" />
              {trend}
            </>
          ) : (
            <>
              <Minus className="w-3 h-3" />
              No change
            </>
          )}
        </div>
      )}
    </div>
  );
}
