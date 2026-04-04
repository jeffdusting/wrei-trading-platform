/**
 * Professional Metrics Dashboard Component
 *
 * Sophisticated Bloomberg Terminal-style metrics display for institutional
 * investors with real-time data visualization, trend indicators, and
 * professional color coding.
 */

'use client';

import { FC, useMemo } from 'react';
import { enhancedProfessionalTheme, EnhancedThemeUtils } from '@/design-system/enhanced-professional-theme';

export interface MetricData {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  type: 'currency' | 'percentage' | 'number' | 'ratio' | 'basis-points' | 'text' | 'score';
  trend?: 'up' | 'down' | 'stable';
  significance?: 'high' | 'medium' | 'low';
  category?: 'performance' | 'risk' | 'esg' | 'operational' | 'market';
  unit?: string;
  precision?: number;
  threshold?: {
    good: number;
    warning: number;
    critical: number;
  };
  description?: string;
  lastUpdated?: Date;
}

export interface MetricGroup {
  id: string;
  title: string;
  subtitle?: string;
  metrics: MetricData[];
  color?: string;
  icon?: string;
  expanded?: boolean;
}

interface ProfessionalMetricsDashboardProps {
  title: string;
  subtitle?: string;
  metricGroups: MetricGroup[];
  layout?: 'grid' | 'list' | 'compact';
  showTrends?: boolean;
  showTimestamps?: boolean;
  realTime?: boolean;
  className?: string;
}

