import React from 'react';
import { Activity, ShieldCheck, Terminal, Lock, Zap } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto animate-in">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 shadow-inner">
        <Activity className="w-10 h-10 text-slate-300" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">Portal Analysis Ready</h2>
      <p className="text-slate-500 mb-8 leading-relaxed">
        To begin the health check, paste your HubSpot Private App Access Token into the connection panel on the left.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
          <ShieldCheck className="w-5 h-5 text-hubspot-orange mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Secure Access</h4>
          <p className="text-xs text-slate-400">Tokens are processed locally and never stored.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
          <Terminal className="w-5 h-5 text-blue-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Scope Aware</h4>
          <p className="text-xs text-slate-400">We only audit objects your token is allowed to see.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
          <Lock className="w-5 h-5 text-emerald-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Read Only</h4>
          <p className="text-xs text-slate-400">We never write or modify your CRM data.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
          <Zap className="w-5 h-5 text-amber-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Fast Analysis</h4>
          <p className="text-xs text-slate-400">Deep scan completes in under 30 seconds.</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 w-full">
        <p className="text-xs text-slate-500">
          <strong className="text-slate-600">Need a token?</strong> Create one in your HubSpot account under Settings &gt; Integrations &gt; Private Apps
        </p>
      </div>
    </div>
  );
}
