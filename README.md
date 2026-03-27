# WREI Trading Platform

A Next.js 14 application demonstrating Water Roads' WREI carbon credit trading platform. Features an AI negotiation agent powered by Claude API that negotiates the sale of WREI-verified carbon credits with human buyers.

![Platform Demo](public/banner.png)

## Features

### Core Platform Capabilities
- **AI-Powered Negotiation**: Claude API-driven negotiation agent with sophisticated strategies
- **11 Buyer Personas**: Pre-configured buyer types including 5 original personas plus 6 advanced scenarios
- **Real-Time Analytics**: Live negotiation metrics and progress tracking
- **Dynamic Pricing**: WREI Pricing Index integration with market context
- **Security Defence Layers**: Price floor enforcement, concession limits, input sanitisation
- **Australian English**: Localised language throughout the platform

### **Stage 2: AI-Enhanced Platform (March 2026)**
- **🎯 AI Demo Orchestration**: Intelligent tour management with contextual guidance
- **🧠 Dynamic Scenario Generation**: AI-powered market simulation and stress testing
- **📊 Intelligent Analytics Dashboard**: Predictive insights with machine learning
- **🎨 Adaptive Presentation Layer**: Audience-specific content optimization
- **👥 Multi-Audience System**: Executive, Technical, and Compliance interfaces

### Advanced Capabilities
- **Investment Calculator**: Sophisticated financial modelling with scenario comparison
- **Compliance Dashboard**: Real-time regulatory compliance monitoring
- **Demo Mode**: Guided tours with pre-populated data and contextual overlays
- **Developer Portal**: API Explorer with comprehensive documentation
- **Scenario Simulation**: Market stress testing and portfolio optimization
- **Performance Monitoring**: Real-time system health and analytics
- **Committee Mode**: Multi-stakeholder negotiation interface
- **Institutional Onboarding**: 6-step KYC/AML compliance workflow

## Technology Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom WREI design system
- **AI Engine**: Anthropic Claude API (@anthropic-ai/sdk) - Sonnet 4 for dev, Opus 4.6 for production
- **Charts & Visualization**: Recharts with custom WREI components
- **Icons**: Heroicons React library
- **State Management**: React useState/useReducer + Zustand for demo mode
- **Testing**: Jest + React Testing Library + Playwright E2E
- **Deployment**: Vercel (optimised for free tier)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (Claude API access)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wrei-trading-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=your_claude_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /page.tsx                           # Landing page (Water Roads branding)
  /negotiate/page.tsx                 # Main negotiation interface
  /calculator/page.tsx                # Investment calculator
  /compliance/page.tsx                # Compliance dashboard
  /demo/page.tsx                     # Demo mode landing
  /developer/page.tsx                # API Explorer and documentation
  /institutional/portal/page.tsx     # Institutional onboarding
  /performance/page.tsx              # Performance monitoring
  /scenario/page.tsx                 # Scenario simulation
  /api
    /negotiate/route.ts              # Core negotiation engine (Claude API)
    /analytics/route.ts              # Financial calculations
    /analytics/predict/route.ts      # **Stage 2:** Predictive analytics
    /scenarios/generate/route.ts     # **Stage 2:** Scenario generation
    /presentation/adapt/route.ts     # **Stage 2:** Adaptive presentation
    /compliance/route.ts             # Compliance reporting
    /market-data/route.ts           # Market data feeds
    /metadata/route.ts              # Token metadata
    /performance/route.ts           # Performance monitoring
/components
  /analytics/                       # Analytics dashboards and charts
  /audience/                       # **Stage 2:** Multi-audience system
  /orchestration/                  # **Stage 2:** Demo orchestration
  /generation/                     # **Stage 2:** Scenario generation
  /presentation/                   # **Stage 2:** Adaptive presentation
  /institutional/                  # Institutional onboarding components
  /negotiation/                    # Negotiation-specific UI components
  /charts/                         # Recharts-based visualization components
  /demo/                          # Demo mode and tour overlays
  /professional/                  # Professional-grade UI components
/lib
  /types.ts                       # TypeScript type definitions
  /personas.ts                    # 11 buyer persona configurations
  /negotiation-config.ts          # Pricing and constraint parameters
  /defence.ts                     # Security layers and validation
  /analytics-utils.ts             # Analytics utility functions
  /ai-scenario-generation/        # **Stage 2:** AI scenario engine
  /demo-mode/                     # Demo state management (Zustand)
  /config/                        # **Stage 2:** Configuration modules
  /services/                      # **Stage 2:** Service layer
