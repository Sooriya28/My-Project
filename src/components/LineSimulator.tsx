import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  AlertOctagon, 
  PlusCircle, 
  StepForward,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';
import { RotorSample, SystemSettings } from '../types/inspection';
import { ROTOR_SAMPLES } from '../data/rotorSamples';

interface LineSimulatorProps {
  settings: SystemSettings;
  setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  onTriggerInspection: (sample: RotorSample, decision: 'PASS' | 'FAIL') => void;
  isAutoRunning: boolean;
  setIsAutoRunning: (val: boolean) => void;
}

interface SimulatedDisc {
  id: string;
  x: number; // position along conveyor (0 to 1000)
  sample: RotorSample;
  state: 'approaching' | 'at_station' | 'inspected' | 'rejected' | 'passed';
  decision?: 'PASS' | 'FAIL';
  flashOpacity: number;
}

export const LineSimulator: React.FC<LineSimulatorProps> = ({
  settings,
  setSettings,
  onTriggerInspection,
  isAutoRunning,
  setIsAutoRunning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speedPpm, setSpeedPpm] = useState<number>(30);
  const [eStopTriggered, setEStopTriggered] = useState<boolean>(false);
  const [lastVerdict, setLastVerdict] = useState<{ serial: string; decision: 'PASS' | 'FAIL'; defect: string } | null>(null);
  
  // Station physical positions along line (0 to 1000)
  const SENSOR_POS = 340;
  const CAMERA_POS = 480;
  const EJECTOR_POS = 680;
  const PASS_BIN_POS = 920;

  const [discs, setDiscs] = useState<SimulatedDisc[]>([
    {
      id: 'd-1',
      x: 120,
      sample: ROTOR_SAMPLES[0], // Nominal PASS
      state: 'approaching',
      flashOpacity: 0,
    },
    {
      id: 'd-2',
      x: 360,
      sample: ROTOR_SAMPLES[2], // Defective crack sample
      state: 'approaching',
      flashOpacity: 0,
    },
  ]);

  const discsRef = useRef<SimulatedDisc[]>(discs);
  discsRef.current = discs;

  const [pneumaticPusherY, setPneumaticPusherY] = useState<number>(0); // 0 = retracted, 1 = fully extended
  const [strobeFlash, setStrobeFlash] = useState<number>(0);

  // Manual inject rotor
  const injectDisc = (isDefective: boolean = false) => {
    const candidateSamples = ROTOR_SAMPLES.filter(s => 
      isDefective ? s.intendedOutcome === 'FAIL' : s.intendedOutcome === 'PASS'
    );
    const chosen = candidateSamples[Math.floor(Math.random() * candidateSamples.length)];
    
    setDiscs(prev => [
      ...prev,
      {
        id: `d-${Date.now()}`,
        x: 20,
        sample: chosen,
        state: 'approaching',
        flashOpacity: 0,
      }
    ]);
  };

  // Single step pulse
  const stepForward = () => {
    const currentDiscs = discsRef.current;
    const inspectedEvents: Array<{ sample: RotorSample; decision: 'PASS' | 'FAIL' }> = [];
    let shouldTriggerPneumatic = false;
    let shouldTriggerStrobe = false;

    const nextDiscs = currentDiscs.map(disc => {
      const nextX = disc.x + 35;
      let nextState = disc.state;
      let nextDecision = disc.decision;

      if (disc.x < CAMERA_POS && nextX >= CAMERA_POS && disc.state === 'approaching') {
        nextState = 'inspected';
        const isPass = disc.sample.intendedOutcome === 'PASS' && disc.sample.dimensions.isWithinTolerance;
        nextDecision = isPass ? 'PASS' : 'FAIL';
        shouldTriggerStrobe = true;
        inspectedEvents.push({ sample: disc.sample, decision: nextDecision });
      }

      if (disc.x < EJECTOR_POS && nextX >= EJECTOR_POS && disc.decision === 'FAIL' && disc.state !== 'rejected') {
        nextState = 'rejected';
        shouldTriggerPneumatic = true;
      }

      if (nextX >= PASS_BIN_POS && disc.decision === 'PASS' && disc.state !== 'passed') {
        nextState = 'passed';
      }

      return {
        ...disc,
        x: nextX,
        state: nextState,
        decision: nextDecision,
      };
    }).filter(d => d.x <= 1040);

    setDiscs(nextDiscs);
    discsRef.current = nextDiscs;

    if (shouldTriggerStrobe) setStrobeFlash(1.0);
    if (shouldTriggerPneumatic) setPneumaticPusherY(1.0);

    for (const evt of inspectedEvents) {
      setLastVerdict({
        serial: evt.sample.serialNumber,
        decision: evt.decision,
        defect: evt.sample.primaryDefect,
      });
      onTriggerInspection(evt.sample, evt.decision);
    }
  };

  // Main animation loop
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      if (!eStopTriggered && isAutoRunning) {
        const moveSpeed = (speedPpm / 30) * 1.8;
        const currentDiscs = discsRef.current;
        let shouldTriggerStrobe = false;
        let shouldTriggerPneumatic = false;
        const inspectedEvents: Array<{ sample: RotorSample; decision: 'PASS' | 'FAIL' }> = [];

        const nextDiscs: SimulatedDisc[] = [];

        for (const disc of currentDiscs) {
          const nextX = disc.x + moveSpeed;
          let nextState = disc.state;
          let nextDecision = disc.decision;

          // 1. Camera Inspection Station
          if (disc.x < CAMERA_POS && nextX >= CAMERA_POS && disc.state === 'approaching') {
            nextState = 'inspected';
            const isPass = disc.sample.intendedOutcome === 'PASS' && disc.sample.dimensions.isWithinTolerance;
            nextDecision = isPass ? 'PASS' : 'FAIL';
            shouldTriggerStrobe = true;
            inspectedEvents.push({ sample: disc.sample, decision: nextDecision });
          }

          // 2. Pneumatic Rejector Station
          if (disc.x < EJECTOR_POS && nextX >= EJECTOR_POS && disc.decision === 'FAIL' && disc.state !== 'rejected') {
            nextState = 'rejected';
            shouldTriggerPneumatic = true;
          }

          // 3. Pass Line Exit
          if (nextX >= PASS_BIN_POS && disc.decision === 'PASS' && disc.state !== 'passed') {
            nextState = 'passed';
          }

          if (nextX <= 1040) {
            nextDiscs.push({
              ...disc,
              x: nextX,
              state: nextState,
              decision: nextDecision,
              flashOpacity: Math.max(0, disc.flashOpacity - 0.05),
            });
          }
        }

        // Auto spawn new discs if line has room
        const hasRecentDisc = nextDiscs.some(d => d.x < 240);
        if (!hasRecentDisc && Math.random() < 0.035) {
          const isDefect = Math.random() < 0.40; // 40% defect rate for realistic testing
          const samples = ROTOR_SAMPLES.filter(s => isDefect ? s.intendedOutcome === 'FAIL' : s.intendedOutcome === 'PASS');
          const sample = samples[Math.floor(Math.random() * samples.length)];
          nextDiscs.push({
            id: `d-${Date.now()}`,
            x: 10,
            sample,
            state: 'approaching',
            flashOpacity: 0,
          });
        }

        // Commit updated discs
        setDiscs(nextDiscs);
        discsRef.current = nextDiscs;

        // Decay or trigger animations
        if (shouldTriggerStrobe) {
          setStrobeFlash(1.0);
        } else {
          setStrobeFlash(prev => Math.max(0, prev - 0.10));
        }

        if (shouldTriggerPneumatic) {
          setPneumaticPusherY(1.0);
        } else {
          setPneumaticPusherY(prev => Math.max(0, prev - 0.07));
        }

        // Trigger side effects outside of state updates
        for (const evt of inspectedEvents) {
          setLastVerdict({
            serial: evt.sample.serialNumber,
            decision: evt.decision,
            defect: evt.sample.primaryDefect,
          });
          onTriggerInspection(evt.sample, evt.decision);
        }
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRunning, speedPpm, eStopTriggered, onTriggerInspection]);

  // Render Conveyor & Stations on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const scale = w / 1000;

    ctx.clearRect(0, 0, w, h);

    // Factory Floor Background
    ctx.fillStyle = '#080d17';
    ctx.fillRect(0, 0, w, h);

    // Subtle safety floor zoning markings
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const conveyorY = h * 0.52;
    const beltHeight = 44;

    // 1. Conveyor Belt Bed & Rails
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, conveyorY - beltHeight / 2, w, beltHeight);
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, conveyorY - beltHeight / 2);
    ctx.lineTo(w, conveyorY - beltHeight / 2);
    ctx.moveTo(0, conveyorY + beltHeight / 2);
    ctx.lineTo(w, conveyorY + beltHeight / 2);
    ctx.stroke();

    // Moving belt slats
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    const offset = isAutoRunning ? (Date.now() * 0.05 * (speedPpm / 30)) % 20 : 0;
    for (let x = -offset; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, conveyorY - beltHeight / 2);
      ctx.lineTo(x, conveyorY + beltHeight / 2);
      ctx.stroke();
    }

    // 2. Station 1: Loading Infeed Zone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillRect(10, conveyorY - 50, 180 * scale, 100);
    ctx.strokeStyle = '#0284c7';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(10, conveyorY - 50, 180 * scale, 100);
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText('MODULE 1: INFEED / FIXTURE JIG', 16, conveyorY - 56);

    // 3. Station 2: Optical Sensor
    const sensorX = SENSOR_POS * scale;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(sensorX - 8, conveyorY - beltHeight / 2 - 20, 16, 18);
    // Sensor Laser Beam
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sensorX, conveyorY - beltHeight / 2 - 2);
    ctx.lineTo(sensorX, conveyorY + beltHeight / 2 + 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.font = '9px monospace';
    ctx.fillText('DI 0.2: SENSOR', sensorX - 25, conveyorY - beltHeight / 2 - 26);

    // 4. Station 3: Vision Inspection Station & Camera Gantry
    const camX = CAMERA_POS * scale;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(camX - 35, conveyorY - 110, 70, 110);

    ctx.fillStyle = '#334155';
    ctx.fillRect(camX - 16, conveyorY - 100, 32, 28);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(camX - 10, conveyorY - 72, 20, 12);

    // Strobe Ring Light
    ctx.beginPath();
    ctx.arc(camX, conveyorY - 58, 22, 0, Math.PI * 2);
    ctx.strokeStyle = strobeFlash > 0.1 ? '#ffffff' : '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Strobe Flash Light Cone
    if (strobeFlash > 0.05) {
      const flashGrad = ctx.createRadialGradient(camX, conveyorY - 58, 5, camX, conveyorY, 70);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${strobeFlash * 0.9})`);
      flashGrad.addColorStop(0.5, `rgba(56, 189, 248, ${strobeFlash * 0.4})`);
      flashGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(camX, conveyorY, 65, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.fillText('CAM-01 + STROBE', camX - 40, conveyorY - 116);

    // 5. Station 4: Pneumatic Rejector Mechanism
    const ejectX = EJECTOR_POS * scale;
    const pusherExtension = pneumaticPusherY * 46;
    
    ctx.fillStyle = '#475569';
    ctx.fillRect(ejectX - 12, conveyorY - beltHeight / 2 - 40, 24, 38);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ejectX - 12, conveyorY - beltHeight / 2 - 40, 24, 38);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(ejectX - 4, conveyorY - beltHeight / 2 - 2, 8, pusherExtension);

    ctx.fillStyle = pneumaticPusherY > 0.2 ? '#ef4444' : '#e2e8f0';
    ctx.fillRect(ejectX - 20, conveyorY - beltHeight / 2 - 2 + pusherExtension, 40, 10);
    ctx.fillStyle = '#f43f5e';
    ctx.font = '9px monospace';
    ctx.fillText('DO 0.3: PNEUMATIC EJECTOR', ejectX - 55, conveyorY - beltHeight / 2 - 46);

    // Reject Bin
    const rejectBinY = conveyorY + beltHeight / 2 + 30;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(ejectX - 40, rejectBinY, 80, 50);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(ejectX - 40, rejectBinY, 80, 50);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('REJECT BIN', ejectX - 32, rejectBinY + 28);

    // Pass Line Exit Bin
    const passX = PASS_BIN_POS * scale;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(passX - 10, conveyorY - beltHeight / 2 - 15, 80, beltHeight + 30);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.strokeRect(passX - 10, conveyorY - beltHeight / 2 - 15, 80, beltHeight + 30);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PASS BIN', passX + 6, conveyorY + 4);

    // 6. Draw Moving Disc Brake Rotors
    discs.forEach(disc => {
      const dx = disc.x * scale;
      let dy = conveyorY;

      if (disc.state === 'rejected') {
        const progress = Math.min(1, (disc.x - EJECTOR_POS) / 60);
        dy = conveyorY + progress * 55;
      }

      ctx.save();
      ctx.translate(dx, dy);

      const rRadius = 18;

      ctx.beginPath();
      ctx.arc(0, 0, rRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.strokeStyle = disc.decision === 'FAIL' ? '#ef4444' : disc.decision === 'PASS' ? '#10b981' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#334155';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#090d16';
      ctx.fill();

      // Defect marker indicator
      if (disc.sample.intendedOutcome === 'FAIL') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(8, -8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

  }, [discs, strobeFlash, pneumaticPusherY, speedPpm, isAutoRunning]);

  return (
    <div className="space-y-6">
      
      {/* Simulator Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Automated Production Line Simulation</span>
            <span className="text-xs text-cyan-400 font-mono">Modules 1, 2, 8, 9, 10</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time physical flow: Loading Jig → Photoelectric Sensor → Strobe Machine Vision → Pneumatic Reject Solenoid → Bin Sorter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isAutoRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
            }`}
          >
            {isAutoRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                Pause Conveyor
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Conveyor
              </>
            )}
          </button>

          <button
            onClick={stepForward}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <StepForward className="w-3.5 h-3.5" />
            Step Pulse
          </button>

          <button
            onClick={() => injectDisc(false)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Feed Good Rotor
          </button>

          <button
            onClick={() => injectDisc(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Inject Defect
          </button>

          <button
            onClick={() => setEStopTriggered(!eStopTriggered)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              eStopTriggered
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            {eStopTriggered ? 'E-STOP ACTIVE' : 'E-STOP'}
          </button>
        </div>
      </div>

      {/* Latest Verdict Banner */}
      {lastVerdict && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
          lastVerdict.decision === 'PASS' 
            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200' 
            : 'bg-rose-950/50 border-rose-500/80 text-rose-200 animate-pulse'
        }`}>
          <div className="flex items-center gap-2">
            {lastVerdict.decision === 'PASS' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <span>
              LATEST INSPECTED: <strong>{lastVerdict.serial}</strong> · CLASSIFICATION: <strong>{lastVerdict.defect}</strong>
            </span>
          </div>
          <div className="font-bold">
            ACTION: {lastVerdict.decision === 'PASS' ? 'ACCEPTED (PASS BIN)' : 'EJECTED TO REJECT BIN (SOLENOID ON)'}
          </div>
        </div>
      )}

      {/* Primary Animated Canvas Viewport */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden shadow-2xl space-y-4">
        <div className="relative w-full aspect-[16/7] min-h-[320px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80">
          <canvas
            ref={canvasRef}
            width={1000}
            height={440}
            className="w-full h-full object-contain"
          />

          {eStopTriggered && (
            <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-30">
              <AlertOctagon className="w-12 h-12 text-rose-400 animate-bounce" />
              <h3 className="text-xl font-bold tracking-tight">EMERGENCY LINE STOP TRIPPED</h3>
              <p className="text-xs text-rose-200">Safety relay DI 0.4 open · All pneumatic and conveyor actuators de-energized</p>
              <button
                onClick={() => setEStopTriggered(false)}
                className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-semibold"
              >
                Reset Safety Interlock
              </button>
            </div>
          )}
        </div>

        {/* Speed & Conveyor Line Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80 text-xs">
          
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="text-slate-400">Line Throughput:</span>
              <span className="text-cyan-400 font-bold">{speedPpm} PPM</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={speedPpm}
              onChange={(e) => setSpeedPpm(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 PPM (Slow test)</span>
              <span>60 PPM (High speed)</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
            <div>
              <div className="text-slate-400">Active Conveyor Discs:</div>
              <div className="text-lg font-bold text-white">{discs.length} units in transit</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400">Solenoid Stroke:</div>
              <div className="text-lg font-bold text-amber-400">50 mm (6.2 Bar)</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between font-mono">
            <div>
              <div className="text-slate-400">Photoelectric Latency:</div>
              <div className="text-lg font-bold text-emerald-400">8.2 ms response</div>
            </div>
            <button
              onClick={() => setDiscs([])}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Line
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
