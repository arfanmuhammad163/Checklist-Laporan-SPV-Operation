import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Check,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  Code2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  STORAGE_APPS_SCRIPT_URL_KEY,
  STORAGE_SHEET_WEB_URL_KEY,
  STORAGE_IS_LOCKED_KEY,
  STORAGE_LAST_SYNC_KEY,
  DEFAULT_APPS_SCRIPT_URL,
  APPS_SCRIPT_CODE,
  formatAppsScriptUrl,
} from '../services/appsScriptSync';

interface GoogleSheetsSyncBannerProps {
  onSyncNow: (scriptUrl: string) => Promise<void>;
  onPullFromSheet?: (scriptUrl: string) => Promise<void>;
  isSyncing: boolean;
  lastSyncedTime: string | null;
  activeSpreadsheetUrl?: string | null;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const GoogleSheetsSyncBanner: React.FC<GoogleSheetsSyncBannerProps> = ({
  onSyncNow,
  onPullFromSheet,
  isSyncing,
  lastSyncedTime,
  activeSpreadsheetUrl,
  onToast,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_APPS_SCRIPT_URL_KEY) || DEFAULT_APPS_SCRIPT_URL;
  });
  const [sheetWebUrl, setSheetWebUrl] = useState<string>(() => {
    return (
      activeSpreadsheetUrl ||
      localStorage.getItem(STORAGE_SHEET_WEB_URL_KEY) ||
      'https://docs.google.com/spreadsheets'
    );
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_IS_LOCKED_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Sync sheetWebUrl if prop updates
  useEffect(() => {
    if (activeSpreadsheetUrl) {
      setSheetWebUrl(activeSpreadsheetUrl);
      localStorage.setItem(STORAGE_SHEET_WEB_URL_KEY, activeSpreadsheetUrl);
    }
  }, [activeSpreadsheetUrl]);

  const handleToggleLock = () => {
    const nextState = !isLocked;
    setIsLocked(nextState);
    localStorage.setItem(STORAGE_IS_LOCKED_KEY, String(nextState));
    if (!nextState) {
      onToast('info', 'URL Apps Script dapat diedit. Klik gembok lagi untuk mengunci.');
    } else {
      localStorage.setItem(STORAGE_APPS_SCRIPT_URL_KEY, formatAppsScriptUrl(scriptUrl));
      onToast('success', 'URL Apps Script berhasil dikunci & disimpan permanen.');
    }
  };

  const handleUrlChange = (val: string) => {
    setScriptUrl(val);
    localStorage.setItem(STORAGE_APPS_SCRIPT_URL_KEY, val);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopiedCode(true);
      onToast('success', 'Kode Google Apps Script berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      onToast('error', 'Gagal menyalin kode. Silakan salin manual.');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(scriptUrl);
      setCopiedUrl(true);
      onToast('success', 'URL Apps Script berhasil disalin!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      onToast('error', 'Gagal menyalin URL');
    }
  };

  const handleTriggerSync = async () => {
    const formatted = formatAppsScriptUrl(scriptUrl);
    if (!formatted) {
      onToast('error', 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu');
      return;
    }
    await onSyncNow(formatted);
  };

  const handleOpenSheets = () => {
    if (sheetWebUrl && sheetWebUrl.startsWith('http')) {
      window.open(sheetWebUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://docs.google.com/spreadsheets', '_blank', 'noopener,noreferrer');
    }
  };

  // Truncate display URL for the header
  const displayUrl = scriptUrl
    ? scriptUrl.length > 55
      ? scriptUrl.substring(0, 52) + '...'
      : scriptUrl
    : 'https://script.google.com/macros/s/...';

  return (
    <section className="w-full space-y-3 mb-5 no-print animate-in fade-in duration-200">
      {/* 1. TOP HEADER BAR */}
      <div
        id="card-sheets-sync-header"
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5"
      >
        {/* Left Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight uppercase">
                SINKRONISASI GOOGLE SHEETS
              </h2>
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs animate-pulse shrink-0"
                title="Status: Aktif"
              />
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5" title={scriptUrl}>
              Tersambung otomatis ke spreadsheet ({displayUrl})
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-sync-report-primary"
            type="button"
            disabled={isSyncing}
            onClick={handleTriggerSync}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00875A] hover:bg-[#00704A] active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Sinkronkan laporan saat ini ke Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Laporan'}</span>
          </button>

          <button
            id="btn-toggle-settings"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Sembunyikan Pengaturan' : 'Tampilkan Pengaturan'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. EXPANDED SETTINGS SECTION */}
      {isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Bebas Error Vercel Callout Box */}
          <div className="bg-emerald-50/75 border border-emerald-200/90 rounded-2xl p-4 sm:p-4.5 space-y-1 text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-900 tracking-wide">
              <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
              <span>SINKRONISASI VIA GOOGLE APPS SCRIPT (BEBAS ERROR VERCEL)</span>
              <span className="text-amber-500">⭐</span>
            </div>
            <p className="text-xs text-emerald-800/95 leading-relaxed pl-5.5">
              Metode ini menggunakan script Google Apps Script di dalam Spreadsheet Anda yang
              bertindak sebagai jembatan langsung. Sangat aman, privat, dan bekerja 100% lancar di
              Vercel, HP, Safari, maupun Laptop!
            </p>
          </div>

          {/* Connection Status & Web App URL Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                STATUS HUBUNGAN (PERMANEN & TERKUNCI)
              </span>

              <button
                type="button"
                onClick={handleToggleLock}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                  isLocked
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                }`}
                title={isLocked ? 'Klik untuk membuka kunci dan mengedit URL' : 'Klik untuk mengunci URL'}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Script URL Terkunci</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Mode Edit (Klik untuk Kunci)</span>
                  </>
                )}
              </button>
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Active Pill */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full font-bold text-xs shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                <span>AKTIF (APPS SCRIPT)</span>
              </div>

              {/* URL Display / Input Box */}
              <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-amber-50/50 border border-amber-200/90 rounded-xl px-3 py-1.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <input
                  type="text"
                  readOnly={isLocked}
                  value={scriptUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={`flex-1 text-xs font-mono text-slate-700 bg-transparent focus:outline-none truncate ${
                    !isLocked ? 'cursor-text bg-white px-2 py-0.5 rounded border border-slate-300' : 'cursor-default'
                  }`}
                  title={scriptUrl}
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer"
                  title="Salin URL Google Apps Script"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleTriggerSync}
                className="flex items-center gap-2 px-4 py-2 bg-[#00875A] hover:bg-[#00704A] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sinkron Sekarang</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSheets}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0"
                title="Buka Google Sheets di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Buka Sheets</span>
              </button>
            </div>

            {lastSyncedTime && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terakhir disinkronkan: <strong>{lastSyncedTime}</strong></span>
              </div>
            )}
          </div>

          {/* 3. STEP BY STEP GUIDE (HANYA 1 MENIT) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-wide">
                CARA MENDAPATKAN URL APPS SCRIPT (HANYA 1 MENIT):
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                1. Buka Google Sheet Anda (atau klik tombol{' '}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 underline hover:text-emerald-800 inline-flex items-center gap-0.5"
                >
                  sheets.new
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
                ), klik menu <strong>Ekstensi (Extensions)</strong> ➔ <strong>Apps Script</strong>.
              </p>
              <p>
                2. Hapus semua kode bawaan di editor, lalu salin dan tempelkan kode di bawah ini:
              </p>
            </div>

            {/* Dark Code Container */}
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
              {/* Code Header */}
              <div className="bg-[#1E293B] px-4 py-2 flex items-center justify-between text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">&gt;_</span>
                  <span>Code.gs — Google Apps Script Connector</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Kode Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua Kode (Ctrl+C)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Body */}
              <pre className="bg-[#0F172A] text-slate-200 p-4 font-mono text-[11px] sm:text-xs overflow-x-auto max-h-72 leading-relaxed selection:bg-teal-500 selection:text-white">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
            </div>

            {/* Subsequent Steps */}
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed pt-1">
              <p>
                3. Klik <strong>Simpan</strong> (ikon disket 💾), lalu klik tombol <strong>Deploy (Terapkan)</strong> ➔{' '}
                <strong>Deployment baru (New deployment)</strong>.
              </p>
              <p>
                4. Pilih jenis <strong>Aplikasi Web (Web App)</strong>, pada bagian <strong>Akses (Who has access)</strong> pilih{' '}
                <strong className="text-emerald-800 underline">&quot;Siapa saja&quot; (Anyone)</strong>, lalu klik <strong>Terapkan (Deploy)</strong> dan salin URL Web App ke kolom di atas!
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
