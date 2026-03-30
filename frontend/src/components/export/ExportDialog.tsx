'use client';

import { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import { ExportOptions } from '@/utils/exportHelpers';
import { generatePDF, generateCSV, ExportData } from '@/utils/pdfGenerator';
import { downloadFile, generateFilename } from '@/utils/exportHelpers';

interface ExportDialogProps {
  groupName: string;
  groupData: ExportData;
  onClose: () => void;
}

export function ExportDialog({ groupName, groupData, onClose }: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeMembers: true,
    includeContributions: true,
    includeAnalytics: true,
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let blob: Blob;
      const filename = generateFilename(groupName, options.format);

      if (options.format === 'pdf') {
        blob = generatePDF(groupData);
      } else if (options.format === 'csv') {
        blob = generateCSV(groupData);
      } else {
        blob = new Blob([JSON.stringify(groupData, null, 2)], { type: 'application/json' });
      }

      downloadFile(blob, filename);
      onClose();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <h2 className="text-xl font-bold">Export Group Data</h2>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="block font-medium">Export Format</label>
          <div className="space-y-2">
            {(['pdf', 'csv', 'json'] as const).map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={fmt}
                  checked={options.format === fmt}
                  onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                  className="w-4 h-4"
                />
                <span className="capitalize">{fmt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Include Options */}
        <div className="space-y-2">
          <label className="block font-medium">Include</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeMembers}
              onChange={(e) => setOptions({ ...options, includeMembers: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Members List</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeContributions}
              onChange={(e) => setOptions({ ...options, includeContributions: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Contribution History</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeAnalytics}
              onChange={(e) => setOptions({ ...options, includeAnalytics: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Analytics</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            disabled={exporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
