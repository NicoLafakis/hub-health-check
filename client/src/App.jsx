import React, { useState, useEffect, useCallback } from 'react';
import { useAudit } from './hooks/useAudit';
import { useAuditHistory } from './hooks/useAuditHistory';
import { useKeyboardShortcuts, useCommandPalette } from './hooks/useKeyboardShortcuts';
import { useToast, ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';
import { exportPDF, exportMarkdown } from './lib/api';
import { fireConfetti, fireworksConfetti } from './lib/confetti';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import Dashboard from './components/Dashboard';
import CategoryDetails from './components/CategoryDetails';
import ScopeWarning from './components/ScopeWarning';
import ExportModal from './components/ExportModal';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/ToastContainer';
import HistoryPanel from './components/HistoryPanel';
import RecommendationsPanel from './components/RecommendationsPanel';

function AppContent() {
  const {
    token,
    setToken,
    tokenInfo,
    results,
    error,
    setError,
    isValidating,
    isAuditing,
    auditPhase,
    audit,
    reset
  } = useAudit();

  const { addAudit, getScoreTrend } = useAuditHistory();
  const { success, error: showError } = useToast();
  const commandPalette = useCommandPalette();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showRecommendationsPanel, setShowRecommendationsPanel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  // Fire confetti when we get a good score
  useEffect(() => {
    if (results && !hasShownConfetti) {
      setHasShownConfetti(true);
      addAudit(results);

      if (results.healthScore >= 85) {
        fireworksConfetti();
        success('Excellent portal health! Your CRM is in great shape.');
      } else if (results.healthScore >= 70) {
        fireConfetti({ particleCount: 50 });
        success('Good job! Your portal health is above average.');
      }
    }
  }, [results, hasShownConfetti, addAudit, success]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: commandPalette.toggle
    },
    {
      key: 'd',
      ctrl: true,
      action: () => document.querySelector('[data-theme-toggle]')?.click()
    },
    {
      key: 'Enter',
      ctrl: true,
      action: () => {
        if (!results && !isAuditing) audit();
      }
    },
    {
      key: 'Escape',
      action: () => {
        if (showExportModal) setShowExportModal(false);
        if (showHistoryPanel) setShowHistoryPanel(false);
        if (showRecommendationsPanel) setShowRecommendationsPanel(false);
      }
    }
  ]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setActiveTab('details');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setActiveTab('dashboard');
    setSelectedCategory(null);
  }, []);

  const handleExport = useCallback(async (format) => {
    if (!results) return;

    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await exportPDF(results);
        success('PDF report downloaded successfully!');
      } else {
        await exportMarkdown(results);
        success('Markdown report downloaded successfully!');
      }
      setShowExportModal(false);
    } catch (err) {
      showError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  }, [results, success, showError]);

  const handleNewAudit = useCallback(() => {
    reset();
    setActiveTab('dashboard');
    setSelectedCategory(null);
    setHasShownConfetti(false);
  }, [reset]);

  const trend = results ? getScoreTrend(results.hubId) : null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        token={token}
        onTokenChange={setToken}
        onAudit={audit}
        isAuditing={isAuditing}
        isValidating={isValidating}
        error={error}
        tokenInfo={tokenInfo}
        results={results}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewAudit={handleNewAudit}
        onShowHistory={() => setShowHistoryPanel(true)}
        onShowRecommendations={() => setShowRecommendationsPanel(true)}
        onOpenCommandPalette={commandPalette.open}
      />

      {/* Main Content */}
      <main className="ml-80 flex-1 flex flex-col min-w-0">
        <Header
          results={results}
          onExport={() => setShowExportModal(true)}
          trend={trend}
        />

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* Scope Warning */}
          {tokenInfo?.scopes?.missingRequired?.length > 0 && (
            <ScopeWarning
              missingScopes={tokenInfo.scopes.missingRequired}
              onDismiss={() => {}}
            />
          )}

          {/* Main Content Area */}
          {isAuditing ? (
            <LoadingState phase={auditPhase} />
          ) : results ? (
            activeTab === 'dashboard' ? (
              <Dashboard
                results={results}
                onCategorySelect={handleCategorySelect}
                trend={trend}
              />
            ) : (
              <CategoryDetails
                category={selectedCategory}
                onBack={handleBackToDashboard}
                hubId={results.hubId}
              />
            )
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {/* Modals and Panels */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}

      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        onRunAudit={results ? handleNewAudit : audit}
        onExportPDF={() => handleExport('pdf')}
        onExportMarkdown={() => handleExport('markdown')}
        onShowHistory={() => setShowHistoryPanel(true)}
        onShowRecommendations={() => setShowRecommendationsPanel(true)}
        hasResults={!!results}
      />

      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
      />

      <RecommendationsPanel
        isOpen={showRecommendationsPanel}
        onClose={() => setShowRecommendationsPanel(false)}
        results={results}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
