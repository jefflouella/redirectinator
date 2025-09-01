import { useState, useEffect } from 'react';
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
import { useRouting } from './hooks/useRouting';
import { useAnalytics } from './hooks/useAnalytics';
import { useSchema } from './hooks/useSchema';

function App() {
  const { activeTab, navigateTo } = useRouting();
  const [isUrlOverlayOpen, setIsUrlOverlayOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { settings, updateSettings } = useAppSettings();
  const { currentProject, projects, loadProject, createNewProject, deleteProject, updateProject, setCurrentProject } = useProjects(settings);
  const { results, processingStatus, processUrls, stopProcessing } = useUrlProcessing(
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
    clearResults,
    getUnprocessedUrls,
    getProgressStats
  } = useResultsPersistence({ projectId: currentProject?.id || null });
  
  // Use persistent results if available, otherwise use in-memory results
  const finalResults = persistentResults.length > 0 ? persistentResults : results;
  const summaryStats = useSummaryStats(finalResults);

  // Get progress statistics - use actual URL count from project
  const progressStats = currentProject ? getProgressStats(currentProject.urls?.length || 0) : undefined;

  // Analytics tracking
  const { 
    trackFeatureUsage, 
    trackUrlProcessing, 
    trackProjectCreation, 
    trackExport, 
    trackError 
  } = useAnalytics();

  // Schema management
  useSchema(activeTab === 'about' ? 'about' : 'home');

  // Track tab navigation
  useEffect(() => {
    trackFeatureUsage('tab_navigation', { tab: activeTab });
  }, [activeTab, trackFeatureUsage]);

  // Processing functions
  const handleRunAllUrls = async () => {
    if (!currentProject) return;
    
    // Track URL processing
    const urlCount = currentProject.urls?.length || 0;
    trackUrlProcessing(urlCount, 'run_all');
    
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
      // Track URL processing
      trackUrlProcessing(unprocessedUrls.length, 'run_new');
      
      // Process only unprocessed URLs
      await processUrls(unprocessedUrls);
    }
  };

  const handleContinueProcessing = async () => {
    if (!currentProject) return;
    
    // Track URL processing
    const remainingCount = progressStats?.remaining || 0;
    trackUrlProcessing(remainingCount, 'continue');
    
    const projectUrls = currentProject.urls || [];
    const unprocessedUrls = getUnprocessedUrls(projectUrls);
    await processUrls(unprocessedUrls);
  };

  const handleStopProcessing = () => {
    trackFeatureUsage('processing_stopped');
    stopProcessing();
  };

  const handleClearResults = async () => {
    trackFeatureUsage('results_cleared');
    await clearResults();
  };

  const exportResults = async (format: 'csv' | 'json' | 'excel' | 'report') => {
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
          ExportService.generateReport(finalResults);
          break;
      }
      
      // Track export usage
      trackExport(format, finalResults.length);
    } catch (error) {
      console.error('Export failed:', error);
      trackError('export_failed', format);
    }
  };

  // Enhanced project creation with analytics
  const handleCreateProject = async (name: string, description?: string) => {
    try {
      const newProject = await createNewProject(name, description);
      trackProjectCreation();
      return newProject;
    } catch (error) {
      trackError('project_creation_failed');
      throw error;
    }
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



  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f9fafb' }}>
        <Header 
          currentProject={currentProject}
          onTabChange={navigateTo}
          activeTab={activeTab}
        />
        
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="container mx-auto px-4 py-6 space-y-6">
              <Dashboard 
                summaryStats={summaryStats}
                processingStatus={processingStatus}
                onExport={exportResults}
              />
              
              <UrlSummary 
                key={`${currentProject?.id}-${currentProject?.updatedAt}-${currentProject?.urls?.length}-${refreshCounter}`}
                currentProject={currentProject}
                onProcessUrls={processUrls}
                isProcessing={processingStatus.isProcessing}
                onEditUrls={() => setIsUrlOverlayOpen(true)}
                onNavigateToProjects={() => navigateTo('projects')}
                onProjectUpdate={(updatedProject) => {
                  // Update the current project state
                  setCurrentProject(updatedProject);
                  // Force a re-render
                  setRefreshCounter(prev => prev + 1);
                }}
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
            <div className="container mx-auto px-4 py-6 space-y-6">
              <ProjectManager 
                projects={projects}
                currentProject={currentProject}
                onCreateProject={handleCreateProject}
                onLoadProject={loadProject}
                onDeleteProject={deleteProject}
                onUpdateProject={updateProject}
                onGoToDashboard={() => navigateTo('dashboard')}
              />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <Settings 
              settings={settings}
              onUpdateSettings={updateSettings}
            />
          )}

          {activeTab === 'about' && (
            <AboutPage onBack={() => navigateTo('dashboard')} />
          )}

          {activeTab === 'privacy' && (
            <PrivacyPage onBack={() => navigateTo('dashboard')} />
          )}

          {activeTab === 'terms' && (
            <TermsPage onBack={() => navigateTo('dashboard')} />
          )}
        </main>

        {/* Footer - show on all pages */}
        <Footer />
        
        {/* URL Input Overlay */}
        <UrlInputOverlay
          isOpen={isUrlOverlayOpen}
          onClose={() => setIsUrlOverlayOpen(false)}
          currentProject={currentProject}
          onUrlsAdded={async () => {
            // Refresh the current project to get updated URL count
            console.log('onUrlsAdded called, refreshing project:', currentProject?.id);
            if (currentProject) {
              await loadProject(currentProject.id);
              setRefreshCounter(prev => prev + 1); // Force re-render
              console.log('Project reloaded, new URL count:', currentProject.urls?.length);
            }
          }}
          onProjectUpdate={(updatedProject) => {
            // Update the current project state
            setCurrentProject(updatedProject);
            // Force a re-render
            setRefreshCounter(prev => prev + 1);
          }}
        />
      </div>
    </NotificationProvider>
  );
}

export default App;
