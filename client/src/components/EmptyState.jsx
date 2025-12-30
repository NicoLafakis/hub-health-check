import React from 'react';
import { Activity, ShieldCheck, Terminal, Lock, Zap, Sparkles, ArrowRight } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-xl mx-auto animate-in">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-hubspot-orange to-rose-500 rounded-3xl flex items-center justify-center shadow-xl shadow-hubspot-orange/20 animate-float">
          <Activity className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-in" style={{ animationDelay: '0.3s' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
        Ready to Analyze Your Portal
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-lg">
        Connect your HubSpot Private App Token to run a comprehensive health audit on your CRM data.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 gap-4 w-full mb-8 stagger-children">
        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="w-10 h-10 bg-hubspot-orange/10 dark:bg-hubspot-orange/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-hubspot-orange group-hover:scale-110 transition-all">
            <ShieldCheck className="w-5 h-5 text-hubspot-orange group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Secure Access</h4>
          <p className="text-xs text-slate-400">Tokens are processed locally and never stored on our servers.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:scale-110 transition-all">
            <Terminal className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Scope Aware</h4>
          <p className="text-xs text-slate-400">We only audit objects your token has permission to access.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:scale-110 transition-all">
            <Lock className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Read Only</h4>
          <p className="text-xs text-slate-400">We never write or modify any of your CRM data.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:scale-110 transition-all">
            <Zap className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">AI Insights</h4>
          <p className="text-xs text-slate-400">Get smart recommendations powered by AI analysis.</p>
        </div>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 w-full">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <strong className="text-slate-600 dark:text-slate-300">Need a token?</strong>{' '}
          Create one in HubSpot under{' '}
          <a
            href="https://app.hubspot.com/private-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-hubspot-orange hover:underline inline-flex items-center gap-1"
          >
            Settings → Integrations → Private Apps
            <ArrowRight className="w-3 h-3" />
          </a>
        </p>
      </div>

      {/* Keyboard Shortcut Hint */}
      <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
        Pro tip: Press <kbd>⌘</kbd> <kbd>K</kbd> for quick actions
      </p>
    </div>
  );
}
