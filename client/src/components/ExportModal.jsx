import React from 'react';
import { X, FileText, FileCode, Download, Loader } from 'lucide-react';

export default function ExportModal({ onClose, onExport, isExporting }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-hubspot-orange/10 rounded-lg">
              <Download className="w-5 h-5 text-hubspot-orange" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Export Report</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-500 text-sm mb-6">
            Choose your preferred format to download the audit report.
          </p>

          <div className="space-y-3">
            {/* PDF Option */}
            <button
              onClick={() => onExport('pdf')}
              disabled={isExporting}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-3 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                <FileText className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-slate-800">PDF Document</h3>
                <p className="text-xs text-slate-500">
                  Formatted report with charts and branding
                </p>
              </div>
              {isExporting ? (
                <Loader className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-slate-400 group-hover:text-hubspot-orange transition-colors" />
              )}
            </button>

            {/* Markdown Option */}
            <button
              onClick={() => onExport('markdown')}
              disabled={isExporting}
              className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FileCode className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-slate-800">Markdown</h3>
                <p className="text-xs text-slate-500">
                  Plain text format for docs and wikis
                </p>
              </div>
              {isExporting ? (
                <Loader className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-slate-400 group-hover:text-hubspot-orange transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            Reports include all audit findings and recommendations
          </p>
        </div>
      </div>
    </div>
  );
}
