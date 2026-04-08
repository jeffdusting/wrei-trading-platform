# Participant Data Source Inventory
## Date: 2026-04-08
## Scope: Pre-Session F data availability assessment

### Demand Side (Scheme Participants / Retailers)

| Source | URL | Available Data | Format | Update Frequency | Access |
|--------|-----|---------------|--------|-----------------|--------|
| IPART Scheme Participant List | energysustainabilityschemes.nsw.gov.au/ESS-Scheme-Participants | Participant names, entity type, compliance status | HTML (on-page) | Annual (per compliance year) | Public — no login required |
| IPART Individual Energy Savings Targets | energysustainabilityschemes.nsw.gov.au/Scheme-Participants/About-Targets-and-Penalties/Individual-Energy-Savings-Targets | Per-participant annual ESC targets (derived from NSW electricity sales) | HTML/PDF | Annual | Public |
| IPART Annual Compliance Report to Minister | Published via parliament.nsw.gov.au | Participant-level liable acquisitions, compliance percentages, penalty payments, total scheme target vs achieved | PDF | Annual (due 31 July) | Public — latest covers 2023 ESS compliance year |
| IPART NSW Retail Electricity Market Report | parliament.nsw.gov.au (IPART annual report) | Big 3 retailer market shares (~74% of NSW small customers), customer counts by network zone | PDF | Annual (2024-25 edition published) | Public |
| Origin Energy Annual Report | originenergy.com.au/about/investors-media/ | Total customers (4.7M national FY2025), no NSW-specific breakdown, no ESS cost line item | PDF/web | Annual (August) | Public (ASX: ORG) |
| AGL Energy Annual Report | agl.com.au/content/aglenergy/nsw/en/about-agl/investors/annual-reports | Total customers (~4.5M national), no NSW-specific breakdown, no ESS cost line item | PDF/web | Annual (August) | Public (ASX: AGL) |
| EnergyAustralia (CLP Holdings) | clp.com.hk annual results | 1.6M+ customers across NSW/VIC/SA/QLD/ACT, EBITDAF A$690M (2025), no ESS cost line item | PDF | Annual (February) | Public (HK:0002) |
| AER Annual Retail Markets Report | aer.gov.au/publications/reports | Retailer customer numbers by state, market share analysis, competitive market metrics | PDF | Annual (2024-25 edition) | Public |

### Supply Side (ACPs)

| Source | URL | Available Data | Format | Update Frequency | Access |
|--------|-----|---------------|--------|-----------------|--------|
| IPART ACP Register | energysustainabilityschemes.nsw.gov.au/accredited-certificate-providers | ACP names, accreditation status (current/cancelled/suspended), accredited methods | HTML (on-page) | Continuous (as accreditations change) | Public — no login required |
| IPART ACP Certificate Creation Document | energysustainabilityschemes.nsw.gov.au/documents/document/accredited-certificate-providers-and-certificates | ACP names with certificate creation volumes | HTML/PDF | Periodic | Public |
| TESSA Registry of Certificates | energysustainabilityschemes.nsw.gov.au/registry-certificates | Certificate registration data: ACP name, certificate status (registered/transferred/surrendered), batch details | Web interface (searchable) | Real-time (May 2024 enhancements added batch status visibility) | Public — no login for viewing |
| IPART Annual Report to Minister | Parliament tabled | ACP creation volumes by compliance year, method-level creation breakdown, ACP compliance rates | PDF | Annual | Public |
| ESS Example Template (CSV Implementation Data) | IPART documents portal | Template structure for ACP reporting (reveals field names and expected data schema) | CSV template (V3.3, Nov 2024) | Periodic | Public |

### Shadow Supply Indicators