export const ProfessionalMetricsDashboard: FC<ProfessionalMetricsDashboardProps> = ({
  title,
  subtitle,
  metricGroups,
  layout = 'grid',
  showTrends = true,
  showTimestamps = false,
  realTime = false,
  className = ''
}) => {
  const theme = enhancedProfessionalTheme;

  const formatMetricValue = (metric: MetricData): string => {
    if (typeof metric.value === 'string') {
      return metric.value;
    }

    const precision = metric.precision ?? 2;

    switch (metric.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision
        }).format(metric.value);

      case 'percentage':
        return `${(metric.value * 100).toFixed(precision)}%`;

      case 'basis-points':
        return `${(metric.value * 10000).toFixed(0)}bp`;

      case 'ratio':
        return `${metric.value.toFixed(precision)}:1`;

      case 'score':
        return `${metric.value.toFixed(1)}/10`;

      case 'number':
        if (metric.value >= 1e9) {
          return `${(metric.value / 1e9).toFixed(1)}B`;
        } else if (metric.value >= 1e6) {
          return `${(metric.value / 1e6).toFixed(1)}M`;
        } else if (metric.value >= 1e3) {
          return `${(metric.value / 1e3).toFixed(1)}K`;
        }
        return metric.value.toFixed(precision);

      default:
        return metric.value.toString();
    }
  };

  const getMetricColor = (metric: MetricData): string => {
    // Threshold-based coloring
    if (metric.threshold && typeof metric.value === 'number') {
      if (metric.value >= metric.threshold.good) {
        return theme.colors.status.success;
      } else if (metric.value >= metric.threshold.warning) {
        return theme.colors.status.warning;
      } else {
        return theme.colors.status.error;
      }
    }

    // Category-based coloring
    switch (metric.category) {
      case 'performance':
        return theme.colors.financial.bullish;
      case 'risk':
        return theme.colors.status.warning;
      case 'esg':
        return theme.colors.esg.sustainable;
      case 'market':
        return theme.colors.primary[500];
      default:
        return theme.colors.terminal.text.primary;
    }
  };

  const getTrendIcon = (metric: MetricData): string => {
    if (!showTrends || !metric.trend) return '';

    switch (metric.trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  const getTrendColor = (metric: MetricData): string => {
    if (!metric.trend) return theme.colors.terminal.text.secondary;

    switch (metric.trend) {
      case 'up': return theme.colors.financial.bullish;
      case 'down': return theme.colors.financial.bearish;
      case 'stable': return theme.colors.financial.neutral;
      default: return theme.colors.terminal.text.secondary;
    }
  };

  const calculateTrendPercentage = (metric: MetricData): string | null => {
    if (typeof metric.value !== 'number' || typeof metric.previousValue !== 'number') {
      return null;
    }

    const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.terminal.background,
    border: `1px solid ${theme.colors.terminal.border}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    fontFamily: theme.typography.fontFamily.primary
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    borderBottom: `1px solid ${theme.colors.terminal.border}`
  };

  const titleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.terminal.text.primary,
    margin: 0,
    marginBottom: subtitle ? theme.spacing[2] : 0
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.terminal.text.secondary,
    margin: 0
  };

  const getGroupsLayoutStyle = (): React.CSSProperties => {
    switch (layout) {
      case 'grid':
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: theme.spacing[6]
        };
      case 'list':
        return {
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[6]
        };
      case 'compact':
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing[4]
        };
      default:
        return {};
    }
  };

  const groupStyle: React.CSSProperties = {
    backgroundColor: theme.colors.terminal.backgroundSecondary,
    border: `1px solid ${theme.colors.terminal.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[5],
    transition: theme.transitions.normal
  };

  const groupHeaderStyle: React.CSSProperties = {
    marginBottom: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    borderBottom: `1px solid ${theme.colors.terminal.border}`
  };

  const groupTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.terminal.text.primary,
    margin: 0,
    marginBottom: theme.spacing[1],
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2]
  };

  const groupSubtitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.terminal.text.secondary,
    margin: 0
  };

  const metricsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: layout === 'compact' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[4]
  };

  const metricCardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.terminal.background,
    border: `1px solid ${theme.colors.terminal.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    transition: theme.transitions.fast,
    position: 'relative'
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.terminal.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing[2]
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily.mono,
    marginBottom: theme.spacing[1]
  };

  const metricTrendStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium
  };

  const metricDescriptionStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.terminal.text.tertiary,
    marginTop: theme.spacing[2],
    lineHeight: theme.typography.lineHeights.tight
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.terminal.text.tertiary,
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[3]
  };

  const realtimeIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
    width: '8px',
    height: '8px',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.status.success,
    animation: 'pulse 2s infinite'
  };

  return (
    <div className={`professional-metrics-dashboard ${className}`} style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        {realTime && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            marginTop: theme.spacing[2],
            fontSize: theme.typography.fontSizes.sm,
            color: theme.colors.status.success
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.status.success,
              animation: 'pulse 2s infinite'
            }} />
            Live Data
          </div>
        )}
      </div>

      {/* Metric Groups */}
      <div style={getGroupsLayoutStyle()}>
        {metricGroups.map((group) => (
          <div
            key={group.id}
            style={{
              ...groupStyle,
              borderLeftColor: group.color || theme.colors.primary[500],
              borderLeftWidth: '4px'
            }}
          >
            {/* Group Header */}
            <div style={groupHeaderStyle}>
              <h3 style={{
                ...groupTitleStyle,
                color: group.color || theme.colors.terminal.text.primary
              }}>
                {group.icon && <span>{group.icon}</span>}
                {group.title}
              </h3>
              {group.subtitle && <p style={groupSubtitleStyle}>{group.subtitle}</p>}
            </div>

            {/* Metrics */}
            <div style={metricsContainerStyle}>
              {group.metrics.map((metric) => (
                <div
                  key={metric.id}
                  style={metricCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.terminal.surface;
                    e.currentTarget.style.borderColor = theme.colors.terminal.borderFocus;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.terminal.background;
                    e.currentTarget.style.borderColor = theme.colors.terminal.border;
                  }}
                >
                  {/* Metric Label */}
                  <div style={metricLabelStyle}>{metric.label}</div>

                  {/* Metric Value */}
                  <div style={{
                    ...metricValueStyle,
                    color: getMetricColor(metric)
                  }}>
                    {formatMetricValue(metric)}
                    {metric.unit && (
                      <span style={{
                        fontSize: theme.typography.fontSizes.sm,
                        marginLeft: theme.spacing[1]
                      }}>
                        {metric.unit}
                      </span>
                    )}
                  </div>

                  {/* Trend Information */}
                  {showTrends && metric.trend && (
                    <div style={{
                      ...metricTrendStyle,
                      color: getTrendColor(metric)
                    }}>
                      <span>{getTrendIcon(metric)}</span>
                      {calculateTrendPercentage(metric) && (
                        <span>{calculateTrendPercentage(metric)}</span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {metric.description && (
                    <div style={metricDescriptionStyle}>
                      {metric.description}
                    </div>
                  )}

                  {/* Timestamp */}
                  {showTimestamps && metric.lastUpdated && (
                    <div style={timestampStyle}>
                      {metric.lastUpdated.toLocaleTimeString()}
                    </div>
                  )}

                  {/* Real-time Indicator */}
                  {realTime && (
                    <div style={realtimeIndicatorStyle} />
                  )}

                  {/* Significance Indicator */}
                  {metric.significance && (
                    <div style={{
                      position: 'absolute',
                      top: theme.spacing[2],
                      left: theme.spacing[2],
                      width: '4px',
                      height: '4px',
                      borderRadius: theme.borderRadius.full,
                      backgroundColor: metric.significance === 'high' ? theme.colors.status.error :
                                      metric.significance === 'medium' ? theme.colors.status.warning :
                                      theme.colors.status.info
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Utility function to create metric data
 */
export const createMetric = (
  id: string,
  label: string,
  value: number | string,
  type: MetricData['type'],
  options: Partial<Omit<MetricData, 'id' | 'label' | 'value' | 'type'>> = {}
): MetricData => ({
  id,
  label,
  value,
  type,
  ...options
});

/**
 * Utility function to create metric groups
 */
export const createMetricGroup = (
  id: string,
  title: string,
  metrics: MetricData[],
  options: Partial<Omit<MetricGroup, 'id' | 'title' | 'metrics'>> = {}
): MetricGroup => ({
  id,
  title,
  metrics,
  ...options
});