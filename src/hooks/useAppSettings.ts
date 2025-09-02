import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';
import { storageService } from '@/services/storage';

const defaultSettings: AppSettings = {
  theme: 'light',
  autoSave: true,
  autoSaveInterval: 5000,
  defaultBatchSize: 50,
  defaultDelay: 100,
  defaultTimeout: 10000,
  showAdvancedOptions: false,
  redirectMode: 'default', // Add default redirect mode
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await storageService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await storageService.saveSettings(updatedSettings);
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    updateSettings,
  };
};
