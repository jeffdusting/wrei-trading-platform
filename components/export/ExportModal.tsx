/**
 * WREI Export Modal - Professional Export Enhancement (B5)
 *
 * Full-featured export modal for institutional users providing:
 * - Format selection (CSV, JSON, Text Report)
 * - Template selection (Executive Summary, Detailed Analysis, Compliance Report)
 * - Preview pane showing export content
 * - Download button with filename preview
 *
 * Uses native browser APIs (Blob, URL.createObjectURL) - no external dependencies.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { ExportOptions, ReportData, CSVDataType, JSONExportTemplate } from '@/lib/export-utilities';
import {
  exportEnhancedReport,
  triggerDownload,
  generateExportPreview,
} from '@/lib/export-utilities';

// =============================================================================
// TYPES
// =============================================================================

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
  recipientName?: string;
  recipientOrganization?: string;
  recipientClassification?: 'retail' | 'wholesale' | 'professional' | 'sophisticated';
}

type ExportFormat = 'csv' | 'json' | 'pdf';
type ExportTemplate = 'executive_summary' | 'detailed_analysis' | 'compliance_report';

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: string;
}

interface TemplateOption {
  id: ExportTemplate;
  label: string;
  description: string;
  csvType: CSVDataType;
  jsonTemplate: JSONExportTemplate;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'csv',
    label: 'CSV Data',
    description: 'Spreadsheet-compatible data export with Australian number formatting',
    icon: 'CSV',
  },
  {
    id: 'json',
    label: 'JSON API',
    description: 'Structured JSON with metadata headers for API integration',
    icon: 'JSON',
  },
  {
    id: 'pdf',
    label: 'Text Report',
    description: 'Professional formatted report suitable for print-to-PDF',
    icon: 'TXT',
  },
];

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'executive_summary',
    label: 'Executive Summary',
    description: 'High-level investment overview with key metrics and recommendation',
    csvType: 'metrics',
    jsonTemplate: 'summary',
  },
  {
    id: 'detailed_analysis',
    label: 'Detailed Analysis',
    description: 'Comprehensive analysis including scenarios, risk metrics, and benchmarks',
    csvType: 'comprehensive',
    jsonTemplate: 'full',
  },
  {
    id: 'compliance_report',
    label: 'Compliance Report',
    description: 'Regulatory disclosures, risk warnings, and tax implications',
    csvType: 'compliance',
    jsonTemplate: 'compliance_only',
  },
];

// =============================================================================
// EXPORT MODAL COMPONENT
// =============================================================================

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  recipientName = 'Professional Investor',
  recipientOrganization = 'Investment Organisation',
  recipientClassification = 'wholesale',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>('detailed_analysis');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Build export options from selections
  const exportOptions: ExportOptions = useMemo(() => ({
    format: selectedFormat === 'pdf' ? 'pdf' : selectedFormat,
    template: selectedTemplate === 'executive_summary' ? 'executive_summary'
      : selectedTemplate === 'compliance_report' ? 'compliance_report'
      : 'detailed_analysis',
    includeCharts: true,
    includeRiskMetrics: selectedTemplate !== 'compliance_report',
    includeScenarios: selectedTemplate === 'detailed_analysis',
    includeCompliance: selectedTemplate !== 'executive_summary',
    branding: {
      companyName: 'Water Roads Pty Ltd',
      reportTitle: 'WREI Professional Investment Analysis',
      confidential: true,
    },
    recipient: {
      name: recipientName,
      organization: recipientOrganization,
      classification: recipientClassification,
    },
  }), [selectedFormat, selectedTemplate, recipientName, recipientOrganization, recipientClassification]);

  // Get the current template configuration
  const currentTemplate = useMemo(
    () => TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate) || TEMPLATE_OPTIONS[1],
    [selectedTemplate]
  );

  // Generate preview content
  const previewContent = useMemo(() => {
    if (!showPreview) return '';
    try {
      return generateExportPreview(reportData, exportOptions, 30);
    } catch {
      return 'Preview unavailable';
    }
  }, [showPreview, reportData, exportOptions]);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const result = await exportEnhancedReport(
        reportData,
        exportOptions,
        currentTemplate.csvType,
        currentTemplate.jsonTemplate
      );

      if (result.success) {
        const downloadSuccess = triggerDownload(result);
        if (!downloadSuccess) {
          setExportError('Failed to trigger download. Please try again.');
        } else {
          onClose();
        }
      } else {
        setExportError(result.error || 'Export failed');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Unexpected export error');
    } finally {
      setIsExporting(false);
    }
  }, [reportData, exportOptions, currentTemplate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Export Professional Report"
      data-testid="export-modal"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="bloomberg-metric-value text-gray-800">Export Professional Report</h2>
              <p className="bloomberg-small-text text-gray-500 mt-1">
                Choose format and template for your institutional report
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close export modal"
              data-testid="export-modal-close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="bloomberg-small-text  text-gray-700 uppercase tracking-wide mb-3">
              Export Format
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => { setSelectedFormat(format.id); setShowPreview(false); }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`format-${format.id}`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bloomberg-section-label ${
                      selectedFormat === format.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {format.icon}
                    </div>
                    <div className="font-medium text-gray-800">{format.label}</div>
                  </div>
                  <div className="bloomberg-section-label text-gray-500">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <h3 className="bloomberg-small-text  text-gray-700 uppercase tracking-wide mb-3">
              Report Template
            </h3>
            <div className="space-y-2">
              {TEMPLATE_OPTIONS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template.id); setShowPreview(false); }}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                    selectedTemplate === template.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`template-${template.id}`}
                >
                  <div>
                    <div className="font-medium text-gray-800">{template.label}</div>
                    <div className="bloomberg-section-label text-gray-500 mt-0.5">{template.description}</div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Toggle & Pane */}
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bloomberg-small-text text-blue-600 hover:text-blue-800 font-medium transition-colors"
              data-testid="preview-toggle"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>

            {showPreview && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto" data-testid="preview-pane">
                <pre className="bloomberg-section-label text-gray-700 bloomberg-data whitespace-pre-wrap">
                  {previewContent}
                </pre>
              </div>
            )}
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="bloomberg-small-text text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium text-gray-800">
                  {FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="font-medium text-gray-800">
                  {currentTemplate.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Recipient:</span>
                <span className="font-medium text-gray-800">
                  {recipientName} ({recipientClassification})
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 bloomberg-small-text text-red-700" data-testid="export-error">
              Export failed: {exportError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              isExporting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            data-testid="export-download-btn"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
