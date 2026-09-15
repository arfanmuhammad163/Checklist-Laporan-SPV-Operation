import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Slash, UserMinus, Calendar, FileText } from 'lucide-react';
import { CellRecord, CellStatusType } from '../types';

interface CellStatusPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  picName: string;
  day: number;
  monthName: string;
  year: number;
  tableType: 'plan' | 'actual';
  currentCell: CellRecord;
  onSave: (status: CellStatusType, note?: string) => void;
  anchorPosition?: { x: number; y: number } | null;
}

export const CellStatusPopover: React.FC<CellStatusPopoverProps> = ({
  isOpen,
  onClose,
  picName,
  day,
  monthName,
  year,
  tableType,
  currentCell,
  onSave,
}) => {
  const [status, setStatus] = useState<CellStatusType>(currentCell?.status || 'unchecked');
  const [note, setNote] = useState<string>(currentCell?.note || '');

  useEffect(() => {
    if (isOpen) {
      setStatus(currentCell?.status || 'unchecked');
      setNote(currentCell?.note || '');
    }
  }, [isOpen, currentCell]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedNote = note.trim();
    const finalNote = status === 'sick' && !trimmedNote ? 'Sakit' : trimmedNote;
    onSave(status, finalNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-[#356170] text-white px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
              {tableType === 'plan' ? 'Edit Plan Harian' : 'Edit Laporan Harian'}
            </span>
            <h3 className="font-bold text-sm sm:text-base leading-tight">
              {picName} - Tgl {day} {monthName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Pilih Status:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('checked')}
              className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                status === 'checked'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-xs border-2 border-emerald-600 bg-white flex items-center justify-center text-emerald-700 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Sudah Lapor</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('unchecked')}
              className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                status === 'unchecked'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-xs border-2 border-slate-400 bg-white shrink-0" />
              <span>Belum Lapor</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('problem')}
              className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                status === 'problem'
                  ? 'border-rose-600 bg-rose-50 text-rose-800'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-xs border-2 border-rose-600 bg-rose-500 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 bg-white rounded-xs" />
              </div>
              <span>Ada Kendala</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('leave')}
              className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                status === 'leave'
                  ? 'border-amber-600 bg-amber-50 text-amber-800'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-xs border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-[9px] font-black text-amber-800 shrink-0">
                C
              </div>
              <span>Cuti / Izin</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('sick')}
              className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                status === 'sick'
                  ? 'border-purple-600 bg-purple-50 text-purple-800'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-4 h-4 rounded-xs border-2 border-purple-500 bg-purple-100 flex items-center justify-center text-[9px] font-black text-purple-800 shrink-0">
                S
              </div>
              <span>Sakit</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('disabled')}
              className={`p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                status === 'disabled'
                  ? 'border-slate-500 bg-slate-100 text-slate-800'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="w-4 h-1 bg-slate-400 rounded shrink-0" />
              <span className="truncate">Libur / Non-aktif</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Catatan / Keterangan (Opsional):</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Laporan via WA jam 18:00, kendala cuaca, dll."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer min-h-[40px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs min-h-[40px]"
          >
            Simpan Status
          </button>
        </div>
      </div>
    </div>
  );
};
