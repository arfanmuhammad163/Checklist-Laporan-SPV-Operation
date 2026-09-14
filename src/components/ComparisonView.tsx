import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { CellRecord, PicMember } from '../types';
import { isSunday, isSaturday } from '../utils/dateUtils';

interface ComparisonViewProps {
  pics: PicMember[];
  planData: Record<string, Record<number, CellRecord>>;
  actualData: Record<string, Record<number, CellRecord>>;
  totalDays: number;
  year: number;
  month: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onToggleActualCell: (picId: string, day: number) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  pics,
  planData,
  actualData,
  totalDays,
  year,
  month,
  selectedDay,
  onSelectDay,
  onToggleActualCell,
}) => {
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const activePics = pics.filter((p) => p.active);

  return (
    <div className="w-full bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden mb-6">
      {/* Subheader */}
      <div className="bg-amber-600/90 text-white px-3 sm:px-4 py-2 sm:py-2.5 font-bold flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-700 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="uppercase tracking-wide font-black truncate">
            ANALISIS DEVIASI: PLAN HARIAN VS REALISASI LAPORAN
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-emerald-500 inline-block" /> Sesuai Plan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-rose-500 inline-block" /> Belum Lapor (Deviasi)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs bg-sky-400 inline-block" /> Lapor Non-Plan
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto select-none scrollbar-thin">
        <table className="w-full border-collapse text-xs text-slate-800">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="sticky left-0 z-20 bg-slate-100 border-r border-slate-300 px-2 sm:px-3 py-2 text-left font-extrabold text-slate-700 w-[125px] min-w-[125px] sm:w-[170px] sm:min-w-[170px] md:w-[220px] md:min-w-[220px] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
                PIC
              </th>
              {daysArray.map((day) => {
                const sunday = isSunday(year, month, day);
                const isSelected = day === selectedDay;

                return (
                  <th
                    key={day}
                    onClick={() => onSelectDay(day)}
                    className={`border-r border-slate-300 px-1 py-1.5 text-center min-w-[32px] sm:min-w-[34px] cursor-pointer ${
                      sunday ? 'bg-rose-100 text-rose-700 font-black' : 'bg-slate-50 font-bold'
                    } ${isSelected ? 'ring-2 ring-amber-500 ring-inset bg-amber-50!' : ''}`}
                  >
                    <span className="text-xs">{day}</span>
                  </th>
                );
              })}
              <th className="border-l-2 border-slate-300 bg-slate-100 px-2 py-1.5 text-center font-bold text-slate-700 min-w-[65px] sm:min-w-[70px]">
                Deviasi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {activePics.map((pic, rowIdx) => {
              let deviationCount = 0;
              const isEven = rowIdx % 2 === 1;

              return (
                <tr
                  key={pic.id}
                  className={`hover:bg-amber-50/20 transition-colors ${
                    isEven ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <td className={`sticky left-0 z-10 ${isEven ? 'bg-slate-50' : 'bg-white'} border-r border-slate-300 px-2 sm:px-3 py-2 text-slate-800 font-semibold truncate shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] w-[125px] min-w-[125px] sm:w-[170px] sm:min-w-[170px] md:w-[220px] md:min-w-[220px]`}>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs" title={`${pic.name} - ${pic.role || 'SPV Operation'}`}>
                        {pic.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal leading-tight truncate">
                        {pic.role || 'SPV Operation'}
                      </span>
                    </div>
                  </td>

                  {daysArray.map((day) => {
                    const planStatus = planData[pic.id]?.[day]?.status;
                    const actualStatus = actualData[pic.id]?.[day]?.status;
                    const sunday = isSunday(year, month, day);
                    const isSelected = day === selectedDay;

                    // Analysis
                    const isPlanned = planStatus === 'checked';
                    const isReported = actualStatus === 'checked';
                    const isProblem = actualStatus === 'problem' || planStatus === 'problem';

                    let cellStyle = 'bg-white';
                    let content = null;
                    let tooltip = '';

                    if (planStatus === 'disabled') {
                      cellStyle = 'bg-slate-100 text-slate-400';
                      content = <span className="w-2.5 h-0.5 bg-slate-300 rounded" />;
                      tooltip = 'Non-aktif / Cuti';
                    } else if (isPlanned && isReported) {
                      cellStyle = 'bg-emerald-100/70 text-emerald-800 font-bold';
                      content = '✓';
                      tooltip = 'Sesuai Plan: Laporan Diterima';
                    } else if (isPlanned && !isReported) {
                      deviationCount++;
                      cellStyle = 'bg-rose-100 text-rose-700 font-bold animate-pulse';
                      content = '✕';
                      tooltip = 'Deviasi: Ada di Plan tapi Belum Lapor! (Klik untuk checklist)';
                    } else if (!isPlanned && isReported) {
                      cellStyle = 'bg-sky-100 text-sky-800 font-semibold';
                      content = '✓*';
                      tooltip = 'Laporan Masuk di Luar Jadwal Plan';
                    } else {
                      cellStyle = sunday ? 'bg-rose-50/40 text-slate-300' : 'text-slate-300';
                      content = '·';
                      tooltip = 'Off / Tidak Dijadwalkan';
                    }

                    return (
                      <td
                        key={day}
                        onClick={() => onToggleActualCell(pic.id, day)}
                        className={`border-r border-slate-200 p-1 text-center cursor-pointer transition-colors ${cellStyle} ${
                          isSelected ? 'ring-1 ring-amber-500 ring-inset' : ''
                        }`}
                        title={tooltip}
                      >
                        <div className="w-5 h-5 mx-auto flex items-center justify-center text-xs">
                          {content}
                        </div>
                      </td>
                    );
                  })}

                  <td className="border-l-2 border-slate-300 px-2 py-2 text-center font-bold text-xs bg-slate-50/80">
                    {deviationCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-black">
                        -{deviationCount}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
