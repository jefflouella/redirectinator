import { useState, useEffect, useCallback } from 'react';

type TabType =
  | 'dashboard'
  | 'projects'
  | 'settings'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'extensions'
  | '404';

export const useRouting = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const navigateTo = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const path = tab === 'dashboard' ? '/' : `/${tab}`;
    window.history.pushState({ tab }, '', path);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      let newTab: TabType = 'dashboard';

      // Define valid routes
      const validRoutes = ['/', '/about', '/privacy', '/terms', '/projects', '/settings', '/extensions'];
      
      if (path === '/about') {
        newTab = 'about';
      } else if (path === '/privacy') {
        newTab = 'privacy';
      } else if (path === '/terms') {
        newTab = 'terms';
      } else if (path === '/projects') {
        newTab = 'projects';
      } else if (path === '/settings') {
        newTab = 'settings';
      } else if (path === '/extensions') {
        newTab = 'extensions';
      } else if (path === '/') {
        newTab = 'dashboard';
      } else {
        // Invalid route - show 404 page
        newTab = '404';
      }

      setActiveTab(newTab);
    };

    // Handle initial route
    handleRouteChange();

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return { activeTab, navigateTo };
};
