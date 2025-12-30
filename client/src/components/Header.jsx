import React from 'react';
import { Activity, Download, ExternalLink, TrendingUp, TrendingDown, Keyboard } from 'lucide-react';

export default function Header({ results, onExport, trend }) {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 sticky top-0 z-40 flex justify-between items-center backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 transition-colors">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          CRM Audit Engine
          {results && (
            <>
              <span className="text-slate-300 dark:text-slate-600 font-normal">/</span>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Hub {results.hubId}</span>
              {trend && (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  trend.direction === 'up'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                    : trend.direction === 'down'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {trend.direction === 'up' ? (
                    <><TrendingUp className="w-3 h-3" /> +{trend.change}</>
                  ) : trend.direction === 'down' ? (
                    <><TrendingDown className="w-3 h-3" /> -{trend.change}</>
                  ) : (
                    'No change'
                  )}
                </span>
              )}
            </>
          )}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {results && (
          <>
            <div className="hidden md:flex bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-[11px] font-bold border border-blue-100 dark:border-blue-800 items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {(results.stats.totalContacts + results.stats.totalCompanies + results.stats.totalDeals).toLocaleString()} records
            </div>

            <button
              onClick={onExport}
              className="btn-secondary text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </>
        )}

        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </div>

        <a
          href="https://app.hubspot.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Open HubSpot"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}
