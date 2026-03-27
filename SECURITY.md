# WREI Trading Platform - Security Documentation

**Document Version:** 1.0
**Date:** 2026-03-27

---

## 1. Security Architecture Overview

The WREI Trading Platform implements a multi-layered defence architecture designed to protect against common vulnerabilities while maintaining platform performance and user experience.

### Core Security Principles

1. **Defence in Depth**: Multiple independent security layers
2. **Least Privilege**: Minimal access rights and API key exposure
3. **Input Validation**: Comprehensive sanitisation at all entry points
4. **Output Filtering**: Internal reasoning stripped from client responses
5. **Constraint Enforcement**: Critical business rules enforced in application logic, not delegated to AI

---

## 2. Defence Layer Architecture

### Layer 1: API Key Protection
- **ANTHROPIC_API_KEY must ONLY be used in server-side API routes**
- **NEVER exposed to client-side code** - enforced by Next.js App Router architecture
- Environment variable validation on server startup
- No API key logging or console output in production

### Layer 2: Input Sanitisation
**File:** `/lib/defence.ts` - `sanitiseInput()`

Protects against injection attacks before data reaches Claude API:

```typescript
// Input sanitisation patterns
const INJECTION_PATTERNS = [
  /system\s*[:|=]/i,           // System prompt injection
  /assistant\s*[:|=]/i,        // Assistant role injection
  /human\s*[:|=]/i,           // Human role injection
  /<\s*script\s*>/i,          // XSS attempts
  /javascript\s*:/i,          // JavaScript protocol
  /data\s*:\s*text/i,         // Data URL schemes
  /\beval\s*\(/i,             // Code evaluation
  /\bexec\s*\(/i,             // Code execution
];
```

**Sanitisation Actions:**
- Pattern matching and removal of injection attempts
- HTML entity encoding for special characters
- Length limits (10,000 characters per message)
- Suspicious content flagging for monitoring

### Layer 3: Pricing Constraint Enforcement
**File:** `/lib/defence.ts` - `enforceConstraints()`

**Critical Business Rules (NON-NEGOTIABLE):**
- **Price Floor**: A$120/tonne absolute minimum (1.2× WREI Pricing Index)
- **Max Concession per Round**: 5% maximum price reduction per negotiation round
- **Max Total Concession**: 20% maximum total concession from anchor price
- **Minimum Rounds**: 3 rounds required before any price concession

```typescript
// Constraint enforcement (simplified)
if (newPrice < PRICE_FLOOR) {
  throw new Error(`Price ${newPrice} below floor ${PRICE_FLOOR}`);
}

const concessionPercent = (currentPrice - newPrice) / currentPrice;
if (concessionPercent > MAX_CONCESSION_PER_ROUND) {
  throw new Error(`Concession ${concessionPercent} exceeds limit`);
}
```

**Why Application-Level Enforcement:**
- LLM instructions alone are insufficient for business-critical constraints
- Prevents AI from making unauthorised pricing decisions
- Ensures audit compliance and risk management
- Maintains pricing integrity under all conditions

### Layer 4: Output Validation and Filtering
**File:** `/lib/defence.ts` - `validateOutput()`

Protects client from potentially harmful AI responses:

```typescript
// Output filtering patterns
const INTERNAL_REASONING_PATTERNS = [
  /thinking:|thought:|reasoning:|internal:/i,
  /\[internal\]|\[reasoning\]|\[thought\]/i,
  /step \d+:|analysis:|consideration:/i,
];
```

**Output Processing:**
- Remove AI internal reasoning before client delivery
- Validate JSON structure for API responses
- Content-length limits and encoding validation
- Malicious content detection and blocking

### Layer 5: Rate Limiting and DoS Protection
**Implementation:** In-memory rate limiting per API endpoint

**Limits:**
- Standard endpoints: 100 requests per minute per API key
- Performance endpoint: 50 requests per minute (resource intensive)
- Burst protection: 10 requests per 10-second window
- IP-based fallback limits when API key missing

### Layer 6: Error Handling and Information Disclosure
**Principle:** Fail securely without information leakage

- Generic error messages to clients
- Detailed logging server-side only
- Stack traces never exposed to client
- API key fragments never logged or returned

---

## 3. Threat Model

### High-Priority Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Prompt Injection** | High - Could bypass pricing constraints | Medium | Input sanitisation + constraint enforcement |
| **API Key Exposure** | Critical - Unauthorized Claude API usage | Low | Server-side only + env validation |
| **Price Manipulation** | High - Financial loss | Medium | Application-level price floor enforcement |
| **XSS Injection** | Medium - Client-side compromise | Low | Input sanitisation + output encoding |
| **DoS Attack** | Medium - Service availability | Medium | Rate limiting + request validation |

