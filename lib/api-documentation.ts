/**
 * WREI API v1 Documentation System
 *
 * Structured documentation for all v1 REST API endpoints.
 * Provides schemas, example payloads, error codes, and rate limit information
 * for the Developer Portal / API Explorer.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  enum?: string[];
  default?: string | number | boolean;
  example?: string | number | boolean;
  min?: number;
  max?: number;
}

export interface ApiEndpointAction {
  name: string;
  description: string;
  parameters: ApiParameter[];
  exampleRequest: Record<string, unknown>;
  exampleResponse: Record<string, unknown>;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  category: ApiCategory;
  title: string;
  description: string;
  authentication: AuthenticationInfo;
  rateLimit: RateLimitInfo;
  actions: ApiEndpointAction[];
  errorCodes: ErrorCode[];
  notes?: string[];
}

export interface AuthenticationInfo {
  required: boolean;
  header: string;
  description: string;
  devMode: string;
}

export interface RateLimitInfo {
  maxRequests: number;
  windowMs: number;
  windowDescription: string;
}

export interface ErrorCode {
  code: number;
  name: string;
  description: string;
}

export type ApiCategory =
  | 'market-data'
  | 'trading'
  | 'clients'
  | 'compliance'
  | 'correspondence'
  | 'webhooks';

export interface ApiCategoryInfo {
  id: ApiCategory;
  label: string;
  description: string;
  icon: string;
}

// =============================================================================
// API CATEGORIES
// =============================================================================

export const apiCategories: ApiCategoryInfo[] = [
  {
    id: 'market-data',
    label: 'Market Data',
    description: 'ESC/VEEC/ACCU prices, order book, instrument metadata',
    icon: 'globe',
  },
  {
    id: 'trading',
    label: 'Trading',
    description: 'Trade records and AI-powered negotiation sessions',
    icon: 'exchange',
  },
  {
    id: 'clients',
    label: 'Clients',
    description: 'Client management, holdings, and entity data',
    icon: 'cube',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Surrender status, shortfall tracking, penalty exposure',
    icon: 'shield',
  },
  {
    id: 'correspondence',
    label: 'Correspondence',
    description: 'Procurement, email negotiation, reporting, settlement',
    icon: 'chart',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    description: 'Event subscriptions with HMAC-SHA256 signed delivery',
    icon: 'gauge',
  },
];

// =============================================================================
// COMMON HELPERS
// =============================================================================

const standardAuth: AuthenticationInfo = {
  required: true,
  header: 'X-API-Key',
  description: 'Include your API key in the X-API-Key header. Keys are provisioned during institutional onboarding.',
  devMode: 'When DATABASE_URL is not configured, the auth middleware returns 503. Use a valid API key for all requests.',
};

const commonErrors: ErrorCode[] = [
  { code: 400, name: 'Bad Request', description: 'Invalid request parameters or malformed JSON body' },
  { code: 401, name: 'Unauthorised', description: 'Missing or invalid API key' },
  { code: 403, name: 'Forbidden', description: 'Insufficient permissions for this operation' },
  { code: 500, name: 'Internal Error', description: 'Unexpected server error' },
];

const readErrors: ErrorCode[] = [
  { code: 401, name: 'Unauthorised', description: 'Missing or invalid API key' },
  { code: 403, name: 'Forbidden', description: 'No organisation associated with account' },
  { code: 500, name: 'Internal Error', description: 'Failed to retrieve data' },
];

const stdRate: RateLimitInfo = {
  maxRequests: 100,
  windowMs: 60000,
  windowDescription: '100 requests per minute',
};

const writeRate: RateLimitInfo = {
  maxRequests: 30,
  windowMs: 60000,
  windowDescription: '30 requests per minute',
};

// =============================================================================
// MARKET DATA ENDPOINTS
// =============================================================================

const marketPrices: ApiEndpoint = {
  id: 'market-prices',
  path: '/api/v1/market/prices',
  method: 'GET',
  category: 'market-data',
  title: 'Current Prices',
  description: 'Retrieve current spot prices for all instruments, or filter by a specific instrument type. Returns pricing from the WREI Pricing Index including anchor price, floor, ceiling, and source.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_prices',
      description: 'Get current prices for all instruments or a specific type.',
      parameters: [
        { name: 'instrument', type: 'string', required: false, description: 'Filter by instrument type', enum: ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'], example: 'ESC' },
      ],
      exampleRequest: { instrument: 'ESC' },
      exampleResponse: {
        data: [
          {
            instrument: 'ESC',
            category: 'energy_savings',
            displayName: 'Energy Savings Certificate',
            price: 6.34,
            anchorPrice: 9.51,
            priceFloor: 7.61,
            priceCeiling: 14.27,
            currency: 'AUD',
            unitOfMeasure: 'certificate',
            source: 'NSW ESS Registry',
            updatedAt: '2026-04-05T10:00:00.000Z',
          },
        ],
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Invalid instrument type' },
    ...readErrors,
  ],
};

const marketPriceHistory: ApiEndpoint = {
  id: 'market-prices-history',
  path: '/api/v1/market/prices/history',
  method: 'GET',
  category: 'market-data',
  title: 'Price History',
  description: 'Retrieve historical price data for a specific instrument. Returns timestamped price records from the database.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_history',
      description: 'Get price history for an instrument over a specified number of days.',
      parameters: [
        { name: 'instrument', type: 'string', required: true, description: 'Instrument type', enum: ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'], example: 'ESC' },
        { name: 'days', type: 'number', required: false, description: 'Number of days of history (1-365)', default: 30, min: 1, max: 365, example: 30 },
      ],
      exampleRequest: { instrument: 'ESC', days: 30 },
      exampleResponse: {
        data: [
          { instrument: 'ESC', price: 6.34, source: 'NSW ESS Registry', recordedAt: '2026-04-05T10:00:00.000Z' },
          { instrument: 'ESC', price: 6.28, source: 'NSW ESS Registry', recordedAt: '2026-04-04T10:00:00.000Z' },
        ],
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing instrument param or invalid days range' },
    ...readErrors,
  ],
};

const marketOrderbook: ApiEndpoint = {
  id: 'market-orderbook',
  path: '/api/v1/market/orderbook',
  method: 'GET',
  category: 'market-data',
  title: 'Order Book',
  description: 'Retrieve the current order book for an instrument. In the demo environment this returns simulated market depth with 5 levels of bids and asks.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_orderbook',
      description: 'Get order book depth for an instrument.',
      parameters: [
        { name: 'instrument', type: 'string', required: true, description: 'Instrument type', enum: ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'], example: 'ESC' },
      ],
      exampleRequest: { instrument: 'ESC' },
      exampleResponse: {
        data: {
          instrument: 'ESC',
          currency: 'AUD',
          midPrice: 6.34,
          spread: 0.03,
          bids: [{ price: 6.33, quantity: 2500, orders: 3 }],
          asks: [{ price: 6.35, quantity: 1800, orders: 2 }],
          source: 'simulated',
          updatedAt: '2026-04-05T10:00:00.000Z',
        },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing or invalid instrument type' },
    ...readErrors,
  ],
};

const marketInstruments: ApiEndpoint = {
  id: 'market-instruments',
  path: '/api/v1/market/instruments',
  method: 'GET',
  category: 'market-data',
  title: 'Instruments',
  description: 'List all tradeable instruments with current configuration including pricing, negotiation style, jurisdictions, and regulatory classification.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_instruments',
      description: 'List all tradeable instruments.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        data: [
          {
            instrumentType: 'ESC',
            category: 'energy_savings',
            displayName: 'Energy Savings Certificate',
            ticker: 'ESC',
            currency: 'AUD',
            unitOfMeasure: 'certificate',
            currentSpot: 6.34,
            anchorPrice: 9.51,
            priceFloor: 7.61,
            priceCeiling: 14.27,
            negotiationStyle: 'institutional',
            keyConsiderations: ['ESS Rule compliance', 'Surrender deadline awareness'],
            jurisdictions: ['NSW'],
            regulatoryClassification: 'not_financial_product',
          },
        ],
      },
    },
  ],
  errorCodes: readErrors,
};

// =============================================================================
// TRADING ENDPOINTS
// =============================================================================

const tradesList: ApiEndpoint = {
  id: 'trades-list',
  path: '/api/v1/trades',
  method: 'GET',
  category: 'trading',
  title: 'List Trades',
  description: 'Retrieve paginated trade records for the authenticated organisation. Filter by status or instrument.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_trades',
      description: 'List trades with pagination and optional filters.',
      parameters: [
        { name: 'page', type: 'number', required: false, description: 'Page number (1-based)', default: 1, example: 1 },
        { name: 'limit', type: 'number', required: false, description: 'Results per page (max 200)', default: 50, max: 200, example: 20 },
        { name: 'status', type: 'string', required: false, description: 'Filter by trade status', example: 'pending' },
        { name: 'instrument_id', type: 'string', required: false, description: 'Filter by instrument ID', example: 'ESC' },
      ],
      exampleRequest: { page: 1, limit: 20 },
      exampleResponse: {
        data: [
          {
            id: 'trd_abc123',
            instrument_id: 'ESC',
            direction: 'buy',
            quantity: 1000,
            price_per_unit: 6.50,
            total_value: 6500,
            currency: 'AUD',
            status: 'confirmed',
            executed_at: '2026-04-05T09:30:00.000Z',
          },
        ],
        meta: { page: 1, limit: 20, total: 45, pages: 3 },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Invalid pagination parameters' },
    ...readErrors,
  ],
};

const tradesCreate: ApiEndpoint = {
  id: 'trades-create',
  path: '/api/v1/trades',
  method: 'POST',
  category: 'trading',
  title: 'Create Trade',
  description: 'Record a new trade. Fires a trade.created webhook event. Requires admin, broker, or trader role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'create_trade',
      description: 'Create a new trade record.',
      parameters: [
        { name: 'instrument_id', type: 'string', required: true, description: 'Instrument type', example: 'ESC' },
        { name: 'direction', type: 'string', required: true, description: 'Trade direction', enum: ['buy', 'sell'] },
        { name: 'quantity', type: 'number', required: true, description: 'Number of units', example: 1000 },
        { name: 'price_per_unit', type: 'number', required: true, description: 'Price per unit in currency', example: 6.50 },
        { name: 'currency', type: 'string', required: false, description: 'Currency code', default: 'AUD' },
        { name: 'buyer_persona', type: 'string', required: false, description: 'Buyer persona type' },
        { name: 'metadata', type: 'object', required: false, description: 'Additional trade metadata' },
      ],
      exampleRequest: {
        instrument_id: 'ESC',
        direction: 'buy',
        quantity: 1000,
        price_per_unit: 6.50,
        currency: 'AUD',
      },
      exampleResponse: {
        data: {
          id: 'trd_abc123',
          instrument_id: 'ESC',
          direction: 'buy',
          quantity: 1000,
          price_per_unit: 6.50,
          total_value: 6500,
          currency: 'AUD',
          status: 'pending',
          executed_at: '2026-04-05T09:30:00.000Z',
        },
      },
    },
  ],
  errorCodes: commonErrors,
  notes: ['Fires trade.created webhook event on success.'],
};

const tradesDetail: ApiEndpoint = {
  id: 'trades-detail',
  path: '/api/v1/trades/:id',
  method: 'GET',
  category: 'trading',
  title: 'Trade Detail',
  description: 'Retrieve a single trade by ID, including settlement timeline and status if available.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_trade',
      description: 'Get trade detail with settlement information.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Trade ID', example: 'trd_abc123' },
      ],
      exampleRequest: { id: 'trd_abc123' },
      exampleResponse: {
        data: {
          id: 'trd_abc123',
          instrument_id: 'ESC',
          direction: 'buy',
          quantity: 1000,
          price_per_unit: 6.50,
          total_value: 6500,
          currency: 'AUD',
          status: 'confirmed',
          executed_at: '2026-04-05T09:30:00.000Z',
          settlement: {
            id: 'stl_xyz789',
            method: 'tessa_transfer',
            status: 'processing',
            blockchain_hash: null,
            settled_at: null,
          },
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Trade not found' },
    ...readErrors,
  ],
};

const negotiateCreate: ApiEndpoint = {
  id: 'negotiate-create',
  path: '/api/v1/trades/negotiate',
  method: 'POST',
  category: 'trading',
  title: 'Initiate Negotiation',
  description: 'Start a new AI-powered negotiation session for a specific instrument. Returns session ID, anchor price, and pricing constraints. Requires admin, broker, or trader role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'initiate_negotiation',
      description: 'Create a new AI negotiation session.',
      parameters: [
        { name: 'instrument', type: 'string', required: true, description: 'Instrument to negotiate', enum: ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'], example: 'ESC' },
        { name: 'persona_type', type: 'string', required: true, description: 'Buyer persona', enum: ['corporate_compliance', 'esg_fund', 'trading_desk', 'sustainability_director', 'government_procurement', 'free_play'] },
        { name: 'quantity', type: 'number', required: false, description: 'Number of units to negotiate', example: 5000 },
        { name: 'buyer_profile', type: 'object', required: false, description: 'Additional buyer context' },
      ],
      exampleRequest: {
        instrument: 'ESC',
        persona_type: 'corporate_compliance',
        quantity: 5000,
      },
      exampleResponse: {
        data: {
          id: 'neg_def456',
          instrument: 'ESC',
          personaType: 'corporate_compliance',
          anchorPrice: 9.51,
          currentOffer: 9.51,
          priceFloor: 7.61,
          phase: 'opening',
          round: 0,
          status: 'active',
          pricing: {
            currency: 'AUD',
            unitOfMeasure: 'certificate',
            volumeDiscount: 0.02,
            maxConcessionPerRound: 0.05,
            maxTotalConcession: 0.20,
          },
          startedAt: '2026-04-05T10:00:00.000Z',
        },
      },
    },
  ],
  errorCodes: commonErrors,
  notes: [
    'Price floor enforced in application code, not delegated to the LLM.',
    'Max 5% concession per round enforced server-side.',
    'Max 20% total concession from anchor price enforced server-side.',
  ],
};

const negotiateStatus: ApiEndpoint = {
  id: 'negotiate-status',
  path: '/api/v1/trades/negotiate/:id',
  method: 'GET',
  category: 'trading',
  title: 'Negotiation Status',
  description: 'Retrieve the current state of a negotiation session including round, phase, offer history, and outcome.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_negotiation',
      description: 'Get negotiation status and transcript.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Negotiation session ID', example: 'neg_def456' },
      ],
      exampleRequest: { id: 'neg_def456' },
      exampleResponse: {
        data: {
          id: 'neg_def456',
          personaType: 'corporate_compliance',
          instrument: 'ESC',
          phase: 'mid_negotiation',
          round: 3,
          anchorPrice: 9.51,
          currentOffer: 8.80,
          priceFloor: 7.61,
          totalConcession: 0.075,
          outcome: null,
          messages: [
            { role: 'buyer', content: 'We need 5,000 ESCs for Q2 surrender.', timestamp: '2026-04-05T10:01:00.000Z' },
          ],
          startedAt: '2026-04-05T10:00:00.000Z',
          completedAt: null,
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Negotiation session not found' },
    ...readErrors,
  ],
};

const negotiateMessage: ApiEndpoint = {
  id: 'negotiate-message',
  path: '/api/v1/trades/negotiate/:id',
  method: 'POST',
  category: 'trading',
  title: 'Send Negotiation Message',
  description: 'Send a buyer message or instruction to an active negotiation session. Advances the round counter. Fires negotiation.completed webhook if the session concludes.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'send_message',
      description: 'Send a message to the negotiation session.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Negotiation session ID (URL param)', example: 'neg_def456' },
        { name: 'message', type: 'string', required: true, description: 'Buyer message or instruction', example: 'We can offer $8.50 per certificate for the full lot.' },
      ],
      exampleRequest: {
        message: 'We can offer $8.50 per certificate for the full lot.',
      },
      exampleResponse: {
        data: {
          id: 'neg_def456',
          round: 4,
          phase: 'mid_negotiation',
          currentOffer: 8.56,
          totalConcession: 0.10,
          outcome: null,
          messageCount: 8,
        },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing message field or negotiation already concluded' },
    { code: 404, name: 'Not Found', description: 'Negotiation session not found' },
    ...readErrors,
  ],
  notes: ['Fires negotiation.completed webhook when the session concludes.'],
};

// =============================================================================
// CLIENT ENDPOINTS
// =============================================================================

const clientsList: ApiEndpoint = {
  id: 'clients-list',
  path: '/api/v1/clients',
  method: 'GET',
  category: 'clients',
  title: 'List Clients',
  description: 'Retrieve all clients for the authenticated organisation.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_clients',
      description: 'List all clients in the organisation.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        data: [
          {
            id: 'cli_001',
            name: 'Acme Energy Pty Ltd',
            entity_type: 'obligated_entity',
            contact_email: 'compliance@acme-energy.com.au',
            abn: '12345678901',
            ess_participant_id: 'ESS-001',
            annual_esc_target: 50000,
            is_active: true,
          },
        ],
      },
    },
  ],
  errorCodes: readErrors,
};

const clientsCreate: ApiEndpoint = {
  id: 'clients-create',
  path: '/api/v1/clients',
  method: 'POST',
  category: 'clients',
  title: 'Create Client',
  description: 'Create a new client record. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'create_client',
      description: 'Create a new client.',
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'Client name', example: 'Acme Energy Pty Ltd' },
        { name: 'entity_type', type: 'string', required: true, description: 'Entity classification', enum: ['acp', 'obligated_entity', 'government', 'corporate', 'institutional'] },
        { name: 'contact_email', type: 'string', required: false, description: 'Primary contact email' },
        { name: 'contact_name', type: 'string', required: false, description: 'Primary contact name' },
        { name: 'abn', type: 'string', required: false, description: 'Australian Business Number' },
        { name: 'ess_participant_id', type: 'string', required: false, description: 'ESS participant ID' },
        { name: 'annual_esc_target', type: 'number', required: false, description: 'Annual ESC surrender target' },
        { name: 'annual_veec_target', type: 'number', required: false, description: 'Annual VEEC surrender target' },
        { name: 'safeguard_facility_id', type: 'string', required: false, description: 'Safeguard Mechanism facility ID' },
        { name: 'metadata', type: 'object', required: false, description: 'Additional metadata' },
      ],
      exampleRequest: {
        name: 'Acme Energy Pty Ltd',
        entity_type: 'obligated_entity',
        contact_email: 'compliance@acme-energy.com.au',
        abn: '12345678901',
        ess_participant_id: 'ESS-001',
        annual_esc_target: 50000,
      },
      exampleResponse: {
        data: {
          id: 'cli_001',
          name: 'Acme Energy Pty Ltd',
          entity_type: 'obligated_entity',
          organisation_id: 'org_ng001',
          contact_email: 'compliance@acme-energy.com.au',
          abn: '12345678901',
          is_active: true,
          created_at: '2026-04-05T10:00:00.000Z',
        },
      },
    },
  ],
  errorCodes: commonErrors,
};

const clientsDetail: ApiEndpoint = {
  id: 'clients-detail',
  path: '/api/v1/clients/:id',
  method: 'GET',
  category: 'clients',
  title: 'Client Detail',
  description: 'Retrieve a single client by ID. Organisation-scoped.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_client',
      description: 'Get client detail.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Client ID', example: 'cli_001' },
      ],
      exampleRequest: { id: 'cli_001' },
      exampleResponse: {
        data: {
          id: 'cli_001',
          name: 'Acme Energy Pty Ltd',
          entity_type: 'obligated_entity',
          contact_email: 'compliance@acme-energy.com.au',
          abn: '12345678901',
          ess_participant_id: 'ESS-001',
          annual_esc_target: 50000,
          annual_veec_target: 20000,
          is_active: true,
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Client not found' },
    ...readErrors,
  ],
};

const clientsUpdate: ApiEndpoint = {
  id: 'clients-update',
  path: '/api/v1/clients/:id',
  method: 'PUT',
  category: 'clients',
  title: 'Update Client',
  description: 'Update an existing client record. Requires admin or broker role. Organisation-scoped.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'update_client',
      description: 'Update client fields.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Client ID (URL param)', example: 'cli_001' },
        { name: 'name', type: 'string', required: false, description: 'Updated client name' },
        { name: 'contact_email', type: 'string', required: false, description: 'Updated contact email' },
        { name: 'annual_esc_target', type: 'number', required: false, description: 'Updated ESC target' },
        { name: 'metadata', type: 'object', required: false, description: 'Updated metadata' },
      ],
      exampleRequest: {
        annual_esc_target: 55000,
        contact_email: 'new-compliance@acme-energy.com.au',
      },
      exampleResponse: {
        data: {
          id: 'cli_001',
          name: 'Acme Energy Pty Ltd',
          annual_esc_target: 55000,
          contact_email: 'new-compliance@acme-energy.com.au',
          updated_at: '2026-04-05T11:00:00.000Z',
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Client not found' },
    ...commonErrors,
  ],
};

const clientsHoldings: ApiEndpoint = {
  id: 'clients-holdings',
  path: '/api/v1/clients/:id/holdings',
  method: 'GET',
  category: 'clients',
  title: 'Client Holdings',
  description: 'Retrieve a client\'s certificate and token holdings with a summary grouped by instrument type.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_holdings',
      description: 'Get client holdings with instrument summary.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Client ID', example: 'cli_001' },
      ],
      exampleRequest: { id: 'cli_001' },
      exampleResponse: {
        data: {
          clientId: 'cli_001',
          clientName: 'Acme Energy Pty Ltd',
          holdings: [
            { instrument_type: 'ESC', quantity: 25000, total_cost: 162500, acquired_at: '2026-03-15T10:00:00.000Z' },
          ],
          summary: [
            { instrumentType: 'ESC', totalQuantity: 25000, totalCost: 162500, positions: 1 },
          ],
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Client not found' },
    ...readErrors,
  ],
};

// =============================================================================
// COMPLIANCE ENDPOINTS
// =============================================================================

const clientsCompliance: ApiEndpoint = {
  id: 'clients-compliance',
  path: '/api/v1/clients/:id/compliance',
  method: 'GET',
  category: 'compliance',
  title: 'Client Compliance',
  description: 'Retrieve a client\'s compliance/surrender status across all schemes. Optionally filter by compliance year.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_compliance',
      description: 'Get compliance position for a client.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Client ID', example: 'cli_001' },
        { name: 'year', type: 'string', required: false, description: 'Compliance year filter', example: '2026' },
      ],
      exampleRequest: { id: 'cli_001', year: '2026' },
      exampleResponse: {
        data: {
          clientId: 'cli_001',
          clientName: 'Acme Energy Pty Ltd',
          complianceYear: '2026',
          surrenderStatus: [
            {
              scheme: 'ESS',
              target: 50000,
              surrendered: 25000,
              shortfall: 25000,
              status: 'shortfall',
              penalty_exposure: 737000,
              deadline: '2026-11-30',
            },
          ],
          summary: {
            totalSchemes: 1,
            totalShortfall: 25000,
            totalPenaltyExposure: 737000,
            atRisk: 1,
            compliant: 0,
          },
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Client not found' },
    ...readErrors,
  ],
};

const complianceSummary: ApiEndpoint = {
  id: 'compliance-summary',
  path: '/api/v1/clients/compliance/summary',
  method: 'GET',
  category: 'compliance',
  title: 'Compliance Summary',
  description: 'All clients\' compliance positions in a single call. Returns per-client surrender status and aggregate penalty exposure.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_summary',
      description: 'Get organisation-wide compliance summary.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        data: {
          clients: [
            {
              clientId: 'cli_001',
              clientName: 'Acme Energy Pty Ltd',
              entityType: 'obligated_entity',
              isActive: true,
              schemes: 2,
              totalShortfall: 25000,
              totalPenaltyExposure: 737000,
              status: 'at_risk',
            },
          ],
          summary: {
            totalClients: 3,
            atRisk: 1,
            compliant: 2,
            aggregatePenaltyExposure: 737000,
          },
        },
      },
    },
  ],
  errorCodes: readErrors,
};

// =============================================================================
// CORRESPONDENCE ENDPOINTS
// =============================================================================

const correspondenceList: ApiEndpoint = {
  id: 'correspondence-list',
  path: '/api/v1/correspondence',
  method: 'GET',
  category: 'correspondence',
  title: 'List Correspondence',
  description: 'List correspondence records for the organisation. Filter by type, status, or client.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_correspondence',
      description: 'List correspondence with optional filters.',
      parameters: [
        { name: 'type', type: 'string', required: false, description: 'Correspondence type filter', enum: ['rfq', 'counter_offer', 'confirmation', 'report', 'settlement'] },
        { name: 'status', type: 'string', required: false, description: 'Status filter', enum: ['drafted', 'approved', 'sent', 'rejected'] },
        { name: 'client_id', type: 'string', required: false, description: 'Filter by client ID' },
      ],
      exampleRequest: { type: 'rfq', status: 'drafted' },
      exampleResponse: {
        data: [
          {
            id: 'cor_001',
            type: 'rfq',
            status: 'drafted',
            subject: 'RFQ: 25,000 ESCs for Acme Energy',
            counterpartyName: 'GreenTrade Solutions',
            clientId: 'cli_001',
            createdAt: '2026-04-05T10:00:00.000Z',
          },
        ],
      },
    },
  ],
  errorCodes: readErrors,
};

const correspondenceInbound: ApiEndpoint = {
  id: 'correspondence-inbound',
  path: '/api/v1/correspondence/inbound',
  method: 'POST',
  category: 'correspondence',
  title: 'Process Inbound Email',
  description: 'Receive forwarded email content, match it to an active negotiation thread, parse the offer using AI, and optionally generate a counter-offer. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'process_inbound',
      description: 'Process an inbound email and match to a negotiation thread.',
      parameters: [
        { name: 'body', type: 'string', required: true, description: 'Email body content', example: 'Hi, we can offer $6.20 per ESC for the 25,000 lot. Best regards, Sarah.' },
        { name: 'threadId', type: 'string', required: false, description: 'Thread ID to match (if known)' },
        { name: 'counterpartyEmail', type: 'string', required: false, description: 'Counterparty email for thread matching' },
        { name: 'subject', type: 'string', required: false, description: 'Email subject line' },
      ],
      exampleRequest: {
        body: 'Hi, we can offer $6.20 per ESC for the 25,000 lot. Best regards, Sarah.',
        counterpartyEmail: 'sarah@greentrade.com.au',
        subject: 'Re: RFQ - 25,000 ESCs',
      },
      exampleResponse: {
        threadId: 'thr_001',
        state: 'counter_drafted',
        parsedOffer: { price: 6.20, quantity: 25000, confidence: 0.92 },
        threatLevel: 'low',
        requiresManualReview: false,
        counterOffer: {
          counterPrice: 7.85,
          concessionThisRound: 0.05,
          remainingRoom: 0.15,
          suggestedBody: 'Thank you for your offer. Given current market conditions...',
          state: 'counter_drafted',
        },
        round: 2,
        currentOurPrice: 7.85,
        currentTheirPrice: 6.20,
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing email body or invalid payload' },
    { code: 404, name: 'Not Found', description: 'Could not match to an active negotiation thread' },
    ...commonErrors,
  ],
};

const correspondenceProcurement: ApiEndpoint = {
  id: 'correspondence-procurement',
  path: '/api/v1/correspondence/procurement',
  method: 'GET',
  category: 'correspondence',
  title: 'Procurement Recommendations',
  description: 'Evaluate all clients for procurement needs based on compliance shortfalls. Returns risk-classified recommendations (red/amber/green). Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_recommendations',
      description: 'Get procurement recommendations for all clients.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        recommendations: [
          {
            clientId: 'cli_001',
            clientName: 'Acme Energy Pty Ltd',
            instrument: 'ESC',
            shortfall: 25000,
            riskLevel: 'red',
            deadline: '2026-11-30',
            penaltyExposure: 737000,
            recommendedAction: 'Immediate procurement required',
          },
        ],
        total: 3,
        byRisk: { red: 1, amber: 1, green: 1 },
      },
    },
  ],
  errorCodes: readErrors,
};

const correspondenceRfqs: ApiEndpoint = {
  id: 'correspondence-rfqs',
  path: '/api/v1/correspondence/procurement/generate-rfqs',
  method: 'POST',
  category: 'correspondence',
  title: 'Generate RFQ Drafts',
  description: 'Generate AI-drafted RFQ emails for a procurement recommendation. The AI drafts are sent for broker review before distribution. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'generate_rfqs',
      description: 'Generate RFQ email drafts for a procurement recommendation.',
      parameters: [
        {
          name: 'recommendation', type: 'object', required: true,
          description: 'Procurement recommendation object with clientId, instrument, and shortfall',
        },
      ],
      exampleRequest: {
        recommendation: {
          clientId: 'cli_001',
          clientName: 'Acme Energy Pty Ltd',
          instrument: 'ESC',
          shortfall: 25000,
          riskLevel: 'red',
          penaltyExposure: 737000,
        },
      },
      exampleResponse: {
        drafts: [
          {
            counterpartyName: 'GreenTrade Solutions',
            subject: 'RFQ: 25,000 ESCs — Acme Energy',
            body: 'Dear GreenTrade team, We are seeking...',
            status: 'drafted',
          },
        ],
        totalDrafts: 3,
        totalTokensUsed: 1250,
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Invalid recommendation object' },
    { code: 404, name: 'Not Found', description: 'No counterparties available for instrument' },
    ...commonErrors,
  ],
};

const correspondenceReportsList: ApiEndpoint = {
  id: 'correspondence-reports-list',
  path: '/api/v1/correspondence/reports',
  method: 'GET',
  category: 'correspondence',
  title: 'List Reports',
  description: 'List generated client position reports. Optionally filter by client ID. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_reports',
      description: 'List generated reports.',
      parameters: [
        { name: 'clientId', type: 'string', required: false, description: 'Filter by client ID' },
      ],
      exampleRequest: { clientId: 'cli_001' },
      exampleResponse: {
        reports: [
          {
            id: 'rpt_001',
            clientId: 'cli_001',
            clientName: 'Acme Energy Pty Ltd',
            period: 'Q1 2026',
            subject: 'Compliance Position Report — Q1 2026',
            status: 'drafted',
            generatedAt: '2026-04-05T10:00:00.000Z',
          },
        ],
        total: 1,
      },
    },
  ],
  errorCodes: readErrors,
};

const correspondenceReportsGenerate: ApiEndpoint = {
  id: 'correspondence-reports-generate',
  path: '/api/v1/correspondence/reports',
  method: 'POST',
  category: 'correspondence',
  title: 'Generate Report',
  description: 'Generate an AI-drafted compliance position report for a specific client, or batch-generate for all clients. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'generate_report',
      description: 'Generate a client position report.',
      parameters: [
        { name: 'clientId', type: 'string', required: false, description: 'Client ID (required unless batch=true)' },
        { name: 'batch', type: 'boolean', required: false, description: 'Generate for all clients', default: false },
        { name: 'period', type: 'string', required: false, description: 'Report period label', example: 'Q1 2026' },
      ],
      exampleRequest: {
        clientId: 'cli_001',
        period: 'Q1 2026',
      },
      exampleResponse: {
        id: 'rpt_001',
        clientId: 'cli_001',
        clientName: 'Acme Energy Pty Ltd',
        period: 'Q1 2026',
        subject: 'Compliance Position Report — Q1 2026',
        body: 'Dear Acme Energy team, Please find enclosed your compliance position summary...',
        status: 'drafted',
        generatedAt: '2026-04-05T10:00:00.000Z',
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'clientId required unless batch is true' },
    { code: 404, name: 'Not Found', description: 'Client not found' },
    ...commonErrors,
  ],
};

const correspondenceSettlement: ApiEndpoint = {
  id: 'correspondence-settlement',
  path: '/api/v1/correspondence/settlement',
  method: 'GET',
  category: 'correspondence',
  title: 'Settlement Status',
  description: 'Retrieve settlement status for pending trades, including TESSA instruction links where applicable.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_settlements',
      description: 'Get settlement status for pending trades.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        data: {
          settlements: [
            {
              tradeId: 'trd_abc123',
              instrumentId: 'ESC',
              direction: 'buy',
              quantity: 1000,
              pricePerUnit: 6.50,
              totalValue: 6500,
              currency: 'AUD',
              tradeStatus: 'confirmed',
              executedAt: '2026-04-05T09:30:00.000Z',
              settlement: {
                id: 'stl_xyz789',
                method: 'tessa_transfer',
                status: 'processing',
                blockchainHash: null,
                settledAt: null,
              },
            },
          ],
          summary: { total: 5, pending: 3, processing: 2 },
        },
      },
    },
  ],
  errorCodes: readErrors,
};

const correspondenceThreads: ApiEndpoint = {
  id: 'correspondence-threads',
  path: '/api/v1/correspondence/threads',
  method: 'GET',
  category: 'correspondence',
  title: 'List Negotiation Threads',
  description: 'List active email negotiation threads for the organisation with current pricing state.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_threads',
      description: 'List active negotiation threads.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        data: [
          {
            id: 'thr_001',
            counterpartyName: 'GreenTrade Solutions',
            counterpartyEmail: 'sarah@greentrade.com.au',
            instrument: 'ESC',
            quantity: 25000,
            state: 'counter_drafted',
            currentOurPrice: 7.85,
            currentTheirPrice: 6.20,
            rounds: 2,
            totalConcessionGiven: 0.05,
            createdAt: '2026-04-04T10:00:00.000Z',
            updatedAt: '2026-04-05T10:00:00.000Z',
          },
        ],
      },
    },
  ],
  errorCodes: readErrors,
};

const correspondenceThreadDetail: ApiEndpoint = {
  id: 'correspondence-thread-detail',
  path: '/api/v1/correspondence/threads/:id',
  method: 'GET',
  category: 'correspondence',
  title: 'Thread Detail',
  description: 'Retrieve full negotiation thread detail including all rounds, pricing history, and current state.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'get_thread',
      description: 'Get full thread detail with all rounds.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Thread ID', example: 'thr_001' },
      ],
      exampleRequest: { id: 'thr_001' },
      exampleResponse: {
        data: {
          id: 'thr_001',
          counterpartyName: 'GreenTrade Solutions',
          counterpartyEmail: 'sarah@greentrade.com.au',
          instrument: 'ESC',
          quantity: 25000,
          state: 'counter_drafted',
          currentOurPrice: 7.85,
          currentTheirPrice: 6.20,
          totalConcessionGiven: 0.05,
          rounds: [
            { direction: 'outbound', type: 'rfq', price: 9.51, sentAt: '2026-04-04T10:00:00.000Z' },
            { direction: 'inbound', type: 'offer', price: 6.20, receivedAt: '2026-04-05T09:00:00.000Z' },
          ],
        },
      },
    },
  ],
  errorCodes: [
    { code: 404, name: 'Not Found', description: 'Thread not found' },
    ...readErrors,
  ],
};

const correspondenceThreadAction: ApiEndpoint = {
  id: 'correspondence-thread-action',
  path: '/api/v1/correspondence/threads/:id',
  method: 'POST',
  category: 'correspondence',
  title: 'Thread Broker Action',
  description: 'Submit a broker action on a negotiation thread: approve a counter-offer, edit a draft, or reject an offer. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'broker_action',
      description: 'Submit a broker action on a thread.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Thread ID (URL param)', example: 'thr_001' },
        { name: 'action', type: 'string', required: true, description: 'Broker action', enum: ['approve', 'edit', 'reject'] },
        { name: 'reason', type: 'string', required: false, description: 'Rejection reason (for reject action)' },
        { name: 'edited_body', type: 'string', required: false, description: 'Edited email body (for edit action)' },
        { name: 'correspondence_id', type: 'string', required: false, description: 'Linked correspondence record ID' },
      ],
      exampleRequest: {
        action: 'approve',
      },
      exampleResponse: {
        data: {
          threadId: 'thr_001',
          state: 'counter_approved',
          message: 'Counter-offer approved and ready to send',
        },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Invalid action or missing required fields for action type' },
    { code: 404, name: 'Not Found', description: 'Thread not found' },
    ...commonErrors,
  ],
};

// =============================================================================
// WEBHOOK ENDPOINTS
// =============================================================================

const webhooksList: ApiEndpoint = {
  id: 'webhooks-list',
  path: '/api/v1/webhooks',
  method: 'GET',
  category: 'webhooks',
  title: 'List Webhooks',
  description: 'List all active webhook registrations for the organisation. Secrets are stripped from the response.',
  authentication: standardAuth,
  rateLimit: stdRate,
  actions: [
    {
      name: 'list_webhooks',
      description: 'List registered webhooks.',
      parameters: [],
      exampleRequest: {},
      exampleResponse: {
        data: [
          {
            id: 'whk_001',
            organisation_id: 'org_ng001',
            url: 'https://hooks.northmore-gordon.com.au/wrei',
            events: ['trade.created', 'trade.settled', 'negotiation.completed'],
            is_active: true,
            created_at: '2026-04-01T10:00:00.000Z',
            updated_at: '2026-04-01T10:00:00.000Z',
          },
        ],
      },
    },
  ],
  errorCodes: readErrors,
};

const webhooksRegister: ApiEndpoint = {
  id: 'webhooks-register',
  path: '/api/v1/webhooks',
  method: 'POST',
  category: 'webhooks',
  title: 'Register Webhook',
  description: 'Register a new webhook endpoint. The secret is returned once on creation — store it securely for payload signature verification. Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'register_webhook',
      description: 'Register a new webhook.',
      parameters: [
        { name: 'url', type: 'string', required: true, description: 'Webhook delivery URL (must be HTTPS)', example: 'https://hooks.northmore-gordon.com.au/wrei' },
        {
          name: 'events', type: 'array', required: true,
          description: 'Event types to subscribe to',
          enum: ['trade.created', 'trade.settled', 'negotiation.completed', 'correspondence.received', 'price.alert', 'compliance.deadline'],
        },
      ],
      exampleRequest: {
        url: 'https://hooks.northmore-gordon.com.au/wrei',
        events: ['trade.created', 'trade.settled', 'negotiation.completed'],
      },
      exampleResponse: {
        data: {
          id: 'whk_001',
          url: 'https://hooks.northmore-gordon.com.au/wrei',
          events: ['trade.created', 'trade.settled', 'negotiation.completed'],
          secret: 'a1b2c3d4e5f6...64_hex_chars',
          isActive: true,
          createdAt: '2026-04-05T10:00:00.000Z',
        },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Invalid URL or event types' },
    ...commonErrors,
  ],
  notes: [
    'The secret is only returned on creation. Store it securely.',
    'Payloads are signed with HMAC-SHA256 using the secret.',
    'Delivery uses 3 retries with exponential backoff (1s, 2s, 4s).',
    'The X-WREI-Signature header contains the hex-encoded HMAC of the body.',
    'The X-WREI-Event-Timestamp header contains the delivery timestamp.',
  ],
};

const webhooksDelete: ApiEndpoint = {
  id: 'webhooks-delete',
  path: '/api/v1/webhooks',
  method: 'DELETE',
  category: 'webhooks',
  title: 'Delete Webhook',
  description: 'Deregister a webhook by ID. The webhook is soft-deleted (is_active set to false). Requires admin or broker role.',
  authentication: standardAuth,
  rateLimit: writeRate,
  actions: [
    {
      name: 'delete_webhook',
      description: 'Deregister a webhook.',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Webhook ID (query parameter)', example: 'whk_001' },
      ],
      exampleRequest: { id: 'whk_001' },
      exampleResponse: {
        data: { id: 'whk_001', deleted: true },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing id query parameter' },
    { code: 404, name: 'Not Found', description: 'Webhook not found' },
    ...commonErrors,
  ],
};

// =============================================================================
// COMPLETE API DOCUMENTATION
// =============================================================================

export const allEndpoints: ApiEndpoint[] = [
  // Market Data
  marketPrices,
  marketPriceHistory,
  marketOrderbook,
  marketInstruments,
  // Trading
  tradesList,
  tradesCreate,
  tradesDetail,
  negotiateCreate,
  negotiateStatus,
  negotiateMessage,
  // Clients
  clientsList,
  clientsCreate,
  clientsDetail,
  clientsUpdate,
  clientsHoldings,
  // Compliance
  clientsCompliance,
  complianceSummary,
  // Correspondence
  correspondenceList,
  correspondenceInbound,
  correspondenceProcurement,
  correspondenceRfqs,
  correspondenceReportsList,
  correspondenceReportsGenerate,
  correspondenceSettlement,
  correspondenceThreads,
  correspondenceThreadDetail,
  correspondenceThreadAction,
  // Webhooks
  webhooksList,
  webhooksRegister,
  webhooksDelete,
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all endpoints grouped by category
 */
