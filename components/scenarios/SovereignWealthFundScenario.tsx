'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';

interface SovereignWealthFundScenarioProps {
  onComplete: (result: any) => void;
  onExit: () => void;
}

type Phase = 'orientation' | 'macro-analysis' | 'geopolitical-assessment' | 'sovereign-integration' | 'recommendation';

interface MacroIndicator {
  name: string;
  current: number;
  forecast: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

interface GeopoliticalRisk {
  region: string;
  type: string;
  probability: number;
  impact: 'critical' | 'high' | 'medium' | 'low';
  mitigation: string;
}

export const SovereignWealthFundScenario: FC<SovereignWealthFundScenarioProps> = ({
  onComplete,
  onExit
}) => {
  const tokens = useDesignTokens('institutional');
  const [currentPhase, setCurrentPhase] = useState<Phase>('orientation');
  const [startTime] = useState(Date.now());
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scenario state
  const [macroView, setMacroView] = useState({
    carbonMarketOutlook: 'neutral' as 'bullish' | 'bearish' | 'neutral',
    geopoliticalRisk: 'medium' as 'high' | 'medium' | 'low',
    currencyHedging: false,
    strategicAllocation: 2.5, // percentage
    timeHorizon: 'long-term' as 'short-term' | 'medium-term' | 'long-term'
  });

  const [assessmentData, setAssessmentData] = useState({
    esgAlignment: 0,
    sovereignMandateScore: 0,
    geopoliticalRiskScore: 0,
    portfolioDiversification: 0
  });

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setPhaseStartTime(Date.now());
  }, [currentPhase]);

  const handleNextPhase = () => {
    const phases: Phase[] = ['orientation', 'macro-analysis', 'geopolitical-assessment', 'sovereign-integration', 'recommendation'];
    const currentIndex = phases.indexOf(currentPhase);

    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
    } else {
      const result = {
        scenario: 'sovereign-wealth-fund-macro',
        completed: true,
        duration: Math.round((Date.now() - startTime) / 1000),
        decisions: {
          macroView,
          assessmentData,
          notes
        },
        persona: 'Dr. Li Wei Chen'
      };
      onComplete(result);
    }
  };

  const renderPhaseHeader = (title: string, subtitle: string) => (
    <div style={{
      marginBottom: tokens.spacing[6],
      paddingBottom: tokens.spacing[4],
      borderBottom: `1px solid ${tokens.colors.surface.tertiary}`
    }}>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.bold,
        color: tokens.colors.text.primary,
        margin: 0,
        marginBottom: tokens.spacing[2]
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: tokens.typography.sizes.md,
        color: tokens.colors.text.secondary,
        margin: 0
      }}>
        {subtitle}
      </p>
    </div>
  );

  const renderMacroIndicators = (): MacroIndicator[] => [
    { name: 'Global Carbon Price', current: 85, forecast: 95, trend: 'bullish', impact: 'high' },
    { name: 'EU ETS Price', current: 65, forecast: 72, trend: 'bullish', impact: 'high' },
    { name: 'US Dollar Index', current: 103.2, forecast: 101.8, trend: 'bearish', impact: 'medium' },
    { name: 'Commodity Index', current: 245, forecast: 252, trend: 'neutral', impact: 'medium' },
    { name: 'Green Bond Spreads', current: 45, forecast: 42, trend: 'bullish', impact: 'high' }
  ];

  const renderGeopoliticalRisks = (): GeopoliticalRisk[] => [
    { region: 'Asia-Pacific', type: 'Trade Relations', probability: 0.65, impact: 'high', mitigation: 'Currency hedging' },
    { region: 'Europe', type: 'Energy Security', probability: 0.45, impact: 'medium', mitigation: 'ESG mandate alignment' },
    { region: 'Americas', type: 'Policy Changes', probability: 0.35, impact: 'medium', mitigation: 'Regulatory diversification' },
    { region: 'Middle East', type: 'Regional Stability', probability: 0.25, impact: 'low', mitigation: 'Geographic allocation' }
  ];

  const renderOrientationPhase = () => (
    <div>
      {renderPhaseHeader(
        'Sovereign Wealth Fund Macro Analysis',
        'Comprehensive macroeconomic assessment for strategic carbon credit allocation'
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            Investment Mandate Overview
          </h3>
          <div style={{
            backgroundColor: tokens.colors.surface.secondary,
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.surface.tertiary}`
          }}>
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <strong style={{ color: tokens.colors.text.primary }}>Fund:</strong>
              <span style={{ color: tokens.colors.text.secondary, marginLeft: tokens.spacing[2] }}>
                Singapore Sovereign Wealth Fund
              </span>
            </div>
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <strong style={{ color: tokens.colors.text.primary }}>Assets Under Management:</strong>
              <span style={{ color: tokens.colors.text.secondary, marginLeft: tokens.spacing[2] }}>
                S$500B
              </span>
            </div>
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <strong style={{ color: tokens.colors.text.primary }}>Carbon Allocation Target:</strong>
              <span style={{ color: tokens.colors.text.secondary, marginLeft: tokens.spacing[2] }}>
                S$12.5B (2.5% strategic allocation)
              </span>
            </div>
            <div style={{ marginBottom: tokens.spacing[3] }}>
              <strong style={{ color: tokens.colors.text.primary }}>Investment Horizon:</strong>
              <span style={{ color: tokens.colors.text.secondary, marginLeft: tokens.spacing[2] }}>
                15-30 years
              </span>
            </div>
            <div>
              <strong style={{ color: tokens.colors.text.primary }}>Strategic Objectives:</strong>
              <span style={{ color: tokens.colors.text.secondary, marginLeft: tokens.spacing[2] }}>
                Climate leadership, portfolio diversification, intergenerational wealth preservation
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            Key Performance Metrics
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3]
          }}>
            {[
              { label: 'Expected Return', value: '8-12%', trend: 'positive' },
              { label: 'Risk Budget', value: '15%', trend: 'neutral' },
              { label: 'ESG Score Target', value: '&gt;8.5/10', trend: 'positive' },
              { label: 'Currency Exposure', value: 'Multi-currency', trend: 'neutral' }
            ].map(metric => (
              <div
                key={metric.label}
                style={{
                  backgroundColor: tokens.colors.surface.secondary,
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.sm,
                  border: `1px solid ${tokens.colors.surface.tertiary}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{
                  fontSize: tokens.typography.sizes.sm,
                  color: tokens.colors.text.secondary
                }}>
                  {metric.label}
                </span>
                <span style={{
                  fontSize: tokens.typography.sizes.sm,
                  fontWeight: tokens.typography.weights.semibold,
                  color: metric.trend === 'positive' ? tokens.colors.market.bullish :
                        metric.trend === 'negative' ? tokens.colors.market.bearish :
                        tokens.colors.text.primary
                }}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: tokens.colors.accent.info + '20',
        padding: tokens.spacing[4],
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.colors.accent.info}`,
        marginBottom: tokens.spacing[6]
      }}>
        <h4 style={{
          fontSize: tokens.typography.sizes.md,
          fontWeight: tokens.typography.weights.semibold,
          color: tokens.colors.text.primary,
          marginBottom: tokens.spacing[2]
        }}>
          🏛️ Sovereign Mandate Alignment
        </h4>
        <p style={{
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.secondary,
          margin: 0,
          lineHeight: tokens.typography.lineHeights.normal
        }}>
          This analysis must align with Singapore&apos;s national climate commitments, regional leadership position,
          and long-term economic development strategy. Consider geopolitical implications and currency exposures.
        </p>
      </div>
    </div>
  );

  const renderMacroAnalysisPhase = () => (
    <div>
      {renderPhaseHeader(
        'Macroeconomic Analysis',
        'Assess global economic indicators and their impact on carbon credit markets'
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            Key Macro Indicators
          </h3>
          <div style={{
            backgroundColor: tokens.colors.surface.secondary,
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.surface.tertiary}`,
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: tokens.spacing[2],
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.surface.tertiary,
              fontSize: tokens.typography.sizes.xs,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.secondary
            }}>
              <div>INDICATOR</div>
              <div>CURRENT</div>
              <div>FORECAST</div>
              <div>TREND</div>
            </div>
            {renderMacroIndicators().map((indicator, index) => (
              <div
                key={indicator.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: tokens.spacing[2],
                  padding: tokens.spacing[3],
                  borderTop: index > 0 ? `1px solid ${tokens.colors.surface.tertiary}` : 'none',
                  fontSize: tokens.typography.sizes.sm
                }}
              >
                <div style={{ color: tokens.colors.text.primary, fontWeight: tokens.typography.weights.medium }}>
                  {indicator.name}
                </div>
                <div style={{ color: tokens.colors.text.secondary }}>{indicator.current}</div>
                <div style={{ color: tokens.colors.text.secondary }}>{indicator.forecast}</div>
                <div style={{
                  color: indicator.trend === 'bullish' ? tokens.colors.market.bullish :
                         indicator.trend === 'bearish' ? tokens.colors.market.bearish :
                         tokens.colors.text.secondary
                }}>
                  {indicator.trend === 'bullish' ? '↗️' : indicator.trend === 'bearish' ? '↘️' : '➡️'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            Strategic Assessment
          </h3>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.secondary,
              display: 'block',
              marginBottom: tokens.spacing[2]
            }}>
              Carbon Market Outlook
            </label>
            <select
              value={macroView.carbonMarketOutlook}
              onChange={(e) => setMacroView({...macroView, carbonMarketOutlook: e.target.value as any})}
              style={{
                width: '100%',
                padding: tokens.spacing[3],
                backgroundColor: tokens.colors.surface.primary,
                border: `1px solid ${tokens.colors.surface.tertiary}`,
                borderRadius: tokens.borderRadius.sm,
                color: tokens.colors.text.primary,
                fontSize: tokens.typography.sizes.sm
              }}
            >
              <option value="bullish">Bullish - Strong growth expected</option>
              <option value="neutral">Neutral - Steady development</option>
              <option value="bearish">Bearish - Cautious outlook</option>
            </select>
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.secondary,
              display: 'block',
              marginBottom: tokens.spacing[2]
            }}>
              Time Horizon Strategy
            </label>
            <select
              value={macroView.timeHorizon}
              onChange={(e) => setMacroView({...macroView, timeHorizon: e.target.value as any})}
              style={{
                width: '100%',
                padding: tokens.spacing[3],
                backgroundColor: tokens.colors.surface.primary,
                border: `1px solid ${tokens.colors.surface.tertiary}`,
                borderRadius: tokens.borderRadius.sm,
                color: tokens.colors.text.primary,
                fontSize: tokens.typography.sizes.sm
              }}
            >
              <option value="long-term">Long-term (15-30 years)</option>
              <option value="medium-term">Medium-term (5-15 years)</option>
              <option value="short-term">Short-term (1-5 years)</option>
            </select>
          </div>

          <div style={{ marginBottom: tokens.spacing[4] }}>
            <label style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.secondary,
              display: 'block',
              marginBottom: tokens.spacing[2]
            }}>
              Strategic Allocation (% of portfolio)
            </label>
            <input
              type="number"
              min="0.5"
              max="5"
              step="0.1"
              value={macroView.strategicAllocation}
              onChange={(e) => setMacroView({...macroView, strategicAllocation: parseFloat(e.target.value)})}
              style={{
                width: '100%',
                padding: tokens.spacing[3],
                backgroundColor: tokens.colors.surface.primary,
                border: `1px solid ${tokens.colors.surface.tertiary}`,
                borderRadius: tokens.borderRadius.sm,
                color: tokens.colors.text.primary,
                fontSize: tokens.typography.sizes.sm
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            <input
              type="checkbox"
              id="currency-hedging"
              checked={macroView.currencyHedging}
              onChange={(e) => setMacroView({...macroView, currencyHedging: e.target.checked})}
              style={{
                width: '16px',
                height: '16px'
              }}
            />
            <label
              htmlFor="currency-hedging"
              style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary
              }}
            >
              Implement multi-currency hedging strategy
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeopoliticalAssessmentPhase = () => (
    <div>
      {renderPhaseHeader(
        'Geopolitical Risk Assessment',
        'Evaluate regional risks and their impact on sovereign investment strategy'
      )}

      <div style={{ marginBottom: tokens.spacing[6] }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.semibold,
          color: tokens.colors.text.primary,
          marginBottom: tokens.spacing[4]
        }}>
          Regional Risk Analysis
        </h3>
        <div style={{
          backgroundColor: tokens.colors.surface.secondary,
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.surface.tertiary}`,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 2fr',
            gap: tokens.spacing[2],
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.surface.tertiary,
            fontSize: tokens.typography.sizes.xs,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.secondary
          }}>
            <div>REGION</div>
            <div>RISK TYPE</div>
            <div>PROBABILITY</div>
            <div>IMPACT</div>
            <div>MITIGATION STRATEGY</div>
          </div>
          {renderGeopoliticalRisks().map((risk, index) => (
            <div
              key={`${risk.region}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 2fr',
                gap: tokens.spacing[2],
                padding: tokens.spacing[3],
                borderTop: index > 0 ? `1px solid ${tokens.colors.surface.tertiary}` : 'none',
                fontSize: tokens.typography.sizes.sm
              }}
            >
              <div style={{ color: tokens.colors.text.primary, fontWeight: tokens.typography.weights.medium }}>
                {risk.region}
              </div>
              <div style={{ color: tokens.colors.text.secondary }}>{risk.type}</div>
              <div style={{ color: tokens.colors.text.secondary }}>{Math.round(risk.probability * 100)}%</div>
              <div style={{
                color: risk.impact === 'critical' ? tokens.colors.market.bearish :
                       risk.impact === 'high' ? tokens.colors.status.warning :
                       risk.impact === 'medium' ? tokens.colors.accent.info :
                       tokens.colors.market.bullish
              }}>
                {risk.impact}
              </div>
              <div style={{ color: tokens.colors.text.secondary, fontSize: tokens.typography.sizes.xs }}>
                {risk.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        {[
          {
            title: 'ESG Alignment Score',
            value: assessmentData.esgAlignment,
            setter: (val: number) => setAssessmentData({...assessmentData, esgAlignment: val}),
            description: 'Alignment with Singapore\'s climate commitments'
          },
          {
            title: 'Sovereign Mandate Score',
            value: assessmentData.sovereignMandateScore,
            setter: (val: number) => setAssessmentData({...assessmentData, sovereignMandateScore: val}),
            description: 'Consistency with national strategic objectives'
          },
          {
            title: 'Geopolitical Risk Score',
            value: assessmentData.geopoliticalRiskScore,
            setter: (val: number) => setAssessmentData({...assessmentData, geopoliticalRiskScore: val}),
            description: 'Regional stability and policy risk assessment'
          }
        ].map(item => (
          <div
            key={item.title}
            style={{
              backgroundColor: tokens.colors.surface.secondary,
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.surface.tertiary}`
            }}
          >
            <h4 style={{
              fontSize: tokens.typography.sizes.sm,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.secondary,
              margin: `0 0 ${tokens.spacing[2]} 0`
            }}>
              {item.title}
            </h4>
            <div style={{
              fontSize: tokens.typography.sizes.xl,
              fontWeight: tokens.typography.weights.bold,
              color: item.value >= 8 ? tokens.colors.market.bullish :
                     item.value >= 6 ? tokens.colors.status.warning :
                     tokens.colors.market.bearish,
              marginBottom: tokens.spacing[2]
            }}>
              {item.value}/10
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={item.value}
              onChange={(e) => item.setter(parseFloat(e.target.value))}
              style={{
                width: '100%',
                marginBottom: tokens.spacing[2]
              }}
            />
            <p style={{
              fontSize: tokens.typography.sizes.xs,
              color: tokens.colors.text.secondary,
              margin: 0,
              lineHeight: tokens.typography.lineHeights.tight
            }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSovereignIntegrationPhase = () => (
    <div>
      {renderPhaseHeader(
        'Sovereign Strategy Integration',
        'Align carbon credit investment with national strategic objectives'
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            National Climate Strategy Alignment
          </h3>
          <div style={{
            backgroundColor: tokens.colors.surface.secondary,
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.surface.tertiary}`,
            marginBottom: tokens.spacing[4]
          }}>
            {[
              { metric: 'Carbon Neutrality Target', value: '2050', alignment: 'Strong' },
              { metric: 'Green Finance Hub', value: 'Regional Leadership', alignment: 'Strong' },
              { metric: 'ASEAN Climate Cooperation', value: 'Active Participation', alignment: 'Moderate' },
              { metric: 'Maritime Decarbonization', value: 'Strategic Priority', alignment: 'Strong' }
            ].map((item, index) => (
              <div
                key={item.metric}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: tokens.spacing[2],
                  marginBottom: index < 3 ? tokens.spacing[2] : 0,
                  backgroundColor: tokens.colors.surface.primary,
                  borderRadius: tokens.borderRadius.sm
                }}
              >
                <div>
                  <div style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: tokens.typography.weights.medium,
                    color: tokens.colors.text.primary
                  }}>
                    {item.metric}
                  </div>
                  <div style={{
                    fontSize: tokens.typography.sizes.xs,
                    color: tokens.colors.text.secondary
                  }}>
                    {item.value}
                  </div>
                </div>
                <span style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: item.alignment === 'Strong' ? tokens.colors.market.bullish + '20' :
                                   item.alignment === 'Moderate' ? tokens.colors.status.warning + '20' :
                                   tokens.colors.market.bearish + '20',
                  color: item.alignment === 'Strong' ? tokens.colors.market.bullish :
                         item.alignment === 'Moderate' ? tokens.colors.status.warning :
                         tokens.colors.market.bearish,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.sizes.xs,
                  fontWeight: tokens.typography.weights.semibold
                }}>
                  {item.alignment}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            Portfolio Diversification Impact
          </h3>
          <div style={{
            backgroundColor: tokens.colors.surface.secondary,
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.surface.tertiary}`
          }}>
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <label style={{
                fontSize: tokens.typography.sizes.sm,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.secondary,
                display: 'block',
                marginBottom: tokens.spacing[2]
              }}>
                Portfolio Diversification Score
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={assessmentData.portfolioDiversification}
                onChange={(e) => setAssessmentData({
                  ...assessmentData,
                  portfolioDiversification: parseFloat(e.target.value)
                })}
                style={{ width: '100%', marginBottom: tokens.spacing[2] }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: tokens.typography.sizes.xs,
                color: tokens.colors.text.secondary
              }}>
                <span>Low Impact</span>
                <span style={{
                  fontWeight: tokens.typography.weights.bold,
                  color: tokens.colors.text.primary
                }}>
                  {assessmentData.portfolioDiversification}/10
                </span>
                <span>High Impact</span>
              </div>
            </div>

            <div style={{
              backgroundColor: tokens.colors.surface.primary,
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.sm,
              border: `1px solid ${tokens.colors.surface.tertiary}`
            }}>
              <h4 style={{
                fontSize: tokens.typography.sizes.sm,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[2]
              }}>
                Correlation Analysis
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.sizes.xs,
                color: tokens.colors.text.secondary
              }}>
                <div>Equities: 0.15</div>
                <div>Fixed Income: 0.08</div>
                <div>Commodities: 0.22</div>
                <div>Real Estate: 0.12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.semibold,
          color: tokens.colors.text.primary,
          marginBottom: tokens.spacing[4]
        }}>
          Strategic Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document key insights, concerns, and strategic considerations for the investment committee..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.surface.secondary,
            border: `1px solid ${tokens.colors.surface.tertiary}`,
            borderRadius: tokens.borderRadius.md,
            color: tokens.colors.text.primary,
            fontSize: tokens.typography.sizes.sm,
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  const renderRecommendationPhase = () => {
    const overallScore = Math.round(
      (assessmentData.esgAlignment +
       assessmentData.sovereignMandateScore +
       (10 - assessmentData.geopoliticalRiskScore) +
       assessmentData.portfolioDiversification) / 4 * 10
    ) / 10;

    const recommendation = overallScore >= 8 ? 'Strong Buy' :
                          overallScore >= 6 ? 'Buy' :
                          overallScore >= 4 ? 'Hold' : 'Avoid';

    return (
      <div>
        {renderPhaseHeader(
          'Strategic Recommendation',
          'Final analysis and investment recommendation for sovereign wealth fund allocation'
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[6],
          marginBottom: tokens.spacing[6]
        }}>
          <div>
            <div style={{
              backgroundColor: tokens.colors.surface.secondary,
              padding: tokens.spacing[6],
              borderRadius: tokens.borderRadius.lg,
              border: `2px solid ${
                recommendation === 'Strong Buy' ? tokens.colors.market.bullish :
                recommendation === 'Buy' ? tokens.colors.accent.info :
                recommendation === 'Hold' ? tokens.colors.status.warning :
                tokens.colors.market.bearish
              }`,
              textAlign: 'center' as const
            }}>
              <h3 style={{
                fontSize: tokens.typography.sizes['2xl'],
                fontWeight: tokens.typography.weights.bold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[2]
              }}>
                {recommendation}
              </h3>
              <div style={{
                fontSize: tokens.typography.sizes.xl,
                fontWeight: tokens.typography.weights.bold,
                color: recommendation === 'Strong Buy' ? tokens.colors.market.bullish :
                       recommendation === 'Buy' ? tokens.colors.accent.info :
                       recommendation === 'Hold' ? tokens.colors.status.warning :
                       tokens.colors.market.bearish,
                marginBottom: tokens.spacing[4]
              }}>
                Overall Score: {overallScore}/10
              </div>
              <div style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary
              }}>
                Recommended allocation: S${(macroView.strategicAllocation * 500).toFixed(1)}B
                ({macroView.strategicAllocation}% of portfolio)
              </div>
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.semibold,
              color: tokens.colors.text.primary,
              marginBottom: tokens.spacing[4]
            }}>
              Risk-Return Analysis
            </h3>
            <div style={{
              backgroundColor: tokens.colors.surface.secondary,
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.surface.tertiary}`
            }}>
              {[
                { metric: 'Expected Annual Return', value: '8-12%', status: 'positive' },
                { metric: 'Volatility (1-year)', value: '15-25%', status: 'neutral' },
                { metric: 'Maximum Drawdown', value: '<10%', status: 'positive' },
                { metric: 'Sharpe Ratio', value: '0.6-0.8', status: 'positive' },
                { metric: 'ESG Impact Score', value: `${assessmentData.esgAlignment}/10`, status: 'positive' }
              ].map((item, index) => (
                <div
                  key={item.metric}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: tokens.spacing[2],
                    marginBottom: index < 4 ? tokens.spacing[2] : 0,
                    backgroundColor: tokens.colors.surface.primary,
                    borderRadius: tokens.borderRadius.sm
                  }}
                >
                  <span style={{
                    fontSize: tokens.typography.sizes.sm,
                    color: tokens.colors.text.secondary
                  }}>
                    {item.metric}
                  </span>
                  <span style={{
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: tokens.typography.weights.semibold,
                    color: item.status === 'positive' ? tokens.colors.market.bullish :
                           item.status === 'negative' ? tokens.colors.market.bearish :
                           tokens.colors.text.primary
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: tokens.colors.surface.secondary,
          padding: tokens.spacing[6],
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${tokens.colors.surface.tertiary}`,
          marginBottom: tokens.spacing[6]
        }}>
          <h3 style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.primary,
            marginBottom: tokens.spacing[4]
          }}>
            Executive Summary for Investment Committee
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacing[6]
          }}>
            <div>
              <h4 style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[3]
              }}>
                Key Strengths
              </h4>
              <ul style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary,
                lineHeight: tokens.typography.lineHeights.normal,
                paddingLeft: tokens.spacing[4]
              }}>
                <li>Strong alignment with Singapore&apos;s 2050 carbon neutrality commitment</li>
                <li>Significant portfolio diversification benefits</li>
                <li>Access to high-quality, dMRV-verified carbon credits</li>
                <li>Long-term growth potential in expanding carbon markets</li>
                <li>Enhanced ESG profile for sovereign fund</li>
              </ul>
            </div>

            <div>
              <h4 style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[3]
              }}>
                Risk Considerations
              </h4>
              <ul style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary,
                lineHeight: tokens.typography.lineHeights.normal,
                paddingLeft: tokens.spacing[4]
              }}>
                <li>Regulatory changes in carbon pricing mechanisms</li>
                <li>Geopolitical risks affecting regional carbon markets</li>
                <li>Currency exposure requiring hedging strategy</li>
                <li>Market volatility in emerging asset class</li>
                <li>Technology disruption in carbon verification</li>
              </ul>
            </div>
          </div>

          {notes && (
            <div style={{ marginTop: tokens.spacing[4] }}>
              <h4 style={{
                fontSize: tokens.typography.sizes.md,
                fontWeight: tokens.typography.weights.semibold,
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing[2]
              }}>
                Additional Strategic Notes
              </h4>
              <div style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary,
                lineHeight: tokens.typography.lineHeights.normal,
                backgroundColor: tokens.colors.surface.primary,
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.sm,
                border: `1px solid ${tokens.colors.surface.tertiary}`
              }}>
                {notes}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getCurrentPhaseContent = () => {
    switch (currentPhase) {
      case 'orientation': return renderOrientationPhase();
      case 'macro-analysis': return renderMacroAnalysisPhase();
      case 'geopolitical-assessment': return renderGeopoliticalAssessmentPhase();
      case 'sovereign-integration': return renderSovereignIntegrationPhase();
      case 'recommendation': return renderRecommendationPhase();
      default: return renderOrientationPhase();
    }
  };

  const getPhaseProgress = () => {
    const phases = ['orientation', 'macro-analysis', 'geopolitical-assessment', 'sovereign-integration', 'recommendation'];
    return ((phases.indexOf(currentPhase) + 1) / phases.length) * 100;
  };

  return (
    <div style={{
      padding: tokens.spacing[6],
      backgroundColor: tokens.colors.surface.primary,
      minHeight: '100vh',
      fontFamily: tokens.typography.families.interface
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacing[6],
        paddingBottom: tokens.spacing[4],
        borderBottom: `1px solid ${tokens.colors.surface.tertiary}`
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.sizes['2xl'],
            fontWeight: tokens.typography.weights.bold,
            color: tokens.colors.text.primary,
            margin: 0,
            marginBottom: tokens.spacing[2]
          }}>
            Sovereign Wealth Fund Macro Analysis
          </h1>
          <div style={{
            fontSize: tokens.typography.sizes.md,
            color: tokens.colors.text.secondary
          }}>
            Dr. Li Wei Chen • Chief Investment Officer • Singapore Sovereign Wealth Fund
          </div>
        </div>
        <button
          onClick={onExit}
          style={{
            padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            backgroundColor: tokens.colors.surface.tertiary,
            border: `1px solid ${tokens.colors.surface.elevated}`,
            borderRadius: tokens.borderRadius.md,
            color: tokens.colors.text.primary,
            cursor: 'pointer',
            fontSize: tokens.typography.sizes.sm,
            fontWeight: tokens.typography.weights.medium
          }}
        >
          Exit Scenario
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: tokens.colors.surface.secondary,
        height: '8px',
        borderRadius: tokens.borderRadius.full,
        marginBottom: tokens.spacing[6],
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: tokens.colors.accent.primary,
          height: '100%',
          width: `${getPhaseProgress()}%`,
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>

      {/* Content */}
      <div ref={scrollRef} style={{ marginBottom: tokens.spacing[6] }}>
        {getCurrentPhaseContent()}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacing[3],
        paddingTop: tokens.spacing[4],
        borderTop: `1px solid ${tokens.colors.surface.tertiary}`
      }}>
        <button
          onClick={handleNextPhase}
          style={{
            padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
            backgroundColor: tokens.colors.accent.primary,
            border: 'none',
            borderRadius: tokens.borderRadius.md,
            color: tokens.colors.surface.primary,
            cursor: 'pointer',
            fontSize: tokens.typography.sizes.sm,
            fontWeight: tokens.typography.weights.semibold
          }}
        >
          {currentPhase === 'recommendation' ? 'Complete Analysis' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};