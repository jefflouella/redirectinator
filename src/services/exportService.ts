import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { RedirectResult, ExportOptions } from '@/types';

export class ExportService {
  static exportToCSV(results: RedirectResult[], _options: ExportOptions): void {
    const csvData = results.map(result => ({
      'Starting URL': result.startingUrl,
      'Target Redirect': result.targetRedirect,
      'Final URL': result.finalUrl,
      'Result': result.result,
      'HTTP Status': result.httpStatus,
      'Final Status Code': result.finalStatusCode,
      'Number of Redirects': result.numberOfRedirects,
      'Response Time (ms)': result.responseTime,
      'Has Redirect Loop': result.hasRedirectLoop ? 'Yes' : 'No',
      'Mixed Redirect Types': result.mixedRedirectTypes ? 'Yes' : 'No',
      'Full Redirect Chain': result.fullRedirectChain.join(' → '),
      'Domain Changes': result.domainChanges ? 'Yes' : 'No',
      'HTTPS Upgrade': result.httpsUpgrade ? 'Yes' : 'No',
      'Error': result.error || '',
      'Timestamp': new Date(result.timestamp).toISOString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `redirectinator-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    saveAs(blob, filename);
  }

  static exportToJSON(results: RedirectResult[], _options: ExportOptions): void {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalResults: results.length,
        version: '2.0.0',
      },
      results: results,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `redirectinator-export-${new Date().toISOString().split('T')[0]}.json`;
    
    saveAs(blob, filename);
  }

  static exportToExcel(results: RedirectResult[], _options: ExportOptions): void {
    // For Excel export, we'll create a CSV with Excel-compatible formatting
    const csvData = results.map(result => ({
      'Starting URL': result.startingUrl,
      'Target Redirect': result.targetRedirect,
      'Final URL': result.finalUrl,
      'Result': result.result,
      'HTTP Status': result.httpStatus,
      'Final Status Code': result.finalStatusCode,
      'Number of Redirects': result.numberOfRedirects,
      'Response Time (ms)': result.responseTime,
      'Has Redirect Loop': result.hasRedirectLoop ? 'Yes' : 'No',
      'Mixed Redirect Types': result.mixedRedirectTypes ? 'Yes' : 'No',
      'Full Redirect Chain': result.fullRedirectChain.join(' → '),
      'Domain Changes': result.domainChanges ? 'Yes' : 'No',
      'HTTPS Upgrade': result.httpsUpgrade ? 'Yes' : 'No',
      'Error': result.error || '',
      'Timestamp': new Date(result.timestamp).toISOString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `redirectinator-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    saveAs(blob, filename);
  }

  static copyToClipboard(results: RedirectResult[]): Promise<void> {
    const csvData = results.map(result => ({
      'Starting URL': result.startingUrl,
      'Target Redirect': result.targetRedirect,
      'Final URL': result.finalUrl,
      'Result': result.result,
      'HTTP Status': result.httpStatus,
      'Final Status Code': result.finalStatusCode,
      'Number of Redirects': result.numberOfRedirects,
      'Response Time (ms)': result.responseTime,
      'Has Redirect Loop': result.hasRedirectLoop ? 'Yes' : 'No',
      'Mixed Redirect Types': result.mixedRedirectTypes ? 'Yes' : 'No',
      'Full Redirect Chain': result.fullRedirectChain.join(' → '),
      'Domain Changes': result.domainChanges ? 'Yes' : 'No',
      'HTTPS Upgrade': result.httpsUpgrade ? 'Yes' : 'No',
      'Error': result.error || '',
      'Timestamp': new Date(result.timestamp).toISOString(),
    }));

    const csv = Papa.unparse(csvData);
    
    return navigator.clipboard.writeText(csv);
  }

  static generateReport(results: RedirectResult[]): string {
    const total = results.length;
    const successful = results.filter(r => r.result === 'redirect').length;
    const errors = results.filter(r => r.result === 'error').length;
    const loops = results.filter(r => r.result === 'loop').length;
    const direct = results.filter(r => r.result === 'direct').length;

    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total;
    const maxRedirects = Math.max(...results.map(r => r.numberOfRedirects));
    const httpsUpgrades = results.filter(r => r.httpsUpgrade).length;
    const domainChanges = results.filter(r => r.domainChanges).length;

    return `
# Redirectinator Report
Generated: ${new Date().toLocaleString()}

## Summary
- Total URLs: ${total}
- Successful Redirects: ${successful} (${((successful/total)*100).toFixed(1)}%)
- Errors: ${errors} (${((errors/total)*100).toFixed(1)}%)
- Redirect Loops: ${loops} (${((loops/total)*100).toFixed(1)}%)
- Direct URLs: ${direct} (${((direct/total)*100).toFixed(1)}%)

## Performance
- Average Response Time: ${avgResponseTime.toFixed(2)}ms
- Maximum Redirects: ${maxRedirects}
- HTTPS Upgrades: ${httpsUpgrades}
- Domain Changes: ${domainChanges}

## Detailed Results
${results.map(r => `
### ${r.startingUrl}
- **Result:** ${r.result}
- **Final URL:** ${r.finalUrl}
- **Status:** ${r.httpStatus}
- **Response Time:** ${r.responseTime}ms
- **Redirects:** ${r.numberOfRedirects}
${r.error ? `- **Error:** ${r.error}` : ''}
`).join('')}
    `.trim();
  }

  static exportReport(results: RedirectResult[]): void {
    const report = this.generateReport(results);
    const blob = new Blob([report], { type: 'text/markdown' });
    const filename = `redirectinator-report-${new Date().toISOString().split('T')[0]}.md`;
    
    saveAs(blob, filename);
  }
}
