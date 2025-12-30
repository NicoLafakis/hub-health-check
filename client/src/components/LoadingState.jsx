import React from 'react';
import { Search } from 'lucide-react';

export default function LoadingState({ phase }) {
  return (
    <div className="h-[65vh] flex flex-col items-center justify-center text-center animate-in">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-hubspot-orange rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-8 h-8 text-hubspot-orange" />
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
        Scanning Portal Objects
      </h3>

      <p className="text-slate-500 font-medium max-w-xs leading-relaxed mb-4">
        {phase || 'Connecting to HubSpot API...'}
      </p>

      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-hubspot-orange rounded-full animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
