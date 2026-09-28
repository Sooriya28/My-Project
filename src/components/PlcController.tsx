import React, { useState } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  Lightbulb, 
  ShieldCheck, 
  AlertCircle, 
  Terminal, 
  Play, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { PlcIoState } from '../types/inspection';

interface PlcControllerProps {
  plcState: PlcIoState;
  setPlcState: React.Dispatch<React.SetStateAction<PlcIoState>>;
}

export const PlcController: React.FC<PlcControllerProps> = ({
  plcState,
  setPlcState,
}) => {
  const [selectedRung, setSelectedRung] = useState<number>(1);
  const [plcMode, setPlcMode] = useState<'RUN' | 'PROGRAM' | 'TEST'>('RUN');

  // Toggle digital input
  const toggleInput = (key: keyof PlcIoState) => {
    setPlcState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Controller Header & Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>PLC / Industrial Controller & Sensor Bus</span>
            <span className="text-xs text-cyan-400 font-mono">Modules 9 & 10</span>
          </h2>
          <p className="text-xs text-slate-400">
            IEC 61131-3 Ladder Execution · 24V PNP Sinking/Sourcing I/O · 10ms Scan Cycle
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {(['RUN', 'TEST', 'PROGRAM'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setPlcMode(mode)}
              className={`px-3 py-1 rounded transition-colors ${
                plcMode === mode
                  ? mode === 'RUN' ? 'bg-emerald-600 text-white font-bold' : 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Industrial Hardware Architecture Diagram */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-3">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span>HARDWARE TOPOLOGY: PROTOTYPE (PC + ARDUINO) → PRODUCTION (IPC + SIEMENS S7-1200)</span>
          <span className="text-cyan-400">Modbus TCP / PROFINET</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-amber-400 font-bold mb-1">PROXIMITY SENSOR</span>
            <span className="text-[10px] text-slate-400">M12 Inductive NPN</span>
            <span className="text-[10px] text-emerald-400 mt-2 font-mono">DI 0.0 (Part In Position)</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-cyan-400 font-bold mb-1">INDUSTRIAL PC / AI</span>
            <span className="text-[10px] text-slate-400">TensorRT / ONNX Engine</span>
            <span className="text-[10px] text-cyan-300 mt-2 font-mono">TCP Socket &lt;40ms</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-emerald-400 font-bold mb-1">PLC CONTROLLER</span>
            <span className="text-[10px] text-slate-400">24V DC Digital Output</span>
            <span className="text-[10px] text-emerald-300 mt-2 font-mono">DO 0.3 Reject Solenoid</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
            <span className="text-rose-400 font-bold mb-1">PNEUMATIC ACTUATOR</span>
            <span className="text-[10px] text-slate-400">5/2 Solenoid Valve (6 Bar)</span>
            <span className="text-[10px] text-rose-300 mt-2 font-mono">Diverts Defective Part</span>
          </div>
        </div>
      </div>

      {/* 24V DC Digital I/O Bank (Interactive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Digital Inputs (DI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              24V DC Digital Inputs (Sensors & Switches)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Click to Toggle State</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { key: 'di_partInPosition' as const, label: 'DI 0.0: Inductive Proximity (Rotor Detected in Jig)', active: plcState.di_partInPosition },
              { key: 'di_fixtureClamped' as const, label: 'DI 0.1: Pneumatic Clamp Reed Switch (Locked)', active: plcState.di_fixtureClamped },
              { key: 'di_proximitySensor' as const, label: 'DI 0.2: Conveyor Optical Entry Beam (Clear)', active: plcState.di_proximitySensor },
              { key: 'di_airPressureOk' as const, label: 'DI 0.3: Air Pressure Transducer (&gt;6.0 Bar)', active: plcState.di_airPressureOk },
              { key: 'di_safetyCurtainOk' as const, label: 'DI 0.4: Safety Light Curtain Interlock (Safe)', active: plcState.di_safetyCurtainOk },
            ].map(di => (
              <div
                key={di.key}
                onClick={() => toggleInput(di.key)}
                className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  di.active 
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200' 
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full border ${
                    di.active ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]' : 'bg-slate-800 border-slate-700'
                  }`} />
                  <span>{di.label}</span>
                </div>
                <span className="font-bold text-xs">{di.active ? 'HIGH (24V)' : 'LOW (0V)'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Outputs (DO) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              24V DC Digital Outputs (Actuators & Strobe)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Manual Test Overrides</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { key: 'do_strobeRingLight' as const, label: 'DO 0.0: High-Speed LED Strobe Ring Flash', active: plcState.do_strobeRingLight, color: 'emerald' },
              { key: 'do_cameraTrigger' as const, label: 'DO 0.1: GigE Hardware Shutter Trigger Opto', active: plcState.do_cameraTrigger, color: 'emerald' },
              { key: 'do_conveyorMotor' as const, label: 'DO 0.2: Conveyor VFD Forward Run Contactor', active: plcState.do_conveyorMotor, color: 'cyan' },
              { key: 'do_pneumaticEjector' as const, label: 'DO 0.3: Pneumatic Rejector Solenoid Valve', active: plcState.do_pneumaticEjector, color: 'rose' },
              { key: 'do_stackLightGreen' as const, label: 'DO 0.4: Stack Tower Light (GREEN - Running)', active: plcState.do_stackLightGreen, color: 'emerald' },
              { key: 'do_stackLightRed' as const, label: 'DO 0.6: Stack Tower Light (RED - Reject/Fault)', active: plcState.do_stackLightRed, color: 'rose' },
              { key: 'do_alarmBuzzer' as const, label: 'DO 0.7: Audible Alarm Warning Horn (Buzzer)', active: plcState.do_alarmBuzzer, color: 'amber' },
            ].map(dOut => (
              <div
                key={dOut.key}
                onClick={() => toggleInput(dOut.key)}
                className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  dOut.active 
                    ? dOut.color === 'rose' 
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                      : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full border ${
                    dOut.active 
                      ? dOut.color === 'rose'
                        ? 'bg-rose-500 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                        : 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                      : 'bg-slate-800 border-slate-700'
                  }`} />
                  <span>{dOut.label}</span>
                </div>
                <span className="font-bold text-xs">{dOut.active ? 'ENERGIZED' : 'OFF'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Ladder Logic Rung Visualizer (IEC 61131-3) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-300">
          <span className="font-bold">LADDER LOGIC SCAN (RUNG EXECUTION TRACE)</span>
          <span className="text-emerald-400">CYCLES: 1,842,910 · SCAN: 8.4 ms</span>
        </div>

        {/* Rung 1: Inspection Trigger Sequence */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px]">RUNG 0001: CAMERA STROBE & TRIGGER SEQUENCE</div>
          <div className="flex items-center gap-3 overflow-x-auto py-2 text-xs">
            <span className="text-slate-500 font-bold">|--[ DI 0.0 Part Present ]--</span>
            <span className="text-slate-500 font-bold">--[ DI 0.1 Clamped ]--</span>
            <span className="text-slate-500 font-bold">--[ DI 0.4 Safety OK ]--</span>
            <span className="text-cyan-400 font-bold">--( DO 0.0 Strobe Pulse )--|</span>
          </div>
          <div className="text-[10px] text-slate-500">Condition: Fires 100µs LED strobe and triggers hardware camera capture.</div>
        </div>

        {/* Rung 2: Automatic Rejection Valve Solenoid */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px]">RUNG 0002: DEFECT REJECTION DIVERTER CYLINDER</div>
          <div className="flex items-center gap-3 overflow-x-auto py-2 text-xs">
            <span className="text-slate-500 font-bold">|--[ AI_VERDICT == REJECT ]--</span>
            <span className="text-slate-500 font-bold">--[ ENCODER_POS == 680mm ]--</span>
            <span className="text-rose-400 font-bold">--( DO 0.3 Solenoid Valve 150ms )--|</span>
          </div>
          <div className="text-[10px] text-slate-500">Condition: Pushes defective disc brake into Reject Bin via pneumatic stroke.</div>
        </div>

        {/* Rung 3: Stack Tower Alarm */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-slate-400 text-[11px]">RUNG 0003: CONSECUTIVE DEFECT INTERLOCK (3x FAILS)</div>
          <div className="flex items-center gap-3 overflow-x-auto py-2 text-xs">
            <span className="text-slate-500 font-bold">|--[ REJECT_COUNT &gt;= 3 ]--</span>
            <span className="text-rose-400 font-bold">--( DO 0.6 Red Light )--</span>
            <span className="text-amber-400 font-bold">--( DO 0.7 Horn Buzzer )--</span>
            <span className="text-slate-500 font-bold">--[/ DO 0.2 Conveyor /]--|</span>
          </div>
          <div className="text-[10px] text-slate-500">Condition: Automatically halts conveyor and alerts supervisor if 3 defects occur in a row.</div>
        </div>
      </div>

    </div>
  );
};
