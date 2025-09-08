import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Project, RedirectResult, AppSettings } from '@/types';

interface RedirectinatorDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-createdAt': number; 'by-updatedAt': number };
  };
  results: {
    key: string;
    value: RedirectResult;
    indexes: { 'by-projectId': string; 'by-timestamp': number };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  exports: {
    key: string;
    value: {
      id: string;
      projectId: string;
      timestamp: number;
      format: string;
      filename: string;
    };
    indexes: { 'by-projectId': string; 'by-timestamp': number };
  };
}

class StorageService {
  private db: IDBPDatabase<RedirectinatorDB> | null = null;
  private readonly DB_NAME = 'RedirectinatorDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<RedirectinatorDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Projects store
        const projectsStore = db.createObjectStore('projects', {
          keyPath: 'id',
        });
        projectsStore.createIndex('by-createdAt', 'createdAt');
        projectsStore.createIndex('by-updatedAt', 'updatedAt');

        // Results store
        const resultsStore = db.createObjectStore('results', { keyPath: 'id' });
        resultsStore.createIndex('by-projectId', 'projectId');
        resultsStore.createIndex('by-timestamp', 'timestamp');

        // Settings store
        db.createObjectStore('settings', { keyPath: 'id' });

        // Exports store
        const exportsStore = db.createObjectStore('exports', { keyPath: 'id' });
        exportsStore.createIndex('by-projectId', 'projectId');
        exportsStore.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  // Project operations
  async saveProject(project: Project): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('projects', project);
  }

  async getProject(id: string): Promise<Project | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('projects', id);
  }

  async getAllProjects(): Promise<Project[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAll('projects');
  }

  async deleteProject(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    // Delete project and all associated results
    await this.db.delete('projects', id);

    // Delete all results for this project
    const results = await this.db.getAllFromIndex(
      'results',
      'by-projectId',
      id
    );
    for (const result of results) {
      await this.db.delete('results', result.id);
    }
  }

  // Results operations
  async saveResults(
    results: RedirectResult[],
    projectId: string
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('results', 'readwrite');

    // Clear existing results for this project before saving new ones
    const existingResults = await tx.store
      .index('by-projectId')
      .getAll(projectId);
    for (const result of existingResults) {
      await tx.store.delete(result.id);
    }

    // Add new results
    for (const result of results) {
      await tx.store.put({ ...result, projectId });
    }

    await tx.done;
  }

  async getProjectResults(projectId: string): Promise<RedirectResult[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllFromIndex('results', 'by-projectId', projectId);
  }

  async deleteProjectResults(projectId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllFromIndex(
      'results',
      'by-projectId',
      projectId
    );
    for (const result of results) {
      await this.db.delete('results', result.id);
    }
  }

  // Settings operations
  async saveSettings(settings: AppSettings): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('settings', { id: 'app-settings', ...settings });
  }

  async getSettings(): Promise<AppSettings | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const settings = await this.db.get('settings', 'app-settings');
    return settings;
  }

  // Export tracking
  async saveExport(
    projectId: string,
    format: string,
    filename: string
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const exportRecord = {
      id: crypto.randomUUID(),
      projectId,
      timestamp: Date.now(),
      format,
      filename,
    };

    await this.db.put('exports', exportRecord);
  }

  async getProjectExports(projectId: string): Promise<
    Array<{
      id: string;
      projectId: string;
      timestamp: number;
      format: string;
      filename: string;
    }>
  > {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllFromIndex('exports', 'by-projectId', projectId);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('projects');
    await this.db.clear('results');
    await this.db.clear('settings');
    await this.db.clear('exports');
  }

  async getDatabaseSize(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    // This is a rough estimate - IndexedDB doesn't provide exact size
    const projects = await this.db.getAll('projects');
    const results = await this.db.getAll('results');
    const settings = await this.db.getAll('settings');
    const exports = await this.db.getAll('exports');

    const data = JSON.stringify({ projects, results, settings, exports });
    return new Blob([data]).size;
  }

  async exportProjectData(projectId: string): Promise<string> {
    const project = await this.getProject(projectId);
    const results = await this.getProjectResults(projectId);

    if (!project) throw new Error('Project not found');

    const exportData = {
      project,
      results,
      exportDate: new Date().toISOString(),
      version: '2.0.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importProjectData(data: string): Promise<Project> {
    try {
      const importData = JSON.parse(data);

      if (!importData.project || !importData.results) {
        throw new Error('Invalid project data format');
      }

      // Generate new IDs to avoid conflicts
      const newProjectId = crypto.randomUUID();
      const project: Project = {
        ...importData.project,
        id: newProjectId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const results: RedirectResult[] = importData.results.map(
        (result: Partial<RedirectResult>) => ({
          ...result,
          id: crypto.randomUUID(),
          projectId: newProjectId,
        })
      );

      // Save project and results
      await this.saveProject(project);
      await this.saveResults(results, newProjectId);

      return project;
    } catch (error) {
      throw new Error(
        `Failed to import project data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const storageService = new StorageService();
