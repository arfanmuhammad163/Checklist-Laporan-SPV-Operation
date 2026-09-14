import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { PicMember, MonthTableData } from '../types';

interface SummaryCardsProps {
  pics: PicMember[];
  data: MonthTableData;
  selectedDay: number;
  totalDays: number;
  monthName: string;
  year: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  pics,
  data,
  selectedDay,
  totalDays,
  monthName,
}) => {
  const activePics = pics.filter((p) => p.active);

  // Stats for selectedDay (Hari Yang Dipilih / Hari Ini)
  let todayPlanned = 0;
  let todayReported = 0;
  let todayProblem = 0;
  let todayUnreported = 0;

  activePics.forEach((pic) => {
    const planRec = data.plan[pic.id]?.[selectedDay]?.status;
    const actualRec = data.actual[pic.id]?.[selectedDay]?.status;

    if (planRec === 'checked') todayPlanned++;
    if (actualRec === 'checked') todayReported++;
    if (actualRec === 'problem' || planRec === 'problem') todayProblem++;

    // Unreported if planned but not checked in actual
    if (planRec === 'checked' && actualRec !== 'checked' && actualRec !== 'disabled') {
      todayUnreported++;
    }
  });

  const todayCompliance = todayPlanned > 0 ? Math.round((todayReported / todayPlanned) * 100) : 100;

  // Month-wide stats
  let totalMonthPlanned = 0;
  let totalMonthReported = 0;

  activePics.forEach((pic) => {
    for (let d = 1; d <= totalDays; d++) {
      if (data.plan[pic.id]?.[d]?.status === 'checked') totalMonthPlanned++;
      if (data.actual[pic.id]?.[d]?.status === 'checked') totalMonthReported++;
    }
  });

  const monthCompliance =
    totalMonthPlanned > 0 ? Math.round((totalMonthReported / totalMonthPlanned) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
      {/* Card 1: Today Compliance */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Kepatuhan Tgl {selectedDay}
          </span>
          <span
            className={`px-1.5 py-0.5 sm:p-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold shrink-0 ${
              todayCompliance >= 90
                ? 'bg-emerald-100 text-emerald-800'
                : todayCompliance >= 60
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {todayCompliance}%
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-800">
            {todayReported} / {todayPlanned}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 truncate">SPV Lapor</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              todayCompliance >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(todayCompliance, 100)}%` }}
          />
        </div>
      </div>

      {/* Card 2: Pending/Unchecked today */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Belum Lapor (Tgl {selectedDay})
          </span>
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
          <span
            className={`text-xl sm:text-2xl font-black ${
              todayUnreported > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {todayUnreported}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500">tertunda</span>
        </div>
        <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 truncate">
          {todayUnreported === 0 ? 'Semua plan terpenuhi' : 'Perlu difollow up'}
        </div>
      </div>

      {/* Card 3: Problem / Kendala */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Kendala Lapangan
          </span>
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
          <span
            className={`text-xl sm:text-2xl font-black ${
              todayProblem > 0 ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {todayProblem}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500">tanda merah</span>
        </div>
        <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 truncate">
          {todayProblem > 0 ? 'Ada catatan kendala' : 'Lancar aman'}
        </div>
      </div>

      {/* Card 4: Month Overview */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total {monthName}
          </span>
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 shrink-0" />
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-800">{totalMonthReported}</span>
          <span className="text-[10px] sm:text-xs text-slate-500 truncate">/ {totalMonthPlanned}</span>
        </div>
        <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between">
          <span className="truncate">Kepatuhan</span>
          <span className="font-bold text-teal-700 ml-1">{monthCompliance}%</span>
        </div>
      </div>
    </div>
  );
};
