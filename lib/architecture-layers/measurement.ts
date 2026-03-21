/**
 * WREI Measurement Layer - Vessel Telemetry Integration
 *
 * Layer 1 of 4: Real-time vessel telemetry processing, emissions calculations,
 * and carbon credit generation from Water Roads' 110-vessel fleet.
 *
 * Fleet Composition:
 * - 88 Regular Vessels: Standard efficiency operations
 * - 22 Deep Power Vessels: Enhanced efficiency with advanced propulsion
 *
 * Key Metrics:
 * - 47.2% vessel efficiency improvement
 * - 47.9% modal shift from road/rail transport
 * - 4.8% construction avoidance emissions reduction
 */

import type {
  VesselTelemetryData,
  GHGCalculation,
  MeasurementResult,
  FleetTelemetry,
  ModalShiftData,
  ConstructionAvoidanceData,
  MeasurementLayer,
  WREIArchitectureMetrics
} from './types';

// =================== MEASUREMENT CONSTANTS ===================

const WREI_MEASUREMENT_CONFIG = {
  // Fleet Configuration
  REGULAR_FLEET_SIZE: 88,
  DEEP_POWER_FLEET_SIZE: 22,
  TOTAL_FLEET_SIZE: 110,

  // Efficiency Metrics (from WREI document)
  BASE_VESSEL_EFFICIENCY: 47.2, // 47.2% efficiency improvement
  DEEP_POWER_EFFICIENCY: 58.7, // Enhanced efficiency for deep power vessels
  MODAL_SHIFT_PERCENTAGE: 47.9, // 47.9% modal shift
  CONSTRUCTION_AVOIDANCE: 4.8, // 4.8% construction avoidance

  // Emissions Factors (tCO2e per passenger-km)
  ROAD_TRANSPORT_EMISSIONS: 0.12, // Baseline road transport
  RAIL_TRANSPORT_EMISSIONS: 0.08, // Baseline rail transport
  WATER_TRANSPORT_EMISSIONS: 0.04, // WREI water transport

  // Carbon Credit Generation
  CREDIT_GENERATION_FACTOR: 1.25, // Credits per tonne avoided
  VERIFICATION_THRESHOLD: 0.95, // 95% confidence threshold

  // Construction Avoidance Factors
  ROAD_CONSTRUCTION_EMISSIONS: 2500, // tCO2e per km of road
  RAIL_CONSTRUCTION_EMISSIONS: 3200, // tCO2e per km of rail
  AVERAGE_ROUTE_SUBSTITUTION: 15.2 // Average km of infrastructure avoided per route
} as const;

// =================== MEASUREMENT LAYER IMPLEMENTATION ===================

class WREIMeasurementLayer implements MeasurementLayer {

  /**
   * Process vessel telemetry data and calculate carbon credit generation
   */
  processTelemetry(data: VesselTelemetryData): MeasurementResult {
    // Calculate GHG emissions across all scopes
    const ghgCalculation = this.calculateGHGEmissions(data);

    // Determine vessel efficiency based on operational mode
    const vesselEfficiency = this.calculateVesselEfficiency(data);

    // Calculate emissions avoided through efficient operations
    const emissionsAvoided = ghgCalculation.avoidedEmissions;

    // Generate tradeable carbon credits
    const carbonCreditsGenerated = emissionsAvoided * WREI_MEASUREMENT_CONFIG.CREDIT_GENERATION_FACTOR;

    // Verify measurement quality
    const measurementVerified = this.verifyMeasurementQuality(data, ghgCalculation);

    return {
      vesselEfficiency,
      emissionsAvoided,
      carbonCreditsGenerated,
      measurementVerified,
      ghgCalculation
    };
  }

  /**
   * Calculate GHG emissions across Scope 1, 2, and 3
   */
  calculateGHGEmissions(data: VesselTelemetryData): GHGCalculation {
    const { energyConsumption, passengerCount, routeDistance, operationalMode } = data;

    // Scope 1: Direct emissions from vessel operations
    const scope1 = energyConsumption * passengerCount * routeDistance * 0.0002; // Conversion factor

    // Scope 2: Indirect emissions from energy consumption (renewable grid factor)
    const scope2 = scope1 * 0.35; // 35% grid emissions factor

    // Scope 3: Value chain emissions (infrastructure, maintenance, etc.)
    const scope3 = (scope1 + scope2) * 0.45; // 45% value chain factor

    // Calculate avoided emissions vs alternative transport
    const alternativeEmissions = this.calculateAlternativeTransportEmissions(passengerCount, routeDistance);
    const actualEmissions = scope1 + scope2 + scope3;
    const avoidedEmissions = Math.max(0, alternativeEmissions - actualEmissions);

    // Net carbon benefit
    const netBenefit = avoidedEmissions - actualEmissions;

    return {
      scope1: Math.round(scope1 * 100) / 100,
      scope2: Math.round(scope2 * 100) / 100,
      scope3: Math.round(scope3 * 100) / 100,
      avoidedEmissions: Math.round(avoidedEmissions * 100) / 100,
      netBenefit: Math.round(netBenefit * 100) / 100
    };
  }

