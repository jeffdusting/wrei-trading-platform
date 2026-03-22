'use client';

import { FC, useMemo } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';

interface DataGridColumn {
  key: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'status';
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataGridRow {
  id: string;
  [key: string]: any;
}

interface ProfessionalDataGridProps {
  columns: DataGridColumn[];
  data: DataGridRow[];
  title?: string;
  loading?: boolean;
  className?: string;
  highlightPositive?: boolean;
  monospaceNumbers?: boolean;
}

export const ProfessionalDataGrid: FC<ProfessionalDataGridProps> = ({
  columns,
  data,
  title,
  loading = false,
  className = '',
  highlightPositive = true,
  monospaceNumbers = true
}) => {
  const tokens = useDesignTokens('institutional');

  const formattedData = useMemo(() => {
    return data.map(row => ({
      ...row,
      _formatted: columns.reduce((acc, col) => {
        acc[col.key] = formatCellValue(row[col.key], col.type, tokens, highlightPositive);
        return acc;
      }, {} as Record<string, any>)
    }));
  }, [data, columns, tokens, highlightPositive]);

  const containerStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    overflow: 'hidden'
  };

  const headerStyles = {
    padding: tokens.spacing[4],
    borderBottom: `1px solid ${tokens.colors.surface.tertiary}`,
    backgroundColor: tokens.colors.surface.primary
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontFamily: monospaceNumbers ? tokens.typography.families.financial : tokens.typography.families.interface,
    fontSize: tokens.typography.sizes.sm
  };

  const thStyles = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: tokens.colors.surface.tertiary,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.weights.semibold,
    textAlign: 'left' as const,
    borderBottom: `1px solid ${tokens.colors.surface.primary}`,
    fontSize: tokens.typography.sizes.xs,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  };

  const tdStyles = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    borderBottom: `1px solid ${tokens.colors.surface.tertiary}`,
    color: tokens.colors.text.primary,
    whiteSpace: 'nowrap' as const
  };

  return (
    <div className={`professional-data-grid ${className}`} style={containerStyles}>
      {title && (
        <div style={headerStyles}>
          <h3 style={{
            margin: 0,
            fontSize: tokens.typography.sizes.md,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary
          }}>
            {title}
          </h3>
        </div>
      )}

      {loading ? (
        <div style={{
          padding: tokens.spacing[8],
          textAlign: 'center',
          color: tokens.colors.text.secondary
        }}>
          Loading data...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyles}>
            <thead>
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    style={{
                      ...thStyles,
                      textAlign: column.align || 'left',
                      width: column.width
                    }}
                  >
                    {column.header}
                    {column.sortable && (
                      <span style={{
                        marginLeft: tokens.spacing[1],
                        opacity: 0.6
                      }}>
                        ▸
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formattedData.map((row, index) => (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: index % 2 === 0
                      ? tokens.colors.surface.secondary
                      : tokens.colors.surface.primary
                  }}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      style={{
                        ...tdStyles,
                        textAlign: column.align || (column.type === 'number' || column.type === 'currency' || column.type === 'percentage' ? 'right' : 'left'),
                        ...row._formatted[column.key].style
                      }}
                    >
                      {row._formatted[column.key].value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function formatCellValue(
  value: any,
  type: DataGridColumn['type'],
  tokens: any,
  highlightPositive: boolean
) {
  if (value === null || value === undefined) {
    return {
      value: '-',
      style: { color: tokens.colors.text.tertiary }
    };
  }

  switch (type) {
    case 'currency':
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      const formatted = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2
      }).format(numValue);

      return {
        value: formatted,
        style: highlightPositive ? {
          color: numValue >= 0 ? tokens.colors.market.bullish : tokens.colors.market.bearish
        } : {}
      };

    case 'percentage':
      const pctValue = typeof value === 'number' ? value : parseFloat(value);
      const pctFormatted = (pctValue * 100).toFixed(2) + '%';

      return {
        value: pctFormatted,
        style: highlightPositive ? {
          color: pctValue >= 0 ? tokens.colors.market.bullish : tokens.colors.market.bearish
        } : {}
      };

    case 'number':
      const numFormatted = typeof value === 'number' ? value : parseFloat(value);
      const numberFormatted = new Intl.NumberFormat('en-AU').format(numFormatted);

      return {
        value: numberFormatted,
        style: highlightPositive ? {
          color: numFormatted >= 0 ? tokens.colors.market.bullish : tokens.colors.market.bearish
        } : {}
      };

    case 'date':
      const date = new Date(value);
      return {
        value: date.toLocaleDateString('en-AU'),
        style: {}
      };

    case 'status':
      const statusColors: Record<string, string> = {
        active: tokens.colors.status.online,
        online: tokens.colors.status.online,
        success: tokens.colors.status.online,
        inactive: tokens.colors.status.offline,
        offline: tokens.colors.status.offline,
        error: tokens.colors.status.offline,
        warning: tokens.colors.status.warning,
        pending: tokens.colors.status.warning,
        maintenance: tokens.colors.status.maintenance
      };

      return {
        value: String(value).toUpperCase(),
        style: {
          color: statusColors[String(value).toLowerCase()] || tokens.colors.text.primary,
          fontWeight: tokens.typography.weights.medium
        }
      };

    case 'text':
    default:
      return {
        value: String(value),
        style: {}
      };
  }
}

// Sample data for testing the component
export const samplePortfolioData = [
  {
    id: '1',
    asset: 'WREI-CC-001',
    type: 'Carbon Credits',
    quantity: 10000,
    unitPrice: 155.75,
    totalValue: 1557500,
    yield: 0.087,
    risk: 0.23,
    status: 'active',
    maturity: '2027-12-31'
  },
  {
    id: '2',
    asset: 'INFRA-REIT-AU',
    type: 'Infrastructure REIT',
    quantity: 5000,
    unitPrice: 42.30,
    totalValue: 211500,
    yield: 0.065,
    risk: 0.18,
    status: 'active',
    maturity: '2029-06-30'
  },
  {
    id: '3',
    asset: 'GREEN-BOND-050',
    type: 'Green Bond',
    quantity: 1000,
    unitPrice: 98.75,
    totalValue: 98750,
    yield: 0.048,
    risk: 0.12,
    status: 'active',
    maturity: '2028-03-15'
  }
];

export const samplePortfolioColumns: DataGridColumn[] = [
  { key: 'asset', header: 'Asset', type: 'text', width: '140px' },
  { key: 'type', header: 'Type', type: 'text', width: '120px' },
  { key: 'quantity', header: 'Quantity', type: 'number', align: 'right', sortable: true },
  { key: 'unitPrice', header: 'Unit Price', type: 'currency', align: 'right', sortable: true },
  { key: 'totalValue', header: 'Total Value', type: 'currency', align: 'right', sortable: true },
  { key: 'yield', header: 'Yield', type: 'percentage', align: 'right', sortable: true },
  { key: 'risk', header: 'Risk', type: 'percentage', align: 'right', sortable: true },
  { key: 'status', header: 'Status', type: 'status', align: 'center' },
  { key: 'maturity', header: 'Maturity', type: 'date', align: 'right' }
];