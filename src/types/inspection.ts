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

export type OperatorRole = 'OPERATOR' | 'QA_ENGINEER' | 'ADMIN' | 'CONTROLS_TECH';

export interface OperatorProfile {
  id: string; // e.g. 'OP-05'
  name: string; // e.g. 'S. Saravanan'
  role: OperatorRole;
  shift: string; // e.g. 'Shift A (06:00 - 14:00)'
  department: string;
  badgeNumber: string;
  loginTime: string;
  pin?: string;
  title?: string;
  email?: string;
  avatarColor?: string;
  permissions?: string[];
}

export const PRESET_OPERATORS: OperatorProfile[] = [
  {
    id: 'OP-05',
    name: 'S. Saravanan',
    role: 'OPERATOR',
    title: 'Lead Line Operator',
    department: 'Machining & Assembly Cell #02',
    shift: 'Shift A (06:00 - 14:00)',
    badgeNumber: 'BDG-7741',
    loginTime: '2026-10-07 06:00:00',
    pin: '1234',
    email: 'saravanan.s@precisionbrake.com',
    avatarColor: 'from-cyan-500 to-blue-600',
    permissions: ['live_inspection', 'conveyor_control', 'manual_pass_fail', 'view_reports', 'acknowledge_alarms'],
  },
  {
    id: 'QA-02',
    name: 'Elena Rostova',
    role: 'QA_ENGINEER',
    title: 'Senior Metrology & Quality Engineer',
    department: 'Quality Assurance & CMM Lab',
    shift: 'General Shift (08:00 - 17:00)',
    badgeNumber: 'BDG-9903',
    loginTime: '2026-10-07 07:45:00',
    pin: '5678',
    email: 'elena.rostova@precisionbrake.com',
    avatarColor: 'from-emerald-500 to-teal-600',
    permissions: ['live_inspection', 'conveyor_control', 'manual_pass_fail', 'view_reports', 'sign_audit_report', 'calibrate_metrology', 'tune_ai_thresholds', 'export_mes'],
  },
  {
    id: 'MGR-01',
    name: 'Marcus Vance',
    role: 'ADMIN',
    title: 'Plant Production Director',
    department: 'Operations & Manufacturing Exec',
    shift: 'Executive Oversight',
    badgeNumber: 'BDG-1001',
    loginTime: '2026-10-07 08:15:00',
    pin: '9999',
    email: 'marcus.vance@precisionbrake.com',
    avatarColor: 'from-purple-500 to-indigo-600',
    permissions: ['live_inspection', 'conveyor_control', 'manual_pass_fail', 'view_reports', 'sign_audit_report', 'calibrate_metrology', 'tune_ai_thresholds', 'export_mes', 'system_admin', 'batch_release'],
  },
  {
    id: 'ENG-07',
    name: 'Dr. Henrik Lindqvist',
    role: 'CONTROLS_TECH',
    title: 'Automation & PLC Controls Engineer',
    department: 'Robotics & Industrial Automation',
    shift: 'Maintenance & Commissioning',
    badgeNumber: 'BDG-4042',
    loginTime: '2026-10-07 07:10:00',
    pin: '2468',
    email: 'henrik.l@precisionbrake.com',
    avatarColor: 'from-amber-500 to-orange-600',
    permissions: ['live_inspection', 'conveyor_control', 'manual_pass_fail', 'view_reports', 'override_plc', 'camera_tuning', 'diagnostics'],
  },
];

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
