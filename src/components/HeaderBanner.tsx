import React from 'react';
import {
  Calendar,
  Users,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Zap,
  Eye,
  CheckCircle2,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { INDONESIAN_MONTHS } from '../utils/dateUtils';
import { ActiveViewTab } from '../types';

interface HeaderBannerProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  activeTab: ActiveViewTab;
  onTabChange: (tab: ActiveViewTab) => void;
  onOpenQuickCheck: () => void;
  onOpenManageTeam: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSheetsSync: () => void;
  isSheetsConnected: boolean;
  spreadsheetUrl?: string;
  lastSyncedTime?: string | null;
  currentUser?: string | null;
  onLogout?: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  activeTab,
  onTabChange,
  onOpenQuickCheck,
  onOpenManageTeam,
  onExportCSV,
  onPrint,
  onResetData,
  searchQuery,
  onSearchChange,
  onOpenSheetsSync,
  isSheetsConnected,
  spreadsheetUrl,
  lastSyncedTime,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Primary Banner matching user's image header style */}
      <div className="bg-[#356170] text-white px-3 py-2.5 sm:px-6 sm:py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-400/20 text-teal-200 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded tracking-wide border border-teal-300/30">
              DEPT. OPERATION & CONTROLLING
            </span>
            <span className="text-[11px] sm:text-xs text-slate-300">Live Monitoring</span>
          </div>
          <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide uppercase mt-1 leading-tight sm:leading-normal">
            LAPORAN HARIAN TEAM SPV OPR PERIODE {INDONESIAN_MONTHS[month]} {year}
          </h1>
        </div>

        {/* Quick actions on the right */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            id="btn-quick-check"
            onClick={onOpenQuickCheck}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer shrink-0 min-h-[40px]"
            title="Checklist cepat laporan hari ini"
          >
            <Zap className="w-4 h-4 text-teal-100" />
            <span>Checklist Hari Ini</span>
          </button>

          <button
            id="btn-manage-team"
            onClick={onOpenManageTeam}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-500/40 transition-all cursor-pointer shrink-0 min-h-[40px]"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tim SPV</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-500/40 transition-all cursor-pointer shrink-0 min-h-[40px]"
            title="Export data ke file Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden xs:inline">Excel/CSV</span>
          </button>

          <button
            id="btn-print"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-500/40 transition-all cursor-pointer shrink-0 min-h-[40px]"
            title="Cetak format cetak / PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            id="btn-reset"
            onClick={onResetData}
            className="flex items-center gap-1 px-2.5 py-2 bg-slate-800/70 hover:bg-red-900/60 text-slate-300 hover:text-red-200 text-xs rounded-lg border border-slate-600/40 transition-all cursor-pointer shrink-0 min-h-[40px]"
            title="Reset ke data awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* User Account & Logout */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-600/60 ml-0.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-800/60 border border-teal-400/30 rounded-lg text-xs font-semibold text-teal-100">
                <UserCheck className="w-3.5 h-3.5 text-teal-300" />
                <span className="font-mono">{currentUser}</span>
              </div>

              {onLogout && (
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-lg border border-rose-400/40 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 min-h-[40px]"
                  title="Keluar dari portal SPV"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: Month Picker, Tab Views & Search */}
      <div className="px-3 py-2 sm:px-6 bg-slate-100/95 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 border-t border-slate-200 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Month & Year selector */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs shrink-0">
            <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
            <select
              id="select-month"
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs sm:text-sm"
            >
              {INDONESIAN_MONTHS.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              id="select-year"
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-600 focus:outline-none cursor-pointer text-xs sm:text-sm border-l border-slate-200 pl-1.5"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Filter View - Horizontally scrollable on mobile */}
          <div className="flex items-center bg-slate-200/90 p-0.5 rounded-lg border border-slate-300/80 text-xs font-semibold overflow-x-auto max-w-full scrollbar-none">
            <button
              id="tab-view-both"
              onClick={() => onTabChange('both')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'both'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              id="tab-view-plan"
              onClick={() => onTabChange('plan')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'plan'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plan
            </button>
            <button
              id="tab-view-actual"
              onClick={() => onTabChange('actual')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'actual'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Realisasi
            </button>
            <button
              id="tab-view-comparison"
              onClick={() => onTabChange('comparison')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deviasi
            </button>
          </div>
        </div>

        {/* Filter / Search SPV */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            id="input-search-pic"
            type="text"
            placeholder="Cari nama SPV..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-48 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>
    </header>
  );
};
