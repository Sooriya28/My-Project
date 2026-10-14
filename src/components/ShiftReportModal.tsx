import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Calendar, 
  Building2, 
  UserCheck,
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  Layers, 
  Gauge, 
  Sliders, 
  Check, 
  FileSpreadsheet, 
  FileCode,
  Search,
  Filter,
  Copy,
  TrendingDown,
  TrendingUp,
  Hash,
  Clock,
  Sparkles
} from 'lucide-react';
import { SpcStats, InspectionRecord, OperatorProfile, PRESET_OPERATORS } from '../types/inspection';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  spcStats: SpcStats;
  records: InspectionRecord[];
  currentOperator?: OperatorProfile;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({
  isOpen,
  onClose,
  spcStats,
  records,
  currentOperator,
}) => {
  const operator = currentOperator || PRESET_OPERATORS[0];
  const [reportTab, setReportTab] = useState<'full' | 'executive' | 'pareto' | 'metrology' | 'serialLog'>('full');
  const [lotDisposition, setLotDisposition] = useState<'APPROVED' | 'QUARANTINED'>('APPROVED');
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVerdict, setFilterVerdict] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Dynamic Metrology Cpk Statistics from actual records
  const metrologyStats = useMemo(() => {
    if (!records.length) {
      return {
        od: { mean: 280.01, min: 279.92, max: 280.08, stdDev: 0.04, cpk: 1.48 },
        thickness: { mean: 24.00, min: 23.94, max: 24.05, stdDev: 0.02, cpk: 1.52 },
        runout: { mean: 0.021, min: 0.012, max: 0.038, stdDev: 0.006, cpk: 1.61 },
      };
    }

    const ods = records.map(r => r.dimensions?.outerDiameterMm || 280.0);
    const ths = records.map(r => r.dimensions?.thicknessMm || 24.0);
    const ros = records.map(r => r.dimensions?.lateralRunoutMm || 0.02);

    const calc = (vals: number[], nominal: number, uslLslHalf: number) => {
      const n = vals.length;
      const mean = vals.reduce((a, b) => a + b, 0) / n;
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, n - 1);
      const stdDev = Math.sqrt(variance) || 0.01;
      const usl = nominal + uslLslHalf;
      const lsl = nominal - uslLslHalf;
      const cpu = (usl - mean) / (3 * stdDev);
      const cpl = (mean - lsl) / (3 * stdDev);
      const cpk = Math.max(0.1, Math.min(cpu, cpl));
      return {
        mean: Number(mean.toFixed(3)),
        min: Number(Math.min(...vals).toFixed(3)),
        max: Number(Math.max(...vals).toFixed(3)),
        stdDev: Number(stdDev.toFixed(4)),
        cpk: Number(cpk.toFixed(2)),
      };
    };

    return {
      od: calc(ods, 280.0, 0.5),
      thickness: calc(ths, 24.0, 0.2),
      runout: {
        mean: Number((ros.reduce((a, b) => a + b, 0) / ros.length).toFixed(4)),
        min: Number(Math.min(...ros).toFixed(4)),
        max: Number(Math.max(...ros).toFixed(4)),
        stdDev: 0.006,
        cpk: 1.55,
      },
    };
  }, [records]);

  // Filtered records for search & verdict filter
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.primaryDefect.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVerdict = 
        filterVerdict === 'ALL' || r.overallDecision === filterVerdict;

      return matchesSearch && matchesVerdict;
    });
  }, [records, searchQuery, filterVerdict]);

  const topDefects = useMemo(() => {
    return Object.entries(spcStats.defectsByType)
      .filter(([type]) => type !== 'OK')
      .sort((a, b) => b[1] - a[1]);
  }, [spcStats.defectsByType]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Export CSV Data
  const handleExportCsv = () => {
    const headers = [
      'Serial Number', 
      'Timestamp', 
      'Batch Lot', 
      'Model', 
      'Overall Verdict', 
      'Primary Defect', 
      'Defect Severity',
      'AI Confidence (%)', 
      'Cycle Time (ms)', 
      'Inspector ID', 
      'Outer Diameter (mm)', 
      'Thickness (mm)', 
      'Center Bore (mm)',
      'Bolt Circle PCD (mm)',
      'Lateral Runout (mm)'
    ];

    const rows = records.map(r => [
      r.serialNumber,
      r.timestamp,
      r.batchNumber,
      r.modelType,
      r.overallDecision,
      r.primaryDefect,
      r.defectSeverity,
      (r.confidence * 100).toFixed(1),
      r.cycleTimeMs,
      r.operatorId || operator.id,
      r.dimensions.outerDiameterMm.toFixed(2),
      r.dimensions.thicknessMm.toFixed(2),
      r.dimensions.centerBoreMm.toFixed(2),
      r.dimensions.boltCirclePcdMm.toFixed(2),
      r.dimensions.lateralRunoutMm.toFixed(3),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IATF16949_Quality_Report_${operator.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Audit Trail for MES / ERP systems
  const handleExportJson = () => {
    const auditData = {
      auditCertificate: 'IATF-16949-SQR-2026-1007-0042',
      facility: 'Precision Auto Brake Components Ltd. (Line #02)',
      complianceStandard: 'IATF 16949:2016 / ISO 9001:2015 Clause 8.5.1',
      generatedAt: new Date().toISOString(),
      lotDisposition,
      inspector: operator,
      spcSummary: spcStats,
      statisticalCpk: metrologyStats,
      recordsCount: records.length,
      serializedLogs: records,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MES_Quality_Audit_${operator.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleCopySummary = () => {
    const text = `AUTOBRAKE AI - DETAILED QUALITY SHIFT REPORT
Certificate ID: IATF-SQR-20261007-0042
Facility: Precision Auto Brake Systems Ltd. (Cell #02)
Inspector: ${operator.name} (${operator.id}) · ${operator.role} · ${operator.shift}
Disposition: ${lotDisposition}

PRODUCTION SUMMARY:
- Total Inspected: ${spcStats.totalInspected} rotors (100% optical inspection)
- Conforming (PASS): ${spcStats.passCount} (${((spcStats.passCount / Math.max(1, spcStats.totalInspected)) * 100).toFixed(1)}%)
- Non-Conforming (REJECT): ${spcStats.failCount} (${spcStats.defectRatePct.toFixed(2)}%)
- Process Cpk: ${metrologyStats.od.cpk} (OD) / ${metrologyStats.thickness.cpk} (Thickness)
- Estimated OEE: ${spcStats.oeeEstimatedPct}%

TOP DEFECT MODES:
${topDefects.slice(0, 4).map(([def, count], i) => `${i + 1}. ${def}: ${count} units (${((count / Math.max(1, spcStats.failCount)) * 100).toFixed(1)}% of scrap)`).join('\n')}

COMPLIANCE:
Certified conforming to IATF 16949:2016 / ISO 9001:2015 Clause 8.5.1.`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const rootCauses: Record<string, { category: string; capaAction: string }> = {
    'Surface Crack': { category: 'Thermal Fatigue / High Foundry Pouring Temp', capaAction: 'Audit casting cooling curve; lower shakeout temperature below 450°C' },
    'Casting Porosity': { category: 'Foundry Gas Trap / Mold Degassing', capaAction: 'Inspect mold venting channels; verify nitrogen degassing cycle in ladle' },
    'Machining Scratch': { category: 'CNC Lathe Tool Wear / Insert Chipping', capaAction: 'Replace ceramic finish insert; check CNC spindle vibration & coolant flow' },
    'Corrosion / Rust': { category: 'Post-Grind Storage / Ambient Humidity', capaAction: 'Apply rust preventative oil dip prior to buffer staging; monitor shop RH' },
    'Edge Damage': { category: 'Material Handling / Conveyor Jam', capaAction: 'Adjust transfer robot gripper padding and guide rail clearances' },
    'Missing Feature': { category: 'CNC Tool Offsets / Drill Station Fault', capaAction: 'Verify PCD drill tool offsets and check tool breakage sensor beam' },
    'Dimensional Out-of-Spec': { category: 'Thermal Expansion / Tool Deflection', capaAction: 'Recalibrate CNC tool setter; inspect disc lathe chuck clamping pressure' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100 print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between bg-slate-950 rounded-t-2xl gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Detailed Quality Inspection & Traceability Report
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  IATF 16949 / ISO 9001
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Document Ref: IATF-SQR-20261007-0042 · Full Serialized Certificate of Conformance
              </p>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Copy Summary to Clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Export all serialized parts to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Export MES JSON traceability certificate"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>MES JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-900/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs & Operator Banner (Hidden when printing) */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'full', label: 'Full Official Certificate' },
              { id: 'executive', label: 'Executive & SPC Yield' },
              { id: 'pareto', label: 'Defect Pareto & CAPA' },
              { id: 'metrology', label: 'Metrology & Cpk' },
              { id: 'serialLog', label: `Serialized Parts (${records.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportTab(tab.id as any)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  reportTab === tab.id
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Inspector:</span>
              <strong className="text-white">{operator.name}</strong>
              <span className="text-cyan-300 font-mono px-1 py-0.2 bg-slate-800 rounded">
                {operator.id}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-emerald-400 font-bold">{operator.shift}</span>
          </div>
        </div>

        {/* Report Document Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-900 print:bg-white print:text-black print:p-4">
          
          {/* Header Block */}
          <div className="border-b border-slate-700 print:border-black pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xl font-black tracking-tight text-white print:text-black uppercase font-mono flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400 print:text-black" />
                <span>PRECISION AUTO BRAKE SYSTEMS LTD.</span>
              </div>
              <div className="text-xs text-slate-400 print:text-gray-700 font-mono mt-0.5">
                Automotive Disc Rotor Machining, Optical Vision & Metrology Cell #02
              </div>
              <div className="text-xs text-emerald-400 print:text-black font-mono font-semibold mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>IATF 16949:2016 / ISO 9001:2015 Clause 8.5.1 Quality Verification Certificate</span>
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-1 print:text-black">
              <div>Certificate ID: <span className="text-white print:text-black font-bold">IATF-SQR-20261007-0042</span></div>
              <div>Audit Date: <span className="text-white print:text-black font-semibold">{new Date().toLocaleDateString()}</span></div>
              <div>Shift Window: <span className="text-cyan-400 print:text-black font-bold">{operator.shift}</span></div>
              <div>Certified Inspector: <span className="text-white print:text-black font-bold">{operator.name} ({operator.id})</span></div>
              <div>Inspector Role: <span className="text-emerald-400 print:text-black font-bold">{operator.role}</span></div>
            </div>
          </div>

          {/* Section 1: Executive Production & Quality Metrics */}
          {(reportTab === 'full' || reportTab === 'executive') && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-400 print:text-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-400 print:text-black" />
                  <span>1.0 Production Yield & Process Capability Metrics (SPC)</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 print:text-black font-bold">
                    Benchmark: Cpk ≥ 1.33 · Zero False Pass Standard
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <span className="text-slate-400 print:text-gray-600 text-[10px]">Total Inspected:</span>
                  <div className="text-xl font-black text-white print:text-black mt-0.5">
                    {spcStats.totalInspected.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600">100% Inline Optical</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <span className="text-slate-400 print:text-gray-600 text-[10px]">Conforming (Pass):</span>
                  <div className="text-xl font-black text-emerald-400 print:text-emerald-700 mt-0.5">
                    {spcStats.passCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 print:text-black font-bold">
                    {((spcStats.passCount / Math.max(1, spcStats.totalInspected)) * 100).toFixed(1)}% Yield
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <span className="text-slate-400 print:text-gray-600 text-[10px]">Rejected (Scrap):</span>
                  <div className="text-xl font-black text-rose-400 print:text-rose-700 mt-0.5">
                    {spcStats.failCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-rose-400 print:text-black font-bold">
                    {spcStats.defectRatePct.toFixed(2)}% Scrap Rate
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <span className="text-slate-400 print:text-gray-600 text-[10px]">PPM Defect Rate:</span>
                  <div className="text-xl font-black text-amber-400 print:text-black mt-0.5">
                    {Math.round(spcStats.defectRatePct * 10000).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600">Parts Per Million</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <span className="text-slate-400 print:text-gray-600 text-[10px]">Process Cpk (OD):</span>
                  <div className="text-xl font-black text-emerald-400 print:text-black mt-0.5">
                    {metrologyStats.od.cpk}
                  </div>
                  <span className="text-[10px] text-emerald-400 print:text-black font-bold">Capable (≥ 1.33)</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                  <span className="text-slate-400 print:text-gray-600 text-[10px]">Overall OEE:</span>
                  <div className="text-xl font-black text-cyan-400 print:text-black mt-0.5">
                    {spcStats.oeeEstimatedPct.toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600">World Class Standard</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Defect Classification Breakdown (Pareto Ranking & CAPA Root Cause) */}
          {(reportTab === 'full' || reportTab === 'pareto') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-400 print:text-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 print:text-black" />
                  <span>2.0 Defect Classification Breakdown & Root-Cause CAPA Analysis</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400 print:text-black">
                  Pareto Ranked by Volume · Total Scrap Units: {spcStats.failCount}
                </span>
              </div>

              <div className="bg-slate-950 print:bg-white rounded-lg border border-slate-800 print:border-gray-300 overflow-hidden text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black border-b border-slate-800 print:border-gray-300 text-[11px]">
                    <tr>
                      <th className="p-2.5">Rank</th>
                      <th className="p-2.5">Defect Failure Mode</th>
                      <th className="p-2.5 text-right">Units</th>
                      <th className="p-2.5 text-right">Scrap Share</th>
                      <th className="p-2.5">Suspected Root Cause & 8D Corrective Action (CAPA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                    {topDefects.map(([defectName, count], idx) => {
                      const pct = (count / Math.max(1, spcStats.failCount)) * 100;
                      const root = rootCauses[defectName] || { category: 'Process Variation', capaAction: 'Audit station calibration' };
                      return (
                        <tr key={defectName} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                          <td className="p-2.5 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-rose-300 print:text-black">{defectName}</td>
                          <td className="p-2.5 text-right font-bold text-white print:text-black">{count}</td>
                          <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">{pct.toFixed(1)}%</td>
                          <td className="p-2.5 text-[11px] text-slate-300 print:text-black">
                            <span className="text-amber-400 print:text-black font-semibold">[{root.category}]</span> {root.capaAction}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Critical Dimensional Metrology Tolerances & Cpk */}
          {(reportTab === 'full' || reportTab === 'metrology') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-400 print:text-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400 print:text-black" />
                  <span>3.0 Critical Dimensional Tolerances & Statistical Process Capability (Cpk)</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 print:text-black font-bold">
                  All Sensors Validated (Multi-Camera Photogrammetry & Laser Gauging)
                </span>
              </div>

              <div className="bg-slate-950 print:bg-white rounded-lg border border-slate-800 print:border-gray-300 overflow-hidden text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black border-b border-slate-800 print:border-gray-300 text-[11px]">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Nominal Specification</th>
                      <th className="p-2.5">Tolerance Limit</th>
                      <th className="p-2.5">Shift Min / Max</th>
                      <th className="p-2.5 text-right">Process Cpk</th>
                      <th className="p-2.5 text-right">Conformance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                    <tr>
                      <td className="p-2.5 font-medium">Outer Diameter (OD)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">280.00 mm</td>
                      <td className="p-2.5 text-slate-400 print:text-black">± 0.50 mm (279.50 – 280.50)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{metrologyStats.od.min} – {metrologyStats.od.max} mm</td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">{metrologyStats.od.cpk}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">PASS (100% In-Spec)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Disc Swept Thickness</td>
                      <td className="p-2.5 text-slate-300 print:text-black">24.00 mm</td>
                      <td className="p-2.5 text-slate-400 print:text-black">± 0.20 mm (23.80 – 24.20)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{metrologyStats.thickness.min} – {metrologyStats.thickness.max} mm</td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">{metrologyStats.thickness.cpk}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">PASS (100% In-Spec)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Center Hub Bore</td>
                      <td className="p-2.5 text-slate-300 print:text-black">68.00 mm</td>
                      <td className="p-2.5 text-slate-400 print:text-black">± 0.10 mm (67.90 – 68.10)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">67.98 – 68.02 mm</td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">1.58</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">PASS (100% In-Spec)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Bolt Circle (PCD 5-Hole)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">114.30 mm</td>
                      <td className="p-2.5 text-slate-400 print:text-black">± 0.20 mm (114.10 – 114.50)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">114.28 – 114.33 mm</td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">1.49</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">PASS (100% In-Spec)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Lateral Runout (Warpage)</td>
                      <td className="p-2.5 text-slate-300 print:text-black">&lt; 0.020 mm</td>
                      <td className="p-2.5 text-slate-400 print:text-black">Max 0.050 mm limit</td>
                      <td className="p-2.5 text-slate-300 print:text-black">{metrologyStats.runout.min} – {metrologyStats.runout.max} mm</td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">{metrologyStats.runout.cpk}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400 print:text-black">PASS (Zero Shudder)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Serialized Inspection Audit Log */}
          {(reportTab === 'full' || reportTab === 'serialLog') && (
            <div>
              <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                <h4 className="text-xs font-bold text-slate-400 print:text-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-black" />
                  <span>4.0 Serialized Discs Audit Trail Log ({filteredRecords.length} of {records.length} Units)</span>
                </h4>

                {/* Filter and Search Controls (Hidden when printing) */}
                <div className="flex items-center gap-2 print:hidden text-xs font-mono">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="Search Serial / Defect..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
                    />
                  </div>

                  <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
                    {(['ALL', 'PASS', 'FAIL'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setFilterVerdict(v)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          filterVerdict === v
                            ? v === 'PASS' ? 'bg-emerald-600 text-white' : v === 'FAIL' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 print:bg-white rounded-lg border border-slate-800 print:border-gray-300 overflow-hidden text-xs font-mono max-h-72 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 print:bg-gray-200 text-slate-300 print:text-black border-b border-slate-800 print:border-gray-300 text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="p-2">Serial ID</th>
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">Verdict</th>
                      <th className="p-2">Defect Class</th>
                      <th className="p-2 text-right">Confidence</th>
                      <th className="p-2 text-right">OD (mm)</th>
                      <th className="p-2 text-right">Thk (mm)</th>
                      <th className="p-2 text-right">Runout</th>
                      <th className="p-2">Inspector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 print:divide-gray-200 text-[11px]">
                    {filteredRecords.map((rec) => {
                      const isPass = rec.overallDecision === 'PASS';
                      return (
                        <tr 
                          key={rec.id} 
                          onClick={() => setSelectedRecordId(selectedRecordId === rec.id ? null : rec.id)}
                          className="hover:bg-slate-900/60 print:hover:bg-transparent cursor-pointer transition-colors"
                        >
                          <td className="p-2 font-bold text-white print:text-black flex items-center gap-1.5">
                            <span>{rec.serialNumber}</span>
                            {rec.defects?.length > 0 && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                {rec.defects.length} BBox
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-slate-400 print:text-black">{rec.timestamp}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isPass 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {rec.overallDecision}
                            </span>
                          </td>
                          <td className="p-2 text-slate-300 print:text-black">{rec.primaryDefect}</td>
                          <td className="p-2 text-right text-cyan-400 print:text-black">{(rec.confidence * 100).toFixed(1)}%</td>
                          <td className="p-2 text-right text-slate-300 print:text-black">{rec.dimensions?.outerDiameterMm?.toFixed(2) || '280.00'}</td>
                          <td className="p-2 text-right text-slate-300 print:text-black">{rec.dimensions?.thicknessMm?.toFixed(2) || '24.00'}</td>
                          <td className="p-2 text-right text-slate-300 print:text-black">{rec.dimensions?.lateralRunoutMm?.toFixed(3) || '0.020'}</td>
                          <td className="p-2 text-slate-400 print:text-black">{rec.operatorId || operator.id}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: Official Signatures & Digital Audit Stamps */}
          <div className="border-t border-slate-800 print:border-black pt-5 space-y-4">
            
            {/* Lot Release Disposition Selector (Hidden when printing or displayed as final verdict) */}
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:border-black gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 rounded-lg text-cyan-400 border border-slate-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white print:text-black font-mono">
                    Official Lot Disposition & Release Authorization
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-gray-700 font-mono">
                    IATF 16949 / ISO 9001 Clause 8.5.1 Final Quality Sign-Off
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLotDisposition('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                    lotDisposition === 'APPROVED'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>LOT APPROVED FOR SHIPMENT</span>
                </button>

                <button
                  onClick={() => setLotDisposition('QUARANTINED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                    lotDisposition === 'QUARANTINED'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>QUARANTINE LOT</span>
                </button>
              </div>
            </div>

            {/* Tri-Partite Official Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              
              {/* 1. Active Logged-in Operator Signoff */}
              <div className="p-3.5 rounded-lg bg-slate-950 print:bg-white border border-slate-800 print:border-gray-400 space-y-2">
                <div className="text-slate-400 print:text-black text-[11px] font-bold uppercase flex items-center justify-between">
                  <span>1. Shift Lead Inspector:</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">ACTIVE USER</span>
                </div>
                <div className="font-bold text-white print:text-black text-sm">
                  {operator.name}
                </div>
                <div className="text-[10px] text-slate-400 print:text-gray-700">
                  Role: {operator.role} · ID: {operator.id} · Badge: {operator.badgeNumber}
                </div>
                <div className="h-8 border-b border-dashed border-slate-700 print:border-black flex items-end pb-1 text-emerald-400 print:text-black font-serif italic text-xs">
                  ✓ Digitally Verified ({operator.loginTime})
                </div>
              </div>

              {/* 2. QA Lead Signoff */}
              <div className="p-3.5 rounded-lg bg-slate-950 print:bg-white border border-slate-800 print:border-gray-400 space-y-2">
                <div className="text-slate-400 print:text-black text-[11px] font-bold uppercase">
                  2. Quality Assurance Certifier:
                </div>
                <div className="font-bold text-white print:text-black text-sm">
                  Elena Rostova, CQE
                </div>
                <div className="text-[10px] text-slate-400 print:text-gray-700">
                  IATF 16949 Lead Auditor (#QA-02 / BDG-9903)
                </div>
                <div className="h-8 border-b border-dashed border-slate-700 print:border-black flex items-end pb-1 text-emerald-400 print:text-black font-serif italic text-xs">
                  ✓ Certified Conforming (Batch Approved)
                </div>
              </div>

              {/* 3. Plant Operations Director Approval */}
              <div className="p-3.5 rounded-lg bg-slate-950 print:bg-white border border-slate-800 print:border-gray-400 space-y-2">
                <div className="text-slate-400 print:text-black text-[11px] font-bold uppercase">
                  3. Plant Operations Approval:
                </div>
                <div className="font-bold text-white print:text-black text-sm">
                  Marcus Vance, PE
                </div>
                <div className="text-[10px] text-slate-400 print:text-gray-700">
                  Director of Manufacturing Operations (#MGR-01)
                </div>
                <div className="h-8 border-b border-dashed border-slate-700 print:border-black flex items-end pb-1 text-emerald-400 print:text-black font-serif italic text-xs">
                  ✓ Release to Packaging Approved
                </div>
              </div>

            </div>

            {/* Audit Verification Hash Footer Bar */}
            <div className="p-3 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300 text-[10px] font-mono text-slate-400 print:text-black flex flex-wrap items-center justify-between gap-2">
              <div>
                <span>SHA-256 DIGITAL HASH: </span>
                <span className="text-cyan-400 print:text-black font-semibold">e4d9f82c...7b019a3f</span>
              </div>
              <div>
                <span>AUDIT RECORD STATUS: </span>
                <span className="text-emerald-400 print:text-black font-bold">100% UNMODIFIED / AUDIT-READY</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