### Medium-Priority Threats

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Session Hijacking** | Medium - Negotiation state compromise | Low | Stateless design (no persistent sessions) |
| **Data Exfiltration** | Low - No sensitive data stored | Very Low | Ephemeral state design |
| **CSRF** | Low - No state-changing GET requests | Low | POST-only for critical operations |

---

## 4. Compliance and Regulatory Framework

### Australian Financial Services Compliance
- **ASIC Regulatory Guide 178**: Compliance with managed investment scheme requirements
- **AML/CTF Act 2006**: Anti-money laundering and counter-terrorism financing
- **Privacy Act 1988**: Data protection and privacy requirements
- **Digital Assets Framework Bill 2025**: Emerging digital asset regulations

### International Standards
- **OWASP Top 10**: Web application security best practices
- **NIST Cybersecurity Framework**: Comprehensive security management
- **ISO 27001**: Information security management systems

---

## 5. Security Monitoring and Incident Response

### Real-Time Monitoring
**File:** `/app/api/performance/route.ts`

**Monitored Metrics:**
- Failed authentication attempts
- Suspicious input patterns detected
- Constraint enforcement violations
- Rate limit breaches
- Unusual API call patterns

### Incident Response Procedures

**Level 1 - Low Severity** (e.g., single injection attempt)
1. Automatic input sanitisation and logging
2. Continue normal operation
3. Daily review of security logs

**Level 2 - Medium Severity** (e.g., repeated injection attempts)
1. Enhanced logging and monitoring
2. Temporary rate limit reduction
3. Security team notification within 4 hours

**Level 3 - High Severity** (e.g., successful constraint bypass)
1. Immediate system assessment
2. Potential service pause for investigation
3. Security team and management notification within 1 hour
4. Incident documentation and remediation plan

### Log Retention and Analysis
- Security logs retained for 90 days minimum
- Daily automated analysis for anomaly detection
- Weekly security review meetings
- Monthly penetration testing (when budget allows)

---

## 6. API Key Management

### Production Key Rotation
**Frequency:** Every 90 days or immediately after suspected compromise

**Rotation Process:**
1. Generate new Anthropic API key
2. Update Vercel environment variables
3. Deploy updated configuration
4. Verify service functionality
5. Revoke old API key
6. Update documentation

### Development Environment
- Separate development API keys with limited quotas
- No production keys in development environments
- Local `.env.local` files never committed to version control
- Team members use individual development keys where possible

---

## 7. Vulnerability Disclosure Policy

### Reporting Security Issues

**Contact:** [Insert security contact email]

**Please Report:**
- Potential security vulnerabilities
- Unauthorised access attempts
- Data integrity issues
- Authentication bypasses
- Pricing constraint bypasses

**Please Include:**
- Detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested remediation (if any)

### Response Timeline
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Resolution Target**: 30 days for critical issues, 90 days for medium/low
- **Disclosure Coordination**: Responsible disclosure after remediation

---

## 8. Security Testing and Validation

### Automated Testing
- **Input sanitisation tests**: 15+ test cases covering injection patterns
- **Constraint enforcement tests**: 20+ test cases for pricing rules
- **API security tests**: Authentication, rate limiting, input validation
- **Integration tests**: End-to-end security workflow validation

### Manual Security Reviews
- **Code review process**: All security-critical code peer reviewed
- **Architecture reviews**: Security implications of new features assessed
- **Penetration testing**: Quarterly external security assessments (planned)

### Security Test Coverage
- **Current Coverage**: 80+ security-focused test cases in Jest suite
- **E2E Security Tests**: 5 Playwright tests covering authentication and constraint enforcement
- **Performance Security**: Load testing with malicious payloads

---

## 9. Secure Development Guidelines

### Code Security Checklist

**Input Handling:**
- [ ] All user inputs sanitised before processing
- [ ] Input length limits enforced
- [ ] Injection pattern detection implemented
- [ ] Error messages do not leak system information

**API Integration:**
- [ ] API keys never exposed to client code
- [ ] Server-side validation for all critical operations
- [ ] Rate limiting implemented and tested
- [ ] Response data filtered before client delivery

**Business Logic:**
- [ ] Critical constraints enforced in application code
- [ ] Pricing rules cannot be bypassed by AI instructions
- [ ] Financial calculations independently validated
- [ ] Audit trails maintained for all transactions

### Security Review Process
1. **Design Phase**: Threat model assessment for new features
2. **Implementation**: Security-focused code review required
3. **Testing**: Automated security tests must pass
4. **Deployment**: Security configuration verification
5. **Monitoring**: Real-time security metrics tracking

---

**Last Updated:** 2026-03-27
**Next Review:** 2026-06-27 (Quarterly review cycle)

---

*This document contains security-sensitive information and should be treated as confidential. Distribution limited to authorised personnel only.*