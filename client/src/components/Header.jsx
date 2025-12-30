import React from 'react';
import { Activity, Download, ExternalLink } from 'lucide-react';

export default function Header({ results, onExport }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40 flex justify-between items-center backdrop-blur-sm bg-white/80">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          CRM Audit Engine
          {results && (
            <>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-500 text-sm font-medium">Hub {results.hubId}</span>
            </>
          )}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {results && (
          <>
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[11px] font-bold border border-blue-100 flex items-center gap-1.5 shadow-sm">
              <Activity className="w-3.5 h-3.5" />
              Scanned {(results.stats.totalContacts + results.stats.totalCompanies + results.stats.totalDeals).toLocaleString()} records
            </div>

            <button
              onClick={onExport}
              className="btn-secondary text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </>
        )}

        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
