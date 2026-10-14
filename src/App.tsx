/**
 * AutoBrake AI - Industrial Disc Brake Inspection System
 * Modules 1-18 End-to-End Modular Architecture
 */

import React, { useState, useCallback } from 'react';
import { 
  DefectType, 
  InspectionRecord, 
  PlcIoState, 
  RotorSample, 
  SpcStats, 
  SystemSettings,
  OperatorProfile,
  PRESET_OPERATORS
} from './types/inspection';
import { ROTOR_SAMPLES } from './data/rotorSamples';
import { VisionProcessResult } from './utils/visionEngine';
import { Navigation } from './components/Navigation';
import { InspectionConsole } from './components/InspectionConsole';
import { LineSimulator } from './components/LineSimulator';
import { MetrologyPanel } from './components/MetrologyPanel';
import { PlcController } from './components/PlcController';
import { SpcAnalytics } from './components/SpcAnalytics';
import { ArchitectureBlueprint } from './components/ArchitectureBlueprint';
import { ShiftReportModal } from './components/ShiftReportModal';
import { LoginModal } from './components/LoginModal';

// Initial pre-seeded historical shift records (Module 15 & 18 data)
const INITIAL_RECORDS: InspectionRecord[] = [
  {
    id: 'rec-001',
    serialNumber: 'DB-2026-08091',
    timestamp: '2026-09-28 07:12:04',
    batchNumber: 'LOT-GG25-401',
    modelType: 'Rotor A-280 Vent',
    overallDecision: 'PASS',
    primaryDefect: 'OK',
    defectSeverity: 'None',
    confidence: 0.994,
    cycleTimeMs: 382,
    operatorId: 'OP-05',
    cameraChannel: 'CAM-01',
    defects: [],
    dimensions: {
      outerDiameterMm: 280.02,
      thicknessMm: 24.01,
      centerBoreMm: 68.00,
      boltCirclePcdMm: 114.30,
      lateralRunoutMm: 0.018,
      isWithinTolerance: true,
      outOfSpecFields: [],
    },
    imageThumbnail: '',
  },
  {
    id: 'rec-002',
    serialNumber: 'DB-2026-08092',
    timestamp: '2026-09-28 07:13:22',
    batchNumber: 'LOT-GG25-401',
    modelType: 'Rotor A-280 Vent',
    overallDecision: 'FAIL',
    primaryDefect: 'Surface Crack',
    defectSeverity: 'Critical',
    confidence: 0.974,
    cycleTimeMs: 395,
    operatorId: 'OP-05',
    cameraChannel: 'CAM-01',
    defects: [{
      id: 'd-hist-1',
      type: 'Surface Crack',
      x: 60,
      y: 30,
      width: 15,
      height: 20,
      confidence: 0.974,
      description: 'Radial thermal crack',
    }],
    dimensions: {
      outerDiameterMm: 280.04,
      thicknessMm: 24.00,
      centerBoreMm: 68.01,
      boltCirclePcdMm: 114.32,
      lateralRunoutMm: 0.022,
      isWithinTolerance: true,
      outOfSpecFields: [],
    },
    imageThumbnail: '',
  },
  {
    id: 'rec-003',
    serialNumber: 'DB-2026-08093',
    timestamp: '2026-09-28 07:14:48',
    batchNumber: 'LOT-GG25-401',
    modelType: 'Rotor A-280 Vent',
    overallDecision: 'PASS',
    primaryDefect: 'OK',
    defectSeverity: 'None',
    confidence: 0.988,
    cycleTimeMs: 379,
    operatorId: 'OP-05',
    cameraChannel: 'CAM-01',
    defects: [],
    dimensions: {
      outerDiameterMm: 279.98,
      thicknessMm: 24.03,
      centerBoreMm: 67.99,
      boltCirclePcdMm: 114.28,
      lateralRunoutMm: 0.016,
      isWithinTolerance: true,
      outOfSpecFields: [],
    },
    imageThumbnail: '',
  },
  {
    id: 'rec-004',
    serialNumber: 'DB-2026-08094',
    timestamp: '2026-09-28 07:15:10',
    batchNumber: 'LOT-GG25-401',
    modelType: 'Rotor A-280 Vent',
    overallDecision: 'FAIL',
    primaryDefect: 'Casting Porosity',
    defectSeverity: 'Critical',
    confidence: 0.962,
    cycleTimeMs: 388,
    operatorId: 'OP-05',
    cameraChannel: 'CAM-01',
    defects: [],
    dimensions: {
      outerDiameterMm: 280.08,
      thicknessMm: 24.02,
      centerBoreMm: 68.02,
      boltCirclePcdMm: 114.30,
      lateralRunoutMm: 0.025,
      isWithinTolerance: true,
      outOfSpecFields: [],
    },
    imageThumbnail: '',
  },
  {
    id: 'rec-005',
    serialNumber: 'DB-2026-08095',
    timestamp: '2026-09-28 07:16:35',
    batchNumber: 'LOT-GG25-401',
    modelType: 'Rotor A-280 Vent',
    overallDecision: 'FAIL',
    primaryDefect: 'Machining Scratch',
    defectSeverity: 'High',
    confidence: 0.941,
    cycleTimeMs: 385,
    operatorId: 'OP-05',
    cameraChannel: 'CAM-01',
    defects: [],
    dimensions: {
      outerDiameterMm: 279.92,
      thicknessMm: 23.95,
      centerBoreMm: 68.01,
      boltCirclePcdMm: 114.31,
      lateralRunoutMm: 0.031,
      isWithinTolerance: true,
      outOfSpecFields: [],
    },
    imageThumbnail: '',
  },
  {
    id: 'rec-006',
    serialNumber: 'DB-2026-08096',
    timestamp: '2026-09-28 07:17:50',
    batchNumber: 'LOT-GG25-401',
    modelType: 'Rotor A-280 Vent',
    overallDecision: 'PASS',
    primaryDefect: 'OK',
    defectSeverity: 'None',
    confidence: 0.995,
    cycleTimeMs: 374,
    operatorId: 'OP-05',
    cameraChannel: 'CAM-01',
    defects: [],
    dimensions: {
      outerDiameterMm: 280.01,
      thicknessMm: 24.00,
      centerBoreMm: 68.00,
      boltCirclePcdMm: 114.30,
      lateralRunoutMm: 0.014,
      isWithinTolerance: true,
      outOfSpecFields: [],
    },
    imageThumbnail: '',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'console' | 'line' | 'metrology' | 'plc' | 'spc' | 'blueprint'
  >('console');

  const [currentSample, setCurrentSample] = useState<RotorSample>(ROTOR_SAMPLES[0]);
  const [records, setRecords] = useState<InspectionRecord[]>(INITIAL_RECORDS);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentOperator, setCurrentOperator] = useState<OperatorProfile>(PRESET_OPERATORS[0]);

  // System Settings
  const [settings, setSettings] = useState<SystemSettings>({
    confidenceThreshold: 0.85,
    autoRejectionEnabled: true,
    soundAlertEnabled: false,
    inspectionDelayMs: 350,
    cyclePpm: 30,
    conveyorRunning: true,
    activeCamera: 'CAM-01',
    odToleranceMm: 0.5,
    thicknessToleranceMm: 0.2,
    maxRunoutMm: 0.05,
    claheEnabled: true,
    edgeFilterThreshold: 45,
  });

  // PLC 24V DC Digital I/O State
  const [plcState, setPlcState] = useState<PlcIoState>({
    di_partInPosition: true,
    di_fixtureClamped: true,
    di_proximitySensor: false,
    di_airPressureOk: true,
    di_safetyCurtainOk: true,
    do_strobeRingLight: false,
    do_cameraTrigger: false,
    do_conveyorMotor: true,
    do_pneumaticEjector: false,
    do_stackLightGreen: true,
    do_stackLightAmber: false,
    do_stackLightRed: false,
    do_alarmBuzzer: false,
  });

  // Calculate SPC statistics
  // Preloaded with historical base numbers (1250 inspected, 1173 pass, 77 fail) from user's brief!
  const baseInspected = 1250;
  const basePass = 1173;
  const baseFail = 77;

  const totalInspected = baseInspected + records.length - INITIAL_RECORDS.length;
  const passCount = basePass + records.filter(r => r.overallDecision === 'PASS').length - INITIAL_RECORDS.filter(r => r.overallDecision === 'PASS').length;
  const failCount = baseFail + records.filter(r => r.overallDecision === 'FAIL').length - INITIAL_RECORDS.filter(r => r.overallDecision === 'FAIL').length;
  const defectRatePct = totalInspected > 0 ? (failCount / totalInspected) * 100 : 0;

  const defectsByType: Record<DefectType, number> = {
    'OK': passCount,
    'Surface Crack': 21 + records.filter(r => r.primaryDefect === 'Surface Crack').length - 1,
    'Machining Scratch': 18 + records.filter(r => r.primaryDefect === 'Machining Scratch').length - 1,
    'Casting Porosity': 24 + records.filter(r => r.primaryDefect === 'Casting Porosity').length - 1,
    'Corrosion / Rust': 14 + records.filter(r => r.primaryDefect === 'Corrosion / Rust').length,
    'Edge Damage': 8 + records.filter(r => r.primaryDefect === 'Edge Damage').length,
    'Missing Feature': 4 + records.filter(r => r.primaryDefect === 'Missing Feature').length,
    'Dimensional Out-of-Spec': 6 + records.filter(r => r.primaryDefect === 'Dimensional Out-of-Spec').length,
  };

  const hourlyHistory = [
    { hour: '08:00 - 09:00', inspected: 165, defects: 9, defectRate: 5.45 },
    { hour: '09:00 - 10:00', inspected: 172, defects: 11, defectRate: 6.40 },
    { hour: '10:00 - 11:00', inspected: 160, defects: 8, defectRate: 5.00 },
    { hour: '11:00 - 12:00', inspected: 168, defects: 14, defectRate: 8.33 },
    { hour: '12:00 - 13:00', inspected: 175, defects: 10, defectRate: 5.71 },
    { hour: '13:00 - 14:00', inspected: 180, defects: 12, defectRate: 6.67 },
    { hour: '14:00 - 15:00', inspected: 170, defects: 7, defectRate: 4.12 },
  ];

  const spcStats: SpcStats = {
    totalInspected,
    passCount,
    failCount,
    defectRatePct,
    avgCycleTimeMs: 385,
    oeeEstimatedPct: 94.6,
    defectsByType,
    hourlyHistory,
  };

  // Triggered on every new inspection cycle
  const handleRecordInspection = useCallback((result: VisionProcessResult, sample: RotorSample) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newRecord: InspectionRecord = {
      id: `rec-${Date.now()}`,
      serialNumber: sample.serialNumber,
      timestamp,
      batchNumber: 'LOT-GG25-401',
      modelType: 'Rotor A-280 Vent',
      overallDecision: result.decision,
      primaryDefect: result.primaryDefect,
      defectSeverity: sample.severity,
      confidence: result.confidence,
      cycleTimeMs: result.inferenceTimeMs,
      operatorId: currentOperator.id,
      cameraChannel: settings.activeCamera,
      defects: result.detectedDefects,
      dimensions: result.metrology,
      imageThumbnail: '',
    };

    setRecords(prev => [newRecord, ...prev]);
  }, [settings.activeCamera, currentOperator.id]);

  // Triggered by PLC logic
  const handleTriggerPlc = useCallback((decision: 'PASS' | 'FAIL') => {
    // Pulse strobe
    setPlcState(prev => ({
      ...prev,
      do_strobeRingLight: true,
      do_cameraTrigger: true,
      do_stackLightGreen: decision === 'PASS',
      do_stackLightRed: decision === 'FAIL',
      do_pneumaticEjector: decision === 'FAIL',
    }));

    // Reset pulse after duration
    setTimeout(() => {
      setPlcState(prev => ({
        ...prev,
        do_strobeRingLight: false,
        do_cameraTrigger: false,
        do_pneumaticEjector: false,
      }));
    }, 240);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* 1-Row 3-Zone Header Contract */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAutoRunning={isAutoRunning}
        setIsAutoRunning={setIsAutoRunning}
        onOpenReport={() => setIsReportOpen(true)}
        passCount={passCount}
        failCount={failCount}
        currentOperator={currentOperator}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'console' && (
          <InspectionConsole
            currentSample={currentSample}
            onSelectSample={setCurrentSample}
            onRecordInspection={handleRecordInspection}
            settings={settings}
            setSettings={setSettings}
            onTriggerPlc={handleTriggerPlc}
            isAutoRunning={isAutoRunning}
            setIsAutoRunning={setIsAutoRunning}
          />
        )}

        {activeTab === 'line' && (
          <LineSimulator
            settings={settings}
            setSettings={setSettings}
            onTriggerInspection={(sample, decision) => {
              setCurrentSample(sample);
              const dummyResult: VisionProcessResult = {
                grayCanvas: null,
                sobelCanvas: null,
                tensor64Data: [],
                detectedDefects: sample.defects,
                metrology: sample.dimensions,
                decision,
                primaryDefect: sample.primaryDefect,
                confidence: sample.confidence,
                inferenceTimeMs: 42,
                defectProbability: decision === 'FAIL' ? sample.confidence : 0.02,
              };
              handleRecordInspection(dummyResult, sample);
              handleTriggerPlc(decision);
            }}
            isAutoRunning={isAutoRunning}
            setIsAutoRunning={setIsAutoRunning}
          />
        )}

        {activeTab === 'metrology' && (
          <MetrologyPanel
            currentSample={currentSample}
            onSelectSample={setCurrentSample}
          />
        )}

        {activeTab === 'plc' && (
          <PlcController
            plcState={plcState}
            setPlcState={setPlcState}
          />
        )}

        {activeTab === 'spc' && (
          <SpcAnalytics
            records={records}
            spcStats={spcStats}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'blueprint' && (
          <ArchitectureBlueprint />
        )}
      </main>

      {/* Modal Shift Quality Report */}
      <ShiftReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        spcStats={spcStats}
        records={records}
        currentOperator={currentOperator}
      />

      {/* Industrial Login & Role Switcher Modal (Module 17: RBAC) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentOperator={currentOperator}
        onSelectOperator={setCurrentOperator}
      />

      {/* Industrial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <div className="flex items-center gap-2">
            <span>AutoBrake AI v2.4</span>
            <span aria-hidden="true">·</span>
            <span>Automotive Brake Disc Machine Vision & Metrology Suite</span>
          </div>
          <div>
            <span>IATF 16949 / ISO 9001:2015 Quality Architecture</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