  /**
   * Get fleet telemetry for regular or deep power vessels
   */
  getFleetTelemetry(fleetType: 'regular' | 'deep_power'): FleetTelemetry {
    const isDeepPower = fleetType === 'deep_power';

    return {
      fleetSize: isDeepPower ? WREI_MEASUREMENT_CONFIG.DEEP_POWER_FLEET_SIZE : WREI_MEASUREMENT_CONFIG.REGULAR_FLEET_SIZE,
      totalEfficiency: isDeepPower ? WREI_MEASUREMENT_CONFIG.DEEP_POWER_EFFICIENCY : WREI_MEASUREMENT_CONFIG.BASE_VESSEL_EFFICIENCY,
      averageUtilization: isDeepPower ? 87.5 : 82.3, // Higher utilization for deep power
      combinedEmissionsReduction: isDeepPower ?
        WREI_MEASUREMENT_CONFIG.DEEP_POWER_FLEET_SIZE * 15.7 : // Enhanced reduction per vessel
        WREI_MEASUREMENT_CONFIG.REGULAR_FLEET_SIZE * 12.3 // Standard reduction per vessel
    };
  }

  /**
   * Calculate modal shift impact from road/rail to water transport
   */
  calculateModalShift(): ModalShiftData {
    const modalShiftPercentage = WREI_MEASUREMENT_CONFIG.MODAL_SHIFT_PERCENTAGE;

    // Annual passenger-km shifted to water transport
    const annualPassengerKm = 45_600_000; // From WREI operations data
    const shiftedPassengerKm = annualPassengerKm * (modalShiftPercentage / 100);

    // Emissions reduction from modal shift
    const roadEmissionsSaved = shiftedPassengerKm * 0.6 * WREI_MEASUREMENT_CONFIG.ROAD_TRANSPORT_EMISSIONS;
    const railEmissionsSaved = shiftedPassengerKm * 0.4 * WREI_MEASUREMENT_CONFIG.RAIL_TRANSPORT_EMISSIONS;
    const totalEmissionsReduction = roadEmissionsSaved + railEmissionsSaved;

    // Baseline emissions from alternative transport
    const alternativeTransportBaseline = shiftedPassengerKm *
      ((WREI_MEASUREMENT_CONFIG.ROAD_TRANSPORT_EMISSIONS * 0.6) +
       (WREI_MEASUREMENT_CONFIG.RAIL_TRANSPORT_EMISSIONS * 0.4));

    return {
      modalShiftPercentage: Math.round(modalShiftPercentage * 10) / 10,
      emissionsReduction: Math.round(totalEmissionsReduction),
      alternativeTransportBaseline: Math.round(alternativeTransportBaseline)
    };
  }

  /**
   * Calculate construction avoidance impact
   */
  calculateConstructionAvoidance(): ConstructionAvoidanceData {
    const constructionAvoidancePercentage = WREI_MEASUREMENT_CONFIG.CONSTRUCTION_AVOIDANCE;

    // Infrastructure construction avoided
    const averageRouteSubstitution = WREI_MEASUREMENT_CONFIG.AVERAGE_ROUTE_SUBSTITUTION;
    const totalRoutesSubstituted = 1247; // From WREI route analysis

    // Construction emissions avoided
    const roadConstructionAvoided = totalRoutesSubstituted * averageRouteSubstitution * 0.7 *
      WREI_MEASUREMENT_CONFIG.ROAD_CONSTRUCTION_EMISSIONS;
    const railConstructionAvoided = totalRoutesSubstituted * averageRouteSubstitution * 0.3 *
      WREI_MEASUREMENT_CONFIG.RAIL_CONSTRUCTION_EMISSIONS;

    const totalEmissionsReduction = roadConstructionAvoided + railConstructionAvoided;

    // Construction baseline
    const constructionBaseline = totalRoutesSubstituted * averageRouteSubstitution *
      ((WREI_MEASUREMENT_CONFIG.ROAD_CONSTRUCTION_EMISSIONS * 0.7) +
       (WREI_MEASUREMENT_CONFIG.RAIL_CONSTRUCTION_EMISSIONS * 0.3));

    return {
      constructionAvoidancePercentage: Math.round(constructionAvoidancePercentage * 10) / 10,
      emissionsReduction: Math.round(totalEmissionsReduction),
      constructionBaseline: Math.round(constructionBaseline)
    };
  }

