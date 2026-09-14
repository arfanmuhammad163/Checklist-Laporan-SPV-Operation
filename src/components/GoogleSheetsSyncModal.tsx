import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  PlusCircle,
  Link2,
  LogOut,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SpreadsheetInfo, extractSpreadsheetId } from '../services/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  spreadsheet: SpreadsheetInfo | null;
  isLoading: boolean;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSaveToSheets: () => Promise<void>;
  onLoadFromSheets: () => Promise<void>;
  onCreateNewSpreadsheet: () => Promise<void>;
  onConnectCustomSheet: (idOrUrl: string) => Promise<void>;
  lastSyncedTime: string | null;
  monthName: string;
  year: number;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  spreadsheet,
  isLoading,
  onSignIn,
  onSignOut,
  onSaveToSheets,
  onLoadFromSheets,
  onCreateNewSpreadsheet,
  onConnectCustomSheet,
  lastSyncedTime,
  monthName,
  year,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'push' | 'pull' | 'create';
    title: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCustomConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    await onConnectCustomSheet(customInput.trim());
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleConfirmExecute = async () => {
    if (!confirmAction) return;
    const action = confirmAction.type;
    setConfirmAction(null);

    if (action === 'push') {
      await onSaveToSheets();
    } else if (action === 'pull') {
      await onLoadFromSheets();
    } else if (action === 'create') {
      await onCreateNewSpreadsheet();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide">
                Database Google Sheets
              </h2>
              <p className="text-xs text-teal-100">
                Penyimpanan cloud aman & permanen untuk checklist SPV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* User Auth Section */}
          {!user ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Hubungkan ke Akun Google
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Masuk dengan akun Google Anda untuk menyimpan dan membaca data
                  laporan checklist langsung ke Google Spreadsheet.
                </p>
              </div>

              {/* Official Google Sign-in Styled Button */}
              <button
                type="button"
                onClick={onSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </div>
          ) : (
            <>
              {/* Connected User Account */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-teal-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs truncate">
                        {user.displayName || 'Pengguna Terverifikasi'}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Keluar dari akun Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Active Spreadsheet Details */}
              {spreadsheet ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 tracking-wider uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Spreadsheet Aktif
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                        {spreadsheet.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono break-all mt-0.5">
                        ID: {spreadsheet.id}
                      </p>
                    </div>

                    <a
                      href={spreadsheet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors shrink-0"
                    >
                      <span>Buka Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {lastSyncedTime && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Terakhir disinkron: <strong>{lastSyncedTime}</strong></span>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        setConfirmAction({
                          type: 'push',
                          title: 'Simpan ke Google Sheets?',
                          message: `Apakah Anda yakin ingin memperbarui data di spreadsheet '${spreadsheet.name}' dengan seluruh data checklist periode ${monthName} ${year}? Data pada tab Tim_SPV, Plan_Harian, dan Actual_Harian akan diperbarui.`,
                        })
                      }
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        setConfirmAction({
                          type: 'pull',
                          title: 'Muat dari Google Sheets?',
                          message: `Apakah Anda yakin ingin menarik data dari spreadsheet '${spreadsheet.name}'? Data checklist di layar aplikasi akan diselaraskan dengan isi Google Sheets.`,
                        })
                      }
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <DownloadCloud className="w-4 h-4 text-slate-600" />
                      <span>Tarik dari Sheet</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* No Spreadsheet Connected Yet */
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">
                      Belum Ada Spreadsheet Terhubung
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Buat spreadsheet database otomatis di Google Drive Anda atau tautkan ID spreadsheet yang sudah ada.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      setConfirmAction({
                        type: 'create',
                        title: 'Buat Spreadsheet Baru?',
                        message:
                          'Aplikasi akan membuat spreadsheet Google baru berjudul "Checklist Laporan SPV Operation - Database" di akun Google Drive Anda lengkap dengan tab Tim_SPV, Plan_Harian, dan Actual_Harian.',
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Spreadsheet Database Baru</span>
                  </button>
                </div>
              )}

              {/* Custom Link / Change Sheet Option */}
              <div className="pt-2 border-t border-slate-200">
                {!showCustomInput ? (
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Hubungkan Spreadsheet Lain / URL</span>
                    </button>

                    {spreadsheet && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          setConfirmAction({
                            type: 'create',
                            title: 'Buat Spreadsheet Baru?',
                            message:
                              'Aplikasi akan membuat spreadsheet Google baru di akun Google Drive Anda untuk periode baru.',
                          })
                        }
                        className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Buat Baru</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleCustomConnect} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Tautkan Link atau ID Google Spreadsheet:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tempelkan link Docs Google Spreadsheet..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!customInput.trim() || isLoading}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-teal-700 disabled:opacity-50"
                      >
                        Tautkan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Memproses komunikasi dengan Google Sheets...</span>
            </div>
          )}
        </div>

        {/* Confirmation Modal Overlay per SKILL.md requirement */}
        {confirmAction && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-6 z-20">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-teal-800">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-800">
                  {confirmAction.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {confirmAction.message}
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExecute}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Struktur Data: 4 Sheets (Tim, Plan, Actual, Catatan)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
