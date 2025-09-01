export interface RedirectResult {
  id: string;
  startingUrl: string;
  targetRedirect: string;
  finalUrl: string;
  result: 'direct' | 'redirect' | 'error' | 'loop';
  httpStatus: string;
  finalStatusCode: number;
  numberOfRedirects: number;
  responseTime: number;
  hasRedirectLoop: boolean;
  mixedRedirectTypes: boolean;
  fullRedirectChain: string[];
  statusChain: string[];
  domainChanges: boolean;
  httpsUpgrade: boolean;
  error?: string;
  timestamp: number;
  needsManualOverride?: boolean;
  suggestedFinalUrl?: string;
  blockedReason?: string;
  affiliateService?: string;
  suggestedDirectUrl?: string;
  source?: 'manual' | 'bulk' | 'wayback';
  waybackData?: {
    timestamp: string;
    originalUrl: string;
    archivedDate: string;
  };
  // New fields for enhanced redirect tracking
  redirectTypes?: RedirectType[];
  redirectChainDetails?: RedirectStep[];
  hasMetaRefresh?: boolean;
  hasJavaScriptRedirect?: boolean;
}

// New interfaces for enhanced redirect tracking
export interface RedirectType {
  type: 'http' | 'meta' | 'javascript';
  statusCode?: number;
  url: string;
  targetUrl?: string;
  delay?: number; // For meta refresh
}

export interface RedirectStep {
  step: number;
  url: string;
  type: 'http' | 'meta' | 'javascript' | 'final';
  statusCode?: number;
  targetUrl?: string;
  delay?: number;
  method?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  urls: UrlEntry[];
  settings: ProjectSettings;
  results: RedirectResult[];
}

export interface UrlEntry {
  id: string;
  startingUrl: string;
  targetRedirect: string;
}

export interface ProjectSettings {
  batchSize: number;
  delayBetweenRequests: number;
  timeout: number;
  followRedirects: boolean;
  maxRedirects: number;
  includeHeaders: boolean;
  authentication?: {
    username: string;
    password: string;
  };
}

export interface SummaryStats {
  totalUrls: number;
  good: number;
  bad: number;
  notRedirected: number;
  redirectChain: number;
  containsOnly301: number;
  contains302: number;
  contains4xx: number;
  contains5xx: number;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  isStopping: boolean;
  currentBatch: number;
  totalBatches: number;
  processedUrls: number;
  totalUrls: number;
  currentUrl?: string;
  errors: string[];
  startTime?: number;
  estimatedTimeRemaining?: number;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeHeaders: boolean;
  filterResults?: {
    status?: string[];
    hasErrors?: boolean;
    hasLoops?: boolean;
  };
}

export interface AppState {
  currentProject: Project | null;
  projects: Project[];
  processingStatus: ProcessingStatus;
  summaryStats: SummaryStats;
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  autoSaveInterval: number;
  defaultBatchSize: number;
  defaultDelay: number;
  defaultTimeout: number;
  showAdvancedOptions: boolean;
}

export type StatusType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  type: StatusType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}
