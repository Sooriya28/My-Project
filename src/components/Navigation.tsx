import React from 'react';
import { 
  Scan, 
  Activity, 
  Ruler, 
  Cpu, 
  BarChart3, 
  FileText, 
  Play, 
  Square, 
  Layers,
  UserCheck,
  Users
} from 'lucide-react';
import { OperatorProfile } from '../types/inspection';

interface NavigationProps {
  activeTab: 'console' | 'line' | 'metrology' | 'plc' | 'spc' | 'blueprint';
  setActiveTab: (tab: 'console' | 'line' | 'metrology' | 'plc' | 'spc' | 'blueprint') => void;
  isAutoRunning: boolean;
  setIsAutoRunning: (val: boolean) => void;
  onOpenReport: () => void;
  passCount: number;
  failCount: number;
  currentOperator: OperatorProfile;
  onOpenLogin: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isAutoRunning,
  setIsAutoRunning,
  onOpenReport,
  passCount,
  failCount,
  currentOperator,
  onOpenLogin,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-cyan-500/40 shrink-0 bg-slate-900 flex items-center justify-center">
            <img 
              src="/src/assets/images/clean_disc_brake_rotor_1790608741001.jpg" 
              alt="AutoBrake Logo" 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setActiveTab('console'); }}
            className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            AutoBrake AI
          </a>
        </div>

        {/* Zone 2: 5-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'console'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Scan className="w-4 h-4" />
            Live Cell (Console + Line)
          </button>

          <button
            onClick={() => setActiveTab('line')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'line'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Line Simulator
          </button>

          <button
            onClick={() => setActiveTab('metrology')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'metrology'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Ruler className="w-4 h-4" />
            Metrology Gauging
          </button>

          <button
            onClick={() => setActiveTab('plc')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'plc'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            PLC Hardware
          </button>

          <button
            onClick={() => setActiveTab('spc')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'spc'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            SPC & Analytics
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'blueprint'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Architecture Blueprint
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Counter */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">{passCount} PASS</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="text-rose-400 font-semibold">{failCount} REJECT</span>
          </div>

          <button
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isAutoRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isAutoRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop Line
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Auto Run
              </>
            )}
          </button>

          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap border border-slate-700"
            title="Generate Detailed Full Quality Inspection Report (IATF 16949 / ISO 9001)"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full Report</span>
          </button>

          {/* Operator Login / Switcher Profile Button */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs transition-colors group"
            title="Click to Switch Operator / Role or View End-User Roles"
          >
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${currentOperator?.avatarColor || 'from-cyan-500 to-blue-600'} flex items-center justify-center text-[10px] font-bold text-white shadow-inner shrink-0`}>
              {currentOperator?.id?.slice(0, 2) || 'OP'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-white group-hover:text-cyan-400 flex items-center gap-1">
                {currentOperator?.name?.split(' ')[0] || 'Operator'}
                <span className="text-[9px] text-cyan-300 font-mono px-1 py-0.2 bg-slate-800 rounded">
                  {currentOperator?.role === 'QA_ENGINEER' ? 'QA' : currentOperator?.role === 'ADMIN' ? 'MGR' : currentOperator?.role === 'CONTROLS_TECH' ? 'ENG' : 'OP'}
                </span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">{currentOperator?.id || 'OP-05'}</span>
            </div>
            <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
          </button>
        </div>

      </div>

      {/* Mobile nav drawer strip */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'console' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          Live Cell
        </button>
        <button
          onClick={() => setActiveTab('line')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'line' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          Line Simulator
        </button>
        <button
          onClick={() => setActiveTab('metrology')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'metrology' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          Metrology
        </button>
        <button
          onClick={() => setActiveTab('plc')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'plc' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          PLC Hardware
        </button>
        <button
          onClick={() => setActiveTab('spc')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'spc' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          SPC
        </button>
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'blueprint' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'}`}
        >
          18 Modules
        </button>
        <button
          onClick={onOpenLogin}
          className="px-2.5 py-1 rounded whitespace-nowrap bg-slate-900 text-cyan-400 font-mono flex items-center gap-1 border border-slate-800 ml-auto"
        >
          <UserCheck className="w-3 h-3" />
          <span>{currentOperator?.id || 'Login'}</span>
        </button>
      </div>
    </header>
  );
};