  // =================== PRIVATE HELPER METHODS ===================

  private calculateVesselEfficiency(data: VesselTelemetryData): number {
    const baseEfficiency = data.vesselId.includes('DeepPower') ?
      WREI_MEASUREMENT_CONFIG.DEEP_POWER_EFFICIENCY :
      WREI_MEASUREMENT_CONFIG.BASE_VESSEL_EFFICIENCY;

    // Adjust for operational mode
    const modeMultiplier = data.operationalMode === 'deep_power' ? 1.15 :
                          data.operationalMode === 'ramp_up' ? 0.85 : 1.0;

    return Math.round(baseEfficiency * modeMultiplier * 10) / 10;
  }

  private calculateAlternativeTransportEmissions(passengerCount: number, routeDistance: number): number {
    // Weighted average of road (60%) and rail (40%) alternative transport
    const roadEmissions = passengerCount * routeDistance * WREI_MEASUREMENT_CONFIG.ROAD_TRANSPORT_EMISSIONS * 0.6;
    const railEmissions = passengerCount * routeDistance * WREI_MEASUREMENT_CONFIG.RAIL_TRANSPORT_EMISSIONS * 0.4;

    return roadEmissions + railEmissions;
  }

  private verifyMeasurementQuality(data: VesselTelemetryData, ghg: GHGCalculation): boolean {
    // Quality checks
    const validTelemetry = data.energyConsumption > 0 &&
                          data.passengerCount > 0 &&
                          data.routeDistance > 0;

    const validEmissions = ghg.avoidedEmissions > ghg.scope1 + ghg.scope2 + ghg.scope3;

    const validTimestamp = new Date(data.timestamp).getTime() > 0;

    return validTelemetry && validEmissions && validTimestamp;
  }

}

// =================== EXPORT SINGLETON INSTANCE ===================

export const measurementLayer = new WREIMeasurementLayer();

// =================== MEASUREMENT UTILITIES ===================

/**
 * Get real-time fleet status across all 110 vessels
 */
export function getFleetStatus() {
  const regularFleet = measurementLayer.getFleetTelemetry('regular');
  const deepPowerFleet = measurementLayer.getFleetTelemetry('deep_power');

  return {
    totalVessels: WREI_MEASUREMENT_CONFIG.TOTAL_FLEET_SIZE,
    regularFleet,
    deepPowerFleet,
    combinedEfficiency: (
      (regularFleet.totalEfficiency * regularFleet.fleetSize) +
      (deepPowerFleet.totalEfficiency * deepPowerFleet.fleetSize)
    ) / WREI_MEASUREMENT_CONFIG.TOTAL_FLEET_SIZE,
    totalEmissionsReduction: regularFleet.combinedEmissionsReduction + deepPowerFleet.combinedEmissionsReduction
  };
}

/**
 * Generate measurement layer performance metrics
 */
export function getMeasurementMetrics() {
  const modalShift = measurementLayer.calculateModalShift();
  const constructionAvoidance = measurementLayer.calculateConstructionAvoidance();
  const fleetStatus = getFleetStatus();

  return {
    fleetComposition: {
      regular: WREI_MEASUREMENT_CONFIG.REGULAR_FLEET_SIZE,
      deepPower: WREI_MEASUREMENT_CONFIG.DEEP_POWER_FLEET_SIZE,
      total: WREI_MEASUREMENT_CONFIG.TOTAL_FLEET_SIZE
    },
    efficiencyMetrics: {
      averageEfficiency: fleetStatus.combinedEfficiency,
      modalShift: modalShift.modalShiftPercentage,
      constructionAvoidance: constructionAvoidance.constructionAvoidancePercentage
    },
    emissionsImpact: {
      modalShiftReduction: modalShift.emissionsReduction,
      constructionAvoidanceReduction: constructionAvoidance.emissionsReduction,
      totalAnnualReduction: modalShift.emissionsReduction + constructionAvoidance.emissionsReduction,
      fleetEmissionsReduction: fleetStatus.totalEmissionsReduction
    },
    creditGeneration: {
      annualCredits: (modalShift.emissionsReduction + constructionAvoidance.emissionsReduction) *
                     WREI_MEASUREMENT_CONFIG.CREDIT_GENERATION_FACTOR,
      creditValue: (modalShift.emissionsReduction + constructionAvoidance.emissionsReduction) *
                   WREI_MEASUREMENT_CONFIG.CREDIT_GENERATION_FACTOR * 150 // A$150/tonne
    }
  };
}