import React from 'react';
import {
  ShieldCheck,
  History,
  ChevronRight,
  Users,
  Briefcase,
  Building2,
  Database,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

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

function getStatusClasses(status) {
  switch (status) {
    case 'healthy': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'danger': return 'text-rose-600 bg-rose-50 border-rose-100';
    case 'info': return 'text-blue-600 bg-blue-50 border-blue-100';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export default function Dashboard({ results, onCategorySelect }) {
  const IconComponent = (iconName) => iconMap[iconName] || Database;

  return (
    <div className="animate-in">
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
                {results.healthScore}
              </h3>
              <span className="text-2xl text-slate-300 font-bold">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
              <History className="w-4 h-4" />
              Last Audit: {new Date(results.lastRun).toLocaleString()}
            </div>
          </div>

          {/* Circular Progress */}
          <div className="hidden sm:flex relative w-32 h-32 items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#f1f5f9"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * results.healthScore) / 100}
                className={`${getScoreColor(results.healthScore)} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className={`w-8 h-8 ${getScoreColor(results.healthScore)}`} />
            </div>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="bg-hubspot-dark p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center text-white">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
            Top Recommendation
          </p>
          <h4 className="font-bold text-lg leading-tight mb-4">
            {results.healthScore < 80
              ? "Resolve data quality issues to improve your overall score."
              : "Your portal is looking great! Consider reviewing stale deals."}
          </h4>
          <button className="bg-hubspot-orange text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:shadow-lg transition-all w-fit flex items-center gap-2">
            View Action Plan <ChevronRight className="w-4 h-4" />
          </button>
          <BarChart3 className="absolute -right-4 -bottom-4 w-28 h-28 text-white/5" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacts</p>
          <p className="text-2xl font-bold text-slate-800">{results.stats.totalContacts.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Companies</p>
          <p className="text-2xl font-bold text-slate-800">{results.stats.totalCompanies.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deals</p>
          <p className="text-2xl font-bold text-slate-800">{results.stats.totalDeals.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan Time</p>
          <p className="text-2xl font-bold text-slate-800">{results.stats.auditDuration}</p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.categories.map((category) => {
          const Icon = IconComponent(category.icon);

          return (
            <div
              key={category.id}
              className="card flex flex-col group hover:shadow-md transition-all"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-hubspot-orange border border-slate-100 group-hover:bg-hubspot-orange group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{category.name}</h3>
                    <p className="text-xs text-slate-400">{category.recordCount?.toLocaleString()} records</p>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full border bg-white ${getScoreColor(category.score)}`}>
                  {category.score}%
                </div>
              </div>

              <div className="p-5 space-y-4 flex-grow">
                {category.checks.slice(0, 3).map((check, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-slate-700">{check.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusClasses(check.status)}`}>
                        {check.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{check.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">
                <button
                  onClick={() => onCategorySelect(category)}
                  className="w-full text-[10px] font-bold text-slate-400 hover:text-hubspot-orange transition-colors flex items-center justify-center gap-1 uppercase tracking-widest"
                >
                  Deep Dive Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
