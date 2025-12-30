import React from 'react';
import {
  ShieldCheck,
  Activity,
  Lock,
  Settings,
  RefreshCcw,
  XCircle,
  Terminal,
  LayoutDashboard,
  ChevronRight,
  Database,
  Plus,
  History,
  Zap,
  Command,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Sidebar({
  token,
  onTokenChange,
  onAudit,
  isAuditing,
  isValidating,
  error,
  tokenInfo,
  results,
  activeTab,
  onTabChange,
  onNewAudit,
  onShowHistory,
  onShowRecommendations,
  onOpenCommandPalette
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-80 bg-hubspot-dark text-white flex flex-col fixed inset-y-0 left-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hubspot-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20 glow-orange">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">HubCheck</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Health Auditor
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* Quick Actions */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-colors group"
        >
          <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
            <Command className="w-4 h-4" />
            <span className="text-sm">Quick Actions</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="bg-slate-700 border-slate-600 text-slate-400">⌘</kbd>
            <kbd className="bg-slate-700 border-slate-600 text-slate-400">K</kbd>
          </div>
        </button>

        {/* Connection Panel */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" /> Connection
          </h3>

          <div className="space-y-3">
            <div className="relative group">
              <input
                type="password"
                value={token}
                onChange={(e) => onTokenChange(e.target.value)}
                placeholder="pat-xxxxxxxx-xxxx-xxxx"
                disabled={isAuditing || results}
                className="input-field text-white disabled:opacity-50"
              />
              <Settings className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors cursor-pointer" />
            </div>

            {results ? (
              <button
                onClick={onNewAudit}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                New Audit
              </button>
            ) : (
              <button
                onClick={onAudit}
                disabled={isAuditing || isValidating}
                className="btn-primary w-full"
              >
                {isAuditing ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : isValidating ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Run Audit
                  </>
                )}
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-in">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-200 font-medium leading-tight">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Permissions */}
        {results && (
          <div className="space-y-4 animate-in">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Active Permissions
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(results.scopes?.available || []).slice(0, 6).map(scope => (
                <span
                  key={scope}
                  className="text-[9px] font-bold bg-slate-800/80 text-slate-400 px-2 py-1 rounded border border-slate-700/50 tracking-tighter uppercase"
                >
                  {scope.split('.').slice(-2).join('.')}
                </span>
              ))}
              {(results.scopes?.available || []).length > 6 && (
                <span className="text-[9px] font-bold bg-slate-800/80 text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                  +{results.scopes.available.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-2 pt-4 border-t border-slate-700/50">
          <button
            onClick={() => onTabChange('dashboard')}
            disabled={!results}
            className={`w-full flex items-center justify-between p-2.5 text-sm rounded-xl transition-all ${
              activeTab === 'dashboard' && results
                ? 'bg-hubspot-orange/10 text-hubspot-orange'
                : results
                ? 'text-slate-400 hover:bg-slate-800/50'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'dashboard' ? 'rotate-90' : ''}`} />
          </button>

          <button
            onClick={onShowRecommendations}
            disabled={!results}
            className={`w-full flex items-center justify-between p-2.5 text-sm rounded-xl transition-all ${
              results
                ? 'text-slate-400 hover:bg-slate-800/50'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4" />
              Smart Insights
            </div>
            {results && (
              <span className="text-[10px] font-bold bg-hubspot-orange text-white px-1.5 py-0.5 rounded">AI</span>
            )}
          </button>

          <button
            onClick={onShowHistory}
            className="w-full flex items-center justify-between p-2.5 text-sm text-slate-400 hover:bg-slate-800/50 rounded-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4" />
              Audit History
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            className="w-full flex items-center justify-between p-2.5 text-sm text-slate-500 cursor-not-allowed group"
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4" />
              Objects
            </div>
            <Lock className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </nav>

      {/* Footer Status */}
      <div className="p-6 bg-slate-800/30 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <div className={`w-2 h-2 rounded-full ${isAuditing ? 'bg-amber-500 animate-pulse' : results ? 'bg-green-500 glow-green' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAuditing ? 'Scanning' : results ? `Hub ${results.hubId}` : 'Not Connected'}
            </span>
          </div>
          {results && (
            <div className="text-xs text-slate-500">
              v2.0
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
