/**
 * ESG Impact Dashboard Component
 *
 * Interactive dashboard for real-time ESG impact measurement, tracking, and reporting.
 * Provides portfolio overview, category breakdown, compliance status, and projections.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D2: ESG Impact Dashboard
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  calculateESGDashboard,
  getInstitutionalESGRequirements,
  generateESGComplianceReport,
  calculateESGImpactROI,
  type ESGDashboardData,
  type ESGCategory,
  type ESGImpactMetric,
  type ReportingFramework,
  type InstitutionalESGRequirements,
  SAMPLE_ESG_METRICS
} from '@/lib/esg-impact-metrics';
import type { InvestorClassification } from '@/lib/types';

/**
 * Dashboard view modes
 */
type DashboardView = 'overview' | 'categories' | 'compliance' | 'projections' | 'roi';

/**
 * Component props
 */
interface ESGImpactDashboardProps {
  /** Investor classification for tailored requirements */
  investorClassification?: InvestorClassification;
  /** Investment amount for ROI calculations */
  investmentAmount?: number;
  /** Custom ESG metrics (defaults to sample data) */
  customMetrics?: ESGImpactMetric[];
  /** Component class name */
  className?: string;
}

/**
 * ESG Impact Dashboard Component
 */
export const ESGImpactDashboard: React.FC<ESGImpactDashboardProps> = ({
  investorClassification = 'wholesale',
  investmentAmount = 1000000,
  customMetrics = SAMPLE_ESG_METRICS,
  className = ''
}) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [selectedCategory, setSelectedCategory] = useState<ESGCategory>('carbon_reduction');
  const [selectedFramework, setSelectedFramework] = useState<ReportingFramework>('TCFD');
  const [isLoading, setIsLoading] = useState(true);

  // Calculate dashboard data
  const dashboardData = useMemo(() => {
    return calculateESGDashboard(customMetrics);
  }, [customMetrics]);

  // Get institutional requirements
  const requirements = useMemo(() => {
    return getInstitutionalESGRequirements(investorClassification);
  }, [investorClassification]);

  // Calculate ROI metrics
  const roiData = useMemo(() => {
    return calculateESGImpactROI(dashboardData, investmentAmount);
  }, [dashboardData, investmentAmount]);

  // Generate compliance report
  const complianceReport = useMemo(() => {
    return generateESGComplianceReport(selectedFramework, dashboardData, requirements);
  }, [selectedFramework, dashboardData, requirements]);

  // Simulate loading (faster in test environment)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), process.env.NODE_ENV === 'test' ? 100 : 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
          <span className="text-slate-600">Loading ESG impact data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="bloomberg-metric-value text-slate-900">ESG Impact Dashboard</h2>
            <p className="text-slate-600 mt-1">
              Real-time environmental, social, and governance impact tracking
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full bloomberg-small-text font-medium">
              Impact Score: {dashboardData.portfolioOverview.totalImpactScore}/10
            </div>
            <div className="bloomberg-section-label text-slate-500">
              Updated {dashboardData.portfolioOverview.lastCalculated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-4 bg-slate-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Portfolio Overview', icon: '📊' },
            { key: 'categories', label: 'Category Analysis', icon: '📈' },
            { key: 'compliance', label: 'Compliance Status', icon: '✅' },
            { key: 'projections', label: 'Impact Projections', icon: '🔮' },
            { key: 'roi', label: 'Financial Impact', icon: '💰' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key as DashboardView)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md bloomberg-small-text font-medium transition-colors ${
                currentView === key
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {currentView === 'overview' && (
          <OverviewView dashboardData={dashboardData} requirements={requirements} />
        )}

        {currentView === 'categories' && (
          <CategoriesView
            dashboardData={dashboardData}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        )}

        {currentView === 'compliance' && (
          <ComplianceView
            complianceReport={complianceReport}
            requirements={requirements}
            selectedFramework={selectedFramework}
            onFrameworkSelect={setSelectedFramework}
          />
        )}

        {currentView === 'projections' && (
          <ProjectionsView dashboardData={dashboardData} />
        )}

        {currentView === 'roi' && (
          <ROIView roiData={roiData} investmentAmount={investmentAmount} />
        )}
      </div>
    </div>
  );
};

/**
 * Portfolio Overview View
 */
