/**
 * WREI Trading Platform - Demo Presentation Script
 *
 * Professional presentation script for investor briefings
 * Structured 15-20 minute flow with talking points and transitions
 */

import { type DemoTourType } from './demo-state-manager';

export interface PresentationSlide {
  id: string;
  title: string;
  duration: number; // seconds
  talkingPoints: string[];
  keyMessages: string[];
  transitions: string[];
  demoActions?: string[];
  visualCues?: string[];
  audienceNotes?: string[];
}

export interface PresentationScript {
  id: string;
  title: string;
  duration: number; // minutes
  targetAudience: string;
  objectives: string[];
  slides: PresentationSlide[];
  appendix: {
    qnaPrep: string[];
    followUpMaterials: string[];
    nextSteps: string[];
  };
}

export const INVESTOR_BRIEFING_SCRIPT: PresentationScript = {
  id: 'investor-briefing',
  title: 'WREI Trading Platform: Institutional Carbon Credit Investment',
  duration: 18,
  targetAudience: 'Institutional investors, fund managers, family offices',
  objectives: [
    'Demonstrate WREI\'s institutional-grade capabilities',
    'Showcase competitive advantages vs traditional carbon markets',
    'Build confidence in AI negotiation and settlement technology',
    'Establish clear next steps for investment consideration'
  ],
  slides: [
    {
      id: 'opening-hook',
      title: 'Opening: The Carbon Market Opportunity',
      duration: 120, // 2 minutes
      talkingPoints: [
        'Good morning. Today I\'ll show you how WREI transforms carbon credits from a compliance cost centre into a yield-generating infrastructure asset.',
        'We\'ll walk through a live A$100 million allocation decision using our AI negotiation system.',
        'The global carbon market is projected to reach A$155 billion by 2030, but institutional participation has been limited by verification challenges and settlement friction.',
        'WREI solves these institutional barriers with asset-backed credits and T+0 settlement.'
      ],
      keyMessages: [
        'Carbon market = A$155B opportunity by 2030',
        'WREI = institutional-grade solution',
        'Asset-backed credits with real infrastructure'
      ],
      transitions: [
        '[Navigate to landing page]',
        'Let me show you how we\'re different...'
      ],
      visualCues: [
        'Highlight animated market statistics',
        'Point to A$19B RWA market size',
        'Emphasise 28.3% yield figure'
      ],
      demoActions: [
        'data-demo="value-proposition"',
        'data-demo="market-stats"'
      ]
    },

    {
      id: 'market-context',
      title: 'Market Context: Live Pricing Intelligence',
      duration: 150, // 2.5 minutes
      talkingPoints: [
        'This is live market data from our WREI Pricing Index.',
        'Traditional voluntary carbon markets are trading at A$8.45 per tonne for basic offsets.',
        'Forward removal credits are commanding A$185 per tonne, but with T+30 settlement and verification risks.',
        'Our dMRV verified credits with asset backing are anchored at A$152 per tonne with T+0 settlement.',
        'The 85% premium is justified by direct asset ownership and blockchain verification.'
      ],
      keyMessages: [
        'WREI Pricing Index provides market transparency',
        '85% premium justified by asset backing',
        'T+0 settlement vs T+30 traditional'
      ],
      transitions: [
        '[Navigate to performance dashboard]',
        'Let me show you the underlying assets...'
      ],
      visualCues: [
        'Highlight real-time pricing data',
        'Compare traditional vs WREI pricing',
        'Point to settlement time differences'
      ],
      demoActions: [
        'data-demo="market-data"',
        'data-demo="pricing-comparison"'
      ],
      audienceNotes: [
        'Expect questions about premium justification',
        'Be prepared to explain dMRV vs traditional verification'
      ]
    },

    {
      id: 'asset-infrastructure',
      title: 'Underlying Infrastructure: Real Asset Backing',
      duration: 180, // 3 minutes
      talkingPoints: [
        'What makes WREI different is real infrastructure backing.',
        'We have 88 vessels plus 22 Deep Power units generating A$61.1 million in annual lease income.',
        'This translates to 28.3% equity yields with a 3.0x cash-on-cash multiple.',
        'The fleet operates at 97% occupancy, providing stable cash flows that back our carbon credits.',
        'Each credit is tied to measurable CO2 reduction from our renewable energy assets.'
      ],
      keyMessages: [
        '88 vessels + 22 Deep Power units = A$61.1M annual income',
        '28.3% equity yields with 3.0x cash-on-cash',
        '97% occupancy rate for stable cash flows'
      ],
      transitions: [
        '[Navigate to institutional portal]',
        'Now let me show you how institutions onboard...'
      ],
      visualCues: [
        'Show fleet visualization if available',
        'Highlight occupancy and yield metrics',
        'Emphasise real asset connection'
      ],
      demoActions: [
        'data-demo="fleet-metrics"',
        'data-demo="yield-calculation"'
      ]
    },

    {
      id: 'institutional-onboarding',
      title: 'Institutional Onboarding: AFSL Compliance',
      duration: 180, // 3 minutes
      talkingPoints: [
        'Institutional onboarding is fully AFSL compliant with automated KYC/AML verification.',
        'We classify investors according to wholesale client provisions and maintain comprehensive audit trails.',
        'The platform integrates with 23 jurisdictions for automated compliance reporting.',
        'This includes TCFD, ISSB S2, and NGER reporting for Australian institutions.',
        'Let me show you the onboarding process for a A$12 billion infrastructure fund.'
      ],
      keyMessages: [
        'AFSL compliant with wholesale client classification',
        '23 jurisdictions automated compliance',
        'Comprehensive audit trails for institutional requirements'
      ],
      transitions: [
        '[Navigate to negotiation interface]',
        'Once onboarded, institutions can engage our AI negotiation system...'
      ],
      visualCues: [
        'Show compliance dashboard',
        'Highlight multi-jurisdiction coverage',
        'Point to audit trail capabilities'
      ],
      demoActions: [
        'data-demo="afsl-compliance"',
        'data-demo="jurisdiction-map"'
      ]
    },

    {
      id: 'ai-negotiation-demo',
      title: 'Live AI Negotiation: Margaret Richardson Scenario',
      duration: 480, // 8 minutes
      talkingPoints: [
        'This is our AI negotiation engine in action.',
        'I\'m using Margaret Richardson, CIO of Macquarie Infrastructure Partners, with A$12 billion AUM.',
        'Watch how the AI understands infrastructure fund requirements and adapts its strategy.',
        'The system maintains price discipline - we never go below A$125 per tonne, our absolute floor.',
        '[Conduct live negotiation with commentary on AI decisions]',
        'Notice how the AI references asset backing, yield comparisons, and regulatory advantages.',
        'The settlement happens atomically - from agreement to blockchain confirmation in under 3 minutes.'
      ],
      keyMessages: [
        'AI understands institutional investor requirements',
        'Price discipline with A$125 floor maintained',
        'T+0 settlement with blockchain confirmation'
      ],
      transitions: [
        '[Navigate to analytics dashboard]',
        'Behind every negotiation is institutional-grade analysis...'
      ],
      visualCues: [
        'Highlight AI reasoning in real-time',
        'Point out price discipline markers',
        'Show settlement progress'
      ],
      demoActions: [
        'data-demo="negotiation-interface"',
        'data-demo="ai-strategy"',
        'data-demo="settlement-process"'
      ],
      audienceNotes: [
        'This is the showcase moment - ensure smooth execution',
        'Be prepared to explain AI decision-making process',
        'Have backup scenario ready if technical issues'
      ]
    },

    {
      id: 'advanced-analytics',
      title: 'Portfolio Analytics: Institutional-Grade Analysis',
      duration: 240, // 4 minutes
      talkingPoints: [
        'Every institution requires sophisticated analytics for investment committee approval.',
        'Our platform provides Monte Carlo portfolio optimisation with 10,000 simulation runs.',
        'We show 5th to 95th percentile outcomes with expected shortfall calculations.',
        'ESG impact measurement includes quantified CO2 avoidance and UN SDG alignment.',
        'Risk attribution shows the diversification benefits - low correlation with traditional assets.',
        'All reporting can be exported in institutional formats for investment committee papers.'
      ],
      keyMessages: [
        'Monte Carlo optimisation with 10,000 simulations',
        'Quantified ESG impact with UN SDG alignment',
        'Low correlation with traditional assets for diversification'
      ],
      transitions: [
        '[Navigate to compliance reporting]',
        'Regulatory compliance is automated across multiple frameworks...'
      ],
      visualCues: [
        'Show Monte Carlo simulation results',
        'Highlight ESG impact metrics',
        'Point to correlation matrix'
      ],
      demoActions: [
        'data-demo="monte-carlo"',
        'data-demo="esg-metrics"',
        'data-demo="risk-attribution"'
      ]
    },

    {
      id: 'technical-infrastructure',
      title: 'Settlement Infrastructure: Zoniqx Integration',
      duration: 120, // 2 minutes
      talkingPoints: [
        'Settlement happens via Zoniqx zConnect - institutional-grade atomic settlement.',
        'We use the zProtocol tokenisation standard, which is CertiK audited and battle-tested.',
        'Compliance is automated through Zoniqx zCompliance across 20+ jurisdictions.',
        'The entire stack is non-custodial - institutions maintain control of their assets.',
        'Integration happens through our API or existing portfolio management systems.'
      ],
      keyMessages: [
        'Zoniqx zConnect for T+0 atomic settlement',
        'CertiK audited zProtocol tokenisation',
        'Non-custodial with institutional control maintained'
      ],
      transitions: [
        '[Navigate to API explorer if time permits]',
        'Integration is straightforward through our API...'
      ],
      visualCues: [
        'Show blockchain settlement visualization',
        'Highlight institutional-grade security',
        'Point to integration options'
      ],
      demoActions: [
        'data-demo="blockchain-viz"',
        'data-demo="settlement-overview"'
      ]
    },

    {
      id: 'investment-case',
      title: 'Investment Case: Compelling Risk-Adjusted Returns',
      duration: 180, // 3 minutes
      talkingPoints: [
        'Let me summarise the investment case.',
        '28.3% equity yields backed by real infrastructure assets generating A$61.1 million annually.',
        'Low correlation with traditional portfolios provides genuine diversification benefits.',
        'T+0 settlement eliminates counterparty risk and provides immediate liquidity.',
        'Full regulatory compliance reduces implementation friction for institutional investors.',
        'The carbon market is scaling rapidly - we\'re positioned for institutional adoption.'
      ],
      keyMessages: [
        '28.3% yields with real asset backing',
        'Genuine portfolio diversification benefits',
        'Regulatory compliance reduces institutional friction'
      ],
      transitions: [
        'Let me outline the next steps...'
      ],
      visualCues: [
        'Summarise key yield metrics',
        'Show diversification analysis',
        'Highlight competitive advantages'
      ],
      demoActions: [
        'data-demo="investment-summary"',
        'data-demo="competitive-advantages"'
      ]
    },

    {
      id: 'next-steps',
      title: 'Next Steps and Implementation',
      duration: 90, // 1.5 minutes
      talkingPoints: [
        'For institutions interested in proceeding, we can provide:',
        'A customised allocation analysis for your specific portfolio and constraints.',
        'Access to our institutional sandbox for technical due diligence.',
        'Full documentation package including legal structure and compliance frameworks.',
        'We typically see initial allocations from A$25 million to A$200 million.',
        'Implementation can happen within 30 days of investment committee approval.'
      ],
      keyMessages: [
        'Customised allocation analysis available',
        'Institutional sandbox for technical due diligence',
        'A$25M to A$200M typical initial allocations'
      ],
      transitions: [
        'I\'m happy to take questions...'
      ],
      visualCues: [
        'Show implementation timeline',
        'Highlight support services',
        'Present contact information'
      ],
      demoActions: [
        'data-demo="next-steps"',
        'data-demo="contact-info"'
      ]
    }
  ],
  appendix: {
    qnaPrep: [
      'Q: How do you justify the 85% premium vs traditional carbon markets?',
      'A: Real infrastructure backing, dMRV verification, T+0 settlement, and AFSL compliance. Traditional markets have verification risk and extended settlement periods.',

      'Q: What happens if the underlying fleet performance declines?',
      'A: Credits are only issued based on actual verified performance. The asset backing provides yield stability even if credit generation varies.',

      'Q: How liquid are positions if we need to exit?',
      'A: T+0 settlement enables immediate liquidity. We also provide market making for large institutional positions.',

      'Q: What regulatory risks should we be aware of?',
      'A: We maintain compliance with current frameworks and monitor regulatory developments across 23 jurisdictions. AFSL compliance provides Australian regulatory clarity.',

      'Q: How does this compare to listed carbon ETFs or futures?',
      'A: Direct asset exposure with higher yields vs listed products. No management fees or tracking error - you own the underlying credits.',

      'Q: What\'s the minimum allocation and lock-up period?',
      'A: A$25 million minimum with no mandatory lock-up. T+0 settlement provides liquidity on demand.',

      'Q: How do you ensure additionality and permanence?',
      'A: Our dMRV system provides real-time verification of CO2 reduction from our renewable energy assets. Permanence is backed by ongoing asset operations.'
    ],
    followUpMaterials: [
      'Comprehensive due diligence package with legal structure',
      'Technical integration documentation and API access',
      'Historical performance data and backtest results',
      'Compliance framework mapping for specific jurisdictions',
      'Sample portfolio allocation analysis',
      'Reference client case studies (where permissible)',
      'Detailed fee schedule and implementation timeline'
    ],
    nextSteps: [
      'Schedule technical due diligence session with CTO/developers',
      'Provide investment committee presentation materials',
      'Begin AFSL compliance verification process',
      'Arrange legal documentation review',
      'Set up institutional sandbox access',
      'Coordinate with existing portfolio management systems',
      'Establish ongoing relationship management'
    ]
  }
};

