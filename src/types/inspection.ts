/**
 * Industrial Disc Brake Inspection System Data Types
 * Modules 1-18 End-to-End Architecture
 */

export type DefectType = 
  | 'OK'
  | 'Surface Crack'
  | 'Machining Scratch'
  | 'Casting Porosity'
  | 'Corrosion / Rust'
  | 'Edge Damage'
  | 'Missing Feature'
  | 'Dimensional Out-of-Spec';

export type DefectSeverity = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export type CameraChannel = 'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04';

export interface CameraConfig {
  id: CameraChannel;
  name: string;
  viewAngle: string;
  lensFocalLength: string;
  lightingType: string;
  resolution: string;
}

export interface DefectBBox {
  id: string;
  type: DefectType;
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  confidence: number;
  description: string;
}

export interface DimensionalMetrics {
  outerDiameterMm: number;    // Nominal: 280.0 ± 0.5 mm
  thicknessMm: number;        // Nominal: 24.0 ± 0.2 mm
  centerBoreMm: number;       // Nominal: 68.0 ± 0.1 mm
  boltCirclePcdMm: number;    // Nominal: 114.3 ± 0.2 mm
  lateralRunoutMm: number;    // Max allowed: 0.05 mm
  isWithinTolerance: boolean;
  outOfSpecFields: string[];
}

export interface InspectionRecord {
  id: string;
  serialNumber: string;
  timestamp: string;
  batchNumber: string;
  modelType: string;
  overallDecision: 'PASS' | 'FAIL';
  primaryDefect: DefectType;
  defectSeverity: DefectSeverity;
  confidence: number;
  cycleTimeMs: number;
  operatorId: string;
  cameraChannel: CameraChannel;
  defects: DefectBBox[];
  dimensions: DimensionalMetrics;
  imageThumbnail: string;
  notes?: string;
}

export interface RotorSample {
  id: string;
  name: string;
  serialNumber: string;
  description: string;
  intendedOutcome: 'PASS' | 'FAIL';
  primaryDefect: DefectType;
  severity: DefectSeverity;
  confidence: number;
  dimensions: DimensionalMetrics;
  defects: DefectBBox[];
  surfaceTexture: 'smooth-machined' | 'slotted' | 'cross-hatch' | 'cast-rough';
  visualHighlights: string[];
  imageUrl?: string;
  category?: 'photo' | 'synthetic';
}

export interface PlcIoState {
  // 24V Digital Inputs
  di_partInPosition: boolean;    // DI 0.0
  di_fixtureClamped: boolean;    // DI 0.1
  di_proximitySensor: boolean;   // DI 0.2
  di_airPressureOk: boolean;     // DI 0.3
  di_safetyCurtainOk: boolean;   // DI 0.4
  // 24V Digital Outputs
  do_strobeRingLight: boolean;   // DO 0.0
  do_cameraTrigger: boolean;     // DO 0.1
  do_conveyorMotor: boolean;     // DO 0.2
  do_pneumaticEjector: boolean;  // DO 0.3
  do_stackLightGreen: boolean;   // DO 0.4
  do_stackLightAmber: boolean;   // DO 0.5
  do_stackLightRed: boolean;     // DO 0.6
  do_alarmBuzzer: boolean;       // DO 0.7
}

export interface SystemSettings {
  confidenceThreshold: number; // e.g. 0.85
  autoRejectionEnabled: boolean;
  soundAlertEnabled: boolean;
  inspectionDelayMs: number;
  cyclePpm: number;
  conveyorRunning: boolean;
  activeCamera: CameraChannel;
  odToleranceMm: number;
  thicknessToleranceMm: number;
  maxRunoutMm: number;
  claheEnabled: boolean;
  edgeFilterThreshold: number;
}

export interface SpcStats {
  totalInspected: number;
  passCount: number;
  failCount: number;
  defectRatePct: number;
  avgCycleTimeMs: number;
  oeeEstimatedPct: number;
  defectsByType: Record<DefectType, number>;
  hourlyHistory: Array<{ hour: string; inspected: number; defects: number; defectRate: number }>;
}
