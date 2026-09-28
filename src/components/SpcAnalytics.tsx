import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { DefectType, InspectionRecord, SpcStats } from '../types/inspection';

interface SpcAnalyticsProps {
  records: InspectionRecord[];
  spcStats: SpcStats;
  onOpenReport: () => void;
}

export const SpcAnalytics: React.FC<SpcAnalyticsProps> = ({
  records,
  spcStats,
  onOpenReport,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [selectedShift, setSelectedShift] = useState<'ALL' | 'SHIFT_A' | 'SHIFT_B' | 'SHIFT_C'>('ALL');

  // Filtered traceability records
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.primaryDefect.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDecision = 
      filterDecision === 'ALL' || rec.overallDecision === filterDecision;

    return matchesSearch && matchesDecision;
  });

  // Export CSV function (Module 14: Traceability DB)
  const exportCsv = () => {
    const headers = [
      'Record_ID',
      'Part_Serial',
      'Timestamp',
      'Batch',
      'Model',
      'Decision',
      'Primary_Defect',
      'Severity',
      'Confidence_Pct',
      'Cycle_Time_ms',
      'Outer_Dia_mm',
      'Thickness_mm',
      'Runout_mm',
      'PCD_Holes_mm',
      'Camera_Channel',
      'Operator_ID'
    ];

    const rows = records.map(r => [
      r.id,
      r.serialNumber,
      r.timestamp,
      r.batchNumber,
      r.modelType,
      r.overallDecision,
      `"${r.primaryDefect}"`,
      r.defectSeverity,
      (r.confidence * 100).toFixed(1),
      r.cycleTimeMs,
      r.dimensions.outerDiameterMm.toFixed(2),
      r.dimensions.thicknessMm.toFixed(2),
      r.dimensions.lateralRunoutMm.toFixed(3),
      r.dimensions.boltCirclePcdMm.toFixed(2),
      r.cameraChannel,
      r.operatorId
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AutoBrake_Inspection_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pareto chart items sorted by frequency
  const defectCounts = Object.entries(spcStats.defectsByType)
    .filter(([type]) => type !== 'OK')
    .sort((a, b) => b[1] - a[1]);

  const totalDefects = defectCounts.reduce((acc, curr) => acc + curr[1], 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Statistical Process Control (SPC) & Quality Analytics</span>
            <span className="text-xs text-cyan-400 font-mono">Modules 14, 15, 16, 17</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time Defect Rates · Pareto Root-Cause Analysis · Lot Traceability Database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Log
          </button>

          <button
            onClick={onOpenReport}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-900/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            View Shift Quality Report
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Module 15: Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Total Inspected</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {spcStats.totalInspected.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Target: 4,500 / shift</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-emerald-400 font-medium">Passed (Conforming)</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {spcStats.passCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-500/80 font-mono mt-1">
            {((spcStats.passCount / Math.max(1, spcStats.totalInspected)) * 100).toFixed(1)}% First Pass Yield
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-rose-400 font-medium">Rejected (Scrap/Rework)</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {spcStats.failCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-400/80 font-mono mt-1">
            {spcStats.defectRatePct.toFixed(2)}% Defect Rate
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Upper Control Limit (UCL)</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            7.50%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">3-Sigma p-chart</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Mean Cycle Time</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {spcStats.avgCycleTimeMs} ms
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">42 parts / min peak</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">OEE Availability</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            94.8%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">MTBF: 168 hrs</div>
        </div>

      </div>

      {/* Analytics Charts Grid: Pareto Defect Ranking & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Defect Pareto Distribution (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-200">
                Pareto Defect Distribution (Module 16)
              </h3>
              <p className="text-[11px] text-slate-400">
                Ranked by frequency for foundry and machining corrective actions
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Total Defects: {totalDefects}</span>
          </div>

          <div className="space-y-3 pt-1">
            {defectCounts.map(([defectName, count]) => {
              const pct = totalDefects > 0 ? (count / totalDefects) * 100 : 0;
              return (
                <div key={defectName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{defectName}</span>
                    <span className="text-slate-400">
                      <strong className="text-white">{count}</strong> units ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        defectName.includes('Crack') ? 'bg-rose-500' :
                        defectName.includes('Porosity') ? 'bg-amber-500' :
                        defectName.includes('Scratch') ? 'bg-cyan-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Quality Engineer Recommendation:</strong> Surface Cracks and Casting Porosity account for over 52% of all rejections. 
              Notify casting foundry to adjust pouring temperature and de-gassing lance flow.
            </span>
          </div>
        </div>

        {/* Hourly Trend / SPC p-Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-200">
                Shift Defect Rate Trend (p-Chart)
              </h3>
              <p className="text-[11px] text-slate-400">Hourly rejection percentage vs UCL</p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Shift 08:00 - 16:00</span>
          </div>

          <div className="space-y-2 pt-2">
            {spcStats.hourlyHistory.map((h, i) => {
              const isOverUcl = h.defectRate > 7.5;
              return (
                <div key={i} className="flex items-center justify-between text-xs font-mono p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{h.hour}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({h.inspected} parts)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isOverUcl ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (h.defectRate / 10) * 100)}%` }}
                      />
                    </div>
                    <span className={`font-bold w-12 text-right ${isOverUcl ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {h.defectRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>UCL: 7.50% (Alarm Limit)</span>
            <span>Target: &lt; 3.00%</span>
          </div>
        </div>

      </div>

      {/* Module 14: Traceability Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200">
              Complete Rotor Traceability Database (Module 14)
            </h3>
            <p className="text-[11px] text-slate-400">
              Every inspected automotive brake disc logged with timestamp, serial number, defect tag, and metrology
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Serial / Defect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterDecision('ALL')}
                className={`px-2 py-0.5 rounded ${filterDecision === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterDecision('PASS')}
                className={`px-2 py-0.5 rounded ${filterDecision === 'PASS' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
              >
                Pass
              </button>
              <button
                onClick={() => setFilterDecision('FAIL')}
                className={`px-2 py-0.5 rounded ${filterDecision === 'FAIL' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400'}`}
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Part Serial No</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3">Defect Category</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">OD (mm)</th>
                <th className="py-2.5 px-3">Thk (mm)</th>
                <th className="py-2.5 px-3">Runout</th>
                <th className="py-2.5 px-3">Cam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.slice(0, 15).map(record => (
                <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {record.serialNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {record.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      record.overallDecision === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {record.overallDecision === 'PASS' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {record.overallDecision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {record.primaryDefect}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {(record.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {record.dimensions.outerDiameterMm.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {record.dimensions.thicknessMm.toFixed(2)}
                  </td>
                  <td className={`py-2.5 px-3 ${record.dimensions.lateralRunoutMm > 0.05 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {record.dimensions.lateralRunoutMm.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {record.cameraChannel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