export const TECHNICAL_DEMO_SCRIPT: PresentationScript = {
  id: 'technical-demo',
  title: 'WREI Platform: Technical Architecture and Integration',
  duration: 15,
  targetAudience: 'CTOs, system architects, development teams',
  objectives: [
    'Demonstrate API capabilities and integration options',
    'Showcase blockchain infrastructure and security',
    'Explain real-time data architecture',
    'Provide clear technical implementation pathway'
  ],
  slides: [
    {
      id: 'api-overview',
      title: 'API Architecture and Endpoints',
      duration: 240, // 4 minutes
      talkingPoints: [
        'Our API provides 6 core endpoints for complete platform integration.',
        'Authentication uses institutional-grade API keys with rate limiting and monitoring.',
        'All endpoints support both REST and WebSocket for real-time data.',
        'Here\'s the interactive API explorer with live endpoints you can test.',
        '[Demonstrate live API calls]'
      ],
      keyMessages: [
        '6 core endpoints with REST and WebSocket support',
        'Institutional-grade authentication and monitoring',
        'Interactive API explorer for testing'
      ],
      transitions: [
        'The blockchain infrastructure is equally robust...'
      ],
      demoActions: [
        'data-demo="api-explorer"',
        'data-demo="endpoint-testing"'
      ]
    },
    // Additional technical slides would continue here...
  ],
  appendix: {
    qnaPrep: [
      'Q: What\'s your API rate limiting policy?',
      'A: 1000 requests per minute for standard endpoints, unlimited for WebSocket subscriptions with institutional accounts.',

      'Q: Do you provide SDKs for different programming languages?',
      'A: Yes, we have official SDKs for TypeScript/JavaScript, Python, and Go. Community SDKs available for other languages.',

      'Q: How do you handle system downtime and failover?',
      'A: Multi-region deployment with 99.9% uptime SLA. Automatic failover and real-time status monitoring.'
    ],
    followUpMaterials: [
      'Complete API documentation with code examples',
      'SDK downloads and integration guides',
      'System architecture diagrams',
      'Security audit reports',
      'Performance benchmarking results'
    ],
    nextSteps: [
      'Provide sandbox API access',
      'Schedule technical integration workshop',
      'Review system requirements and infrastructure',
      'Set up monitoring and alerting',
      'Begin pilot integration development'
    ]
  }
};

export const PRESENTATION_SCRIPTS: Record<string, PresentationScript> = {
  'investor-briefing': INVESTOR_BRIEFING_SCRIPT,
  'technical-demo': TECHNICAL_DEMO_SCRIPT
};

// Utility functions for presentation management
export function getPresentationScript(id: string): PresentationScript | null {
  return PRESENTATION_SCRIPTS[id] || null;
}

export function getCurrentSlide(script: PresentationScript, elapsedTime: number): PresentationSlide | null {
  let cumulative = 0;
  for (const slide of script.slides) {
    cumulative += slide.duration;
    if (elapsedTime <= cumulative) {
      return slide;
    }
  }
  return script.slides[script.slides.length - 1]; // Return last slide if over time
}

export function getPresentationProgress(script: PresentationScript, elapsedTime: number): number {
  const totalDuration = script.slides.reduce((sum, slide) => sum + slide.duration, 0);
  return Math.min(elapsedTime / totalDuration, 1);
}

export function getSlideProgress(slide: PresentationSlide, slideElapsedTime: number): number {
  return Math.min(slideElapsedTime / slide.duration, 1);
}

export default PRESENTATION_SCRIPTS;