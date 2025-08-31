import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { UrlInputOverlay } from './components/UrlInputOverlay';
import { UrlSummary } from './components/UrlSummary';
import { ProcessingOptions } from './components/ProcessingOptions';
import { ResultsTable } from './components/ResultsTable';
import { ProjectManager } from './components/ProjectManager';
import { Settings } from './components/Settings';
import { Footer } from './components/Footer';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { NotificationProvider } from './components/NotificationProvider';
import { ExportService } from './services/exportService';
import { useProjects } from './hooks/useProjects';
import { useUrlProcessing } from './hooks/useUrlProcessing';
import { useResultsPersistence } from './hooks/useResultsPersistence';
import { useSummaryStats } from './hooks/useSummaryStats';
import { useAppSettings } from './hooks/useAppSettings';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'settings' | 'about' | 'privacy' | 'terms'>('dashboard');
  const [isUrlOverlayOpen, setIsUrlOverlayOpen] = useState(false);
  const { settings, updateSettings } = useAppSettings();
  const { currentProject, projects, loadProject, createNewProject, deleteProject } = useProjects(settings);
  const { results, processingStatus, processUrls, stopProcessing, clearResults: clearUrlProcessingResults } = useUrlProcessing(
    currentProject,
    (newResults) => {
      // Save results to persistent storage when processing completes
      saveResults(newResults);
    }
  );
  
  // Use persistent results storage
  const { 
    results: persistentResults, 
    saveResults, 
    addResult, 
    updateResult, 
    clearResults,
    getUnprocessedUrls,
    getProgressStats,
    markUrlProcessed
  } = useResultsPersistence({ projectId: currentProject?.id || null });
  
  // Use persistent results if available, otherwise use in-memory results
  const finalResults = persistentResults.length > 0 ? persistentResults : results;
  const summaryStats = useSummaryStats(finalResults);

  // Get progress statistics - use actual URL count from project
  const progressStats = currentProject ? getProgressStats(currentProject.urls?.length || 0) : undefined;
  


  // Processing functions
  const handleRunAllUrls = async () => {
    if (!currentProject) return;
    
    // Clear existing results and process all URLs
    await clearResults();
    const projectUrls = currentProject.urls || [];
    await processUrls(projectUrls);
  };

  const handleRunNewUrls = async () => {
    if (!currentProject) return;
    
    // Get URLs from the project and find unprocessed ones
    const projectUrls = currentProject.urls || [];
    const unprocessedUrls = getUnprocessedUrls(projectUrls);
    
    if (unprocessedUrls.length > 0) {
      // Process only unprocessed URLs
      await processUrls(unprocessedUrls);
    }
  };

  const handleContinueProcessing = async () => {
    if (!currentProject) return;
    
    // Get URLs from the project and find unprocessed ones
    const projectUrls = currentProject.urls || [];
    const unprocessedUrls = getUnprocessedUrls(projectUrls);
    
    if (unprocessedUrls.length > 0) {
      // Continue processing unprocessed URLs
      await processUrls(unprocessedUrls);
    }
  };

  const handleClearResults = async () => {
    // Clear both persistent and in-memory results
    await clearResults();
    clearUrlProcessingResults();
  };

  const handleStopProcessing = () => {
    stopProcessing();
  };

  // Auto-save functionality
  useEffect(() => {
    if (currentProject && settings.autoSave) {
      const interval = setInterval(() => {
        // Auto-save is handled by individual hooks
      }, settings.autoSaveInterval);
      return () => clearInterval(interval);
    }
  }, [currentProject, settings.autoSave, settings.autoSaveInterval]);

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/about') {
      setActiveTab('about');
    } else if (path === '/privacy') {
      setActiveTab('privacy');
    } else if (path === '/terms') {
      setActiveTab('terms');
    } else {
      setActiveTab('dashboard');
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const path = activeTab === 'dashboard' ? '/' : `/${activeTab}`;
    window.history.replaceState(null, '', path);
  }, [activeTab]);

  const exportResults = async (format: 'csv' | 'json' | 'excel' | 'report') => {
    if (!currentProject) return;

    try {
      switch (format) {
        case 'csv':
          ExportService.exportToCSV(finalResults, { format: 'csv', includeHeaders: true });
          break;
        case 'json':
          ExportService.exportToJSON(finalResults, { format: 'json', includeHeaders: true });
          break;
        case 'excel':
          ExportService.exportToExcel(finalResults, { format: 'excel', includeHeaders: true });
          break;
        case 'report':
          ExportService.exportReport(finalResults);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9fafb' }}>
        <Header 
          currentProject={currentProject}
          onTabChange={setActiveTab}
          activeTab={activeTab}
        />
        
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="container mx-auto px-4 py-6 space-y-6">
              <Dashboard 
                summaryStats={summaryStats}
                processingStatus={processingStatus}
                currentProject={currentProject}
                onExport={exportResults}
              />
              
              <UrlSummary 
                currentProject={currentProject}
                onProcessUrls={processUrls}
                isProcessing={processingStatus.isProcessing}
                onEditUrls={() => setIsUrlOverlayOpen(true)}
              />
              
              <ProcessingOptions
                currentProject={currentProject}
                urlCount={currentProject?.urls?.length || 0}
                resultCount={finalResults.length}
                isProcessing={processingStatus.isProcessing}
                processingStatus={processingStatus}
                onRunAllUrls={handleRunAllUrls}
                onRunNewUrls={handleRunNewUrls}
                onContinueProcessing={handleContinueProcessing}
                onStopProcessing={handleStopProcessing}
                onClearResults={handleClearResults}
                progressStats={progressStats}
              />
              
              {finalResults.length > 0 && (
                <ResultsTable 
                  results={finalResults}
                  onExport={exportResults}
                />
              )}
            </div>
          )}
          
          {activeTab === 'projects' && (
            <ProjectManager 
              projects={projects}
              currentProject={currentProject}
              onCreateProject={createNewProject}
              onLoadProject={loadProject}
              onDeleteProject={deleteProject}
              onGoToDashboard={() => setActiveTab('dashboard')}
            />
          )}
          
          {activeTab === 'settings' && (
            <Settings 
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          )}

          {activeTab === 'about' && (
            <AboutPage onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'privacy' && (
            <PrivacyPage onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'terms' && (
            <TermsPage onBack={() => setActiveTab('dashboard')} />
          )}
        </main>

        {/* Footer - only show on main pages */}
        {['dashboard', 'projects', 'settings'].includes(activeTab) && (
          <Footer />
        )}
        
        {/* URL Input Overlay */}
        <UrlInputOverlay
          isOpen={isUrlOverlayOpen}
          onClose={() => setIsUrlOverlayOpen(false)}
          currentProject={currentProject}
          onUrlsAdded={async () => {
            // Refresh the current project to get updated URL count
            if (currentProject) {
              await loadProject(currentProject.id);
            }
          }}
        />
      </div>
    </NotificationProvider>
  );
}

export default App;
