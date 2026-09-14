import React from 'react';
import { Calendar, Users, FileSpreadsheet, Printer, RotateCcw, Zap, Eye, CheckCircle2 } from 'lucide-react';
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
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Primary Banner matching user's image header style */}
      <div className="bg-[#356170] text-white px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-400/20 text-teal-200 text-xs font-bold px-2 py-0.5 rounded tracking-wide border border-teal-300/30">
              DEPT. OPERATION & CONTROLLING
            </span>
            <span className="text-xs text-slate-300">Live Monitoring</span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-wider uppercase mt-1">
            LAPORAN HARIAN TEAM SPV OPR PERIODE {INDONESIAN_MONTHS[month]} {year}
          </h1>
        </div>

        {/* Quick actions on the right */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-check"
            onClick={onOpenQuickCheck}
            className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
            title="Checklist cepat laporan hari ini"
          >
            <Zap className="w-4 h-4 text-teal-200" />
            <span>Checklist Hari Ini</span>
          </button>

          <button
            id="btn-manage-team"
            onClick={onOpenManageTeam}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/70 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-500/40 transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tim SPV</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/70 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-500/40 transition-all cursor-pointer"
            title="Export data ke file Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
            <span>Excel / CSV</span>
          </button>

          <button
            id="btn-print"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/70 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-medium rounded-lg border border-slate-500/40 transition-all cursor-pointer"
            title="Cetak format cetak / PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          <button
            id="btn-reset"
            onClick={onResetData}
            className="flex items-center gap-1 px-2.5 py-2 bg-slate-800/60 hover:bg-red-900/60 text-slate-300 hover:text-red-200 text-xs rounded-lg border border-slate-600/40 transition-all cursor-pointer"
            title="Reset ke data contoh awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Month Picker, Tab Views & Search */}
      <div className="px-4 py-2.5 sm:px-6 bg-slate-100/90 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Month & Year selector */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
            <Calendar className="w-4 h-4 text-teal-600" />
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

          {/* Tab Filter View */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/80 text-xs font-semibold">
            <button
              id="tab-view-both"
              onClick={() => onTabChange('both')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua (Plan & Laporan)
            </button>
            <button
              id="tab-view-plan"
              onClick={() => onTabChange('plan')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plan Harian
            </button>
            <button
              id="tab-view-actual"
              onClick={() => onTabChange('actual')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'actual'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Harian (Aktual)
            </button>
            <button
              id="tab-view-comparison"
              onClick={() => onTabChange('comparison')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analisis Deviasi
            </button>
          </div>
        </div>

        {/* Filter / Search SPV */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            id="input-search-pic"
            type="text"
            placeholder="Cari nama SPV..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
          <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
            {isSheetsConnected ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-[11px]">Google Sheets Active</span>
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 underline ml-0.5 text-[11px]"
                    title="Buka Spreadsheet di tab baru"
                  >
                    Buka
                  </a>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenSheetsSync}
                className="flex items-center gap-1.5 text-slate-500 hover:text-teal-700 cursor-pointer"
                title="Klik untuk menghubungkan ke Google Sheets"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="hidden sm:inline">Penyimpanan: Lokal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
