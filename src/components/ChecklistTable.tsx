import React from 'react';
import { Check, AlertCircle, Slash, UserMinus, Plus, Info } from 'lucide-react';
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
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const activePics = pics.filter((p) => p.active);

  // Subheader banner color matching user reference image
  const subheaderBg = type === 'plan' ? 'bg-[#92b8d0] text-[#1c3e56]' : 'bg-[#92b8d0] text-[#1c3e56]';

  return (
    <div className="w-full bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden mb-6">
      {/* Table Subheader Bar matching user image */}
      <div className={`${subheaderBg} px-4 py-2 font-black text-center text-sm sm:text-base tracking-wide border-b border-slate-300 flex items-center justify-between`}>
        <div className="w-20 hidden sm:block text-left text-xs font-semibold text-slate-700">
          {type === 'plan' ? '📅 Rencana Kerja' : '✅ Realisasi Laporan'}
        </div>
        <span className="uppercase tracking-widest font-extrabold">{title}</span>
        <div className="text-xs text-slate-700 font-normal">
          Klik kotak untuk checklist
        </div>
      </div>

      {/* Responsive Table Container with smooth horizontal scroll */}
      <div className="overflow-x-auto select-none">
        <table className="w-full border-collapse text-xs text-slate-800">
          <thead>
            {/* Header Row */}
            <tr className="bg-slate-100 border-b border-slate-300">
              {/* Sticky PIC column */}
              <th className="sticky left-0 z-20 bg-slate-100 border-r border-slate-300 px-3 py-2 text-left font-extrabold text-slate-700 min-w-[200px] w-[200px] sm:min-w-[220px] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <span>PIC</span>
                  <span className="text-[10px] text-slate-500 font-normal">
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
                    onClick={() => onSelectDay(day)}
                    className={`border-r border-slate-300 px-1 py-1.5 text-center min-w-[28px] sm:min-w-[32px] cursor-pointer transition-colors group ${
                      sunday
                        ? 'bg-rose-100/80 text-rose-700 font-black'
                        : saturday
                        ? 'bg-amber-50/70 text-slate-700 font-bold'
                        : 'bg-slate-50 text-slate-700 font-bold'
                    } ${isSelected ? 'ring-2 ring-teal-500 ring-inset bg-teal-50!' : ''}`}
                    title={`Tanggal ${day} - Klik untuk fokus / aksi`}
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
              <th className="border-l-2 border-slate-300 bg-slate-100 px-2.5 py-1.5 text-center font-bold text-slate-700 min-w-[64px]">
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

              return (
                <tr
                  key={pic.id}
                  className={`hover:bg-teal-50/30 transition-colors ${
                    rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  {/* Sticky PIC Name Column */}
                  <td className="sticky left-0 z-10 bg-inherit border-r border-slate-300 px-3 py-1.5 text-slate-800 font-medium truncate shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex flex-col min-w-0">
                        <span
                          className="font-semibold text-slate-800 hover:text-teal-700 truncate"
                          title={`${pic.name} - ${pic.role || 'SPV Operation'}`}
                        >
                          {pic.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight truncate">
                          {pic.role || 'SPV Operation'}
                        </span>
                      </div>
                      {onBatchCheckPic && (
                        <button
                          type="button"
                          onClick={() => onBatchCheckPic(pic.id)}
                          className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1 py-0.5 rounded cursor-pointer transition-opacity shrink-0"
                          title="Tandai seluruh hari"
                        >
                          Semua
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Day Checkboxes */}
                  {daysArray.map((day) => {
                    const sunday = isSunday(year, month, day);
                    const isSelected = day === selectedDay;
                    const cellRecord = tableData[pic.id]?.[day] || { status: 'unchecked' };
                    const { status, note } = cellRecord;

                    // Sulthan Syachrul style: if disabled for a streak, render empty/disabled
                    if (status === 'disabled') {
                      return (
                        <td
                          key={day}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onOpenCellMenu(pic.id, day, e);
                          }}
                          onClick={() => onToggleCell(pic.id, day)}
                          className={`border-r border-slate-200 p-0 text-center cursor-pointer transition-colors bg-slate-100/60 hover:bg-slate-200/50 ${
                            sunday ? 'bg-rose-50/40' : ''
                          } ${isSelected ? 'bg-teal-50/60' : ''}`}
                          title={note || 'Non-aktif / Cuti (Klik kanan untuk ubah status)'}
                        >
                          <div className="h-7 w-full flex items-center justify-center">
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
                        className={`border-r border-slate-200 p-1 text-center cursor-pointer transition-colors group/cell ${
                          sunday ? 'bg-rose-50/50' : ''
                        } ${isSelected ? 'bg-teal-50/60 ring-1 ring-teal-400 ring-inset' : 'hover:bg-teal-50/40'}`}
                      >
                        <div className="flex items-center justify-center relative">
                          {status === 'checked' ? (
                            /* Green Checkbox exactly like in user's image */
                            <div
                              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-xs border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-2xs hover:scale-110 active:scale-95 transition-transform"
                              title={note ? `Sudah Lapor: ${note}` : 'Sudah Lapor'}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                            </div>
                          ) : status === 'problem' ? (
                            /* Red Problem Box like Binoni day 4 in screenshot */
                            <div
                              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-xs border-2 border-rose-600 bg-rose-500 flex items-center justify-center text-white shadow-2xs hover:scale-110 active:scale-95 transition-transform"
                              title={note ? `Kendala: ${note}` : 'Ada Kendala'}
                            >
                              <div className="w-2 h-2 bg-white rounded-xs" />
                            </div>
                          ) : status === 'leave' ? (
                            /* Yellow Leave / Cuti Box */
                            <div
                              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-xs border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-amber-800 text-[10px] font-black shadow-2xs hover:scale-110 active:scale-95 transition-transform"
                              title={note ? `Cuti/Izin: ${note}` : 'Cuti/Izin'}
                            >
                              C
                            </div>
                          ) : (
                            /* Empty Unchecked Box exactly like in user's image */
                            <div
                              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-xs border-2 border-slate-400/80 bg-white hover:border-teal-600 hover:bg-teal-50/30 transition-all flex items-center justify-center"
                              title="Belum Checklist (Klik untuk centang)"
                            />
                          )}

                          {note && (
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Row Total */}
                  <td className="border-l-2 border-slate-300 px-2 py-2 text-center font-bold text-slate-700 bg-slate-50/80">
                    <span className="text-emerald-700 font-extrabold">{rowCheckedCount}</span>
                    <span className="text-slate-400 text-[10px]">/{rowPlannedCount}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Column Summary */}
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-700 text-[11px]">
              <td className="sticky left-0 z-20 bg-slate-100 border-r border-slate-300 px-3 py-2 text-left font-black text-slate-800 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <span>Total Lapor</span>
                  <span className="text-[10px] text-slate-500 font-normal">per Hari</span>
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
                    className={`border-r border-slate-300 px-1 py-2 text-center ${
                      sunday ? 'bg-rose-100/60 text-rose-700' : ''
                    }`}
                  >
                    <span
                      className={`font-black ${
                        dayChecked > 0 ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {dayChecked}
                    </span>
                  </td>
                );
              })}
              <td className="border-l-2 border-slate-300 px-2 py-2 text-center font-black text-teal-800 bg-slate-200">
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
