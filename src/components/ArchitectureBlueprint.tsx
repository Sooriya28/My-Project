import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Camera, 
  Lightbulb, 
  Sliders, 
  FileCode2, 
  Calculator, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export const ArchitectureBlueprint: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(4);
  const [expandedModule, setExpandedModule] = useState<number | null>(1);

  // Optics Calculator State
  const [sensorWidthMm, setSensorWidthMm] = useState<number>(7.1); // 1/1.8" sensor
  const [workingDistanceMm, setWorkingDistanceMm] = useState<number>(450); // 450mm from rotor
  const [fovWidthMm, setFovWidthMm] = useState<number>(320); // 320mm field of view for 280mm rotor

  // Focal length formula: f = (WD * SensorWidth) / (FOV + SensorWidth) ≈ (WD * SensorWidth) / FOV
  const calculatedFocalLength = Math.round((workingDistanceMm * sensorWidthMm) / fovWidthMm);

  const modules = [
    {
      num: 1,
      title: "Part Loading",
      subtitle: "Conveyor / Manual Inspection Fixture",
      description: "Brings the brake disc into the inspection station. For small manufacturing units, starting with manual loading into a precision recessed nesting jig eliminates thousands of dollars in high-speed vibratory orienting feeders while ensuring 100% stable positioning.",
      hardware: "Hardened steel jig plate, guide bevels, loading nest",
      keyRule: "Repeatability: Rotor must settle within ±1mm before clamp engages."
    },
    {
      num: 2,
      title: "Positioning & Fixture",
      subtitle: "Locating Pins & Clamps",
      description: "The AI model must see the disc rotor in approximately the same orientation and position every cycle. Mechanical dowel pins align with the rotor hub and lug holes, reducing visual variation and allowing a compact, lightweight CNN to attain 96%+ validation accuracy without massive spatial invariance penalties.",
      hardware: "Tapered locating pins, pneumatic toggle clamp, inductive reed sensor",
      keyRule: "Geometric consistency directly multiplies CNN inference reliability."
    },
    {
      num: 3,
      title: "Industrial Camera + Lighting",
      subtitle: "Wavelength, Angles & Strobe",
      description: "Lighting is just as critical as the neural network. A good CNN will fail on poor images. Low-angle darkfield illumination casts sharp shadows across radial cracks and machining scratches, while high-angle diffuse dome lighting reveals sub-surface casting porosity and blowholes without blinding specular reflections.",
      hardware: "Basler / Daheng 5MP GigE Vision Camera, C-Mount 16mm Lens, White LED Ring Strobe",
      keyRule: "Tune lighting specifically for cracks, scratches, and porosity."
    },
    {
      num: 4,
      title: "Image Preprocessing",
      subtitle: "ROI Extraction, CLAHE & Rescaling",
      description: "Raw Camera Frame → Circular ROI Crop → Rescale to 64×64 (or 128×128) → Luminance Conversion → Contrast Limited Adaptive Histogram Equalization (CLAHE) → Normalization (/255.0) → Input Tensor. Filters out background ambient shop lighting fluctuations.",
      hardware: "OpenCV Python pipeline / C++ Vision library / WebGL shader",
      keyRule: "Normalizes brightness variations caused by dust or day/night factory shifts."
    },
    {
      num: 5,
      title: "AI Defect Detection",
      subtitle: "CNN Feature Extraction",
      description: "Your trained Keras model (`best_model.h5`): Conv2D (8 filters, 3×3) → MaxPool2D → Conv2D (8 filters, 3×3) → MaxPool2D → Flatten → Dense (128) → Dense (128) → Dense Sigmoid/Softmax. Converted to ONNX / TensorRT for sub-25ms inference on edge IPCs.",
      hardware: "NVIDIA Jetson Orin Nano ($299) or Intel N100 Mini IPC ($140)",
      keyRule: "Trained on real automotive disc brake defect taxonomy."
    },
    {
      num: 6,
      title: "Defect Classification",
      subtitle: "Multi-Class Root Cause Engine",
      description: "Instead of a black-box 'Defective / Not Defective' output, the system classifies defects into 8 distinct categories: OK, Radial Thermal Crack, Machining Tool Scratch, Casting Porosity/Blowhole, Corrosion/Rust, Edge Damage, Missing Stud Hole, and Dimensional Out-of-Spec.",
      hardware: "Multi-class Softmax classification head with Grad-CAM localization",
      keyRule: "Gives quality engineers immediate feedback on whether the foundry or lathe failed."
    },
    {
      num: 7,
      title: "Pass / Fail Decision Engine",
      subtitle: "Confidence Thresholds & Safety Rules",
      description: "Converts AI probabilities into a certified manufacturing decision. Employs a fail-safe threshold: if defect confidence ≥ 85%, or if any crack is detected with ≥ 80% certainty, the rotor is immediately flagged for rejection. Also requires dimensional metrology pass.",
      hardware: "Deterministic rule engine with configurable threshold parameters",
      keyRule: "For safety-critical brake components, visual AI is paired with fail-safe bounds."
    },
    {
      num: 8,
      title: "Automatic Rejection System",
      subtitle: "Pneumatic Diverter / Pusher Solenoid",
      description: "Sorts inspected discs into separate streams: PASS parts proceed along the conveyor to final packaging, while REJECT parts are diverted via a high-speed pneumatic cylinder or diverter arm into a lockable scrap bin.",
      hardware: "SMC 50mm stroke pneumatic cylinder, 5/2 way 24V solenoid valve, air regulator (6 Bar)",
      keyRule: "Pneumatic cylinder stroke must actuate within 150ms of camera trigger."
    },
    {
      num: 9,
      title: "PLC / Industrial Controller",
      subtitle: "Physical Automation Bridge",
      description: "Bridges the AI software with the production hardware. Receives sensor signals, strobes the LED illuminator, triggers the camera shutter, and energizes the rejection solenoid. Prototypes use PC + Arduino/Opta; production uses Siemens S7-1200 or Omron PLC.",
      hardware: "Siemens S7-1200 / Arduino Opta Industrial PLC / Optocoupled 24V relay board",
      keyRule: "24V DC PNP sinking/sourcing standard with galvanic isolation."
    },
    {
      num: 10,
      title: "Sensor Module",
      subtitle: "Infeed Triggering & Interlocks",
      description: "Detects when a brake rotor has entered the inspection jig: M12 inductive proximity sensor confirms ferrous disc seated on jig, while photoelectric retroreflective beam verifies clear conveyor infeed.",
      hardware: "Omron E2E M12 Inductive Proximity Sensor, Banner Photoelectric Sensor",
      keyRule: "Eliminates false triggers and synchronizes camera exposure."
    },
    {
      num: 11,
      title: "Multi-Camera Inspection",
      subtitle: "360° Comprehensive Coverage",
      description: "A disc rotor cannot be certified from a single top photo. Complete cell architecture uses: CAM-01 (Top friction surface), CAM-02 (Bottom friction surface), CAM-03 (Side ventilation vanes & thickness profile), and CAM-04 (Center hub bore & lug pattern).",
      hardware: "Multi-camera USB3/GigE hub, synchronized hardware trigger bus",
      keyRule: "Multi-view ensures edge chips and cooling vane blockages are caught."
    },
    {
      num: 12,
      title: "Dimensional Metrology",
      subtitle: "Geometric Caliper & Runout Gauging",
      description: "Not every brake defect is visual. Lateral runout (warpage >0.05 mm), undersized outer diameter, or disc thickness variation (DTV) cause severe pedal shudder. Laser triangulation displacement sensors gauge dimensions during rotation.",
      hardware: "Keyence LK-G5000 / Micro-Epsilon Laser Displacement Sensor, Dial Indicators",
      keyRule: "Complies with FMVSS 105/135 and ECE R90 automotive brake standards."
    },
    {
      num: 13,
      title: "AI + Traditional Metrology",
      subtitle: "Hybrid Inspection Engine",
      description: "The gold standard of industrial quality: Combining Convolutional Neural Networks (for complex visual anomalies like cracks and porosity) with Traditional Machine Vision & Metrology (for sub-millimeter caliper measurement).",
      hardware: "Unified software pipeline running CNN + Hough Circle / Caliper algorithms",
      keyRule: "Never rely on CNN alone for physical millimeter dimensions."
    },
    {
      num: 14,
      title: "Database & Traceability",
      subtitle: "Lot Tracking & Audit Logging",
      description: "Every single brake disc is assigned a unique serial ID (e.g. DB-2026-08103). Logs timestamp, model type, pass/fail result, defect category, confidence, operator ID, and metrology measurements. Exportable to CSV, SQLite, or factory MES.",
      hardware: "Local SQLite / PostgreSQL database with automated CSV shift backup",
      keyRule: "Provides warranty protection and root-cause traceability."
    },
    {
      num: 15,
      title: "Operator Dashboard",
      subtitle: "Industrial HMI Console",
      description: "Rugged touchscreen dashboard for line operators. Displays real-time camera inspection feed, bounding box overlays, cycle time, live pass/fail counts, and immediate manual override buttons.",
      hardware: "15.6\" IP65 Industrial Panel PC mounted on gantry arm",
      keyRule: "Clean, high-contrast visual status legible from 3 meters away."
    },
    {
      num: 16,
      title: "Quality Analytics & SPC",
      subtitle: "Statistical Process Control",
      description: "Tracks defect rate trends over time, generates 3-sigma p-charts with Upper Control Limits (UCL), and plots Pareto distributions to identify recurring failure modes across production shifts.",
      hardware: "Automated SPC analytics engine with shift-by-shift trend aggregation",
      keyRule: "Shifts maintenance from reactive firefighting to predictive quality control."
    },
    {
      num: 17,
      title: "Alerts & Stack Lights",
      subtitle: "Safety Interlocks & Escalation",
      description: "Industrial stack light tower on top of the inspection station: Green = Running normally, Amber = Approaching UCL defect threshold, Red + Buzzer = Consecutive defect spike (e.g. 3 rejects in a row triggers automatic conveyor interlock).",
      hardware: "Patlite 24V LED Stack Tower with piezo buzzer, SMS/Webhook alert relay",
      keyRule: "Prevents a bad lathe tool from churning out hundreds of defective parts."
    },
    {
      num: 18,
      title: "Final Quality Report",
      subtitle: "Shift Audit & Customer Certificates",
      description: "Generates printable end-of-shift quality audit reports formatted for ISO 9001 / IATF 16949 compliance, featuring total volume inspected, defect rate %, top failure modes, and supervisor sign-off.",
      hardware: "Automated PDF export engine with digital QA approval signature",
      keyRule: "Delivers customer-ready quality verification certificates for auto OEMs."
    }
  ];

  const stages = [
    {
      stage: 1,
      name: "AI Prototype",
      tagline: "Your Current State",
      focus: "Disc brake images → Preprocessing (Resize 64×64, Grayscale, Rescale 1/255) → CNN → OK / Defective. (Where your `best_model.h5` notebook sits today).",
      status: "COMPLETED IN NOTEBOOK"
    },
    {
      stage: 2,
      name: "Vision Prototype",
      tagline: "Optics & Fixturing",
      focus: "Mounting industrial camera on aluminum gantry + Diffuse ring strobe lighting + Mechanical disc brake locating jig + Real-time OpenCV pipeline.",
      status: "HARDWARE SETUP"
    },
    {
      stage: 3,
      name: "Industrial Prototype",
      tagline: "PLC & Automated Rejection",
      focus: "Add M12 proximity sensor + 24V PLC controller (or Arduino Opta) + Pneumatic cylinder rejector + Live pass/fail sorting in under 400ms.",
      status: "PILOT DEPLOYMENT"
    },
    {
      stage: 4,
      name: "Small-Industry Product",
      tagline: "Full Production Cell",
      focus: "Conveyor integration + Multi-camera station + Dimensional laser metrology + Local traceability DB + Touchscreen HMI + Shift Quality Reports.",
      status: "FULL PRODUCTION"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Blueprint Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>AI-Based Disc Brake Detection System Architecture</span>
            <span className="text-xs text-cyan-400 font-mono">18 Modules · Production Blueprint</span>
          </h2>
          <p className="text-xs text-slate-400">
            Evolutionary roadmap from notebook CNN model to turnkey small-industry machine vision cell
          </p>
        </div>
      </div>

      {/* The 4 Recommended Evolutionary Stages */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            4-Stage Implementation Strategy: Don't Build All 18 Modules at Once
          </h3>
          <span className="text-xs text-cyan-400 font-mono">Pragmatic Small-Shop Roadmap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stages.map((s) => (
            <div
              key={s.stage}
              onClick={() => setActiveStage(s.stage)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                activeStage === s.stage
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-cyan-400">STAGE {s.stage}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {s.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{s.name}</h4>
              <div className="text-[11px] text-slate-400 font-mono mb-2">{s.tagline}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{s.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Industrial Machine Vision Cell Hardware Reference Image Gallery */}
      <div className="space-y-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-7 relative min-h-[220px] bg-slate-950">
            <img
              src="/src/assets/images/disc_brake_inspection_rig_1790606797343.jpg"
              alt="Industrial automated visual inspection cell for automobile ventilated disc brake rotors"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[300px]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="md:col-span-5 p-5 flex flex-col justify-between bg-slate-900/90">
            <div className="space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Physical Hardware Setup · Stage 2 & 3
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Modular Vision Rig Architecture
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Precision aluminum extrusion gantry with C-mount industrial GigE camera positioned directly over the mechanical locating jig. 
                The circular high-frequency diffuse LED ring light eliminates hot spots and isolates machining cracks and porosity pits.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Rig Footprint: 600×500 mm</span>
              <span className="text-emerald-400">Total BOM: ~$2,240</span>
            </div>
          </div>
        </div>

        {/* Real Visual Standards: Clean Rotor vs Cracked Rotor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-36 h-36 shrink-0 bg-slate-950">
              <img
                src="/src/assets/images/clean_disc_brake_rotor_1790608741001.jpg"
                alt="Clean Disc Brake Rotor Specimen"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  Reference Standard · PASS
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">CNC Machined Ventilated Rotor</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Precision turned GG25 cast iron with cross-hatch grinding marks, uniform friction ring, and 5 chamfered lug holes.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">Zero Visual Anomalies Detected</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-36 h-36 shrink-0 bg-slate-950">
              <img
                src="/src/assets/images/cracked_disc_brake_rotor_1790608779053.jpg"
                alt="Cracked Disc Brake Rotor Specimen"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">
                  Defect Standard · REJECT
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">Radial Thermal Fatigue Crack</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  High-contrast radial fracture propagating outward across the swept friction track. Triggers pneumatic rejection.
                </p>
              </div>
              <span className="text-[10px] font-mono text-rose-400 mt-2">Pneumatic Diverter Solenoid Activated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Optics & Lens Focal Length Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Camera Optics & Focal Length Calculator (Module 3)
            </h3>
            <span className="text-xs font-mono text-slate-400">f = (WD × Sensor) / FOV</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Camera Sensor Width:</span>
                <span className="text-cyan-400 font-bold">{sensorWidthMm} mm (1/1.8" format)</span>
              </div>
              <input
                type="range"
                min="4.8"
                max="13.2"
                step="0.1"
                value={sensorWidthMm}
                onChange={(e) => setSensorWidthMm(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Working Distance (Lens to Rotor):</span>
                <span className="text-cyan-400 font-bold">{workingDistanceMm} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="10"
                value={workingDistanceMm}
                onChange={(e) => setWorkingDistanceMm(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Required Field of View (FOV):</span>
                <span className="text-cyan-400 font-bold">{fovWidthMm} mm (Brake Rotor: 280mm + margin)</span>
              </div>
              <input
                type="range"
                min="280"
                max="500"
                step="10"
                value={fovWidthMm}
                onChange={(e) => setFovWidthMm(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Calculated Recommendation */}
            <div className="p-3 bg-slate-950 rounded-lg border border-cyan-500/40 flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-[10px]">RECOMMENDED C-MOUNT LENS:</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {calculatedFocalLength} mm Focal Length
                </div>
                <div className="text-[10px] text-emerald-400">
                  Standard industrial lens choices: 8mm, 12mm, <strong>16mm</strong>, 25mm, 35mm
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500">Pixel Resolution:</div>
                <div className="text-sm font-bold text-cyan-400">~0.13 mm / pixel</div>
              </div>
            </div>
          </div>
        </div>

        {/* Small-Industry Bill of Materials (BOM) & Budget */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Small-Industry Bill of Materials (BOM) & Cost
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Total: ~$2,240 USD</span>
          </div>

          <div className="space-y-2 text-xs font-mono overflow-y-auto max-h-[220px] pr-1">
            {[
              { item: "Industrial GigE Camera (5MP, Global Shutter)", model: "Daheng / Basler acA2440-35um", cost: "$480" },
              { item: "Precision 16mm C-Mount Lens (Low Distortion)", model: "Fujinon / Computar 5MP", cost: "$190" },
              { item: "Diffuse White LED Strobe Ring Light + Controller", model: "OPT Machine Vision OPT-RI90", cost: "$260" },
              { item: "Edge AI Industrial PC / Mini Host", model: "NVIDIA Jetson Orin Nano / Advantech IPC", cost: "$380" },
              { item: "Small PLC Controller (24V Digital I/O)", model: "Siemens Logo! 8 or Arduino Opta", cost: "$220" },
              { item: "Pneumatic Rejection Cylinder & 5/2 Valve", model: "SMC CDQ2B50-50DZ + Solenoid", cost: "$180" },
              { item: "Locating Jig & Mechanical Mounting Extrusions", model: "4040 T-Slot Aluminum + Dowel Pins", cost: "$290" },
              { item: "Inductive Proximity & Optical Sensors", model: "Omron E2E-X4MD1 M12 NPN", cost: "$90" },
              { item: "Industrial Stack Light Tower & Buzzer", model: "Patlite 3-Tier 24V LED", cost: "$150" },
            ].map((part, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80">
                <div>
                  <div className="font-semibold text-slate-200">{part.item}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{part.model}</div>
                </div>
                <span className="text-emerald-400 font-bold">{part.cost}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 font-sans">
            *Comparison: Commercial turnkey brake rotor inspection cells cost $45,000–$80,000. 
            This modular open-architecture setup costs &lt;5% while running your custom trained CNN.
          </div>
        </div>

      </div>

      {/* The 18 Modules Interactive Accordion Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Complete End-to-End Modular Architecture (Modules 1 → 18)
            </h3>
            <p className="text-[11px] text-slate-400">Click any module to examine its purpose, hardware, and engineering rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((m) => {
            const isExpanded = expandedModule === m.num;
            return (
              <div
                key={m.num}
                onClick={() => setExpandedModule(isExpanded ? null : m.num)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
                      {m.num}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">{m.subtitle}</div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {m.description}
                    </p>

                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800 font-mono text-[10px] space-y-1">
                      <div className="text-slate-400">
                        <strong className="text-slate-300">Hardware:</strong> {m.hardware}
                      </div>
                      <div className="text-emerald-400">
                        <strong className="text-emerald-300">Key Rule:</strong> {m.keyRule}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Export Guide for user's `best_model.h5` */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>How to Deploy Your Existing `best_model.h5` into This Industrial Pipeline</span>
          </div>
          <span className="text-cyan-400 text-[10px]">Python + ONNX Runtime</span>
        </div>

        <pre className="p-3 bg-slate-900 rounded-lg text-slate-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-800">
{`# Step 1: Convert your trained Keras HDF5 model to ONNX for 10x faster edge inference
import tf2onnx
import tensorflow as tf

model = tf.keras.models.load_model('best_model.h5')
spec = (tf.TensorSpec((None, 64, 64, 1), tf.float32, name="input"),)
output_path = "disc_brake_cnn.onnx"
model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)
print("Model successfully exported to ONNX for Industrial PC deployment!")

# Step 2: Real-time edge inference loop connecting Camera -> ONNX -> PLC
import cv2
import numpy as np
import onnxruntime as ort

session = ort.InferenceSession("disc_brake_cnn.onnx")

def inspect_rotor(frame):
    # 1. Preprocess exactly as in your notebook
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (64, 64))
    tensor = resized.astype(np.float32) / 255.0
    tensor = np.expand_dims(np.expand_dims(tensor, axis=0), axis=-1)

    # 2. Run CNN inference (< 12 ms)
    inputs = {session.get_inputs()[0].name: tensor}
    pred = session.run(None, inputs)[0][0][0]

    # 3. Pass/Fail Decision (Threshold 0.5 or 0.85)
    is_defective = pred <= 0.5  # As defined in your notebook
    return "REJECT" if is_defective else "PASS", float(pred)`}
        </pre>
      </div>

    </div>
  );
};
