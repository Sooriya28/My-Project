import React, { useState } from 'react';
import { 
  Ruler, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  Cpu, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { RotorSample } from '../types/inspection';
import { ROTOR_SAMPLES } from '../data/rotorSamples';

interface MetrologyPanelProps {
  currentSample: RotorSample;
  onSelectSample: (sample: RotorSample) => void;
}

export const MetrologyPanel: React.FC<MetrologyPanelProps> = ({
  currentSample,
  onSelectSample,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string>('od');

  const { dimensions } = currentSample;

  const odStatus = Math.abs(dimensions.outerDiameterMm - 280.0) <= 0.5;
  const thkStatus = Math.abs(dimensions.thicknessMm - 24.0) <= 0.2;
  const boreStatus = Math.abs(dimensions.centerBoreMm - 68.0) <= 0.1;
  const pcdStatus = Math.abs(dimensions.boltCirclePcdMm - 114.3) <= 0.2;
  const runoutStatus = dimensions.lateralRunoutMm <= 0.05;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Ruler className="w-5 h-5 text-cyan-400" />
            <span>Dimensional Metrology & Geometric Tolerancing</span>
            <span className="text-xs text-cyan-400 font-mono">Modules 12 & 13</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automotive Brake Rotor Spec: FMVSS 105/135 & ECE R90 Dimensional Conformity
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Active Part:</span>
          <span className="font-semibold text-white bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {currentSample.serialNumber}
          </span>
        </div>
      </div>

      {/* Critical Engineering Note (Module 13: Vision AI + Traditional Metrology) */}
      <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Why CNN Appearance Alone is Insufficient for Disc Brakes</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          A Convolutional Neural Network (CNN) excels at detecting visual surface anomalies (cracks, tool gouges, blowholes, porosity, and oxidation). 
          However, <strong>safety-critical automotive brake rotors</strong> can experience violent pedal shudder or failure if they have <strong>lateral runout (&gt;0.05 mm)</strong>, 
          <strong>disc thickness variation (DTV &gt; 10 µm)</strong>, or undersized diameter, even when the casting surface appears spotless.
          The production cell pairs the CNN Vision Engine with <strong>Laser Metrology Displacement Sensors</strong> to achieve 100% QA.
        </p>
      </div>

      {/* Digital Vernier & Dial Gauge Readout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Outer Diameter (OD) */}
        <div 
          onClick={() => setSelectedDimension('od')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            odStatus
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-rose-950/30 border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Outer Diameter (OD)</span>
            {odStatus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className={`text-2xl font-bold ${odStatus ? 'text-white' : 'text-rose-400'}`}>
              {dimensions.outerDiameterMm.toFixed(2)} mm
            </span>
            <span className="text-xs text-slate-500">Nom: 280.0 ± 0.5</span>
          </div>
          {/* Tolerance bar */}
          <div className="mt-3 relative h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className={`h-full ${odStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, ((dimensions.outerDiameterMm - 279) / 2) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>279.5 min</span>
            <span>280.5 max</span>
          </div>
        </div>

        {/* 2. Rotor Flange Thickness */}
        <div 
          onClick={() => setSelectedDimension('thickness')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            thkStatus
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-rose-950/30 border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Friction Disc Thickness</span>
            {thkStatus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className={`text-2xl font-bold ${thkStatus ? 'text-white' : 'text-rose-400'}`}>
              {dimensions.thicknessMm.toFixed(2)} mm
            </span>
            <span className="text-xs text-slate-500">Nom: 24.0 ± 0.2</span>
          </div>
          <div className="mt-3 relative h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className={`h-full ${thkStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, ((dimensions.thicknessMm - 23.5) / 1) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>23.8 min</span>
            <span>24.2 max</span>
          </div>
        </div>

        {/* 3. Lateral Runout / Flatness (Crucial Disc Brake Spec) */}
        <div 
          onClick={() => setSelectedDimension('runout')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            runoutStatus
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-rose-950/30 border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Lateral Runout (TIR)</span>
            {runoutStatus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className={`text-2xl font-bold ${runoutStatus ? 'text-white' : 'text-rose-400'}`}>
              {dimensions.lateralRunoutMm.toFixed(3)} mm
            </span>
            <span className="text-xs text-slate-500">Limit: &lt;0.050</span>
          </div>
          <div className="mt-3 relative h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className={`h-full ${runoutStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (dimensions.lateralRunoutMm / 0.08) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0.000 (Ideal)</span>
            <span>0.050 max</span>
          </div>
        </div>

        {/* 4. Center Spindle Hub Bore */}
        <div 
          onClick={() => setSelectedDimension('bore')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            boreStatus
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-rose-950/30 border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Center Spindle Bore</span>
            {boreStatus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className={`text-2xl font-bold ${boreStatus ? 'text-white' : 'text-rose-400'}`}>
              {dimensions.centerBoreMm.toFixed(2)} mm
            </span>
            <span className="text-xs text-slate-500">Nom: 68.0 ± 0.1</span>
          </div>
          <div className="mt-3 relative h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className={`h-full ${boreStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, ((dimensions.centerBoreMm - 67.8) / 0.4) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>67.9 min</span>
            <span>68.1 max</span>
          </div>
        </div>

        {/* 5. PCD Bolt Circle Diameter */}
        <div 
          onClick={() => setSelectedDimension('pcd')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            pcdStatus
              ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              : 'bg-rose-950/30 border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Pitch Circle Dia (PCD)</span>
            {pcdStatus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className={`text-2xl font-bold ${pcdStatus ? 'text-white' : 'text-rose-400'}`}>
              {dimensions.boltCirclePcdMm.toFixed(2)} mm
            </span>
            <span className="text-xs text-slate-500">5×114.3 ± 0.2</span>
          </div>
          <div className="mt-3 relative h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className={`h-full ${pcdStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, ((dimensions.boltCirclePcdMm - 114) / 0.6) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>114.1 min</span>
            <span>114.5 max</span>
          </div>
        </div>

        {/* 6. Overall Metrology Verdict */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          dimensions.isWithinTolerance
            ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
        }`}>
          <div>
            <span className="text-xs font-mono font-medium">METROLOGY GATE</span>
            <div className="text-2xl font-bold font-mono mt-1">
              {dimensions.isWithinTolerance ? 'CONFORMANT' : 'OUT-OF-SPEC'}
            </div>
            <p className="text-xs mt-1 text-slate-300">
              {dimensions.isWithinTolerance 
                ? 'All 5 critical dimensions within ISO 2768-m tolerances' 
                : `${dimensions.outOfSpecFields.length} dimensional violations detected`}
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            Sensor: Keyence LK-G5000 Laser Triangulation
          </div>
        </div>

      </div>

      {/* Test Sample Selector for Metrology */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300">
          Load Known Dimension Failure Specimen:
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => onSelectSample(ROTOR_SAMPLES[8])}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 transition-colors"
          >
            Sample #9: Warped Flange & Excessive Runout (0.115mm TIR)
          </button>
          <button
            onClick={() => onSelectSample(ROTOR_SAMPLES[5])}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 transition-colors"
          >
            Sample #6: Rim Edge Chipped (Undersized OD 277.6mm)
          </button>
          <button
            onClick={() => onSelectSample(ROTOR_SAMPLES[7])}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 transition-colors"
          >
            Sample #8: Missing 5th Wheel Stud Hole (PCD Geometry Check)
          </button>
          <button
            onClick={() => onSelectSample(ROTOR_SAMPLES[0])}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 transition-colors"
          >
            Sample #1: Nominal Reference Rotor (All OK)
          </button>
        </div>
      </div>

    </div>
  );
};
