/**
 * Pipeline Transition Component - Test Suite
 *
 * Tests for the institutional onboarding to negotiation transition interface.
 * Covers state transitions, validation, UI rendering, and user interactions.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement B4: Pipeline Transition Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PipelineTransition } from '@/components/institutional/PipelineTransition';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';

// Mock the onboarding pipeline utilities
jest.mock('@/lib/onboarding-pipeline', () => ({
  extractNegotiationPreConfig: jest.fn(),
  validateOnboardingForNegotiation: jest.fn(),
  generateNegotiationUrlParams: jest.fn(),
  generatePersonalisedWelcome: jest.fn(),
}));

describe('PipelineTransition Component', () => {
  const mockOnboardingState: InstitutionalOnboardingState = {
    institutionalIdentity: {
      entityName: 'Test Superannuation Fund',
      personaType: 'superannuation_fund',
      entityType: 'fund',
      jurisdiction: 'australia',
      regulatoryStatus: 'regulated'
    },
    investorClassification: {
      classification: 'wholesale',
      netWorth: 15000000,
      grossIncome: 2500000,
      professionalInvestor: true,
      sophisticatedInvestor: true
    },
    kycAmlVerification: {
      verificationStatus: 'complete',
      documentsVerified: ['incorporation', 'afsl', 'financial_statements'],
      sanctionsScreening: true,
      pepStatus: 'not_identified',
      riskRating: 'low'
    },
    afslCompliance: {
      hasAfslLicense: true,
      licenseNumber: 'AFS123456',
      complianceStatus: 'compliant',
      jurisdictionRestrictions: [],
      clientTypeRestrictions: []
    },
    investmentPreferences: {
      primaryTokenType: 'carbon_credits',
      secondaryTokenTypes: ['real_estate_tokens'],
      minInvestmentSize: 1000000,
      maxInvestmentSize: 50000000,
      yieldRequirement: 8.5,
      riskTolerance: 'moderate',
      timeHorizon: 'long_term',
      esgConstraints: ['climate_positive', 'no_fossil_fuels'],
      settlementTimeline: 't1',
      paymentMethod: 'wire',
      reportingRequirements: 'enhanced',
      volumeRequirements: 'forward'
    },
    complianceConfirmation: {
      wholesaleClientConfirmation: true,
      riskWarningAcknowledged: true,
      coolingOffPeriodWaived: true,
      sophisticatedInvestorDeclaration: true,
      regulatoryDisclosuresAccepted: true
    }
  };

  const mockPreConfig = {
    isPreConfigured: true,
    buyerPersona: 'esg_fund_portfolio_manager' as const,
    institutionalClassification: 'wholesale' as const,
    entityName: 'Test Superannuation Fund',
    investmentFocus: {
      primaryTokenType: 'carbon_credits',
      targetYield: 8.5,
      riskTolerance: 'moderate' as const,
      minInvestmentSize: 1000000,
      maxInvestmentSize: 50000000
    },
    complianceContext: {
      afslStatus: 'compliant' as const,
      kycStatus: 'complete' as const,
      jurisdictionRestrictions: [],
      regulatoryConstraints: []
    },
    tradingPreferences: {
      settlementTimeline: 't1' as const,
      paymentMethod: 'wire' as const,
      reportingRequirements: 'enhanced' as const,
      volumeRequirements: 'forward' as const
    }
  };

  const mockNavigate = jest.fn();

  const mockProps = {
    onboardingState: mockOnboardingState,
    onContinueToNegotiation: jest.fn(),
    onExit: jest.fn(),
    navigate: mockNavigate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    // Setup default mocks
    const { extractNegotiationPreConfig, validateOnboardingForNegotiation, generateNegotiationUrlParams, generatePersonalisedWelcome } = require('@/lib/onboarding-pipeline');

    extractNegotiationPreConfig.mockImplementation(() => JSON.parse(JSON.stringify(mockPreConfig)));
    validateOnboardingForNegotiation.mockReturnValue({ isValid: true, missingFields: [] });
    generateNegotiationUrlParams.mockReturnValue('onboarded=true&persona=esg_fund_portfolio_manager&classification=wholesale');
    generatePersonalisedWelcome.mockReturnValue('Welcome to WREI\'s ESG-focused carbon credit marketplace.');
  });

  describe('Component Rendering', () => {
    test('renders initial preparing stage', () => {
      render(<PipelineTransition {...mockProps} />);

      expect(screen.getByText('Preparing Your Profile')).toBeInTheDocument();
      expect(screen.getByText(/processing your institutional onboarding data/i)).toBeInTheDocument();
    });

    test('renders the main container with proper styling', () => {
      render(<PipelineTransition {...mockProps} />);

      const container = screen.getByText('Preparing Your Profile').closest('.bg-white');
      expect(container).toHaveClass('rounded-lg', 'shadow-sm', 'border', 'border-slate-200', 'p-8');
    });

    test('renders progress indicator during processing stages', () => {
      render(<PipelineTransition {...mockProps} />);

      expect(screen.getByText('Preparing')).toBeInTheDocument();
      expect(screen.getByText('Validating')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    test('progresses through preparing → validating → ready stages', async () => {
      render(<PipelineTransition {...mockProps} />);

      // Initially shows preparing
      expect(screen.getByText('Preparing Your Profile')).toBeInTheDocument();

      // Wait for validating stage
      await waitFor(() => {
        expect(screen.getByText('Validating Compliance')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Wait for ready stage
      await waitFor(() => {
        expect(screen.getByText('Ready to Begin Trading')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('calls utility functions during processing', async () => {
      const { validateOnboardingForNegotiation, extractNegotiationPreConfig } = require('@/lib/onboarding-pipeline');

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(validateOnboardingForNegotiation).toHaveBeenCalledWith(mockOnboardingState);
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(extractNegotiationPreConfig).toHaveBeenCalledWith(mockOnboardingState);
      }, { timeout: 3000 });
    });

    test('shows error state when validation fails', async () => {
      const { validateOnboardingForNegotiation } = require('@/lib/onboarding-pipeline');
      validateOnboardingForNegotiation.mockReturnValue({
        isValid: false,
        missingFields: ['entityName', 'investorClassification']
      });

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Configuration Issue')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Check for error messages (might be formatted differently)
      expect(screen.getByText(/entity.*name/i)).toBeInTheDocument();
      expect(screen.getByText(/investor.*classification/i)).toBeInTheDocument();
    });

    test('shows error state when pre-config extraction fails', async () => {
      const { extractNegotiationPreConfig } = require('@/lib/onboarding-pipeline');
      extractNegotiationPreConfig.mockImplementation(() => {
        throw new Error('Processing failed');
      });

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Configuration Issue')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Failed to process onboarding data')).toBeInTheDocument();
    });
  });

  describe('Ready State Display', () => {
    test('displays personalised welcome message', async () => {
      const { generatePersonalisedWelcome } = require('@/lib/onboarding-pipeline');
      const welcomeMessage = 'Welcome Test Fund! Your ESG profile is ready.';
      generatePersonalisedWelcome.mockReturnValue(welcomeMessage);

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('displays configuration summary with entity information', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Your Configuration Summary')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Test Superannuation Fund')).toBeInTheDocument();
      expect(screen.getByText(/wholesale.*investor/i)).toBeInTheDocument();
    });

    test('displays investment focus and range information', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/carbon credits/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText(/8\.5.*target yield/i)).toBeInTheDocument();
      expect(screen.getByText(/1000K.*50\.0M/i)).toBeInTheDocument();
      expect(screen.getByText(/moderate.*risk profile/i)).toBeInTheDocument();
    });

    test('displays settlement and payment preferences', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/t1/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText(/wire.*payment/i)).toBeInTheDocument();
    });

    test('displays "What Happens Next" information section', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('What Happens Next')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText(/AI negotiation agent will understand/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles exit button click in ready state', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Return to Home')).toBeInTheDocument();
      }, { timeout: 3000 });

      fireEvent.click(screen.getByText('Return to Home'));

      expect(mockProps.onExit).toHaveBeenCalled();
    });

    test('handles exit button click in error state', async () => {
      const { validateOnboardingForNegotiation } = require('@/lib/onboarding-pipeline');
      validateOnboardingForNegotiation.mockReturnValue({
        isValid: false,
        missingFields: ['entityName']
      });

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Return to Onboarding')).toBeInTheDocument();
      }, { timeout: 3000 });

      fireEvent.click(screen.getByText('Return to Onboarding'));

      expect(mockProps.onExit).toHaveBeenCalled();
    });

    test('renders contact support link in error state', async () => {
      const { validateOnboardingForNegotiation } = require('@/lib/onboarding-pipeline');
      validateOnboardingForNegotiation.mockReturnValue({
        isValid: false,
        missingFields: ['entityName']
      });

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        const supportLink = screen.getByText('Contact Support');
        expect(supportLink).toBeInTheDocument();
        expect(supportLink.closest('a')).toHaveAttribute('href', 'mailto:institutional@wrei.com');
      }, { timeout: 3000 });
    });

    test('calls navigate function when continue button is clicked', async () => {
      const { generateNegotiationUrlParams } = require('@/lib/onboarding-pipeline');
      generateNegotiationUrlParams.mockReturnValue('test=params');

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Begin AI Negotiation')).toBeInTheDocument();
      }, { timeout: 3000 });

      fireEvent.click(screen.getByText('Begin AI Negotiation'));

      // Should show transitioning state
      expect(screen.getByText('Launching Negotiation Interface')).toBeInTheDocument();

      // Should call navigate function with correct parameters
      expect(mockNavigate).toHaveBeenCalledWith('/negotiate?test=params');
    });
  });

  describe('Entity Name Override', () => {
    test('uses entity name override when provided', async () => {
      const overrideName = 'Override Fund Name';
      render(<PipelineTransition {...mockProps} entityNameOverride={overrideName} />);

      await waitFor(() => {
        expect(screen.getByText(overrideName)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('uses original entity name when override not provided', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Test Superannuation Fund')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Progress Indicator', () => {
    test('shows active progress indicator during preparing stage', () => {
      render(<PipelineTransition {...mockProps} />);

      const preparingIndicator = screen.getByText('Preparing').closest('div');
      expect(preparingIndicator).toHaveClass('text-sky-600');
    });

    test('updates progress indicator during validating stage', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        const validatingIndicator = screen.getByText('Validating').closest('div');
        expect(validatingIndicator).toHaveClass('text-amber-600');
      }, { timeout: 2000 });
    });

    test('shows completed progress indicator in ready state', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        const validatingIndicator = screen.getByText('Validating').closest('div');
        expect(validatingIndicator).toHaveClass('text-green-600');

        const readyIndicator = screen.getByText('Ready').closest('div');
        expect(readyIndicator).toHaveClass('text-green-600');
      }, { timeout: 3000 });
    });

    test('hides progress indicator in error state', async () => {
      const { validateOnboardingForNegotiation } = require('@/lib/onboarding-pipeline');
      validateOnboardingForNegotiation.mockReturnValue({
        isValid: false,
        missingFields: ['entityName']
      });

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Configuration Issue')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Progress indicator should not be visible in error state
      expect(screen.queryByText('Preparing')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', async () => {
      render(<PipelineTransition {...mockProps} />);

      expect(screen.getByRole('heading', { level: 2, name: /preparing your profile/i })).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2, name: /ready to begin trading/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('has accessible buttons with proper labels', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /begin ai negotiation/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('has accessible link for support contact', async () => {
      const { validateOnboardingForNegotiation } = require('@/lib/onboarding-pipeline');
      validateOnboardingForNegotiation.mockReturnValue({
        isValid: false,
        missingFields: ['entityName']
      });

      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        const supportLink = screen.getByRole('link', { name: /contact support/i });
        expect(supportLink).toBeInTheDocument();
        expect(supportLink).toHaveAttribute('href', 'mailto:institutional@wrei.com');
      }, { timeout: 3000 });
    });
  });

  describe('Loading States', () => {
    test('shows loading animation in preparing stage', () => {
      render(<PipelineTransition {...mockProps} />);

      const loadingSpinner = screen.getByText('Preparing Your Profile').closest('div')?.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    test('shows pulse animation in validating stage', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        const pulseElement = screen.getByText('Validating Compliance').closest('div')?.querySelector('.animate-pulse');
        expect(pulseElement).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    test('shows loading animation in transitioning stage', async () => {
      render(<PipelineTransition {...mockProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Begin AI Negotiation'));
      }, { timeout: 3000 });

      const loadingSpinner = screen.getByText('Launching Negotiation Interface').closest('div')?.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });
});