import React, { useRef } from 'react';
import { Check, AlertCircle, Slash, UserMinus, Plus, Info, ChevronRight, Calendar } from 'lucide-react';
import { CellRecord, CellStatusType, PicMember } from '../types';
import { isSunday, isSaturday } from '../utils/dateUtils';

interface ChecklistTableProps {
  title: string;
  type: 'plan' | 'actual';
  pics: PicMember[];
  tableData: Record<string, Record<number, CellRecord>>;
  totalDays: number;
  year: number;
  month: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onToggleCell: (picId: string, day: number) => void;
  onOpenCellMenu: (picId: string, day: number, e: React.MouseEvent) => void;
  onBatchCheckDay?: (day: number) => void;
  onBatchCheckPic?: (picId: string) => void;
}

export const ChecklistTable: React.FC<ChecklistTableProps> = ({
  title,
  type,
  pics,
  tableData,
  totalDays,
  year,
  month,
  selectedDay,
  onSelectDay,
  onToggleCell,
  onOpenCellMenu,
  onBatchCheckDay,
  onBatchCheckPic,
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const activePics = pics.filter((p) => p.active);

  // Subheader banner color matching user reference image
  const subheaderBg = type === 'plan' ? 'bg-[#92b8d0] text-[#1c3e56]' : 'bg-[#92b8d0] text-[#1c3e56]';

  const handleScrollToDay = (day: number) => {
    onSelectDay(day);
    if (!tableContainerRef.current) return;
    const colElement = tableContainerRef.current.querySelector(`[data-day-col="${day}"]`) as HTMLElement;
    if (colElement) {
      colElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden mb-5">
      {/* Table Subheader Bar matching user image */}
      <div className={`${subheaderBg} px-3 py-2 sm:px-4 sm:py-2.5 font-black text-xs sm:text-sm md:text-base tracking-wide border-b border-slate-300 flex flex-wrap items-center justify-between gap-1.5`}>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="hidden sm:inline">
            {type === 'plan' ? '📅 Rencana Kerja' : '✅ Realisasi Laporan'} —
          </span>
          <span className="uppercase tracking-wider font-extrabold">{title}</span>
        </div>

        {/* Mobile quick scroll button & hint */}
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => handleScrollToDay(selectedDay)}
            className="flex items-center gap-1 px-2 py-0.5 bg-white/70 hover:bg-white text-slate-800 rounded-md font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Gulir tabel langsung ke kolom tanggal terpilih"
          >
            <Calendar className="w-3 h-3 text-teal-700" />
            <span>Tgl {selectedDay}</span>
          </button>
          <span className="text-slate-700 hidden md:inline text-xs font-normal">
            Klik kotak untuk checklist
          </span>
          <span className="text-slate-700 md:hidden text-[10px] font-normal flex items-center">
            Geser tabel <ChevronRight className="w-3 h-3 inline" />
          </span>
        </div>
      </div>

      {/* Responsive Table Container with smooth horizontal scroll */}
      <div ref={tableContainerRef} className="overflow-x-auto select-none scroll-smooth">
        <table className="w-full border-collapse text-xs text-slate-800">
          <thead>
            {/* Header Row */}
            <tr className="bg-slate-100 border-b border-slate-300">
              {/* Sticky PIC column - responsive width & 100% opaque background */}
              <th className="sticky left-0 z-20 bg-slate-100 border-r border-slate-300 px-2 sm:px-3 py-2 text-left font-extrabold text-slate-700 w-[125px] min-w-[125px] sm:w-[175px] sm:min-w-[175px] md:w-[220px] md:min-w-[220px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">Nama SPV</span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {activePics.length} SPV
                  </span>
                </div>
              </th>

              {/* Day Columns 1..N */}
              {daysArray.map((day) => {
                const sunday = isSunday(year, month, day);
                const saturday = isSaturday(year, month, day);
                const isSelected = day === selectedDay;

                return (
                  <th
                    key={day}
                    data-day-col={day}
                    onClick={() => handleScrollToDay(day)}
                    className={`border-r border-slate-300 px-0.5 sm:px-1 py-1.5 text-center min-w-[32px] sm:min-w-[32px] md:min-w-[34px] cursor-pointer transition-colors group ${
                      sunday
                        ? 'bg-rose-100/90 text-rose-700 font-black'
                        : saturday
                        ? 'bg-amber-50 text-slate-700 font-bold'
                        : 'bg-slate-50 text-slate-700 font-bold'
                    } ${isSelected ? 'ring-2 ring-teal-500 ring-inset bg-teal-100/70!' : ''}`}
                    title={`Tanggal ${day} - Klik untuk fokus`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`text-xs ${sunday ? 'text-rose-600 font-black' : ''}`}>
                        {day}
                      </span>
                    </div>
                  </th>
                );
              })}

              {/* Total Column */}
              <th className="border-l-2 border-slate-300 bg-slate-100 px-2 py-1.5 text-center font-bold text-slate-700 min-w-[54px] sm:min-w-[64px]">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {activePics.map((pic, rowIdx) => {
              // Calculate row total checked
              let rowCheckedCount = 0;
              let rowPlannedCount = 0;
              daysArray.forEach((d) => {
                const cell = tableData[pic.id]?.[d];
                if (cell?.status === 'checked') rowCheckedCount++;
                if (cell?.status !== 'disabled') rowPlannedCount++;
              });

              const isEven = rowIdx % 2 === 1;
              const rowBg = isEven ? 'bg-slate-50' : 'bg-white';

              return (
                <tr
                  key={pic.id}
                  className={`hover:bg-teal-50/40 transition-colors ${rowBg}`}
                >
                  {/* Sticky PIC Name Column - Solid opaque background prevents ghost bleed */}
                  <td className={`sticky left-0 z-10 ${rowBg} border-r border-slate-300 px-2 sm:px-3 py-1.5 text-slate-800 font-medium truncate shadow-[3px_0_6px_-2px_rgba(0,0,0,0.1)] w-[125px] min-w-[125px] sm:w-[175px] sm:min-w-[175px] md:w-[220px] md:min-w-[220px]`}>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex flex-col min-w-0">
                        <span
                          className="font-bold text-slate-800 text-[11px] sm:text-xs truncate leading-tight"
                          title={`${pic.name} - ${pic.role || 'SPV Operation'}`}
                        >
                          {pic.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal leading-tight truncate">
                          {pic.role || 'SPV Operation'}
                        </span>
                      </div>
                      {onBatchCheckPic && (
                        <button
                          type="button"
                          onClick={() => onBatchCheckPic(pic.id)}
                          className="hidden sm:inline-block text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1 py-0.5 rounded cursor-pointer shrink-0 hover:bg-teal-100"
                          title="Tandai seluruh hari"
                        >
                          Semua
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Day Checkboxes - Optimized touch targets for phones & tablets */}
                  {daysArray.map((day) => {
                    const sunday = isSunday(year, month, day);
                    const isSelected = day === selectedDay;
                    const cellRecord = tableData[pic.id]?.[day] || { status: 'unchecked' };
                    const { status, note } = cellRecord;

                    // Disabled / Cuti Rutin
                    if (status === 'disabled') {
                      return (
                        <td
                          key={day}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onOpenCellMenu(pic.id, day, e);
                          }}
                          onClick={() => onToggleCell(pic.id, day)}
                          className={`border-r border-slate-200 p-0 text-center cursor-pointer transition-colors bg-slate-100/70 hover:bg-slate-200/50 min-w-[32px] h-10 sm:h-9 ${
                            sunday ? 'bg-rose-50/50' : ''
                          } ${isSelected ? 'bg-teal-50/70' : ''}`}
                          title={note || 'Non-aktif / Cuti (Klik kanan untuk ubah status)'}
                        >
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="w-3 h-0.5 bg-slate-300 rounded" />
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={day}
                        onClick={() => onToggleCell(pic.id, day)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          onOpenCellMenu(pic.id, day, e);
                        }}
                        className={`border-r border-slate-200 p-0 text-center cursor-pointer transition-colors min-w-[32px] h-10 sm:h-9 ${
                          sunday ? 'bg-rose-50/40' : ''
                        } ${isSelected ? 'bg-teal-50/60 ring-1 ring-teal-400 ring-inset' : 'hover:bg-teal-50/40'}`}
                      >
                        <div className="w-full h-full flex items-center justify-center relative p-1">
                          {status === 'checked' ? (
                            /* Green Checkbox matching screenshot */
                            <div
                              className="w-[20px] h-[20px] sm:w-[19px] sm:h-[19px] rounded-xs border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-2xs hover:scale-110 active:scale-90 transition-transform"
                              title={note ? `Sudah Lapor: ${note}` : 'Sudah Lapor'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                            </div>
                          ) : status === 'problem' ? (
                            /* Red Problem Box */
                            <div
                              className="w-[20px] h-[20px] sm:w-[19px] sm:h-[19px] rounded-xs border-2 border-rose-600 bg-rose-500 flex items-center justify-center text-white shadow-2xs hover:scale-110 active:scale-90 transition-transform"
                              title={note ? `Kendala: ${note}` : 'Ada Kendala'}
                            >
                              <div className="w-2 h-2 bg-white rounded-xs" />
                            </div>
                          ) : status === 'leave' ? (
                            /* Yellow Leave / Cuti Box */
                            <div
                              className="w-[20px] h-[20px] sm:w-[19px] sm:h-[19px] rounded-xs border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-amber-800 text-[10px] font-black shadow-2xs hover:scale-110 active:scale-90 transition-transform"
                              title={note ? `Cuti/Izin: ${note}` : 'Cuti/Izin'}
                            >
                              C
                            </div>
                          ) : status === 'sick' ? (
                            /* Purple Sick Box */
                            <div
                              className="w-[20px] h-[20px] sm:w-[19px] sm:h-[19px] rounded-xs border-2 border-purple-500 bg-purple-100 flex items-center justify-center text-purple-800 text-[10px] font-black shadow-2xs hover:scale-110 active:scale-90 transition-transform"
                              title={note ? `Sakit: ${note}` : 'Sakit'}
                            >
                              S
                            </div>
                          ) : (
                            /* Empty Unchecked Box */
                            <div
                              className="w-[20px] h-[20px] sm:w-[19px] sm:h-[19px] rounded-xs border-2 border-slate-400/80 bg-white hover:border-teal-600 hover:bg-teal-50/40 transition-all flex items-center justify-center active:scale-90"
                              title="Belum Checklist (Klik untuk centang)"
                            />
                          )}

                          {note && (
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Row Total */}
                  <td className="border-l-2 border-slate-300 px-1.5 py-2 text-center font-bold text-slate-700 bg-slate-50/90 min-w-[54px] sm:min-w-[64px]">
                    <span className="text-emerald-700 font-extrabold text-xs">{rowCheckedCount}</span>
                    <span className="text-slate-400 text-[10px]">/{rowPlannedCount}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Column Summary */}
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-700 text-[11px]">
              <td className="sticky left-0 z-20 bg-slate-100 border-r border-slate-300 px-2 sm:px-3 py-2 text-left font-black text-slate-800 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.12)] w-[125px] min-w-[125px] sm:w-[175px] sm:min-w-[175px] md:w-[220px] md:min-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">Total Lapor</span>
                  <span className="text-[9px] text-slate-500 font-normal hidden sm:inline">per Hari</span>
                </div>
              </td>
              {daysArray.map((day) => {
                let dayChecked = 0;
                activePics.forEach((p) => {
                  if (tableData[p.id]?.[day]?.status === 'checked') dayChecked++;
                });
                const sunday = isSunday(year, month, day);

                return (
                  <td
                    key={day}
                    className={`border-r border-slate-300 px-0.5 py-2 text-center ${
                      sunday ? 'bg-rose-100/60 text-rose-700' : ''
                    }`}
                  >
                    <span
                      className={`font-black text-xs ${
                        dayChecked > 0 ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {dayChecked}
                    </span>
                  </td>
                );
              })}
              <td className="border-l-2 border-slate-300 px-1 py-2 text-center font-black text-teal-800 bg-slate-200">
                {activePics.reduce((acc, p) => {
                  return (
                    acc +
                    daysArray.filter((d) => tableData[p.id]?.[d]?.status === 'checked').length
                  );
                }, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
