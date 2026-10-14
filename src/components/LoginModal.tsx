import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  Key, 
  Lock, 
  Users, 
  Check, 
  Building2, 
  Clock, 
  BadgeCheck, 
  AlertCircle,
  FileText,
  Activity,
  Ruler,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OperatorProfile, PRESET_OPERATORS } from '../types/inspection';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOperator: OperatorProfile;
  onSelectOperator: (operator: OperatorProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentOperator,
  onSelectOperator,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'endusers'>('switch');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(currentOperator.id);
  const [pinInput, setPinInput] = useState<string>('');
  const [customShift, setCustomShift] = useState<string>(currentOperator.shift);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetPreset = PRESET_OPERATORS.find(p => p.id === selectedPresetId) || PRESET_OPERATORS[0];

  const handleApplyLogin = (preset: OperatorProfile = targetPreset) => {
    // If PIN entered, verify or default
    if (pinInput && preset.pin && pinInput !== preset.pin) {
      setErrorMessage(`Invalid PIN for ${preset.name}. (Default test PIN: ${preset.pin})`);
      return;
    }

    const now = new Date();
    const loginTimeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const updatedProfile: OperatorProfile = {
      ...preset,
      shift: customShift || preset.shift,
      loginTime: loginTimeStr,
    };

    onSelectOperator(updatedProfile);
    setSuccessNotice(`Authenticated as ${updatedProfile.name} (${updatedProfile.role})`);
    setTimeout(() => {
      setSuccessNotice(null);
      onClose();
    }, 600);
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput(prev => prev + digit);
      setErrorMessage(null);
    }
  };

  const handleKeypadClear = () => {
    setPinInput('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  AutoBrake AI · Plant Security & Access Control
                </h3>
                <span className="text-[10px] bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                  Module 17: RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Operator Station Login, Role Assignment & Shift Handover
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('switch')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Operator Sign-In & Switch</span>
          </button>

          <button
            onClick={() => setActiveTab('endusers')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'endusers'
                ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Who is the End-User? (Industry Personas)</span>
          </button>
        </div>

        {/* Body */}
        {activeTab === 'switch' ? (
          <div className="p-5 sm:p-6 space-y-5">
            {successNotice && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Profile Selector Cards */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block mb-2.5">
                Select Active Personnel Profile:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_OPERATORS.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  const isCurrentlyActive = currentOperator.id === preset.id;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setCustomShift(preset.shift);
                        setPinInput(preset.pin || '');
                        setErrorMessage(null);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${preset.avatarColor || 'from-slate-600 to-slate-800'} flex items-center justify-center font-bold text-white text-xs shadow-inner`}>
                            {preset.id.split('-')[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{preset.name}</span>
                              {isCurrentlyActive && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-cyan-400 font-mono font-medium">
                              {preset.title}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {preset.id}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{preset.department}</span>
                        <span className="text-slate-500">PIN: {preset.pin}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Operator Details & Shift Customizer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-400">
                  Authentication Target: <strong className="text-white">{targetPreset.name}</strong> ({targetPreset.id})
                </div>
                <div className="text-xs text-slate-300">
                  Role: <span className="text-emerald-400 font-mono font-bold">{targetPreset.role}</span> · Badge: <span className="font-mono text-cyan-400">{targetPreset.badgeNumber}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Permissions: {targetPreset.permissions?.join(', ')}
                </div>
              </div>

              {/* Shift Switcher */}
              <div className="w-full sm:w-auto shrink-0 space-y-1">
                <label className="text-[11px] font-mono text-slate-400 block">Shift Assignment:</label>
                <select
                  value={customShift}
                  onChange={(e) => setCustomShift(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Shift A (06:00 - 14:00)">Shift A (06:00 - 14:00)</option>
                  <option value="Shift B (14:00 - 22:00)">Shift B (14:00 - 22:00)</option>
                  <option value="Shift C (22:00 - 06:00)">Shift C (22:00 - 06:00)</option>
                  <option value="General Shift (08:00 - 17:00)">General Shift (08:00 - 17:00)</option>
                  <option value="Executive Oversight">Executive Oversight</option>
                </select>
              </div>
            </div>

            {/* 4-Digit PIN & Quick Login Action */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 text-slate-400">
                  <Key className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono">4-Digit Plant Security PIN</div>
                  <div className="text-[11px] text-slate-400">
                    Auto-filled for testing: <strong className="text-cyan-400 font-mono">{targetPreset.pin}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN"
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-500"
                />

                <button
                  onClick={() => handleApplyLogin()}
                  className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>Authenticate & Apply</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Who is the End-User Tab */
          <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Who is the End-User of AutoBrake AI?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                AutoBrake AI is an industrial-grade **Machine Vision & Automated Metrology Inspection System** designed for high-volume automotive brake disc manufacturing (casting, machining, and final pack-out). The system serves 5 distinct stakeholder personas across the manufacturing lifecycle:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Persona 1: Line Operator */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-md text-blue-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">1. Line Operators & Production Technicians</span>
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded font-mono">
                    Tactical
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Role:</strong> Operates the physical machining line, monitors the moving conveyor, triggers camera inspections, responds to pneumatic diverter jams, and acknowledges alarms.
                </p>
                <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                  <strong>Key Value:</strong> Eliminates human visual fatigue and prevents defective rotors from advancing down the line at 30-60 parts/min.
                </div>
              </div>

              {/* Persona 2: QA / Metrology Engineer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-md text-emerald-400">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">2. Quality Assurance & Metrology Engineers</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                    Technical QA/QC
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Role:</strong> Calibrates outer diameter (280mm ±0.5), thickness (24mm ±0.2), and runout (max 0.05mm) tolerances; fine-tunes AI confidence thresholds; signs off on Certificates of Conformance.
                </p>
                <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                  <strong>Key Value:</strong> Replaces slow, destructive coordinate measuring machine (CMM) batch audits with 100% inline contactless optical metrology.
                </div>
              </div>

              {/* Persona 3: Plant Operations Director */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-md text-purple-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">3. Plant Operations & Production Managers</span>
                  </div>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-mono">
                    Operational
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Role:</strong> Tracks Overall Equipment Effectiveness (OEE &gt; 94%), scrap rates, defect Pareto root causes (e.g. lathe tool wear vs casting porosity), and hourly throughput.
                </p>
                <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                  <strong>Key Value:</strong> Drastically reduces scrap costs, prevents warranty recall fines ($100k-$1M+), and maximizes shift yield.
                </div>
              </div>

              {/* Persona 4: Automotive OEM Auditor */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 rounded-md text-amber-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">4. Automotive OEM Quality Auditors</span>
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
                    Compliance
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Role:</strong> OEM clients (e.g., Brembo, Bosch, Continental, Tesla, Toyota, BMW) inspecting Tier-1 brake supplier plants for compliance with IATF 16949 / ISO 9001 Clause 8.5.1.
                </p>
                <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/80">
                  <strong>Key Value:</strong> 100% serialized digital traceability down to individual rotor IDs with timestamped defect heatmaps and signed reports.
                </div>
              </div>

              {/* Persona 5: Controls & Maintenance */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/20 rounded-md text-cyan-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white font-mono">5. Automation, PLC & Maintenance Engineers</span>
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono">
                    Integration & Hardware
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Role:</strong> Interfaces machine vision with Siemens S7-1500 / Allen-Bradley ControlLogix PLCs over 24V DC optoisolated signals, PROFINET, or Ethernet/IP; tunes pneumatic ejector solenoid delay and optical strobe pulse widths.
                </p>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('switch')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <span>Back to Operator Sign-In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
