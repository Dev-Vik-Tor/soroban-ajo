export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  includeMembers: boolean;
  includeContributions: boolean;
  includeAnalytics: boolean;
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateFilename(groupName: string, format: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitized = groupName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${sanitized}_report_${timestamp}.${format}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
