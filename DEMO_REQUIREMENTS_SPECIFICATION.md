# WREI Trading Platform - Demo Requirements Specification

**Version**: 1.0.0
**Date**: March 25, 2026
**Author**: Claude Sonnet 4 (Requirements Analysis)
**Scope**: Business requirements and use cases for demo system
**Context**: NSW Energy Savings Certificates trading at Northmore Gordon

---

## Table of Contents

1. [Requirements Overview](#requirements-overview)
2. [Business Context & Stakeholders](#business-context--stakeholders)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Use Case Specifications](#use-case-specifications)
6. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
7. [Business Rules & Constraints](#business-rules--constraints)
8. [Integration Requirements](#integration-requirements)
9. [Compliance & Regulatory Requirements](#compliance--regulatory-requirements)
10. [Success Metrics & KPIs](#success-metrics--kpis)

---

## Requirements Overview

### Project Vision

The WREI Trading Platform Demo System enables comprehensive, audience-specific demonstrations of carbon credit trading capabilities, specifically focused on NSW Energy Savings Certificates. The system addresses the critical business need for effective stakeholder engagement across Executive, Technical, and Compliance audiences, supporting client acquisition and business development activities at Northmore Gordon.

### Business Objectives

#### Primary Objectives
1. **Stakeholder Engagement**: Enable compelling demonstrations for diverse audience types
2. **Client Acquisition**: Support business development through effective capability showcasing
3. **Market Positioning**: Demonstrate competitive advantages in carbon credit trading
4. **Technical Validation**: Prove system capabilities and integration potential

#### Secondary Objectives
1. **Process Optimization**: Reduce demo preparation time through automation
2. **Knowledge Transfer**: Educate stakeholders on carbon credit trading processes
3. **Risk Mitigation**: Provide controlled, predictable demonstration environment
4. **Scalability Demonstration**: Show platform's ability to handle various trading scenarios

### Requirements Scope

#### In Scope
- **NSW ESC Trading Demonstrations**: Focus on NSW Energy Savings Certificates market
- **Multi-Audience Support**: Executive, Technical, and Compliance audience types
- **Real-time Analytics**: Live demonstration metrics and performance indicators
- **AI-Powered Orchestration**: Automated demo flow management and adaptation
- **Professional Reporting**: Comprehensive reporting and export capabilities

#### Out of Scope
- **Live Trading**: No actual trading transactions or financial commitments
- **Multi-Market Support**: Initial focus on NSW ESC only (future expansion planned)
- **User Account Management**: Demo sessions are ephemeral, no persistent user accounts
- **Payment Processing**: No financial transaction processing capabilities

### Requirements Categories

```typescript
enum RequirementCategory {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non_functional',
  BUSINESS_RULE = 'business_rule',
  CONSTRAINT = 'constraint',
  ASSUMPTION = 'assumption'
}

enum RequirementPriority {
  CRITICAL = 'critical',    // Must have for system to function
  HIGH = 'high',           // Important for business success
  MEDIUM = 'medium',       // Desirable for optimal experience
  LOW = 'low'             // Nice to have, future consideration
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  source: RequirementSource;
  acceptanceCriteria: AcceptanceCriteria[];
  testCases: TestCase[];
  dependencies: string[];
  risks: Risk[];
}
```

---

## Business Context & Stakeholders

### Business Context

#### Market Environment
**NSW Energy Savings Scheme (ESS)**
- Market size: A$200M+ annual trading volume
- Regulatory framework: NSW Department of Planning, Industry and Environment
- Key participants: Accredited Certificate Providers (ACPs), Large Energy Users, Energy Retailers
- Trading characteristics: Spot market with forward contracting, quarterly compliance cycles

**Northmore Gordon Position**
- Advisory role in carbon credit trading
- Client base includes institutional investors, corporates, government entities
- Requirement for sophisticated demonstration capabilities to support client acquisition
- Need for multi-audience presentation capabilities

#### Business Drivers
1. **Client Acquisition**: Demonstrate platform capabilities to potential clients
2. **Competitive Differentiation**: Showcase unique AI-powered trading capabilities
3. **Stakeholder Education**: Educate diverse audiences on carbon credit trading
4. **Market Credibility**: Establish credibility in carbon credit trading market

### Stakeholder Analysis

#### Primary Stakeholders

**Executive Stakeholders**
```yaml
executive_stakeholders:
  role: "Decision makers, C-suite executives, Board members"
  interests:
    - ROI and revenue potential
    - Strategic market positioning
    - Competitive advantages
    - Risk assessment and mitigation
  requirements:
    - High-level, outcome-focused presentations
    - Clear ROI projections and business case
    - Competitive analysis and market positioning
    - Executive-friendly interface and reporting
  success_criteria:
    - Presentation duration: 15-30 minutes
    - Engagement level: High attention maintenance
    - Content clarity: Business-focused, minimal technical detail
    - Decision support: Clear next steps and action items
```

**Technical Stakeholders**
```yaml
technical_stakeholders:
  role: "CTOs, IT Directors, System Architects, Developers"
  interests:
    - System architecture and scalability
    - Integration capabilities and APIs
    - Performance and reliability metrics
    - Technical implementation details
  requirements:
    - Detailed technical demonstrations
    - API documentation and integration examples
    - Architecture diagrams and technical specifications
    - Performance benchmarks and scalability evidence
  success_criteria:
    - Presentation duration: 45-90 minutes
    - Technical depth: Comprehensive system understanding
    - Integration proof: Clear integration pathways
    - Performance validation: Benchmarks and metrics
```

**Compliance Stakeholders**
```yaml
compliance_stakeholders:
  role: "Compliance Officers, Legal Teams, Auditors, Regulators"
  interests:
    - Regulatory compliance and adherence
    - Audit trails and documentation
    - Risk management and controls
    - Reporting and governance capabilities
  requirements:
    - Compliance framework demonstrations
    - Audit trail generation and management
    - Risk assessment and mitigation workflows
    - Regulatory reporting capabilities
  success_criteria:
    - Presentation duration: 30-60 minutes
    - Compliance coverage: Comprehensive regulatory adherence
    - Audit capabilities: Complete audit trail generation
    - Risk management: Effective risk identification and mitigation
```

#### Secondary Stakeholders

**Business Development Team**
- Requirements: Easy demo setup and configuration
- Success metrics: Increased demo effectiveness and client conversion

**Product Management Team**
- Requirements: Feature validation and market feedback
- Success metrics: Product-market fit validation and enhancement insights

**Sales Team**
- Requirements: Compelling sales support materials
- Success metrics: Improved sales cycle efficiency and close rates

### Stakeholder Requirements Matrix

| Requirement | Executive | Technical | Compliance | Priority |
|-------------|-----------|-----------|------------|----------|
| Multi-audience interface | High | High | High | Critical |
| NSW ESC scenario library | High | Medium | High | Critical |
| Real-time analytics | High | High | Medium | High |
| Professional reporting | High | Medium | High | High |
| API integration demos | Low | Critical | Low | High |
| Compliance workflows | Medium | Low | Critical | High |
| Performance metrics | Medium | Critical | Medium | High |
| Audit trail generation | Low | Low | Critical | High |

---

## Functional Requirements

### FR-001: Demo Configuration System

#### FR-001.1: Audience Selection and Configuration
**Priority**: Critical
**Description**: System must support selection and configuration of demonstration parameters based on audience type.

**Detailed Requirements**:
- **FR-001.1.1**: Support three distinct audience types: Executive, Technical, Compliance
- **FR-001.1.2**: Provide audience-specific configuration templates with appropriate defaults
- **FR-001.1.3**: Allow customization of demo parameters while maintaining audience appropriateness
- **FR-001.1.4**: Validate configuration consistency and completeness before demo initiation

**Acceptance Criteria**:
```gherkin
Feature: Audience Selection and Configuration

Scenario: Executive audience configuration
  Given I am on the demo configuration page
  When I select "Executive" as the audience type
  Then I should see executive-focused scenario options
  And the default presentation duration should be 15-30 minutes
  And technical details should be minimized in the interface
  And business-focused metrics should be prominently displayed

Scenario: Technical audience configuration
  Given I am on the demo configuration page
  When I select "Technical" as the audience type
  Then I should see technical-focused scenario options
  And the default presentation duration should be 45-90 minutes
  And detailed technical metrics should be available
  And API integration examples should be included

Scenario: Compliance audience configuration
  Given I am on the demo configuration page
  When I select "Compliance" as the audience type
  Then I should see compliance-focused scenario options
  And regulatory compliance features should be prominent
  And audit trail capabilities should be highlighted
  And risk management workflows should be available
```

#### FR-001.2: Scenario Template Management
**Priority**: Critical
**Description**: System must provide a comprehensive library of NSW ESC trading scenario templates.

**Detailed Requirements**:
- **FR-001.2.1**: Maintain library of pre-configured NSW ESC trading scenarios
- **FR-001.2.2**: Support scenario categorization (Spot Trading, Forward Contracts, Portfolio Optimization, Compliance Workflows)
- **FR-001.2.3**: Enable scenario parameter customization within realistic constraints
- **FR-001.2.4**: Provide scenario difficulty levels (Basic, Intermediate, Advanced)
- **FR-001.2.5**: Validate scenario realism and market accuracy

**Business Rules**:
- All scenarios must use current NSW ESC market conditions and pricing
- Scenario parameters must remain within realistic market ranges
- Compliance scenarios must reflect current regulatory requirements

### FR-002: Real-Time Analytics Engine

#### FR-002.1: Negotiation Analytics
**Priority**: High
**Description**: System must provide real-time analytics during demonstration sessions.

**Detailed Requirements**:
- **FR-002.1.1**: Calculate and display real-time negotiation metrics
- **FR-002.1.2**: Track negotiation progress and price movement
- **FR-002.1.3**: Generate performance benchmarks and comparisons
- **FR-002.1.4**: Provide market positioning analysis

**Performance Requirements**:
- Analytics updates must occur within 1 second of data changes
- Calculations must complete within 500ms
- Dashboard updates must not impact system performance

#### FR-002.2: Audience Engagement Tracking
**Priority**: Medium
**Description**: System must track and analyze audience engagement during demonstrations.

**Detailed Requirements**:
- **FR-002.2.1**: Monitor interaction patterns and engagement levels
- **FR-002.2.2**: Adapt content based on audience engagement
- **FR-002.2.3**: Generate engagement reports and recommendations
- **FR-002.2.4**: Provide real-time engagement feedback to presenters

### FR-003: Multi-Audience Interface System

#### FR-003.1: Adaptive User Interface
**Priority**: Critical
**Description**: System must provide audience-appropriate user interfaces and content presentation.

**Detailed Requirements**:
- **FR-003.1.1**: Present executive-focused dashboards with high-level KPIs and business metrics
- **FR-003.1.2**: Provide technical interfaces with detailed system metrics and integration information
- **FR-003.1.3**: Offer compliance panels with regulatory information and audit capabilities
- **FR-003.1.4**: Support dynamic interface adaptation based on audience engagement and feedback

**Interface Requirements by Audience**:

**Executive Interface**:
```typescript
interface ExecutiveInterface {
  kpiDashboard: {
    roiProjections: ROIProjection[];
    marketOpportunity: MarketOpportunityAnalysis;
    competitiveAdvantage: CompetitiveAdvantageMetrics;
    riskAssessment: RiskSummary;
  };

  presentationFlow: {
    duration: number; // 15-30 minutes
    automaticProgression: boolean;
    executiveSummary: boolean;
    technicaldepthLevel: 'minimal';
  };

  reporting: {
    executiveSummaryReport: boolean;
    businessCaseDocument: boolean;
    roiAnalysisExport: boolean;
  };
}
```

**Technical Interface**:
```typescript
interface TechnicalInterface {
  architectureDashboard: {
    systemDiagrams: SystemArchitectureDiagram[];
    integrationPoints: IntegrationEndpoint[];
    performanceMetrics: DetailedPerformanceMetrics;
    scalabilityAnalysis: ScalabilityMetrics;
  };

  developmentSupport: {
    apiDocumentation: APIDocumentation;
    codeExamples: CodeExample[];
    integrationTutorials: Tutorial[];
    sandboxAccess: SandboxEnvironment;
  };

  presentationFlow: {
    duration: number; // 45-90 minutes
    technicalDepth: 'comprehensive';
    interactiveElements: boolean;
    qnaSupport: boolean;
  };
}
```

**Compliance Interface**:
```typescript
interface ComplianceInterface {
  regulatoryDashboard: {
    complianceFramework: RegulatoryFramework;
    auditTrails: AuditTrailCapabilities;
    riskManagement: RiskManagementWorkflow;
    reportingCapabilities: ComplianceReporting;
  };

  workflowDemonstration: {
    complianceWorkflows: ComplianceWorkflow[];
    auditTrailGeneration: AuditTrailDemo;
    regulatoryReporting: ReportingDemo;
    riskAssessment: RiskAssessmentDemo;
  };

  documentation: {
    complianceReports: ComplianceReport[];
    auditDocuments: AuditDocument[];
    regulatoryFiling: RegulatoryFiling[];
  };
}
```

### FR-004: AI-Powered Demo Orchestration (Stage 2)

#### FR-004.1: Intelligent Demo Flow Management
**Priority**: High
**Description**: System must intelligently manage demo flow based on audience analysis and engagement.

**Detailed Requirements**:
- **FR-004.1.1**: Analyze audience type and engagement level automatically
- **FR-004.1.2**: Adapt demo flow and content in real-time based on audience response
- **FR-004.1.3**: Generate contextually appropriate scenarios and responses
- **FR-004.1.4**: Optimize presentation timing and content depth automatically

#### FR-004.2: Dynamic Scenario Generation
**Priority**: High
**Description**: System must generate realistic trading scenarios dynamically based on current market conditions.

**Detailed Requirements**:
- **FR-004.2.1**: Generate market conditions based on real NSW ESC market data
- **FR-004.2.2**: Create participant profiles with realistic behavior patterns
- **FR-004.2.3**: Simulate trading outcomes with high market accuracy
- **FR-004.2.4**: Validate generated scenarios for realism and educational value

### FR-005: Reporting and Export System

#### FR-005.1: Professional Report Generation
**Priority**: High
**Description**: System must generate professional reports tailored to each audience type.

**Detailed Requirements**:
- **FR-005.1.1**: Generate executive summary reports with business focus
- **FR-005.1.2**: Create technical architecture and integration reports
- **FR-005.1.3**: Produce compliance and audit trail documentation
- **FR-005.1.4**: Support multiple export formats (PDF, Excel, PowerPoint)

**Report Specifications**:

**Executive Reports**:
- Business case summary
- ROI analysis and projections
- Market opportunity assessment
- Competitive advantage analysis
- Risk summary and mitigation strategies

**Technical Reports**:
- System architecture documentation
- API integration guides
- Performance benchmarks and analysis
- Scalability assessment
- Integration examples and tutorials

**Compliance Reports**:
- Regulatory compliance assessment
- Audit trail documentation
- Risk management framework
- Compliance reporting capabilities
- Regulatory filing examples

---

## Non-Functional Requirements

### NFR-001: Performance Requirements

#### NFR-001.1: Response Time Requirements
**Priority**: Critical
**Specification**:
- Demo initialization: < 5 seconds
- API response times: < 2 seconds (95th percentile)
- UI interactions: < 200 milliseconds
- Analytics calculations: < 1 second
- Report generation: < 10 seconds

#### NFR-001.2: Throughput Requirements
**Priority**: High
**Specification**:
- Concurrent demo sessions: Support 10+ simultaneous sessions
- API request handling: > 100 requests per minute
- Analytics processing: Real-time updates for 10+ concurrent sessions

#### NFR-001.3: Resource Utilization
**Priority**: High
**Specification**:
- Memory usage: < 512MB per demo session
- CPU utilization: < 70% under normal load
- Network bandwidth: < 100KB/s per session
- Storage: No persistent storage requirements

### NFR-002: Reliability Requirements

#### NFR-002.1: Availability
**Priority**: Critical
**Specification**:
- System availability: 99.9% uptime during business hours
- Demo success rate: > 99% successful completion
- Error recovery: < 30 seconds automatic recovery
- Failover capability: < 5 seconds switchover time

#### NFR-002.2: Error Handling
**Priority**: High
**Specification**:
- Graceful degradation under system stress
- Comprehensive error logging and monitoring
- User-friendly error messages for all error conditions
- Automatic retry mechanisms for transient failures

### NFR-003: Scalability Requirements

#### NFR-003.1: Horizontal Scalability
**Priority**: High
**Specification**:
- Auto-scaling capability based on demand
- Stateless architecture for easy scaling
- Load balancing across multiple instances
- Database connection pooling and optimization

#### NFR-003.2: Performance Under Load
**Priority**: High
**Specification**:
- Maintain performance with 50+ concurrent users
- Linear performance degradation under extreme load
- Automatic load shedding when necessary
- Performance monitoring and alerting

### NFR-004: Security Requirements

#### NFR-004.1: Data Protection
**Priority**: Critical
**Specification**:
- No persistent storage of sensitive data
- Data encryption in transit (HTTPS/TLS 1.3)
- Input validation and sanitization for all user inputs
- Output filtering to prevent information leakage

#### NFR-004.2: API Security
**Priority**: Critical
**Specification**:
- API key protection (server-side only)
- Rate limiting on all API endpoints
- Request authentication and authorization
- Audit logging of all API calls

#### NFR-004.3: Access Control
**Priority**: High
**Specification**:
- Role-based access control for different demo modes
- Session management and timeout controls
- IP-based access restrictions if required
- Activity logging and monitoring

### NFR-005: Usability Requirements

#### NFR-005.1: User Interface
**Priority**: High
**Specification**:
- Intuitive interface requiring minimal training
- Responsive design supporting desktop and tablet devices
- Accessibility compliance (WCAG 2.1 AA standards)
- Consistent visual design following brand guidelines

#### NFR-005.2: User Experience
**Priority**: High
**Specification**:
- Self-explanatory workflows and navigation
- Context-sensitive help and guidance
- Progressive disclosure of complexity
- Smooth transitions and animations

### NFR-006: Compatibility Requirements

#### NFR-006.1: Browser Compatibility
**Priority**: High
**Specification**:
- Chrome 90+ (primary browser)
- Firefox 85+ (secondary support)
- Safari 14+ (secondary support)
- Edge 90+ (secondary support)

#### NFR-006.2: Device Compatibility
**Priority**: Medium
**Specification**:
- Desktop computers (primary target)
- Tablets (iPad Pro, Surface Pro)
- Large mobile devices (limited support)
- 4K displays and high DPI screens

---

## Use Case Specifications

### UC-001: Executive Demonstration

**Actor**: Executive Stakeholder (C-suite, Board Member, Senior Decision Maker)
**Goal**: Understand business value and ROI potential of WREI trading platform
**Preconditions**: Demo system is available and configured
**Postconditions**: Executive has clear understanding of business case and next steps

**Main Success Scenario**:
1. Business Development Manager initiates executive demo configuration
2. System presents executive-focused interface with business metrics
3. Demo showcases NSW ESC trading opportunities and market size
4. System demonstrates ROI calculations and revenue projections
5. Competitive analysis shows WREI platform advantages
6. Risk assessment and mitigation strategies are presented
7. Executive summary report is generated and provided
8. Next steps and engagement process are outlined

**Extensions**:
- **3a**: If executive requests specific market focus, system adapts scenario accordingly
- **5a**: If competitive questions arise, system provides detailed competitive analysis
- **7a**: If technical questions arise, system offers to transition to technical demonstration

**Special Requirements**:
- Presentation must complete within 30 minutes
- Business-focused content with minimal technical detail
- Professional presentation quality suitable for C-suite audience
- Clear ROI projections and business case

**Use Case Acceptance Criteria**:
```gherkin
Feature: Executive Demonstration

Scenario: Successful executive demo completion
  Given an executive stakeholder is attending a demonstration
  When the demo is configured for executive audience
  Then the presentation should focus on business outcomes
  And ROI projections should be prominently displayed
  And the demo should complete within 30 minutes
  And an executive summary report should be generated
  And next steps should be clearly outlined

Scenario: Executive requests competitive analysis
  Given an executive demo is in progress
  When the executive asks about competitive positioning
  Then the system should provide detailed competitive analysis
  And market advantage areas should be highlighted
  And competitive differentiation should be demonstrated
  And market positioning should be clearly explained

Scenario: Technical question during executive demo
  Given an executive demo is in progress
  When a technical question is asked
  Then the system should provide a high-level technical response
  And offer to schedule a detailed technical demonstration
  And maintain focus on business outcomes
```

### UC-002: Technical Deep-Dive Demonstration

**Actor**: Technical Stakeholder (CTO, IT Director, System Architect, Developer)
**Goal**: Evaluate technical capabilities, architecture, and integration potential
**Preconditions**: Demo system is configured for technical audience
**Postconditions**: Technical stakeholder understands system architecture and integration approach

**Main Success Scenario**:
1. Technical lead configures demo for technical deep-dive
2. System presents technical architecture and system overview
3. API integration capabilities are demonstrated with live examples
4. Performance metrics and scalability evidence are shown
5. Security architecture and data protection measures are explained
6. Integration scenarios are demonstrated with code examples
7. Technical documentation and sandbox access are provided
8. Q&A session addresses specific technical concerns

**Extensions**:
- **4a**: If performance concerns are raised, detailed benchmarking is demonstrated
- **6a**: If specific integration scenarios are requested, custom examples are generated
- **8a**: If development resources are requested, sandbox environment access is provided

**Special Requirements**:
- Comprehensive technical detail appropriate for architects
- Live system demonstrations with real performance metrics
- API documentation and integration examples
- Code samples and development resources

### UC-003: Compliance and Risk Assessment

**Actor**: Compliance Officer (Legal Team, Auditor, Risk Manager, Regulator)
**Goal**: Validate regulatory compliance, audit capabilities, and risk management
**Preconditions**: Demo system configured for compliance demonstration
**Postconditions**: Compliance stakeholder confirms regulatory adherence and audit capabilities

**Main Success Scenario**:
1. Compliance officer initiates compliance-focused demonstration
2. System demonstrates NSW ESC regulatory compliance framework
3. Audit trail generation and management capabilities are shown
4. Risk assessment and mitigation workflows are demonstrated
5. Regulatory reporting capabilities are presented
6. Compliance monitoring and alerting features are shown
7. Audit documentation and compliance reports are generated
8. Regulatory filing and submission processes are explained

**Extensions**:
- **3a**: If specific audit requirements exist, customized audit trails are demonstrated
- **5a**: If regulatory changes are discussed, system adaptation capabilities are shown
- **7a**: If compliance gaps are identified, mitigation strategies are presented

**Special Requirements**:
- Comprehensive coverage of NSW ESC regulatory requirements
- Detailed audit trail capabilities
- Professional compliance documentation
- Risk assessment and mitigation workflows

### UC-004: Multi-Stakeholder Presentation

**Actor**: Mixed Audience (Executive + Technical + Compliance stakeholders)
**Goal**: Address diverse stakeholder needs in single presentation
**Preconditions**: Demo system configured for mixed audience
**Postconditions**: All stakeholder types have appropriate understanding of system capabilities

**Main Success Scenario**:
1. Presenter configures demo for mixed audience
2. System begins with executive overview of business value
3. Technical deep-dive section addresses architecture and integration
4. Compliance section covers regulatory and risk management
5. Interactive Q&A addresses specific stakeholder concerns
6. Audience-specific follow-up materials are generated
7. Next steps are tailored to each stakeholder group

**Extensions**:
- **2a**: If audience composition changes, system adapts content mix accordingly
- **5a**: If specific stakeholder questions dominate, system rebalances content
- **6a**: Different report formats are generated for different stakeholder types

**Special Requirements**:
- Flexible content adaptation based on audience engagement
- Seamless transitions between different content depths
- Audience-appropriate materials for each stakeholder type

### UC-005: Scenario Customization and Configuration

**Actor**: Demo Administrator (Business Development, Product Manager, Sales Team)
**Goal**: Configure and customize demonstration scenarios for specific client needs
**Preconditions**: Access to demo configuration system
**Postconditions**: Customized demo scenario ready for client presentation

**Main Success Scenario**:
1. Administrator accesses demo configuration interface
2. Client-specific requirements are analyzed and input
3. Appropriate scenario template is selected and customized
4. Market conditions and parameters are configured
5. Audience type and presentation preferences are set
6. Demo scenario is validated and tested
7. Customized demo is ready for client presentation

**Extensions**:
- **3a**: If no suitable template exists, new scenario is created from scratch
- **4a**: If real-time market data is required, live data feeds are configured
- **6a**: If scenario validation fails, parameters are adjusted and re-tested

**Special Requirements**:
- Flexible scenario customization capabilities
- Real-time market data integration
- Scenario validation and testing tools

---

## User Stories & Acceptance Criteria

### Epic 1: Demo Configuration System

#### US-001: As a Business Development Manager, I want to quickly configure audience-appropriate demonstrations

**Story**: As a Business Development Manager preparing for a client meeting, I want to quickly select and configure a demonstration that matches my audience type and client interests, so that I can deliver a compelling and relevant presentation without extensive technical setup.

**Acceptance Criteria**:
- [ ] I can select from Executive, Technical, or Compliance audience types
- [ ] Scenario templates are automatically filtered based on audience selection
- [ ] Configuration takes less than 5 minutes to complete
- [ ] Preview functionality allows me to review demo content before presentation
- [ ] Configuration can be saved and reused for similar client types

**Definition of Done**:
- Feature is fully implemented and tested
- User interface is intuitive and requires minimal training
- Performance meets specified response time requirements
- Documentation and user guide are complete

#### US-002: As an Executive Stakeholder, I want to see business-focused content without technical complexity

**Story**: As a CEO evaluating the WREI platform for potential investment, I want to see clear business outcomes, ROI projections, and competitive advantages without getting lost in technical details, so that I can make informed business decisions quickly.

**Acceptance Criteria**:
- [ ] Business metrics are prominently displayed on the main dashboard
- [ ] Technical details are minimized or hidden by default
- [ ] ROI calculations are clearly explained and justified
- [ ] Market opportunity and competitive analysis are included
- [ ] Presentation duration is 30 minutes or less

#### US-003: As a Technical Architect, I want to see detailed system architecture and integration examples

**Story**: As a Technical Architect evaluating integration options, I want to understand the system architecture, see API documentation, and review integration examples, so that I can assess technical feasibility and integration effort.

**Acceptance Criteria**:
- [ ] System architecture diagrams are comprehensive and up-to-date
- [ ] API documentation includes examples and code samples
- [ ] Integration scenarios cover common use cases
- [ ] Performance benchmarks and scalability metrics are provided
- [ ] Sandbox environment access is available for testing

#### US-004: As a Compliance Officer, I want to validate regulatory adherence and audit capabilities

**Story**: As a Compliance Officer responsible for regulatory adherence, I want to see how the system handles NSW ESC compliance requirements and generates audit trails, so that I can confirm the platform meets our regulatory obligations.

**Acceptance Criteria**:
- [ ] NSW ESC regulatory framework coverage is comprehensive
- [ ] Audit trail generation is automatic and complete
- [ ] Compliance reports can be generated for regulatory filing
- [ ] Risk assessment and mitigation workflows are demonstrated
- [ ] System adapts to regulatory changes and updates

### Epic 2: Real-Time Analytics Engine

#### US-005: As a Demo Presenter, I want to show live analytics to demonstrate system capabilities

**Story**: As a presenter demonstrating the platform to potential clients, I want to show real-time analytics and metrics during trading simulations, so that clients can see the platform's analytical capabilities and data-driven insights.

**Acceptance Criteria**:
- [ ] Analytics update in real-time during demo scenarios
- [ ] Metrics are accurate and reflect trading simulation data
- [ ] Dashboard is visually appealing and easy to interpret
- [ ] Performance benchmarks and comparisons are included
- [ ] Analytics can be exported for follow-up discussions

#### US-006: As an Executive, I want to see competitive analysis and market positioning

**Story**: As an Executive evaluating market opportunities, I want to see how the WREI platform compares to competitors and what market advantages it provides, so that I can understand our competitive position and market potential.

**Acceptance Criteria**:
- [ ] Competitive analysis includes major market players
- [ ] Market positioning is clearly visualized and explained
- [ ] Unique value propositions are highlighted
- [ ] Market share and opportunity analysis is provided
- [ ] Competitive advantages are quantified where possible

### Epic 3: Multi-Audience Interface System

#### US-007: As a presenter, I want the system to adapt content based on audience engagement

**Story**: As a presenter giving demonstrations to diverse audiences, I want the system to automatically adjust content depth and focus based on audience engagement and questions, so that I can deliver the most relevant and effective presentation.

**Acceptance Criteria**:
- [ ] System monitors audience engagement indicators
- [ ] Content adapts automatically based on engagement levels
- [ ] Presenter receives real-time feedback on audience interest
- [ ] Content depth can be adjusted on-demand during presentation
- [ ] Adaptation occurs smoothly without disrupting presentation flow

#### US-008: As a stakeholder, I want to receive appropriate follow-up materials

**Story**: As a stakeholder who attended a demonstration, I want to receive follow-up materials that are appropriate for my role and interests, so that I can review key information and share relevant details with my team.

**Acceptance Criteria**:
- [ ] Follow-up materials are automatically generated based on audience type
- [ ] Materials include key demonstration highlights and metrics
- [ ] Executive materials focus on business case and ROI
- [ ] Technical materials include architecture and integration details
- [ ] Compliance materials include regulatory and audit information

### Epic 4: AI-Powered Demo Orchestration (Stage 2)

#### US-009: As a presenter, I want the system to automatically manage demo flow

**Story**: As a presenter with limited technical expertise, I want the AI system to automatically manage the demonstration flow and adapt to audience needs, so that I can focus on engaging with stakeholders rather than technical demo management.

**Acceptance Criteria**:
- [ ] AI analyzes audience type and engagement automatically
- [ ] Demo flow adapts based on audience response and interest
- [ ] Presenter guidance is provided for optimal demo delivery
- [ ] System handles technical issues and transitions smoothly
- [ ] Manual override is available when needed

#### US-010: As a client, I want to see realistic and relevant trading scenarios

**Story**: As a potential client evaluating the trading platform, I want to see trading scenarios that are realistic and relevant to my business context, so that I can accurately assess how the platform would work for my organization.

**Acceptance Criteria**:
- [ ] Scenarios reflect current NSW ESC market conditions
- [ ] Trading parameters match real market constraints
- [ ] Participant behavior is realistic and representative
- [ ] Outcomes are probable and achievable in real markets
- [ ] Scenarios can be customized for specific business contexts

### Epic 5: Reporting and Export System

#### US-011: As a stakeholder, I want professional reports for internal sharing

**Story**: As a stakeholder who needs to share demonstration insights with my team, I want professional reports that summarize key findings and recommendations in a format appropriate for internal distribution and decision-making.

**Acceptance Criteria**:
- [ ] Reports are professionally formatted and branded
- [ ] Content is appropriate for the intended audience
- [ ] Key metrics and insights are highlighted
- [ ] Reports can be exported in multiple formats (PDF, Excel, PowerPoint)
- [ ] Custom branding and logos can be included

#### US-012: As a Business Development Manager, I want to track demonstration effectiveness

**Story**: As a Business Development Manager conducting multiple client demonstrations, I want to track which demonstrations are most effective and lead to client engagement, so that I can optimize my demonstration approach and improve conversion rates.

**Acceptance Criteria**:
- [ ] Demonstration metrics are automatically collected
- [ ] Effectiveness can be measured across different audience types
- [ ] Stakeholder feedback is captured and analyzed
- [ ] Reports show trends and improvement opportunities
- [ ] Best practices and successful patterns are identified

---

## Business Rules & Constraints

### Business Rules

#### BR-001: Market Data Accuracy
**Rule**: All demonstration scenarios must use current and accurate NSW ESC market data
**Rationale**: Credibility and realism are essential for effective stakeholder engagement
**Implementation**:
- Market data must be updated daily
- Scenarios must validate against current market conditions
- Price ranges must reflect actual trading ranges
- Regulatory changes must be incorporated within 48 hours

#### BR-002: Audience Appropriateness
**Rule**: Content presented must be appropriate for the selected audience type
**Rationale**: Stakeholder engagement requires audience-appropriate communication
**Implementation**:
- Executive content focuses on business outcomes and ROI
- Technical content provides architecture and integration details
- Compliance content emphasizes regulatory adherence and audit capabilities
- Content filtering prevents inappropriate information disclosure

#### BR-003: Demonstration Realism
**Rule**: All demonstration scenarios must represent realistic and achievable outcomes
**Rationale**: Unrealistic scenarios damage credibility and stakeholder trust
**Implementation**:
- Trading outcomes must be statistically probable
- Performance metrics must reflect actual system capabilities
- Integration examples must be technically feasible
- Market analysis must be based on factual data

#### BR-004: Professional Standards
**Rule**: All demonstrations and materials must meet professional presentation standards
**Rationale**: Professional credibility is essential for business development success
**Implementation**:
- User interfaces must follow design guidelines
- Reports must be professionally formatted
- Content must be error-free and well-structured
- Branding must be consistent throughout

### System Constraints

#### SC-001: No Persistent Data Storage
**Constraint**: Demo system must not store sensitive client or business data persistently
**Impact**: All demo data exists only in memory during active sessions
**Mitigation**:
- Session-based data management
- Automatic data cleanup after session completion
- No user account or profile storage

#### SC-002: API Key Security
**Constraint**: Anthropic API keys must never be exposed to client-side code
**Impact**: All AI integration must occur server-side only
**Mitigation**:
- Server-side API integration architecture
- Environment variable protection
- Code review processes to prevent key exposure

#### SC-003: Performance Requirements
**Constraint**: System must maintain responsiveness during live demonstrations
**Impact**: All operations must complete within specified time limits
**Mitigation**:
- Performance monitoring and optimization
- Caching strategies for frequently accessed data
- Load testing and capacity planning

#### SC-004: Browser Compatibility
**Constraint**: System must work across commonly used business browsers
**Impact**: Development must account for browser differences
**Mitigation**:
- Cross-browser testing protocols
- Progressive enhancement approach
- Polyfills for compatibility

### Regulatory Constraints

#### RC-001: NSW ESC Compliance
**Constraint**: All NSW ESC-related content must comply with current regulations
**Impact**: Regular updates required as regulations change
**Mitigation**:
- Regular regulatory review process
- Automated compliance checking where possible
- Expert review of compliance-related content

#### RC-002: Data Privacy
**Constraint**: System must comply with applicable privacy regulations
**Impact**: Data handling and processing restrictions
**Mitigation**:
- Privacy-by-design architecture
- Minimal data collection and processing
- Transparent privacy practices

### Technical Constraints

#### TC-001: Vercel Platform Limitations
**Constraint**: System must operate within Vercel platform capabilities and limits
**Impact**: Architecture and resource usage constraints
**Mitigation**:
- Platform-optimized architecture design
- Resource usage monitoring and optimization
- Alternative hosting strategy if needed

#### TC-002: Third-Party Dependencies
**Constraint**: System relies on external services (Claude API, market data feeds)
**Impact**: External service availability affects system functionality
**Mitigation**:
- Fallback mechanisms for service disruptions
- Service monitoring and alerting
- Graceful degradation strategies

---

## Integration Requirements

### INT-001: Claude API Integration

#### INT-001.1: AI Service Integration
**Priority**: Critical
**Description**: System must integrate with Anthropic Claude API for AI-powered demonstration orchestration

**Technical Requirements**:
- Secure API key management (server-side only)
- Request/response handling with error recovery
- Token usage monitoring and optimization
- Response validation and filtering

**Integration Specifications**:
```typescript
interface ClaudeIntegration {
  apiEndpoint: 'https://api.anthropic.com/v1/messages';
  authentication: 'Bearer token';
  models: {
    development: 'claude-3-sonnet-20240229';
    production: 'claude-3-opus-20240229';
  };

  requestLimits: {
    tokensPerMinute: 40000;
    requestsPerMinute: 50;
    maxTokensPerRequest: 4096;
  };

  errorHandling: {
    retryAttempts: 3;
    backoffStrategy: 'exponential';
    fallbackResponse: boolean;
  };
}
```

**Quality Requirements**:
- Response time: < 5 seconds for 95% of requests
- Availability: 99.9% uptime during business hours
- Error handling: Graceful degradation with fallback responses
- Security: API key never exposed to client-side code

### INT-002: Market Data Integration

#### INT-002.1: NSW ESC Market Data Feed
**Priority**: High
**Description**: System must integrate with NSW ESC market data sources for realistic scenario generation

**Data Sources**:
- IPART (Independent Pricing and Regulatory Tribunal) ESC data
- ACCU (Australian Carbon Credit Unit) registry data
- Energy market operator data feeds
- Third-party carbon credit pricing services

**Integration Requirements**:
```typescript
interface MarketDataIntegration {
  dataSources: {
    primary: 'IPART_ESC_API';
    secondary: 'ACCU_Registry_API';
    tertiary: 'Commercial_Data_Feed';
  };

  updateFrequency: {
    pricing: 'hourly';
    regulatory: 'daily';
    market_conditions: 'real_time';
  };

  dataValidation: {
    accuracyThreshold: 0.95;
    freshnessRequirement: '4_hours';
    completenessCheck: true;
  };
}
```

### INT-003: Analytics and Reporting Integration

#### INT-003.1: Business Intelligence Integration
**Priority**: Medium
**Description**: System should integrate with business intelligence tools for advanced analytics

**Integration Targets**:
- Power BI for executive dashboards
- Tableau for advanced data visualization
- Excel for financial modeling and analysis
- Custom reporting APIs for third-party tools

### INT-004: Authentication and Access Control

#### INT-004.1: Enterprise Authentication Integration
**Priority**: Low (Future Consideration)
**Description**: System may integrate with enterprise authentication systems

**Potential Integrations**:
- Active Directory for user authentication
- SAML for single sign-on
- OAuth for third-party authentication
- Multi-factor authentication for enhanced security

---

## Compliance & Regulatory Requirements

### COMP-001: NSW Energy Savings Scheme Compliance

#### COMP-001.1: Regulatory Framework Adherence
**Priority**: Critical
**Description**: System must accurately represent NSW ESC regulatory requirements and compliance obligations

**Regulatory Requirements**:
- Energy Savings Scheme Rule compliance
- Accredited Certificate Provider (ACP) requirements
- Certificate creation and trading regulations
- Compliance monitoring and reporting obligations

**Implementation Requirements**:
```yaml
nsw_esc_compliance:
  regulatory_framework:
    - "Energy Savings Scheme Rule 2009"
    - "Electricity Supply Act 1995 (NSW)"
    - "National Electricity Law"
    - "Australian Energy Market Operator (AEMO) procedures"

  compliance_areas:
    certificate_creation:
      - "Measurement and verification protocols"
      - "Baseline methodology compliance"
      - "Quality assurance requirements"

    trading_compliance:
      - "Trading platform registration"
      - "Transaction reporting obligations"
      - "Price discovery and transparency"

    audit_requirements:
      - "Certificate audit and verification"
      - "ACP compliance monitoring"
      - "Regulatory reporting and filing"
```

#### COMP-001.2: Data Accuracy and Validation
**Priority**: High
**Description**: All NSW ESC-related data must be accurate and regularly validated against official sources

**Validation Requirements**:
- Daily synchronization with official ESC registry
- Automated data accuracy checking
- Manual review of regulatory updates
- Expert validation of compliance content

### COMP-002: Financial Regulation Compliance

#### COMP-002.1: Financial Services Compliance
**Priority**: High
**Description**: System must comply with relevant financial services regulations

**Applicable Regulations**:
- Australian Securities and Investments Commission (ASIC) requirements
- Anti-Money Laundering and Counter-Terrorism Financing Act 2006
- Privacy Act 1988 (Commonwealth)
- Corporations Act 2001 (Commonwealth)

**Compliance Requirements**:
- Client identification and verification procedures
- Transaction monitoring and reporting
- Privacy and data protection measures
- Professional conduct and advice standards

### COMP-003: Data Privacy and Protection

#### COMP-003.1: Privacy Regulation Compliance
**Priority**: High
**Description**: System must comply with applicable privacy and data protection regulations

**Privacy Requirements**:
```yaml
privacy_compliance:
  applicable_laws:
    - "Privacy Act 1988 (Commonwealth)"
    - "Australian Privacy Principles (APPs)"
    - "General Data Protection Regulation (GDPR)" # if applicable

  implementation:
    data_minimization:
      - "Collect only necessary data for demonstration purposes"
      - "No persistent storage of personal information"
      - "Automatic data deletion after session completion"

    transparency:
      - "Clear privacy notices and policies"
      - "Data usage explanation during demonstrations"
      - "Stakeholder consent for data processing"

    security:
      - "Data encryption in transit and processing"
      - "Access controls and authentication"
      - "Security incident response procedures"
```

### COMP-004: Professional Standards Compliance

#### COMP-004.1: Industry Best Practices
**Priority**: Medium
**Description**: System should follow relevant industry best practices and standards

**Applicable Standards**:
- ISO 27001 (Information Security Management)
- ISO 9001 (Quality Management Systems)
- ISAE 3402 (Assurance Reports on Controls at Service Organizations)
- CPA Australia professional standards

---

## Success Metrics & KPIs

### Business Success Metrics

#### BSM-001: Stakeholder Engagement Metrics

**Primary KPIs**:
```yaml
stakeholder_engagement:
  satisfaction_scores:
    target: ">= 4.5/5.0"
    measurement: "Post-demonstration survey"
    frequency: "After each demonstration"

  engagement_duration:
    executive:
      target: "15-30 minutes"
      measurement: "Session duration tracking"
    technical:
      target: "45-90 minutes"
      measurement: "Session duration tracking"
    compliance:
      target: "30-60 minutes"
      measurement: "Session duration tracking"

  completion_rate:
    target: ">= 99%"
    measurement: "Successful demo completion percentage"
    frequency: "Weekly reporting"

  follow_up_engagement:
    target: ">= 70%"
    measurement: "Stakeholder follow-up rate within 30 days"
    frequency: "Monthly tracking"
```

#### BSM-002: Business Development Impact

**Primary KPIs**:
```yaml
business_development:
  client_conversion:
    target: ">= 25%"
    measurement: "Demo to client engagement conversion rate"
    frequency: "Quarterly assessment"

  sales_cycle_impact:
    target: "20% reduction in sales cycle length"
    measurement: "Time from first demo to contract signing"
    frequency: "Quarterly analysis"

  proposal_success_rate:
    target: ">= 40%"
    measurement: "Percentage of demos leading to proposals"
    frequency: "Monthly tracking"

  revenue_attribution:
    target: "Track revenue attributed to demo effectiveness"
    measurement: "Revenue from demo-originated clients"
    frequency: "Quarterly reporting"
```

#### BSM-003: Market Positioning Metrics

**Primary KPIs**:
```yaml
market_positioning:
  competitive_advantage:
    target: "Clear differentiation demonstration"
    measurement: "Stakeholder feedback on unique value proposition"
    frequency: "After each demonstration"

  market_credibility:
    target: ">= 85% credibility score"
    measurement: "Expert validation of market accuracy"
    frequency: "Monthly expert review"

  thought_leadership:
    target: "Industry recognition and references"
    measurement: "Industry citations and references"
    frequency: "Quarterly assessment"
```

### Technical Success Metrics

#### TSM-001: System Performance Metrics

**Primary KPIs**:
```yaml
system_performance:
  response_time:
    demo_initialization:
      target: "< 5 seconds"
      measurement: "Time from start to ready state"
      monitoring: "Real-time"

    api_response:
      target: "< 2 seconds (95th percentile)"
      measurement: "API endpoint response times"
      monitoring: "Continuous"

    ui_interactions:
      target: "< 200 milliseconds"
      measurement: "User interface response times"
      monitoring: "Real-time"

  availability:
    uptime:
      target: ">= 99.9%"
      measurement: "System availability during business hours"
      monitoring: "24/7"

    error_rate:
      target: "< 1%"
      measurement: "Percentage of failed requests"
      monitoring: "Continuous"

  scalability:
    concurrent_users:
      target: "> 10 simultaneous demos"
      measurement: "Concurrent session support"
      monitoring: "Load testing"
```

#### TSM-002: Quality Metrics

**Primary KPIs**:
```yaml
quality_metrics:
  code_quality:
    test_coverage:
      target: ">= 90%"
      measurement: "Automated test coverage percentage"
      monitoring: "CI/CD pipeline"

    defect_density:
      target: "< 1 defect per 1000 lines of code"
      measurement: "Bugs per lines of code"
      monitoring: "Weekly reporting"

  user_experience:
    usability_score:
      target: ">= 4.0/5.0"
      measurement: "User experience rating"
      monitoring: "Monthly user testing"

    accessibility_compliance:
      target: "WCAG 2.1 AA compliance"
      measurement: "Accessibility audit results"
      monitoring: "Quarterly assessment"
```

### Operational Success Metrics

#### OSM-001: Efficiency Metrics

**Primary KPIs**:
```yaml
operational_efficiency:
  demo_preparation:
    setup_time:
      target: "< 5 minutes"
      measurement: "Time to configure and start demo"
      monitoring: "User feedback"

    customization_effort:
      target: "< 15 minutes for scenario customization"
      measurement: "Time to customize scenarios"
      monitoring: "User tracking"

  maintenance_effort:
    update_frequency:
      target: "Weekly market data updates"
      measurement: "Data freshness and update success rate"
      monitoring: "Automated reporting"

    support_requests:
      target: "< 1 support request per 20 demos"
      measurement: "Support ticket volume"
      monitoring: "Monthly reporting"
```

#### OSM-002: Content Quality Metrics

**Primary KPIs**:
```yaml
content_quality:
  market_accuracy:
    data_accuracy:
      target: ">= 95% accuracy"
      measurement: "Market data validation against official sources"
      monitoring: "Daily validation"

    scenario_realism:
      target: ">= 90% realism score"
      measurement: "Expert validation of scenario authenticity"
      monitoring: "Monthly expert review"

  educational_value:
    learning_effectiveness:
      target: ">= 80% comprehension rate"
      measurement: "Post-demo knowledge assessment"
      monitoring: "After each demo"

    stakeholder_feedback:
      target: ">= 4.2/5.0 educational value rating"
      measurement: "Stakeholder feedback surveys"
      monitoring: "Continuous collection"
```

### Success Measurement Framework

#### Measurement Process

**Data Collection**:
```typescript
interface SuccessMetrics {
  businessMetrics: {
    stakeholderSatisfaction: number[];
    engagementDuration: number[];
    completionRate: number;
    conversionRate: number;
  };

  technicalMetrics: {
    responseTime: PerformanceMetrics;
    availability: AvailabilityMetrics;
    errorRate: ErrorMetrics;
    scalability: ScalabilityMetrics;
  };

  operationalMetrics: {
    setupTime: number[];
    maintenanceEffort: number;
    supportRequests: number;
    contentAccuracy: number;
  };
}
```

**Reporting Schedule**:
```yaml
reporting_schedule:
  daily:
    - "System performance metrics"
    - "Demo completion rates"
    - "Error rates and availability"

  weekly:
    - "Stakeholder satisfaction summary"
    - "Quality metrics review"
    - "Market data accuracy validation"

  monthly:
    - "Business impact assessment"
    - "Operational efficiency analysis"
    - "Content quality review"

  quarterly:
    - "Success metrics comprehensive review"
    - "ROI analysis and business case validation"
    - "Strategic recommendations and improvements"
```

**Success Thresholds**:
```yaml
success_thresholds:
  green: # Success
    stakeholder_satisfaction: ">= 4.5"
    completion_rate: ">= 99%"
    response_time: "< 2 seconds"
    conversion_rate: ">= 25%"

  yellow: # At Risk
    stakeholder_satisfaction: "4.0-4.4"
    completion_rate: "95-98%"
    response_time: "2-5 seconds"
    conversion_rate: "15-24%"

  red: # Critical
    stakeholder_satisfaction: "< 4.0"
    completion_rate: "< 95%"
    response_time: "> 5 seconds"
    conversion_rate: "< 15%"
```

---

## Cross-References

- **Master Development Plan**: See [DEMO_DEVELOPMENT_MASTER_PLAN.md](DEMO_DEVELOPMENT_MASTER_PLAN.md)
- **Architecture Specification**: See [DEMO_ARCHITECTURE_SPECIFICATION.md](DEMO_ARCHITECTURE_SPECIFICATION.md)
- **Implementation Guide**: See [DEMO_IMPLEMENTATION_GUIDE.md](DEMO_IMPLEMENTATION_GUIDE.md)
- **Testing Strategy**: See [DEMO_TESTING_STRATEGY.md](DEMO_TESTING_STRATEGY.md)
- **Technical Specifications**: See [DEMO_TECHNICAL_SPECIFICATIONS.md](DEMO_TECHNICAL_SPECIFICATIONS.md)
- **Progress Tracking**: See [DEMO_PROGRESS_TRACKING.md](DEMO_PROGRESS_TRACKING.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-25 | Claude Sonnet 4 | Initial comprehensive requirements specification |

---

**Document Status**: Active
**Next Review**: 2026-04-01
**Owner**: Business Analyst / Product Manager
**Stakeholders**: Executive Team, Development Team, QA Team, Business Development Team, Compliance Team