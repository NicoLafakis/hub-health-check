import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  History,
  ChevronRight,
  Users,
  Briefcase,
  Building2,
  Database,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { getOverallBenchmark } from '../lib/benchmarks';

const iconMap = {
  Users: Users,
  Briefcase: Briefcase,
  Building2: Building2,
  Database: Database,
  TrendingUp: TrendingUp,
  CheckCircle: CheckCircle
};

function getScoreColor(score) {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-amber-500';
  return 'text-rose-500';
}

function getScoreStroke(score) {
  if (score >= 85) return '#10B981';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

function getStatusClasses(status) {
  switch (status) {
    case 'healthy': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800';
    case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
    case 'danger': return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800';
    case 'info': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
    default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
  }
}

function AnimatedScore({ score }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return displayScore;
}

export default function Dashboard({ results, onCategorySelect, trend }) {
  const IconComponent = (iconName) => iconMap[iconName] || Database;
  const benchmark = getOverallBenchmark(results.healthScore);
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (results.healthScore / 100) * circumference;

  return (
    <div className="animate-in stagger-children">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Health Score Card */}
        <div className="card p-6 col-span-1 lg:col-span-2 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Overall Health Score
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-6xl font-black tracking-tighter ${getScoreColor(results.healthScore)}`}>
                <AnimatedScore score={results.healthScore} />
              </h3>
              <span className="text-2xl text-slate-300 dark:text-slate-600 font-bold">/ 100</span>
              {trend && (
                <span className={`flex items-center gap-1 text-sm font-bold ${
                  trend.direction === 'up' ? 'text-emerald-500' : trend.direction === 'down' ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {trend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : trend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                  {trend.direction === 'up' ? `+${trend.change}` : trend.direction === 'down' ? `-${trend.change}` : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <History className="w-4 h-4" />
                {new Date(results.lastRun).toLocaleString()}
              </div>
              <span className="text-lg">{benchmark.emoji}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{benchmark.tier}</span>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="hidden sm:flex relative w-32 h-32 items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-100 dark:text-slate-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={getScoreStroke(results.healthScore)}
                strokeWidth="10"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${getScoreStroke(results.healthScore)}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className={`w-8 h-8 ${getScoreColor(results.healthScore)}`} />
            </div>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="bg-gradient-to-br from-hubspot-dark to-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center text-white">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-5 h-5 text-hubspot-orange animate-pulse" />
          </div>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
            Top Recommendation
          </p>
          <h4 className="font-bold text-lg leading-tight mb-4">
            {results.healthScore < 70
              ? "Critical: Focus on fixing data integrity issues first."
              : results.healthScore < 85
              ? "Good progress! Reduce duplicate contacts to boost your score."
              : "Excellent! Maintain your portal with regular audits."}
          </h4>
          <button className="bg-hubspot-orange text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all w-fit flex items-center gap-2">
            <Zap className="w-3 h-3" />
            View Action Plan <ChevronRight className="w-4 h-4" />
          </button>
          <BarChart3 className="absolute -right-4 -bottom-4 w-28 h-28 text-white/5" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3 text-hubspot-orange" /> Contacts
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-hubspot-orange transition-colors">
            {results.stats.totalContacts.toLocaleString()}
          </p>
        </div>
        <div className="card p-4 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-3 h-3 text-blue-500" /> Companies
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
            {results.stats.totalCompanies.toLocaleString()}
          </p>
        </div>
        <div className="card p-4 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-emerald-500" /> Deals
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
            {results.stats.totalDeals.toLocaleString()}
          </p>
        </div>
        <div className="card p-4 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3 h-3 text-purple-500" /> Scan Time
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">
            {results.stats.auditDuration}
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.categories.map((category, catIndex) => {
          const Icon = IconComponent(category.icon);

          return (
            <div
              key={category.id}
              className="card flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all"
              style={{ animationDelay: `${catIndex * 0.1}s` }}
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-hubspot-orange border border-slate-100 dark:border-slate-600 group-hover:bg-hubspot-orange group-hover:text-white group-hover:border-hubspot-orange transition-all group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{category.name}</h3>
                    <p className="text-xs text-slate-400">{category.recordCount?.toLocaleString()} records</p>
                  </div>
                </div>
                <div className={`text-sm font-bold px-2.5 py-1 rounded-full border ${
                  category.score >= 85
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                    : category.score >= 70
                    ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                }`}>
                  {category.score}%
                </div>
              </div>

              <div className="p-5 space-y-4 flex-grow">
                {category.checks.slice(0, 3).map((check, idx) => (
                  <div key={idx} className="group/check">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover/check:text-hubspot-orange transition-colors">
                        {check.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusClasses(check.status)}`}>
                        {check.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{check.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50/50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 rounded-b-2xl">
                <button
                  onClick={() => onCategorySelect(category)}
                  className="w-full text-[10px] font-bold text-slate-400 hover:text-hubspot-orange transition-colors flex items-center justify-center gap-1 uppercase tracking-widest group-hover:text-hubspot-orange"
                >
                  Deep Dive Details <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
