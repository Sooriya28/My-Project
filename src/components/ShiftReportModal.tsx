import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Calendar, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { SpcStats, InspectionRecord } from '../types/inspection';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  spcStats: SpcStats;
  records: InspectionRecord[];
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({
  isOpen,
  onClose,
  spcStats,
  records,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const topDefects = Object.entries(spcStats.defectsByType)
    .filter(([type]) => type !== 'OK')
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Module 18 — Official Shift Quality Audit Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Body (styled like a clean, printable ISO 9001 audit sheet) */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-900">
          
          {/* Header Block */}
          <div className="border-b border-slate-700 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                PRECISION BRAKE SYSTEMS LTD.
              </div>
              <div className="text-xs text-slate-400">Automotive Rotor Machining & Inspection Cell #02</div>
              <div className="text-xs text-slate-400 mt-1">IATF 16949 / ISO 9001:2015 Compliance Certificate</div>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div>Report ID: <span className="text-white font-semibold">SQR-2026-0928-A</span></div>
              <div>Date: <span className="text-white font-semibold">28-SEP-2026</span></div>
              <div>Shift: <span className="text-cyan-400 font-semibold">Shift A (06:00 - 14:00)</span></div>
              <div>Inspector: <span className="text-white font-semibold">OP-05 / S. Saravanan</span></div>
            </div>
          </div>

          {/* Key Production Stats Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              1.0 Production & Quality Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Parts Inspected:</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {spcStats.totalInspected.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Accepted (Pass):</span>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">
                  {spcStats.passCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Rejected (Fail):</span>
                <div className="text-xl font-bold text-rose-400 mt-0.5">
                  {spcStats.failCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Defect Percentage:</span>
                <div className="text-xl font-bold text-amber-400 mt-0.5">
                  {spcStats.defectRatePct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Top Defects Pareto Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              2.0 Defect Classification Breakdown (Pareto Ranking)
            </h4>
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-2.5 text-xs font-mono">
              {topDefects.slice(0, 5).map(([defectName, count], idx) => {
                const pct = (count / Math.max(1, spcStats.failCount)) * 100;
                return (
                  <div key={defectName} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">{idx + 1}.</span>
                      <span className="text-white font-medium">{defectName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{count} units</span>
                      <span className="text-cyan-400 font-bold w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Metrology & Visual AI Invariants */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              3.0 In-Line Sensor & AI Verification Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Vision CNN Model:</div>
                <div className="text-slate-400 text-[11px]">Model File: `best_model.h5` (Converted to ONNX INT8)</div>
                <div className="text-emerald-400 font-mono text-[11px]">Accuracy Check: 96.36% Val Acc · Threshold: 85%</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">Rejection Solenoid & PLC:</div>
                <div className="text-slate-400 text-[11px]">Air Pressure: 6.2 Bar · Diverter Stroke: 50mm</div>
                <div className="text-emerald-400 font-mono text-[11px]">Fail-safe Pneumatic Ejector: 100% Tested</div>
              </div>
            </div>
          </div>

          {/* Signoff Section */}
          <div className="border-t border-slate-800 pt-6 grid grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-4">
              <div className="text-slate-400">Shift Production Supervisor:</div>
              <div className="h-9 border-b border-slate-700 flex items-end pb-1 text-slate-300">
                M. Anderson (Sign & Date)
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-slate-400">Quality Assurance Lead:</div>
              <div className="h-9 border-b border-slate-700 flex items-end pb-1 text-slate-300">
                R. Tanaka, CQE (Sign & Date)
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
