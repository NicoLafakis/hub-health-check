import React from 'react';
import {
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Briefcase,
  Building2,
  Database,
  TrendingUp,
  CheckCircle,
  Info
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

export default function CategoryDetails({ category, onBack }) {
  if (!category) return null;

  const Icon = iconMap[category.icon] || Database;

  return (
    <div className="animate-in">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white rounded-xl shadow-sm text-hubspot-orange border border-slate-100">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{category.name}</h2>
            </div>
            <p className="text-slate-500">
              Comprehensive breakdown of object properties and metadata health.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Category Health
            </p>
            <div className={`text-4xl font-black ${getScoreColor(category.score)}`}>
              {category.score}%
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Audit Check
                  </th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Finding
                  </th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {category.checks.map((check, i) => (
                  <tr key={i} className="group">
                    <td className="py-6 pr-4">
                      <div className="font-bold text-slate-700 group-hover:text-hubspot-orange transition-colors">
                        {check.label}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{check.description}</div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="font-mono text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {check.value}
                      </span>
                      {check.percentage && (
                        <span className="ml-2 text-xs text-slate-400">({check.percentage}%)</span>
                      )}
                    </td>
                    <td className="py-6 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusClasses(check.status)}`}>
                        {check.status === 'healthy' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : check.status === 'info' ? (
                          <Info className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {check.status}
                      </div>
                    </td>
                    <td className="py-6 pl-4 text-sm text-slate-500 italic leading-relaxed max-w-xs">
                      {check.recommendation || 'No action required.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Affected Records Section */}
        {category.checks.some(c => c.affectedRecords?.length > 0) && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Sample Affected Records</h3>
            {category.checks.filter(c => c.affectedRecords?.length > 0).map((check, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {check.label}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {check.affectedRecords.slice(0, 10).map((record, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    >
                      <div className="font-medium text-slate-700 truncate">
                        {record.name || record.email || `ID: ${record.id}`}
                      </div>
                      <div className="text-slate-400 text-[10px]">ID: {record.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