/hooks
  /useLivePricing.ts             # **Stage 2:** Live pricing data hook
/__tests__                        # Jest + React Testing Library (80+ test files)
/e2e                             # Playwright end-to-end tests
/docs                            # Comprehensive documentation suite (v2.0)
/public                          # Static assets and branding
```

## Configuration

### Negotiation Parameters

Key pricing and constraint settings in `/lib/negotiation-config.ts`:

- **Base Price**: $100/t (WREI Pricing Index reference)
- **WREI Premium**: 1.5× multiplier
- **Anchor Price**: $150/t
- **Price Floor**: $120/t (absolute minimum)
- **Max Concession per Round**: 5%
- **Max Total Concession**: 20% from anchor price

### Buyer Personas

**Core Personas (5):**
1. **Corporate Compliance Officer** - Time-pressured, audit-focused, risk-averse
2. **ESG Fund Portfolio Manager** - Quality-driven, sophisticated, premium-tolerant
3. **Carbon Trading Desk Analyst** - Transactional, volume-focused, price-aggressive
4. **Sustainability Director** - Values-driven, smaller budget, greenwashing-concerned
5. **Government Procurement Officer** - Process-driven, multi-approval required

**Advanced Scenario Personas (6):**
6. **DeFi Yield Farming Scenario** - Decentralized finance integration and yield optimization
7. **ESG Impact Scenario** - Environmental impact measurement and reporting
8. **Family Office Scenario** - High-net-worth family wealth preservation
9. **Infrastructure Fund Scenario** - Large-scale infrastructure project financing
10. **Sovereign Wealth Fund Scenario** - Nation-state level investment strategies
11. **Free Play Mode** - Unrestricted negotiation for custom scenarios

## Security & Defence Layers

The platform implements multiple defence layers:

- **Price Floor Enforcement**: Hard $120/t minimum enforced in application code
- **Concession Limits**: Maximum 5% per round, 20% total enforced programmatically
- **Input Sanitisation**: Injection attempt filtering before Claude API calls
- **Output Validation**: Internal reasoning stripped from client responses
- **API Key Protection**: Anthropic credentials never exposed to client-side code

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables in Vercel dashboard**
   - Add `ANTHROPIC_API_KEY` to your Vercel project settings

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Alternative Deployment

The application works on any Next.js-compatible hosting platform:
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Netlify

## API Endpoints

### POST `/api/negotiate`

Main negotiation endpoint for Claude API integration.

**Request Body:**
```json
{
  "message": "buyer message text",
  "negotiationState": {
    "round": 1,
    "phase": "opening",
    "currentOfferPrice": 150,
    // ... full negotiation state
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "agent response text",
  "negotiationState": {
    // updated state
  }
}
```

## Infrastructure Context

**Note**: Zoniqx integration references are for agent knowledge only. No live API connections exist in this demo.

The WREI platform architecture separates proprietary verification and negotiation capabilities from infrastructure layers:

- **Settlement**: Zoniqx zConnect (T+0 atomic, cross-chain)
- **Tokenisation**: Zoniqx zProtocol (DyCIST/ERC-7518, CertiK-audited)
- **Compliance**: Zoniqx zCompliance (AI-powered, 20+ jurisdictions)
- **Identity/KYC**: Zoniqx zIdentity (jurisdiction-based access control)

## Development Guidelines

### Code Style

- Australian English spelling throughout (`organised`, `recognised`, `colour`)
- Single-file components with Tailwind CSS classes
- No separate CSS files
- TypeScript strict mode enabled

### Security Requirements

- **NEVER** expose `ANTHROPIC_API_KEY` to client-side code
- **ALWAYS** enforce price floors and concession limits in application logic
- **NEVER** delegate pricing constraints to LLM instructions alone
- Validate all inputs and sanitise outputs

### State Management

- Use React `useState`/`useReducer` only
- No `localStorage` or `sessionStorage` usage
- All state must be ephemeral and session-based

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### API Connection Issues

1. Verify `ANTHROPIC_API_KEY` is correctly set in `.env.local`
2. Check API key has sufficient credits and permissions
3. Ensure environment variables are configured in production deployment

### TypeScript Errors

```bash
# Check types
npm run type-check

# Fix common issues
npm run lint --fix
```

## License

This project is a demonstration platform for Water Roads' WREI technology.

## Support

For technical issues or questions:
- Check the troubleshooting section above
- Review console logs for API connection issues
- Ensure all environment variables are correctly configured

---

**Water Roads Engineering** | Verified Carbon Credit Trading Platform# Deployment trigger
