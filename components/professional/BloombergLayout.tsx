'use client';

import { FC, ReactNode } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';

interface BloombergLayoutProps {
  children: ReactNode;
  investorType?: 'infrastructure_fund' | 'sovereign_wealth' | 'pension_fund' | 'family_office' | 'esg_fund';
  mode?: 'trading' | 'analysis' | 'reporting';
  className?: string;
}

export const BloombergLayout: FC<BloombergLayoutProps> = ({
  children,
  investorType = 'infrastructure_fund',
  mode = 'analysis',
  className = ''
}) => {
  const tokens = useDesignTokens('institutional');

  const layoutStyles = {
    backgroundColor: tokens.colors.surface.primary,
    fontFamily: tokens.typography.families.interface,
    color: tokens.colors.text.primary,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const
  };

  const headerStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderBottom: `1px solid ${tokens.colors.surface.tertiary}`,
    padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    zIndex: 50
  };

  const workspaceStyles = {
    display: 'flex',
    flex: '1',
    overflow: 'hidden'
  };

  const sidebarStyles = {
    width: '280px',
    backgroundColor: tokens.colors.surface.secondary,
    borderRight: `1px solid ${tokens.colors.surface.tertiary}`,
    padding: tokens.spacing[4],
    overflowY: 'auto' as const
  };

  const contentStyles = {
    flex: '1',
    padding: tokens.spacing[6],
    overflowY: 'auto' as const,
    backgroundColor: tokens.colors.surface.primary
  };

  const analyticsStyles = {
    width: '320px',
    backgroundColor: tokens.colors.surface.secondary,
    borderLeft: `1px solid ${tokens.colors.surface.tertiary}`,
    padding: tokens.spacing[4],
    overflowY: 'auto' as const
  };

  const footerStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderTop: `1px solid ${tokens.colors.surface.tertiary}`,
    padding: `${tokens.spacing[2]} ${tokens.spacing[6]}`,
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '40px'
  };

  return (
    <div
      className={`bloomberg-layout ${className}`}
      style={layoutStyles}
      data-investor-type={investorType}
      data-mode={mode}
    >
      {/* Professional header with market data ticker */}
      <header className="bloomberg-header" style={headerStyles}>
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[6] }}>
          <div style={{ fontWeight: tokens.typography.weights.bold, fontSize: tokens.typography.sizes.lg }}>
            WREI
          </div>
          <MarketDataTicker />
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
          <UserProfile investorType={investorType} />
          <SystemStatus />
        </div>
      </header>

      {/* Main content area with Bloomberg-style panels */}
      <main className="bloomberg-workspace" style={workspaceStyles}>
        <aside className="bloomberg-sidebar" style={sidebarStyles}>
          <NavigationPanel mode={mode} />
          <QuickActions />
          <MarketIntelligence />
        </aside>

        <section className="bloomberg-content" style={contentStyles}>
          {children}
        </section>

        <aside className="bloomberg-analytics" style={analyticsStyles}>
          <RealTimeAnalytics />
          <RiskMonitor />
          <PerformanceMetrics />
        </aside>
      </main>

      {/* Professional footer with compliance info */}
      <footer className="bloomberg-footer" style={footerStyles}>
        <ComplianceNotice />
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
          <DataAttribution />
          <SystemTime />
        </div>
      </footer>
    </div>
  );
};

// Supporting components - placeholder implementations
const MarketDataTicker: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[4],
      fontFamily: tokens.typography.families.financial,
      fontSize: tokens.typography.sizes.sm
    }}>
      <span style={{ color: tokens.colors.market.bullish }}>VCM +2.3%</span>
      <span style={{ color: tokens.colors.market.neutral }}>CARBON $6.34</span>
      <span style={{ color: tokens.colors.market.bearish }}>OFFSET -1.1%</span>
    </div>
  );
};

const UserProfile: FC<{ investorType: string }> = ({ investorType }) => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{
      fontSize: tokens.typography.sizes.sm,
      color: tokens.colors.text.secondary
    }}>
      {investorType.replace('_', ' ').toUpperCase()}
    </div>
  );
};

const SystemStatus: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: tokens.colors.status.online
    }} />
  );
};

const NavigationPanel: FC<{ mode: string }> = ({ mode }) => {
  const tokens = useDesignTokens('institutional');

  return (
    <nav style={{ marginBottom: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.sm,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[3],
        color: tokens.colors.text.secondary
      }}>
        NAVIGATION
      </h3>
      <div style={{ fontSize: tokens.typography.sizes.sm }}>
        Mode: {mode.toUpperCase()}
      </div>
    </nav>
  );
};

const QuickActions: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{ marginBottom: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.sm,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[3],
        color: tokens.colors.text.secondary
      }}>
        QUICK ACTIONS
      </h3>
    </div>
  );
};

const MarketIntelligence: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.sm,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[3],
        color: tokens.colors.text.secondary
      }}>
        MARKET INTEL
      </h3>
    </div>
  );
};

const RealTimeAnalytics: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{ marginBottom: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.sm,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[3],
        color: tokens.colors.text.secondary
      }}>
        REAL-TIME ANALYTICS
      </h3>
    </div>
  );
};

const RiskMonitor: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{ marginBottom: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.sm,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[3],
        color: tokens.colors.text.secondary
      }}>
        RISK MONITOR
      </h3>
    </div>
  );
};

const PerformanceMetrics: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.sm,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[3],
        color: tokens.colors.text.secondary
      }}>
        PERFORMANCE
      </h3>
    </div>
  );
};

const ComplianceNotice: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{ fontSize: tokens.typography.sizes.xs }}>
      © 2026 Water Roads Pty Ltd | Regulated by ASIC
    </div>
  );
};

const DataAttribution: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{ fontSize: tokens.typography.sizes.xs }}>
      Market data by WREI Pricing Index
    </div>
  );
};

const SystemTime: FC = () => {
  const tokens = useDesignTokens('institutional');

  return (
    <div style={{
      fontSize: tokens.typography.sizes.xs,
      fontFamily: tokens.typography.families.financial
    }}>
      {new Date().toLocaleTimeString()} AEDT
    </div>
  );
};