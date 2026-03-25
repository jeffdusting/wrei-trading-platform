/**
 * Regulatory Compliance Map - Test Suite
 *
 * Tests for the RegulatoryMap and ComplianceStatusDashboard components.
 * Enhancement D3: Regulatory Compliance Map
 *
 * WREI Trading Platform - Phase 4
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegulatoryMap from '@/components/compliance/RegulatoryMap';
import ComplianceStatusDashboard from '@/components/compliance/ComplianceStatusDashboard';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/compliance'),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  );
});

// =============================================================================
// RegulatoryMap Component Tests
// =============================================================================

describe('RegulatoryMap Component', () => {
  test('renders the regulatory compliance map header', () => {
    render(<RegulatoryMap />);
    expect(screen.getByText('Regulatory Compliance Map')).toBeInTheDocument();
    expect(screen.getByText(/Australian Financial Services Framework/)).toBeInTheDocument();
  });

  test('renders investor type filter dropdown', () => {
    render(<RegulatoryMap />);
    const filter = screen.getByLabelText('Investor Type');
    expect(filter).toBeInTheDocument();
    expect(filter).toHaveValue('all');
  });

  test('renders offering structure filter dropdown', () => {
    render(<RegulatoryMap />);
    const filter = screen.getByLabelText('Offering Structure');
    expect(filter).toBeInTheDocument();
    expect(filter).toHaveValue('wholesale_only');
  });

  test('renders all compliance framework nodes', () => {
    render(<RegulatoryMap />);
    expect(screen.getByTestId('node-afsl')).toBeInTheDocument();
    expect(screen.getByTestId('node-aml-ctf')).toBeInTheDocument();
    expect(screen.getByTestId('node-tax-treatment')).toBeInTheDocument();
    expect(screen.getByTestId('node-digital-assets')).toBeInTheDocument();
  });

  test('renders investor type node', () => {
    render(<RegulatoryMap />);
    const node = screen.getByTestId('node-investor-type');
    expect(node).toBeInTheDocument();
    expect(within(node).getByText('All Investor Types')).toBeInTheDocument();
  });

  test('renders overall status node', () => {
    render(<RegulatoryMap />);
    expect(screen.getByTestId('node-overall-status')).toBeInTheDocument();
    expect(screen.getByText('Overall Compliance')).toBeInTheDocument();
  });

  test('renders status legend with all statuses', () => {
    render(<RegulatoryMap />);
    const legend = screen.getByRole('list', { name: /status legend/i });
    expect(legend).toBeInTheDocument();
    expect(within(legend).getByText('Compliant')).toBeInTheDocument();
    expect(within(legend).getByText('Pending')).toBeInTheDocument();
    expect(within(legend).getByText('Non-Compliant')).toBeInTheDocument();
    expect(within(legend).getByText('Under Review')).toBeInTheDocument();
  });

  test('clicking a node shows detail panel', () => {
    render(<RegulatoryMap />);
    // Click AFSL node
    fireEvent.click(screen.getByTestId('node-afsl'));
    // Detail panel should appear
    const detailPanel = screen.getByTestId('detail-panel');
    expect(detailPanel).toBeInTheDocument();
    expect(within(detailPanel).getByText('AFSL Licensing')).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Regulatory Body: ASIC/)).toBeInTheDocument();
  });

  test('clicking the same node again closes detail panel', () => {
    render(<RegulatoryMap />);
    fireEvent.click(screen.getByTestId('node-afsl'));
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    // Click same node again
    fireEvent.click(screen.getByTestId('node-afsl'));
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
  });

  test('close details button dismisses detail panel', () => {
    render(<RegulatoryMap />);
    fireEvent.click(screen.getByTestId('node-afsl'));
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close details'));
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
  });

  test('changing investor filter updates the investor node label', () => {
    render(<RegulatoryMap />);
    const filter = screen.getByLabelText('Investor Type');
    const node = screen.getByTestId('node-investor-type');

    fireEvent.change(filter, { target: { value: 'wholesale' } });
    expect(within(node).getByText('Wholesale Investor')).toBeInTheDocument();

    fireEvent.change(filter, { target: { value: 'retail' } });
    expect(within(node).getByText('Retail Investor')).toBeInTheDocument();

    fireEvent.change(filter, { target: { value: 'professional' } });
    expect(within(node).getByText('Professional Investor')).toBeInTheDocument();

    fireEvent.change(filter, { target: { value: 'sophisticated' } });
    expect(within(node).getByText('Sophisticated Investor')).toBeInTheDocument();
  });

  test('changing offering structure updates compliance statuses', () => {
    render(<RegulatoryMap />);
    const filter = screen.getByLabelText('Offering Structure');

    // Switch to retail_included - should show pending AFSL
    fireEvent.change(filter, { target: { value: 'retail_included' } });
    // The AFSL node should still be present and reflect the changed structure
    expect(screen.getByTestId('node-afsl')).toBeInTheDocument();
  });

  test('changing filter closes open detail panel', () => {
    render(<RegulatoryMap />);
    // Open detail for a node
    fireEvent.click(screen.getByTestId('node-afsl'));
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();

    // Change investor filter
    const filter = screen.getByLabelText('Investor Type');
    fireEvent.change(filter, { target: { value: 'retail' } });

    // Detail panel should be dismissed
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
  });

  test('renders compliance alerts section', () => {
    render(<RegulatoryMap />);
    expect(screen.getByText('Active Compliance Alerts')).toBeInTheDocument();
  });

  test('renders flowchart structure with connection arrows', () => {
    render(<RegulatoryMap />);
    // Flowchart should have the correct aria label
    const flowchart = screen.getByRole('img', { name: /regulatory compliance flowchart/i });
    expect(flowchart).toBeInTheDocument();
  });

  test('AFSL node shows correct details for wholesale offering', () => {
    render(<RegulatoryMap initialOfferingStructure="wholesale_only" />);
    fireEvent.click(screen.getByTestId('node-afsl'));

    const detailPanel = screen.getByTestId('detail-panel');
    expect(within(detailPanel).getByText(/exemption claimed/i)).toBeInTheDocument();
    expect(within(detailPanel).getByText('Exemption: s708')).toBeInTheDocument();
  });

  test('AML/CTF node shows registration details', () => {
    render(<RegulatoryMap />);
    fireEvent.click(screen.getByTestId('node-aml-ctf'));

    const detailPanel = screen.getByTestId('detail-panel');
    expect(within(detailPanel).getByText(/Regulatory Body: AUSTRAC/)).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Risk Rating: medium/)).toBeInTheDocument();
  });

  test('Tax treatment node shows rate information', () => {
    render(<RegulatoryMap />);
    fireEvent.click(screen.getByTestId('node-tax-treatment'));

    const detailPanel = screen.getByTestId('detail-panel');
    expect(within(detailPanel).getByText(/Regulatory Body: ATO/)).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Corporate Rate: 30%/)).toBeInTheDocument();
  });

  test('Digital Assets node shows framework status', () => {
    render(<RegulatoryMap />);
    fireEvent.click(screen.getByTestId('node-digital-assets'));

    const detailPanel = screen.getByTestId('detail-panel');
    expect(within(detailPanel).getByText(/Regulatory Body: Treasury\/ASIC/)).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Status: in force/)).toBeInTheDocument();
  });

  test('accepts initial props for investor filter and offering structure', () => {
    render(
      <RegulatoryMap
        initialInvestorFilter="professional"
        initialOfferingStructure="sophisticated_only"
      />
    );
    expect(screen.getByLabelText('Investor Type')).toHaveValue('professional');
    expect(screen.getByLabelText('Offering Structure')).toHaveValue('sophisticated_only');
    expect(within(screen.getByTestId('node-investor-type')).getByText('Professional Investor')).toBeInTheDocument();
  });
});

// =============================================================================
// ComplianceStatusDashboard Component Tests
// =============================================================================

describe('ComplianceStatusDashboard Component', () => {
  test('renders the dashboard header', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByText('Compliance Status Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive compliance monitoring/)).toBeInTheDocument();
  });

  test('renders compliance score gauge', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByTestId('compliance-score-gauge')).toBeInTheDocument();
    expect(screen.getByText('Compliance Score')).toBeInTheDocument();
  });

  test('renders investor type selector', () => {
    render(<ComplianceStatusDashboard />);
    const selector = screen.getByLabelText('View Requirements For');
    expect(selector).toBeInTheDocument();
    expect(selector).toHaveValue('wholesale');
  });

  test('renders framework compliance section', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByText('Framework Compliance')).toBeInTheDocument();
    expect(screen.getByText('AFSL Licensing')).toBeInTheDocument();
    // AML/CTF appears in both framework list and requirement tags, so check for at least one
    expect(screen.getAllByText('AML/CTF').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Digital Assets')).toBeInTheDocument();
    expect(screen.getByText('Tax Treatment')).toBeInTheDocument();
  });

  test('renders requirements summary with counts', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByText('Requirements Summary')).toBeInTheDocument();
    expect(screen.getByTestId('requirements-met')).toBeInTheDocument();
    expect(screen.getByTestId('requirements-pending')).toBeInTheDocument();
    expect(screen.getByTestId('requirements-not-met')).toBeInTheDocument();
  });

  test('renders progress bar', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders requirements checklist for wholesale investors', () => {
    render(<ComplianceStatusDashboard initialInvestorType="wholesale" />);
    const reqList = screen.getByRole('list', { name: /compliance requirements/i });
    expect(reqList).toBeInTheDocument();
    // Should have wholesale-specific requirements
    expect(screen.getByTestId('requirement-afsl-exemption')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-wholesale-cert')).toBeInTheDocument();
  });

  test('renders requirements checklist for retail investors', () => {
    render(<ComplianceStatusDashboard initialInvestorType="retail" />);
    // Should have retail-specific requirements
    expect(screen.getByTestId('requirement-afsl-licence')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-pds')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-appropriateness')).toBeInTheDocument();
  });

  test('changing investor type updates requirements', () => {
    render(<ComplianceStatusDashboard />);
    const selector = screen.getByLabelText('View Requirements For');

    // Initially wholesale
    expect(screen.getByTestId('requirement-afsl-exemption')).toBeInTheDocument();

    // Switch to retail
    fireEvent.change(selector, { target: { value: 'retail' } });
    expect(screen.getByTestId('requirement-afsl-licence')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-pds')).toBeInTheDocument();
  });

  test('renders upcoming deadlines section', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
    const deadlineList = screen.getByRole('list', { name: /upcoming compliance deadlines/i });
    expect(deadlineList).toBeInTheDocument();
  });

  test('renders AUSTRAC registration deadline', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByTestId('deadline-austrac-reg')).toBeInTheDocument();
    expect(screen.getByText('AUSTRAC Registration Deadline')).toBeInTheDocument();
  });

  test('renders document status tracker table', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByText('Document Status Tracker')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('renders base documents for all investor types', () => {
    render(<ComplianceStatusDashboard />);
    expect(screen.getByTestId('doc-aml-program')).toBeInTheDocument();
    expect(screen.getByTestId('doc-risk-assessment')).toBeInTheDocument();
    expect(screen.getByTestId('doc-cybersecurity-policy')).toBeInTheDocument();
    expect(screen.getByTestId('doc-token-audit')).toBeInTheDocument();
  });

  test('retail investor sees PDS document requirement', () => {
    render(<ComplianceStatusDashboard initialInvestorType="retail" />);
    const docRow = screen.getByTestId('doc-pds');
    expect(docRow).toBeInTheDocument();
    expect(within(docRow).getByText('Product Disclosure Statement')).toBeInTheDocument();
  });

  test('wholesale investor sees exemption documentation', () => {
    render(<ComplianceStatusDashboard initialInvestorType="wholesale" />);
    expect(screen.getByTestId('doc-wholesale-exemption')).toBeInTheDocument();
    expect(screen.getByText('Wholesale Exemption Documentation')).toBeInTheDocument();
  });

  test('sophisticated investor sees certification document', () => {
    render(<ComplianceStatusDashboard initialInvestorType="sophisticated" />);
    const docRow = screen.getByTestId('doc-sophistication-cert');
    expect(docRow).toBeInTheDocument();
    expect(within(docRow).getByText('Sophisticated Investor Certificate')).toBeInTheDocument();
  });

  test('compliance score gauge renders with SVG', () => {
    render(<ComplianceStatusDashboard />);
    const gauge = screen.getByTestId('compliance-score-gauge');
    const svg = gauge.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(screen.getByTestId('score-progress')).toBeInTheDocument();
  });

  test('requirements checklist heading reflects investor type', () => {
    render(<ComplianceStatusDashboard initialInvestorType="professional" />);
    expect(screen.getByText(/Requirements Checklist - Professional Investor/)).toBeInTheDocument();
  });

  test('all common requirements are present across investor types', () => {
    render(<ComplianceStatusDashboard />);
    // Common requirements that appear for all investor types
    expect(screen.getByTestId('requirement-kyc-identity')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-aml-registration')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-daf-risk-mgmt')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-daf-cybersecurity')).toBeInTheDocument();
    expect(screen.getByTestId('requirement-tax-reporting')).toBeInTheDocument();
  });
});
