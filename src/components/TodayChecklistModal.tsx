import React, { useState } from 'react';
import { X, Check, Calendar, CheckCircle2, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { CellRecord, CellStatusType, PicMember } from '../types';
import { formatIndonesianDate, getDayName, INDONESIAN_MONTHS } from '../utils/dateUtils';

interface TodayChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  pics: PicMember[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  month: number;
  year: number;
  totalDays: number;
  planData: Record<string, Record<number, CellRecord>>;
  actualData: Record<string, Record<number, CellRecord>>;
  onUpdateActualCell: (picId: string, day: number, newStatus: CellStatusType, note?: string) => void;
  onBatchSetActualDay: (day: number, status: CellStatusType) => void;
}

export const TodayChecklistModal: React.FC<TodayChecklistModalProps> = ({
  isOpen,
  onClose,
  pics,
  selectedDay,
  onSelectDay,
  month,
  year,
  totalDays,
  planData,
  actualData,
  onUpdateActualCell,
  onBatchSetActualDay,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  const activePics = pics.filter((p) => p.active);

  const filteredPics = activePics.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterPendingOnly) {
      const actualStatus = actualData[p.id]?.[selectedDay]?.status;
      return actualStatus !== 'checked';
    }

    return true;
  });

  const dayName = getDayName(year, month, selectedDay);
  const monthName = INDONESIAN_MONTHS[month];

  // Count reported vs planned for this day
  const totalPlannedToday = activePics.filter(
    (p) => planData[p.id]?.[selectedDay]?.status === 'checked'
  ).length;

  const totalReportedToday = activePics.filter(
    (p) => actualData[p.id]?.[selectedDay]?.status === 'checked'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#356170] text-white p-4 sm:p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-bold px-2 py-0.5 rounded">
                KONTROL CEPAT
              </span>
              <span className="text-xs text-slate-200">Dept. Operation & Controlling</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1">
              Checklist Laporan Harian SPV
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Tandai SPV yang sudah menyerahkan laporan harian. Sisa centang langsung tersimpan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector & Progress bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-600">Pilih Tanggal:</span>
            <select
              value={selectedDay}
              onChange={(e) => onSelectDay(Number(e.target.value))}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d} {monthName} ({getDayName(year, month, d)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Progres Hari Ini:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {totalReportedToday} / {activePics.length} Selesai
            </span>
          </div>
        </div>

        {/* Quick Bulk Action Buttons & Search */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama SPV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                filterPendingOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Hanya Belum Lapor</span>
            </button>

            <button
              onClick={() => onBatchSetActualDay(selectedDay, 'checked')}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Centang Semua</span>
            </button>
          </div>
        </div>

        {/* Checklist List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          {filteredPics.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Tidak ada SPV yang cocok dengan kriteria pencarian
            </div>
          ) : (
            filteredPics.map((pic) => {
              const currentCell = actualData[pic.id]?.[selectedDay] || { status: 'unchecked' };
              const planCell = planData[pic.id]?.[selectedDay] || { status: 'unchecked' };
              const isChecked = currentCell.status === 'checked';
              const isProblem = currentCell.status === 'problem';
              const isSick = currentCell.status === 'sick';
              const isLeave = currentCell.status === 'leave';
              const isPlanned = planCell.status === 'checked';

              return (
                <div
                  key={pic.id}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                      : isProblem
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isSick
                      ? 'bg-purple-50/40 hover:bg-purple-50/70'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Big satisfying checkbox */}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateActualCell(
                          pic.id,
                          selectedDay,
                          isChecked ? 'unchecked' : 'checked'
                        )
                      }
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all shadow-2xs ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                          : isProblem
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : isSick
                          ? 'border-purple-600 bg-purple-600 text-white font-black text-xs'
                          : isLeave
                          ? 'border-amber-500 bg-amber-500 text-white font-black text-xs'
                          : 'border-slate-300 bg-white hover:border-teal-600'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      {isProblem && <AlertCircle className="w-4 h-4" />}
                      {isSick && 'S'}
                      {isLeave && 'C'}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{pic.name}</span>
                        {isPlanned ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded">
                            Plan: Kerja
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-slate-100 rounded">
                            Plan: Off/Libur
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {currentCell.note ? (
                          <span className="text-indigo-600 font-medium">
                            📝 {currentCell.note}
                          </span>
                        ) : isChecked ? (
                          <span className="text-emerald-700 font-medium">
                            ✓ Laporan harian sudah diterima
                          </span>
                        ) : isProblem ? (
                          <span className="text-rose-600 font-medium">
                            ⚠ Ada kendala / catatan
                          </span>
                        ) : isSick ? (
                          <span className="text-purple-700 font-medium">
                            🤒 Sakit
                          </span>
                        ) : isLeave ? (
                          <span className="text-amber-700 font-medium">
                            🏖 Cuti / Izin
                          </span>
                        ) : (
                          <span className="text-slate-400">Belum menyerahkan laporan</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateActualCell(
                          pic.id,
                          selectedDay,
                          isChecked ? 'unchecked' : 'checked'
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                      }`}
                    >
                      {isChecked ? 'Sudah Lapor' : 'Tandai Lapor'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isSick) {
                          const note = window.prompt(
                            `Ubah keterangan sakit untuk ${pic.name} (kosongkan lalu klik OK untuk menghapus status sakit):`,
                            currentCell.note || 'Sakit'
                          );
                          if (note === null) return;
                          if (note.trim() === '') {
                            onUpdateActualCell(pic.id, selectedDay, 'unchecked');
                          } else {
                            onUpdateActualCell(pic.id, selectedDay, 'sick', note.trim());
                          }
                        } else {
                          const note = window.prompt(
                            `Keterangan sakit untuk ${pic.name}:`,
                            currentCell.note || 'Sakit'
                          );
                          if (note !== null) {
                            onUpdateActualCell(pic.id, selectedDay, 'sick', note.trim() || 'Sakit');
                          }
                        }
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${
                        isSick
                          ? 'bg-purple-100 text-purple-800 border-purple-300 ring-1 ring-purple-400'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                      title={isSick ? `Status Sakit: ${currentCell.note || 'Sakit'} (Klik untuk ubah keterangan)` : 'Tandai Sakit'}
                    >
                      {isSick ? '✓ Sakit' : 'Sakit'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const note = window.prompt(
                          `Catatan kendala untuk ${pic.name}:`,
                          currentCell.note || ''
                        );
                        if (note !== null) {
                          onUpdateActualCell(pic.id, selectedDay, 'problem', note);
                        }
                      }}
                      className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border ${
                        isProblem
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title="Tandai ada kendala"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Perubahan langsung tersimpan ke spreadsheet tabel utama.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
