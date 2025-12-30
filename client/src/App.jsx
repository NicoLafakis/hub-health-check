import React, { useState } from 'react';
import { useAudit } from './hooks/useAudit';
import { exportPDF, exportMarkdown } from './lib/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import Dashboard from './components/Dashboard';
import CategoryDetails from './components/CategoryDetails';
import ScopeWarning from './components/ScopeWarning';
import ExportModal from './components/ExportModal';

export default function App() {
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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActiveTab('details');
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setSelectedCategory(null);
  };

  const handleExport = async (format) => {
    if (!results) return;

    setIsExporting(true);
    try {
      if (format === 'pdf') {
        await exportPDF(results);
      } else {
        await exportMarkdown(results);
      }
      setShowExportModal(false);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewAudit = () => {
    reset();
    setActiveTab('dashboard');
    setSelectedCategory(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
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
      />

      {/* Main Content */}
      <main className="ml-80 flex-1 flex flex-col min-w-0">
        <Header
          results={results}
          onExport={() => setShowExportModal(true)}
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
              />
            ) : (
              <CategoryDetails
                category={selectedCategory}
                onBack={handleBackToDashboard}
              />
            )
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}