| Source | URL | What It Reveals | Granularity | Notes |
|--------|-----|----------------|-------------|-------|
| TESSA Certificate Registry | energysustainabilityschemes.nsw.gov.au | Certificate status (registered/transferred/surrendered) — proxy for inventory build/draw | Per-certificate batch | No bulk export confirmed; searchable web interface |
| Ecovantage Weekly Market Updates | ecovantage.com.au/energy-certificate-market-update/ | Broker commentary on supply/demand, forward prices, inventory sentiment | Weekly | Single-page format (current week only, no archives) |
| DemandManager Certificate Prices | demandmanager.com.au/certificate-prices/ | ESC spot and forward prices | Weekly | Alternative broker pricing source |
| DCCEEW Statutory Review Data | energy.nsw.gov.au | 2019-2022: 18.7M ESCs surrendered, 274K penalty-equivalent shortfalls — implies participant surplus buffer | One-off (statutory review) | Key historical reference for surplus estimation |
| NMG Market Intelligence | Subscription service | Detailed inventory estimates, supply-demand balance, broker market share | Weekly | **Paid subscription** — not freely accessible |
| IPART Compliance Report (surplus data) | Parliament tabled | Certificates surrendered vs obligation — surplus certificates indicate participant banking | Annual | 12+ month lag from compliance year to publication |

### Cross-Instrument (ACCU, LGC, VEEC)

| Source | URL | Available Data | Relevance |
|--------|-----|---------------|-----------|
| CER ANREU Registry | cleanenergyregulator.gov.au | ACCU issuance, transfer, surrender data | ACCU price model — required for training |
| CCM Auction Results | cleanenergyregulator.gov.au/csf | Carbon Credit Mechanism auction clearing prices | ACCU reference price (A$79.20 current) |
| CER Quarterly Carbon Market Reports | cleanenergyregulator.gov.au | ACCU supply/demand, method-level issuance, market statistics | ACCU fundamental analysis |
| VEU Registry (Victoria) | veu-registry.vic.gov.au | VEEC creation, transfer, surrender data | VEEC instrument model |
| AEMO NEM Wholesale Prices | nemweb.com.au (CSV files) | Regional Reference Price (NSW1), demand data, dispatch data — monthly CSV per region | Indirect ESC demand signal (energy costs → retrofit activity) |
| AER Default Market Offer | aer.gov.au | NSW regulated retail electricity prices by network zone | Indirect — retail price benchmark |
| Ecovantage Market Updates | ecovantage.com.au | Multi-instrument prices: ESC, VEEC, LGC, STC, PRC, ACCU (current week) | Cross-instrument pricing reference |
| AEC (Australian Energy Council) | energycouncil.com.au/submissions | Industry submissions on ESS, scheme cost analysis (3.6-4.1% admin costs) | Policy intelligence |

### Assessment

**Immediately usable by CC scrapers:**
1. IPART Scheme Participant List (HTML scraping)
2. IPART ACP Register (HTML scraping)
3. TESSA Registry of Certificates (web interface — may need Playwright for interactive search)
4. AEMO NEM wholesale price CSVs (direct download, no auth)
5. Ecovantage weekly market updates (current week, HTML scraping — already implemented)
6. DemandManager certificate prices (new scraper target)
7. CER quarterly reports and CCM auction results (PDF/HTML scraping)

**Require paid subscriptions or manual access:**
1. NMG Market Intelligence (paid subscription — currently referenced in model but not scraped)
2. Retailer-specific NSW customer data (not publicly itemised; only available in aggregate from IPART/AER)
3. TESSA bulk export (no confirmed public bulk download — registered users may have additional access)

**Highest signal-to-noise for demand/supply forecasting:**
1. **IPART Individual Energy Savings Targets** — directly reveals per-retailer ESC demand obligations
2. **TESSA Certificate Registry** — real-time supply-side visibility (creation, transfers, surrenders)
3. **IPART ACP Register with creation volumes** — supply concentration and pipeline estimation
4. **AEMO NEM wholesale prices** — leading indicator for energy cost → retrofit activity → ESC creation
5. **Ecovantage/DemandManager spot prices** — real-time price signal (already partially implemented)

**Recommended scraper priority order:**
1. IPART Individual Energy Savings Targets (demand signal — direct)
2. IPART ACP Register + creation volumes (supply signal — direct)
3. TESSA Certificate Registry (shadow supply — requires Playwright)
4. DemandManager certificate prices (price cross-validation)
5. AEMO NEM CSV download (wholesale price feature)
6. CER ACCU data (cross-instrument — required for ACCU model)