const OverviewView: React.FC<{
  dashboardData: ESGDashboardData;
  requirements: InstitutionalESGRequirements;
}> = ({ dashboardData, requirements }) => {
  const { portfolioOverview, certificationStatus } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Carbon Impact"
          value={`${portfolioOverview.carbonFootprintReduction.toLocaleString()}`}
          unit="tonnes CO₂e"
          trend="improving"
          bgColor="bg-green-50"
          textColor="text-green-700"
          icon="🌱"
        />
        <MetricCard
          title="Biodiversity Score"
          value={portfolioOverview.biodiversityImpactScore.toString()}
          unit="/10"
          trend="improving"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          icon="🦎"
        />
        <MetricCard
          title="Social Impact Score"
          value={portfolioOverview.socialImpactScore.toString()}
          unit="/10"
          trend="stable"
          bgColor="bg-purple-50"
          textColor="text-purple-700"
          icon="👥"
        />
        <MetricCard
          title="Governance Score"
          value={portfolioOverview.governanceScore.toString()}
          unit="/10"
          trend="improving"
          bgColor="bg-amber-50"
          textColor="text-amber-700"
          icon="⚖️"
        />
      </div>

      {/* Certification Status */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">Verification Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="bloomberg-large-metric text-green-600">
              {certificationStatus.verifiedCredits.toLocaleString()}
            </div>
            <div className="bloomberg-small-text text-slate-600">Verified Credits</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-amber-600">
              {certificationStatus.pendingVerification.toLocaleString()}
            </div>
            <div className="bloomberg-small-text text-slate-600">Pending Verification</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-sky-600">
              {Math.round(certificationStatus.verificationRate * 100)}%
            </div>
            <div className="bloomberg-small-text text-slate-600">Verification Rate</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {certificationStatus.certificationBodies.map((body, index) => (
            <span
              key={index}
              className="bg-white px-3 py-1 rounded-full bloomberg-section-label font-medium text-slate-600 border"
            >
              {body}
            </span>
          ))}
        </div>
      </div>

      {/* Institutional Requirements */}
      <div className="bg-sky-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">
          Institutional Requirements ({requirements.classification})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Reporting Frameworks</h4>
            <div className="space-y-1">
              {requirements.mandatoryFrameworks.map((framework, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="bloomberg-small-text text-slate-600">{framework}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Required Metrics</h4>
            <div className="space-y-1">
              {requirements.requiredMetrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  <span className="bloomberg-small-text text-slate-600">
                    {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Category Analysis View
 */
const CategoriesView: React.FC<{
  dashboardData: ESGDashboardData;
  selectedCategory: ESGCategory;
  onCategorySelect: (category: ESGCategory) => void;
}> = ({ dashboardData, selectedCategory, onCategorySelect }) => {
  const { categoryBreakdown } = dashboardData;
  const categoryData = categoryBreakdown[selectedCategory];

  const categories: { key: ESGCategory; label: string; icon: string }[] = [
    { key: 'carbon_reduction', label: 'Carbon Reduction', icon: '🌱' },
    { key: 'biodiversity_protection', label: 'Biodiversity Protection', icon: '🦎' },
    { key: 'water_conservation', label: 'Water Conservation', icon: '💧' },
    { key: 'social_impact', label: 'Social Impact', icon: '👥' },
    { key: 'governance_improvement', label: 'Governance', icon: '⚖️' },
    { key: 'sustainable_development', label: 'Sustainable Development', icon: '🎯' }
  ];

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {categories.map(({ key, label, icon }) => {
          const data = categoryBreakdown[key];
          const isSelected = selectedCategory === key;

          return (
            <button
              key={key}
              onClick={() => onCategorySelect(key)}
              className={`p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="bloomberg-large-metric mb-2">{icon}</div>
              <div className={`bloomberg-small-text font-medium ${isSelected ? 'text-sky-900' : 'text-slate-900'}`}>
                {label}
              </div>
              <div className={`bloomberg-section-label ${isSelected ? 'text-sky-600' : 'text-slate-600'}`}>
                Score: {data?.score?.toFixed(1) || '0.0'}/10
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Details */}
      {categoryData && (
        <div className="space-y-6">
          {/* Category Overview */}
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="bloomberg-card-title text-slate-900">
                {categories.find(c => c.key === selectedCategory)?.label} Overview
              </h3>
              <div className="text-right">
                <div className="bloomberg-large-metric text-sky-600">
                  {categoryData.score.toFixed(1)}/10
                </div>
                <div className="bloomberg-small-text text-slate-600">Impact Score</div>
              </div>
            </div>

            {/* Progress to Target */}
            <div className="mb-4">
              <div className="flex justify-between bloomberg-small-text mb-2">
                <span className="text-slate-600">Progress to Target</span>
                <span className="font-medium text-slate-900">{categoryData.targetProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(categoryData.targetProgress, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div>
              <h4 className="font-medium text-slate-700 mb-2">12-Month Trend</h4>
              <div className="flex items-end space-x-1 h-20">
                {categoryData.monthlyTrend.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-sky-200 rounded-t transition-all duration-300 hover:bg-sky-300"
                    style={{ height: `${(value / Math.max(...categoryData.monthlyTrend)) * 100}%` }}
                    title={`Month ${index + 1}: ${value.toFixed(1)}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryData.metrics.map((metric: ESGImpactMetric) => (
              <div key={metric.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{metric.name}</h4>
                  <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${
                    metric.trend === 'improving'
                      ? 'bg-green-100 text-green-700'
                      : metric.trend === 'stable'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
                <p className="bloomberg-small-text text-slate-600 mb-3">{metric.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-small-text text-slate-600">Current</span>
                    <span className="font-medium">{metric.value.toLocaleString()} {metric.unit.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-small-text text-slate-600">Target</span>
                    <span className="font-medium">{metric.target.toLocaleString()} {metric.unit.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-small-text text-slate-600">Progress</span>
                    <span className="font-medium text-sky-600">
                      {Math.round(((metric.value - metric.baseline) / (metric.target - metric.baseline)) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 bloomberg-section-label text-slate-500">
                  Verified by {metric.verificationSource} • {metric.confidenceLevel} confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compliance Status View
 */
const ComplianceView: React.FC<{
  complianceReport: ReturnType<typeof generateESGComplianceReport>;
  requirements: InstitutionalESGRequirements;
  selectedFramework: ReportingFramework;
  onFrameworkSelect: (framework: ReportingFramework) => void;
}> = ({ complianceReport, requirements, selectedFramework, onFrameworkSelect }) => {
  const frameworks: ReportingFramework[] = ['TCFD', 'SASB', 'GRI', 'UN_SDG', 'EU_TAXONOMY', 'CSRD', 'ISSB'];

  return (
    <div className="space-y-6">
      {/* Framework Selector */}
      <div>
        <h3 className="bloomberg-card-title text-slate-900 mb-3">Reporting Framework</h3>
        <div className="flex flex-wrap gap-2">
          {frameworks.map(framework => {
            const isMandatory = requirements.mandatoryFrameworks.includes(framework);
            const isSelected = selectedFramework === framework;

            return (
              <button
                key={framework}
                onClick={() => onFrameworkSelect(framework)}
                className={`px-3 py-2 rounded-lg bloomberg-small-text font-medium transition-colors ${
                  isSelected
                    ? 'bg-sky-500 text-white'
                    : isMandatory
                    ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {framework}
                {isMandatory && <span className="ml-1 bloomberg-section-label">*</span>}
              </button>
            );
          })}
        </div>
        <p className="bloomberg-small-text text-slate-600 mt-2">
          * Mandatory frameworks for {requirements.classification} classification
        </p>
      </div>

      {/* Compliance Score */}
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="bloomberg-card-title text-slate-900">
            {selectedFramework} Compliance Status
          </h3>
          <div className="text-right">
            <div className={`bloomberg-large-metric ${
              complianceReport.complianceScore >= 80
                ? 'text-green-600'
                : complianceReport.complianceScore >= 60
                ? 'text-amber-600'
                : 'text-red-600'
            }`}>
              {complianceReport.complianceScore}%
            </div>
            <div className="bloomberg-small-text text-slate-600">Compliance Score</div>
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              complianceReport.complianceScore >= 80
                ? 'bg-green-500'
                : complianceReport.complianceScore >= 60
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${complianceReport.complianceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Compliance Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Disclosures */}
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="font-medium text-green-900 mb-3">
            ✅ Completed Disclosures ({complianceReport.completedDisclosures.length})
          </h4>
          <div className="space-y-2">
            {complianceReport.completedDisclosures.map((disclosure, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="bloomberg-small-text text-green-700">{disclosure}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Gaps */}
        <div className="bg-red-50 rounded-lg p-6">
          <h4 className="font-medium text-red-900 mb-3">
            ❌ Compliance Gaps ({complianceReport.gaps.length})
          </h4>
          <div className="space-y-2">
            {complianceReport.gaps.map((gap, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="bloomberg-small-text text-red-700">{gap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {complianceReport.recommendations.length > 0 && (
        <div className="bg-sky-50 rounded-lg p-6">
          <h4 className="font-medium text-sky-900 mb-3">💡 Recommendations</h4>
          <div className="space-y-2">
            {complianceReport.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-2"></div>
                <span className="bloomberg-small-text text-sky-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Impact Projections View
 */
const ProjectionsView: React.FC<{
  dashboardData: ESGDashboardData;
}> = ({ dashboardData }) => {
  const { impactProjections } = dashboardData;

  return (
    <div className="space-y-6">
      <h3 className="bloomberg-card-title text-slate-900">Future Impact Projections</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {impactProjections.map((projection, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-medium text-slate-900 mb-4 capitalize">
              {projection.timeline.replace('months', ' Months').replace('month', ' Month').replace('year', ' Year')} Projection
            </h4>

            <div className="space-y-4">
              <ProjectionMetric
                label="Carbon Reduction"
                value={projection.projectedCarbonReduction}
                unit="tonnes CO₂e"
                confidence={projection.confidenceInterval}
                color="green"
              />
              <ProjectionMetric
                label="Biodiversity Gain"
                value={projection.projectedBiodiversityGain}
                unit="hectares"
                confidence={projection.confidenceInterval}
                color="blue"
              />
              <ProjectionMetric
                label="Social Benefit"
                value={projection.projectedSocialBenefit}
                unit="people"
                confidence={projection.confidenceInterval}
                color="purple"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="bloomberg-section-label text-slate-600">
                Confidence interval: {Math.round(projection.confidenceInterval[0] * 100)}% - {Math.round(projection.confidenceInterval[1] * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ROI and Financial Impact View
 */
const ROIView: React.FC<{
  roiData: ReturnType<typeof calculateESGImpactROI>;
  investmentAmount: number;
}> = ({ roiData, investmentAmount }) => {
  return (
    <div className="space-y-6">
      <h3 className="bloomberg-card-title text-slate-900">ESG Financial Impact Analysis</h3>

      {/* ROI Overview */}
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className={`bloomberg-large-metric ${
              roiData.impactROI >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {roiData.impactROI >= 0 ? '+' : ''}{roiData.impactROI}%
            </div>
            <div className="bloomberg-small-text text-slate-600">ESG Impact ROI</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-sky-600">
              ${roiData.totalESGValue.toLocaleString()}
            </div>
            <div className="bloomberg-small-text text-slate-600">Total ESG Value</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-purple-600">
              {roiData.paybackPeriodMonths}
            </div>
            <div className="bloomberg-small-text text-slate-600">Payback (Months)</div>
          </div>
        </div>

        <div className="bloomberg-small-text text-slate-600">
          Based on ${investmentAmount.toLocaleString()} investment
        </div>
      </div>

      {/* Value Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ValueCard
          title="Carbon Value"
          value={roiData.totalESGValue * 0.4} // Approximate carbon portion
          description={`At $${roiData.carbonPrice}/tonne CO₂e pricing`}
          color="green"
        />
        <ValueCard
          title="Social Value"
          value={roiData.socialValueGenerated}
          description="Community and stakeholder benefits"
          color="purple"
        />
        <ValueCard
          title="Reputational Value"
          value={roiData.reputationalValue}
          description="Brand premium and market positioning"
          color="amber"
        />
      </div>
    </div>
  );
};

/**
 * Reusable Metric Card Component
 */
const MetricCard: React.FC<{
  title: string;
  value: string;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  bgColor: string;
  textColor: string;
  icon: string;
}> = ({ title, value, unit, trend, bgColor, textColor, icon }) => (
  <div className={`${bgColor} rounded-lg p-4`}>
    <div className="flex items-center justify-between mb-2">
      <span className="bloomberg-large-metric">{icon}</span>
      <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${
        trend === 'improving'
          ? 'bg-green-100 text-green-700'
          : trend === 'stable'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {trend}
      </span>
    </div>
    <div className={`bloomberg-large-metric ${textColor} mb-1`}>
      {value}<span className="bloomberg-card-title font-normal">{unit}</span>
    </div>
    <div className={`bloomberg-small-text ${textColor.replace('700', '600')}`}>{title}</div>
  </div>
);

/**
 * Projection Metric Component
 */
const ProjectionMetric: React.FC<{
  label: string;
  value: number;
  unit: string;
  confidence: [number, number];
  color: 'green' | 'blue' | 'purple';
}> = ({ label, value, unit, confidence, color }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  };

  return (
    <div>
      <div className="flex justify-between items-end">
        <span className="bloomberg-small-text text-slate-600">{label}</span>
        <span className={` ${colorClasses[color]}`}>
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <div className="bloomberg-section-label text-slate-500 mt-1">
        Range: {Math.round(value * confidence[0]).toLocaleString()} - {Math.round(value * confidence[1]).toLocaleString()}
      </div>
    </div>
  );
};

/**
 * Value Card Component
 */
const ValueCard: React.FC<{
  title: string;
  value: number;
  description: string;
  color: 'green' | 'purple' | 'amber';
}> = ({ title, value, description, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4`}>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="bloomberg-metric-value mb-1">${Math.round(value).toLocaleString()}</div>
      <div className="bloomberg-small-text opacity-80">{description}</div>
    </div>
  );
};