export function getEndpointsByCategory(): Record<ApiCategory, ApiEndpoint[]> {
  const grouped: Record<ApiCategory, ApiEndpoint[]> = {
    'market-data': [],
    trading: [],
    clients: [],
    compliance: [],
    correspondence: [],
    webhooks: [],
  };

  for (const endpoint of allEndpoints) {
    grouped[endpoint.category].push(endpoint);
  }

  return grouped;
}

/**
 * Get a single endpoint by its unique ID
 */
export function getEndpointById(id: string): ApiEndpoint | undefined {
  return allEndpoints.find((ep) => ep.id === id);
}

/**
 * Get action names for a given endpoint
 */
export function getEndpointActions(endpointId: string): string[] {
  const endpoint = getEndpointById(endpointId);
  if (!endpoint) return [];
  return endpoint.actions.map((a) => a.name);
}

/**
 * Get total endpoint count
 */
export function getEndpointCount(): number {
  return allEndpoints.length;
}

/**
 * Get total action count across all endpoints
 */
export function getTotalActionCount(): number {
  return allEndpoints.reduce((sum, ep) => sum + ep.actions.length, 0);
}

/**
 * Validate that all example payloads are valid JSON
 */
export function validateExamplePayloads(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const endpoint of allEndpoints) {
    for (const action of endpoint.actions) {
      try {
        JSON.stringify(action.exampleRequest);
      } catch {
        errors.push(`Invalid example request for ${endpoint.id}/${action.name}`);
      }
      try {
        JSON.stringify(action.exampleResponse);
      } catch {
        errors.push(`Invalid example response for ${endpoint.id}/${action.name}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// CODE EXAMPLES
// =============================================================================

export interface CodeExample {
  language: string;
  label: string;
  code: string;
}

/**
 * Generate code examples for a given endpoint and action
 */
export function generateCodeExamples(
  endpoint: ApiEndpoint,
  action: ApiEndpointAction
): CodeExample[] {
  const baseUrl = 'https://wrei-trading-platform.vercel.app';

  if (endpoint.method === 'GET') {
    const queryParams = action.parameters
      .filter((p) => p.example !== undefined || p.enum)
      .map((p) => `${p.name}=${p.example || (p.enum ? p.enum[0] : '')}`)
      .join('&');
    const url = `${baseUrl}${endpoint.path}${queryParams ? `?${queryParams}` : ''}`;

    return [
      {
        language: 'curl',
        label: 'cURL',
        code: `curl -X GET "${url}" \\
  -H "X-API-Key: your_api_key_here"`,
      },
      {
        language: 'javascript',
        label: 'JavaScript',
        code: `const response = await fetch("${url}", {
  method: "GET",
  headers: {
    "X-API-Key": "your_api_key_here"
  }
});

const data = await response.json();
console.log(data);`,
      },
      {
        language: 'python',
        label: 'Python',
        code: `import requests

response = requests.get(
    "${url}",
    headers={"X-API-Key": "your_api_key_here"}
)

data = response.json()
print(data)`,
      },
    ];
  }

  if (endpoint.method === 'DELETE') {
    const queryParams = action.parameters
      .filter((p) => p.example !== undefined)
      .map((p) => `${p.name}=${p.example}`)
      .join('&');
    const url = `${baseUrl}${endpoint.path}${queryParams ? `?${queryParams}` : ''}`;

    return [
      {
        language: 'curl',
        label: 'cURL',
        code: `curl -X DELETE "${url}" \\
  -H "X-API-Key: your_api_key_here"`,
      },
      {
        language: 'javascript',
        label: 'JavaScript',
        code: `const response = await fetch("${url}", {
  method: "DELETE",
  headers: {
    "X-API-Key": "your_api_key_here"
  }
});

const data = await response.json();
console.log(data);`,
      },
      {
        language: 'python',
        label: 'Python',
        code: `import requests

response = requests.delete(
    "${url}",
    headers={"X-API-Key": "your_api_key_here"}
)

data = response.json()
print(data)`,
      },
    ];
  }

  // POST and PUT requests
  const bodyJson = JSON.stringify(action.exampleRequest, null, 2);
  const method = endpoint.method;

  return [
    {
      language: 'curl',
      label: 'cURL',
      code: `curl -X ${method} "${baseUrl}${endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '${bodyJson}'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch("${baseUrl}${endpoint.path}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
  },
  body: JSON.stringify(${bodyJson})
});

const data = await response.json();
console.log(data);`,
    },
    {
      language: 'python',
      label: 'Python',
      code: `import requests

response = requests.${method.toLowerCase()}(
    "${baseUrl}${endpoint.path}",
    headers={
        "Content-Type": "application/json",
        "X-API-Key": "your_api_key_here"
    },
    json=${bodyJson.replace(/"/g, '"').replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}
)

data = response.json()
print(data)`,
    },
  ];
}
