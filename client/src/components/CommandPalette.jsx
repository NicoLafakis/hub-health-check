import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  Download,
  Moon,
  Sun,
  RefreshCcw,
  History,
  Zap,
  FileText,
  FileCode,
  Settings,
  HelpCircle,
  ExternalLink,
  Keyboard,
  X
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function CommandPalette({
  isOpen,
  onClose,
  onRunAudit,
  onExportPDF,
  onExportMarkdown,
  onShowHistory,
  onShowRecommendations,
  hasResults
}) {
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const commands = useMemo(() => [
    {
      id: 'run-audit',
      label: 'Run New Audit',
      description: 'Start a new CRM health audit',
      icon: RefreshCcw,
      shortcut: ['Ctrl', 'Enter'],
      action: () => { onRunAudit?.(); onClose(); },
      category: 'Actions'
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark theme',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: ['Ctrl', 'D'],
      action: () => { toggleTheme(); onClose(); },
      category: 'Preferences'
    },
    {
      id: 'export-pdf',
      label: 'Export as PDF',
      description: 'Download audit report as PDF',
      icon: FileText,
      shortcut: ['Ctrl', 'Shift', 'P'],
      action: () => { onExportPDF?.(); onClose(); },
      category: 'Export',
      disabled: !hasResults
    },
    {
      id: 'export-markdown',
      label: 'Export as Markdown',
      description: 'Download audit report as Markdown',
      icon: FileCode,
      shortcut: ['Ctrl', 'Shift', 'M'],
      action: () => { onExportMarkdown?.(); onClose(); },
      category: 'Export',
      disabled: !hasResults
    },
    {
      id: 'view-history',
      label: 'View Audit History',
      description: 'See previous audit results and trends',
      icon: History,
      action: () => { onShowHistory?.(); onClose(); },
      category: 'Navigation'
    },
    {
      id: 'view-recommendations',
      label: 'View Smart Recommendations',
      description: 'AI-powered suggestions to improve your score',
      icon: Zap,
      action: () => { onShowRecommendations?.(); onClose(); },
      category: 'Navigation',
      disabled: !hasResults
    },
    {
      id: 'keyboard-shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View all available keyboard shortcuts',
      icon: Keyboard,
      shortcut: ['?'],
      action: () => { /* Show shortcuts modal */ onClose(); },
      category: 'Help'
    },
    {
      id: 'hubspot-docs',
      label: 'HubSpot API Docs',
      description: 'Open HubSpot developer documentation',
      icon: ExternalLink,
      action: () => { window.open('https://developers.hubspot.com/docs/api/overview', '_blank'); onClose(); },
      category: 'Help'
    }
  ], [theme, toggleTheme, hasResults, onRunAudit, onExportPDF, onExportMarkdown, onShowHistory, onShowRecommendations, onClose]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands.filter(c => !c.disabled);
    const searchLower = search.toLowerCase();
    return commands
      .filter(c => !c.disabled)
      .filter(c =>
        c.label.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower)
      );
  }, [commands, search]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  let currentIndex = -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen px-4 pt-20 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div
          className="inline-block w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left align-middle shadow-2xl transition-all animate-in-scale"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 py-4 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-lg"
            />
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <kbd>esc</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {category}
                </div>
                {categoryCommands.map((command) => {
                  currentIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  const Icon = command.icon;

                  return (
                    <button
                      key={command.id}
                      onClick={command.action}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-hubspot-orange text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{command.label}</div>
                        <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                          {command.description}
                        </div>
                      </div>
                      {command.shortcut && (
                        <div className="flex items-center gap-1">
                          {command.shortcut.map((key, i) => (
                            <kbd
                              key={i}
                              className={isSelected ? 'bg-white/20 text-white border-white/30' : ''}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd>↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd>↵</kbd> Select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
