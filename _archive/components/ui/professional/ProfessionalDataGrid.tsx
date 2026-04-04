/**
 * Professional Data Grid Component
 *
 * Bloomberg Terminal-inspired data grid for displaying complex financial
 * and analytical data with sorting, filtering, and real-time updates.
 */

'use client';

import { FC, useState, useMemo } from 'react';
import { enhancedProfessionalTheme, EnhancedThemeUtils } from '@/design-system/enhanced-professional-theme';

export interface DataGridColumn {
  id: string;
  header: string;
  accessor: string;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'status' | 'trend';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  format?: (value: any) => string;
  style?: (value: any, row: any) => React.CSSProperties;
}

export interface DataGridData {
  [key: string]: any;
}

interface ProfessionalDataGridProps {
  columns: DataGridColumn[];
  data: DataGridData[];
  title?: string;
  subtitle?: string;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  className?: string;
  onRowClick?: (row: DataGridData) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

type SortDirection = 'asc' | 'desc' | null;

export const ProfessionalDataGrid: FC<ProfessionalDataGridProps> = ({
  columns,
  data,
  title,
  subtitle,
  sortable = true,
  filterable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  className = '',
  onRowClick,
  onSort
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const theme = enhancedProfessionalTheme;

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply text filter
    if (filterText) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortDirection === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, filterText, sortColumn, sortDirection]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const start = currentPage * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const handleSort = (column: DataGridColumn) => {
    if (!column.sortable && !sortable) return;

    const newDirection: SortDirection =
      sortColumn === column.accessor && sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    setSortColumn(column.accessor);
    setSortDirection(newDirection);
    onSort?.(column.accessor, newDirection);
  };

  const formatCellValue = (column: DataGridColumn, value: any, row: DataGridData) => {
    if (column.format) {
      return column.format(value);
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);

      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;

      case 'number':
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);

      case 'date':
        return new Date(value).toLocaleDateString();

      default:
        return String(value);
    }
  };

  const getCellStyles = (column: DataGridColumn, value: any, row: DataGridData): React.CSSProperties => {
    let styles: React.CSSProperties = {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.terminal.text.primary,
      borderBottom: `1px solid ${theme.colors.terminal.border}`,
      fontFamily: column.type === 'number' || column.type === 'currency' || column.type === 'percentage'
        ? theme.typography.fontFamily.mono
        : theme.typography.fontFamily.primary
    };

    // Apply column-specific styles
    if (column.style) {
      styles = { ...styles, ...column.style(value, row) };
    }

    // Type-specific styling
    switch (column.type) {
      case 'trend':
        styles.color = value > 0
          ? theme.colors.financial.bullish
          : value < 0
          ? theme.colors.financial.bearish
          : theme.colors.financial.neutral;
        break;

      case 'status':
        if (typeof value === 'string') {
          switch (value.toLowerCase()) {
            case 'active':
            case 'completed':
            case 'approved':
              styles.color = theme.colors.status.success;
              break;
            case 'pending':
            case 'processing':
              styles.color = theme.colors.status.warning;
              break;
            case 'rejected':
            case 'failed':
            case 'error':
              styles.color = theme.colors.status.error;
              break;
            default:
              styles.color = theme.colors.status.info;
          }
        }
        break;
    }

    return styles;
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.terminal.background,
    border: `1px solid ${theme.colors.terminal.border}`,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    fontFamily: theme.typography.fontFamily.primary
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.terminal.backgroundSecondary,
    borderBottom: `2px solid ${theme.colors.terminal.border}`,
    padding: theme.spacing[4]
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.terminal.text.primary,
    margin: 0,
    marginBottom: subtitle ? theme.spacing[1] : 0
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.terminal.text.secondary,
    margin: 0
  };

  const filterStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '300px',
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.terminal.background,
    border: `1px solid ${theme.colors.terminal.border}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.terminal.text.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamily.primary
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: theme.typography.fontSizes.sm
  };

  const columnHeaderStyle: React.CSSProperties = {
    backgroundColor: theme.colors.terminal.backgroundSecondary,
    color: theme.colors.terminal.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderBottom: `1px solid ${theme.colors.terminal.border}`,
    textAlign: 'left' as const,
    cursor: sortable ? 'pointer' : 'default'
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.terminal.backgroundSecondary,
    borderTop: `1px solid ${theme.colors.terminal.border}`,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.terminal.text.secondary
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.terminal.border}`,
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    color: theme.colors.terminal.text.primary,
    cursor: 'pointer',
    fontSize: theme.typography.fontSizes.sm,
    transition: theme.transitions.fast,
    margin: `0 ${theme.spacing[1]}`
  };

  return (
    <div className={`professional-data-grid ${className}`} style={containerStyle}>
      {/* Header */}
      {(title || subtitle || filterable) && (
        <div style={headerStyle}>
          {title && <h3 style={titleStyle}>{title}</h3>}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}

          {filterable && (
            <div style={{ marginTop: title || subtitle ? theme.spacing[3] : 0 }}>
              <input
                type="text"
                placeholder="Filter data..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={filterStyle}
              />
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{
                    ...columnHeaderStyle,
                    width: column.width ? `${column.width}px` : 'auto',
                    cursor: (column.sortable ?? sortable) ? 'pointer' : 'default'
                  }}
                  onClick={() => handleSort(column)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                    {column.header}
                    {sortColumn === column.accessor && (
                      <span style={{
                        color: theme.colors.primary[400],
                        fontSize: theme.typography.fontSizes.xs
                      }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...getCellStyles(columns[0], '', {}),
                    textAlign: 'center' as const,
                    color: theme.colors.terminal.text.secondary
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    ...getCellStyles(columns[0], '', {}),
                    textAlign: 'center' as const,
                    color: theme.colors.terminal.text.secondary
                  }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: theme.transitions.fast
                  }}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = theme.colors.terminal.surface;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.id}`}
                      style={getCellStyles(column, row[column.accessor], row)}
                    >
                      {formatCellValue(column, row[column.accessor], row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={paginationStyle}>
          <div>
            Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, processedData.length)} of {processedData.length} results
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              style={{
                ...buttonStyle,
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 0 ? 0.5 : 1
              }}
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              onMouseEnter={(e) => {
                if (currentPage > 0) {
                  e.currentTarget.style.backgroundColor = theme.colors.terminal.surface;
                  e.currentTarget.style.borderColor = theme.colors.terminal.borderFocus;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = theme.colors.terminal.border;
              }}
            >
              Previous
            </button>

            <span style={{ margin: `0 ${theme.spacing[4]}` }}>
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              style={{
                ...buttonStyle,
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages - 1 ? 0.5 : 1
              }}
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              onMouseEnter={(e) => {
                if (currentPage < totalPages - 1) {
                  e.currentTarget.style.backgroundColor = theme.colors.terminal.surface;
                  e.currentTarget.style.borderColor = theme.colors.terminal.borderFocus;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = theme.colors.terminal.border;
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};