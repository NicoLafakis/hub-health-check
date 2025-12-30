import React from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

export default function ScopeWarning({ missingScopes, onDismiss }) {
  if (!missingScopes || missingScopes.length === 0) return null;

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-amber-800 mb-1">Missing Required Scopes</h3>
          <p className="text-sm text-amber-700 mb-3">
            Your Private App token is missing the following required scopes. The audit may be incomplete.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {missingScopes.map(scope => (
              <code
                key={scope}
                className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200 font-mono"
              >
                {scope}
              </code>
            ))}
          </div>
          <a
            href="https://developers.hubspot.com/docs/api/private-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
          >
            Learn how to add scopes <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
