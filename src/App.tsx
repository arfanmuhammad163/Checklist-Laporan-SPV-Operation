import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HeaderBanner } from './components/HeaderBanner';
import { SummaryCards } from './components/SummaryCards';
import { ChecklistTable } from './components/ChecklistTable';
import { TodayChecklistModal } from './components/TodayChecklistModal';
import { CellStatusPopover } from './components/CellStatusPopover';
import { ManageTeamModal } from './components/ManageTeamModal';
import { ComparisonView } from './components/ComparisonView';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { GoogleSheetsSyncBanner } from './components/GoogleSheetsSyncBanner';
import { INITIAL_PICS, generateInitialMonthData } from './data/initialData';
import { getDaysInMonth, INDONESIAN_MONTHS } from './utils/dateUtils';
import { exportToCSV } from './utils/exportUtils';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
} from './services/googleAuth';
import {
  SpreadsheetInfo,
  saveAllToGoogleSheets,
  loadFromGoogleSheets,
  createDatabaseSpreadsheet,
  getSpreadsheetDetails,
  findDatabaseSpreadsheet,
  extractSpreadsheetId,
  STORAGE_SHEET_ID_KEY,
  STORAGE_SHEET_URL_KEY,
} from './services/googleSheets';
import {
  saveToAppsScript,
  loadFromAppsScript,
  STORAGE_LAST_SYNC_KEY,
  PERMANENT_APPS_SCRIPT_URL,
  STORAGE_APPS_SCRIPT_URL_KEY,
  formatAppsScriptUrl,
} from './services/appsScriptSync';
import { User } from 'firebase/auth';
import {
  ActiveViewTab,
  CellRecord,
  CellStatusType,
  MonthTableData,
  PicMember,
} from './types';
import {
  Check,
  AlertTriangle,
  Zap,
  Copy,
  Info,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

const STORAGE_KEY_PREFIX = 'spv_checklist_data_';
const STORAGE_PICS_KEY = 'spv_checklist_pics';

export default function App() {
  // Date State: Default to September 2026 (matching the user's reference image)
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(8); // September (0-indexed: 8)
  const [selectedDay, setSelectedDay] = useState<number>(14);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('both');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SPV Team Members
  const [pics, setPics] = useState<PicMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PICS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved pics', e);
    }
    return INITIAL_PICS;
  });

  // Table Data for current month & year
  const [data, setData] = useState<MonthTableData>(() => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${2026}_${8}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading initial data', e);
    }
    return generateInitialMonthData();
  });

  // Modals state
  const [isQuickCheckOpen, setIsQuickCheckOpen] = useState<boolean>(false);
  const [isManageTeamOpen, setIsManageTeamOpen] = useState<boolean>(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Google Sheets Integration State
  const [user, setUser] = useState<User | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetInfo | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_SHEET_ID_KEY);
      const savedUrl = localStorage.getItem(STORAGE_SHEET_URL_KEY);
      if (savedId) {
        return {
          id: savedId,
          name: 'Checklist Laporan SPV Operation - Database',
          url: savedUrl || `https://docs.google.com/spreadsheets/d/${savedId}`,
        };
      }
    } catch (e) {
      console.error('Error loading saved spreadsheet info', e);
    }
    return null;
  });
  const [isSheetsLoading, setIsSheetsLoading] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem('spv_last_sheets_sync_time');
  });
  const [isAppsScriptSyncing, setIsAppsScriptSyncing] = useState<boolean>(false);
  const [appsScriptLastSyncTime, setAppsScriptLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
  });
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Attempt to restore spreadsheet connection
  const restoreSpreadsheetConnection = async () => {
    try {
      const savedId = localStorage.getItem(STORAGE_SHEET_ID_KEY);
      if (savedId) {
        const details = await getSpreadsheetDetails(savedId);
        setSpreadsheet(details);
        return details;
      }
      // If no saved ID, look up in Drive
      const found = await findDatabaseSpreadsheet();
      if (found) {
        setSpreadsheet(found);
        localStorage.setItem(STORAGE_SHEET_ID_KEY, found.id);
        localStorage.setItem(STORAGE_SHEET_URL_KEY, found.url);
        return found;
      }
    } catch (e) {
      console.warn('Could not auto-restore spreadsheet details:', e);
    }
    return null;
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authedUser) => {
        setUser(authedUser);
        await restoreSpreadsheetConnection();
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Cell Popover state
  const [popoverState, setPopoverState] = useState<{
    isOpen: boolean;
    picId: string;
    picName: string;
    day: number;
    tableType: 'plan' | 'actual';
    currentCell: CellRecord;
  }>({
    isOpen: false,
    picId: '',
    picName: '',
    day: 1,
    tableType: 'actual',
    currentCell: { status: 'unchecked' },
  });

  const totalDays = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const monthName = INDONESIAN_MONTHS[month];

  const isInitialLoadedRef = useRef<boolean>(false);
  const isSavingToSheetsRef = useRef<boolean>(false);

  // Auto-sync on initial page load: anyone who opens this dashboard gets the live spreadsheet data immediately
  useEffect(() => {
    let active = true;
    const autoSyncOnOpen = async () => {
      try {
        setIsAppsScriptSyncing(true);
        const savedUrl =
          localStorage.getItem(STORAGE_APPS_SCRIPT_URL_KEY) || PERMANENT_APPS_SCRIPT_URL;
        const validUrl = formatAppsScriptUrl(savedUrl);
        const result = await loadFromAppsScript(validUrl);
        if (!active) return;
        if (result.pics && result.pics.length > 0) {
          setPics(result.pics);
        }
        if (result.data) {
          setData(result.data);
        }
        const nowStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setAppsScriptLastSyncTime(nowStr);
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, nowStr);
        isInitialLoadedRef.current = true;
        showToast('success', 'Database Google Sheets tersambung & data mutakhir tersinkronisasi.');
      } catch (err: any) {
        console.warn('Auto sync on open warning:', err);
        isInitialLoadedRef.current = true;
      } finally {
        if (active) setIsAppsScriptSyncing(false);
      }
    };

    autoSyncOnOpen();
    return () => {
      active = false;
    };
  }, []);

  // Periodic background check so updates made by teammates automatically reflect on screen
  useEffect(() => {
    const handleSyncFromCloud = async () => {
      if (isSavingToSheetsRef.current || isAppsScriptSyncing || popoverState.isOpen) return;
      try {
        const savedUrl =
          localStorage.getItem(STORAGE_APPS_SCRIPT_URL_KEY) || PERMANENT_APPS_SCRIPT_URL;
        const validUrl = formatAppsScriptUrl(savedUrl);
        const result = await loadFromAppsScript(validUrl);
        if (result.pics && result.pics.length > 0) {
          setPics(result.pics);
        }
        if (result.data) {
          setData(result.data);
        }
        const nowStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setAppsScriptLastSyncTime(nowStr);
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, nowStr);
      } catch {
        // silent fail on background poll
      }
    };

    const interval = setInterval(handleSyncFromCloud, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSyncFromCloud();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAppsScriptSyncing, popoverState.isOpen]);

  // Auto-save changes to Google Sheets so teammates see all updates
  useEffect(() => {
    if (!isInitialLoadedRef.current) return;

    const timeout = setTimeout(async () => {
      isSavingToSheetsRef.current = true;
      try {
        const savedUrl =
          localStorage.getItem(STORAGE_APPS_SCRIPT_URL_KEY) || PERMANENT_APPS_SCRIPT_URL;
        const validUrl = formatAppsScriptUrl(savedUrl);
        await saveToAppsScript(validUrl, year, month, monthName, pics, data);
        const nowStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setAppsScriptLastSyncTime(nowStr);
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, nowStr);
      } catch (e) {
        console.warn('Auto background save warning:', e);
      } finally {
        isSavingToSheetsRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [data, pics, year, month, monthName]);

  // Auto-save pics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PICS_KEY, JSON.stringify(pics));
    } catch (e) {
      console.error('Failed to persist pics', e);
    }
  }, [pics]);

  // Load/save data when month/year changes
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${year}_${month}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setData(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.error('Failed to read month data', e);
    }

    // If switching to September 2026 for the first time without saved data
    if (year === 2026 && month === 8) {
      setData(generateInitialMonthData());
    } else {
      // Initialize blank month
      const blankPlan: Record<string, Record<number, CellRecord>> = {};
      const blankActual: Record<string, Record<number, CellRecord>> = {};
      pics.forEach((p) => {
        blankPlan[p.id] = {};
        blankActual[p.id] = {};
        for (let d = 1; d <= totalDays; d++) {
          blankPlan[p.id][d] = { status: 'unchecked' };
          blankActual[p.id][d] = { status: 'unchecked' };
        }
      });
      setData({ plan: blankPlan, actual: blankActual });
    }
  }, [year, month, totalDays]);

  // Auto-save month data on update
  useEffect(() => {
    const key = `${STORAGE_KEY_PREFIX}${year}_${month}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist month data', e);
    }
  }, [data, year, month]);

  // Ensure selectedDay is within totalDays
  useEffect(() => {
    if (selectedDay > totalDays) {
      setSelectedDay(totalDays);
    }
  }, [totalDays, selectedDay]);

  // Filter PICs based on search query
  const filteredPics = useMemo(() => {
    if (!searchQuery.trim()) return pics;
    return pics.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pics, searchQuery]);

  // Single Click Toggle (Unchecked <-> Checked)
  const handleToggleCell = (
    type: 'plan' | 'actual',
    picId: string,
    day: number
  ) => {
    setData((prev) => {
      const current = prev[type][picId]?.[day]?.status || 'unchecked';
      const currentNote = prev[type][picId]?.[day]?.note;
      const nextStatus: CellStatusType =
        current === 'checked' ? 'unchecked' : 'checked';

      return {
        ...prev,
        [type]: {
          ...prev[type],
          [picId]: {
            ...prev[type][picId],
            [day]: {
              status: nextStatus,
              note: nextStatus === 'unchecked' ? undefined : currentNote,
              updatedAt: new Date().toISOString(),
            },
          },
        },
      };
    });
  };

  // Open Cell Menu for detailed status/notes
  const handleOpenCellMenu = (
    type: 'plan' | 'actual',
    picId: string,
    day: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    const pic = pics.find((p) => p.id === picId);
    const currentCell = data[type][picId]?.[day] || { status: 'unchecked' };

    setPopoverState({
      isOpen: true,
      picId,
      picName: pic?.name || 'SPV',
      day,
      tableType: type,
      currentCell,
    });
  };

  // Save from Cell Status Popover
  const handleSaveCellStatus = (status: CellStatusType, note?: string) => {
    const { tableType, picId, day } = popoverState;
    setData((prev) => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        [picId]: {
          ...prev[tableType][picId],
          [day]: {
            status,
            note: note || undefined,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }));
  };

  // Update cell from Today Checklist modal
  const handleUpdateActualCell = (
    picId: string,
    day: number,
    newStatus: CellStatusType,
    note?: string
  ) => {
    setData((prev) => ({
      ...prev,
      actual: {
        ...prev.actual,
        [picId]: {
          ...prev.actual[picId],
          [day]: {
            status: newStatus,
            note: note || undefined,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    }));
  };

  // Batch set day status
  const handleBatchSetActualDay = (day: number, status: CellStatusType) => {
    setData((prev) => {
      const nextActual = { ...prev.actual };
      pics.forEach((p) => {
        if (!nextActual[p.id]) nextActual[p.id] = {};
        nextActual[p.id][day] = {
          status,
          updatedAt: new Date().toISOString(),
        };
      });
      return {
        ...prev,
        actual: nextActual,
      };
    });
  };

  // Batch check all days for a PIC
  const handleBatchCheckPic = (type: 'plan' | 'actual', picId: string) => {
    setData((prev) => {
      const nextTable = { ...prev[type] };
      if (!nextTable[picId]) nextTable[picId] = {};
      for (let d = 1; d <= totalDays; d++) {
        nextTable[picId][d] = {
          status: 'checked',
          updatedAt: new Date().toISOString(),
        };
      }
      return {
        ...prev,
        [type]: nextTable,
      };
    });
  };

  // Copy Plan to Actual (helpful shortcut for initial monthly setup)
  const handleCopyPlanToActual = () => {
    if (
      window.confirm(
        'Salin seluruh checklist dari Plan Harian ke Laporan Harian untuk bulan ini?'
      )
    ) {
      setData((prev) => {
        const clonedActual: Record<string, Record<number, CellRecord>> = {};
        Object.keys(prev.plan).forEach((picId) => {
          clonedActual[picId] = {};
          for (let d = 1; d <= totalDays; d++) {
            clonedActual[picId][d] = {
              ...(prev.plan[picId]?.[d] || { status: 'unchecked' }),
            };
          }
        });
        return {
          ...prev,
          actual: clonedActual,
        };
      });
    }
  };

  // Reset to default sample from screenshot
  const handleResetData = () => {
    if (
      window.confirm(
        'Kembalikan data ke contoh awal sesuai referensi September 2026?'
      )
    ) {
      setYear(2026);
      setMonth(8);
      setSelectedDay(14);
      setPics(INITIAL_PICS);
      setData(generateInitialMonthData());
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}2026_8`);
      localStorage.removeItem(STORAGE_PICS_KEY);
    }
  };

  // Team Management handlers
  const handleAddPic = (name: string, role?: string) => {
    const newPic: PicMember = {
      id: `pic-${Date.now()}`,
      name,
      role: role || 'SPV Operation',
      active: true,
    };
    setPics((prev) => [...prev, newPic]);
  };

  const handleUpdatePic = (id: string, name: string, role?: string) => {
    setPics((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              name,
              role: role !== undefined ? role : (p.role || 'SPV Operation'),
            }
          : p
      )
    );
  };

  const handleDeletePic = (id: string) => {
    setPics((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReorderPics = (newPics: PicMember[]) => {
    setPics(newPics);
  };

  // Google Sheets Action Handlers
  const handleGoogleSignIn = async () => {
    setIsSheetsLoading(true);
    try {
      const authResult = await googleSignIn();
      if (authResult?.user) {
        setUser(authResult.user);
        showToast('success', `Berhasil login sebagai ${authResult.user.displayName || authResult.user.email}`);

        // Try finding or creating sheet
        let activeSheet = await restoreSpreadsheetConnection();
        if (!activeSheet) {
          showToast('info', 'Menyiapkan spreadsheet database di Google Drive...');
          activeSheet = await createDatabaseSpreadsheet();
          setSpreadsheet(activeSheet);
          await saveAllToGoogleSheets(activeSheet.id, year, month, monthName, pics, data);
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          setLastSyncedTime(nowStr);
          localStorage.setItem('spv_last_sheets_sync_time', nowStr);
          showToast('success', 'Spreadsheet database berhasil dibuat & data tersimpan!');
        } else {
          showToast('success', `Terhubung ke Google Spreadsheet: ${activeSheet.name}`);
        }
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      showToast('error', err.message || 'Gagal masuk dengan akun Google');
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      showToast('info', 'Berhasil logout dari akun Google');
    } catch (err: any) {
      showToast('error', 'Gagal logout');
    }
  };

  const handleSaveToSheets = async () => {
    if (!spreadsheet) {
      showToast('error', 'Belum ada spreadsheet terhubung');
      return;
    }
    setIsSheetsLoading(true);
    try {
      await saveAllToGoogleSheets(spreadsheet.id, year, month, monthName, pics, data);
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(nowStr);
      localStorage.setItem('spv_last_sheets_sync_time', nowStr);
      showToast('success', 'Data checklist berhasil disimpan ke Google Sheets!');
    } catch (err: any) {
      console.error('Save to sheets error:', err);
      showToast('error', err.message || 'Gagal menyimpan ke Google Sheets');
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleLoadFromSheets = async () => {
    if (!spreadsheet) {
      showToast('error', 'Belum ada spreadsheet terhubung');
      return;
    }
    setIsSheetsLoading(true);
    try {
      const result = await loadFromGoogleSheets(spreadsheet.id, pics);
      if (result.pics.length > 0) {
        setPics(result.pics);
      }
      if (result.foundData) {
        setData(result.data);
      }
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(nowStr);
      localStorage.setItem('spv_last_sheets_sync_time', nowStr);
      showToast('success', 'Data checklist berhasil dimuat dari Google Sheets!');
    } catch (err: any) {
      console.error('Load from sheets error:', err);
      showToast('error', err.message || 'Gagal memuat data dari Google Sheets');
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    setIsSheetsLoading(true);
    try {
      const newSheet = await createDatabaseSpreadsheet();
      setSpreadsheet(newSheet);
      await saveAllToGoogleSheets(newSheet.id, year, month, monthName, pics, data);
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(nowStr);
      localStorage.setItem('spv_last_sheets_sync_time', nowStr);
      showToast('success', 'Spreadsheet baru berhasil dibuat dan disinkronkan!');
    } catch (err: any) {
      console.error('Create sheet error:', err);
      showToast('error', err.message || 'Gagal membuat spreadsheet baru');
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleConnectCustomSheet = async (idOrUrl: string) => {
    setIsSheetsLoading(true);
    try {
      const targetId = extractSpreadsheetId(idOrUrl);
      const details = await getSpreadsheetDetails(targetId);
      setSpreadsheet(details);
      localStorage.setItem(STORAGE_SHEET_ID_KEY, details.id);
      localStorage.setItem(STORAGE_SHEET_URL_KEY, details.url);
      showToast('success', `Berhasil terhubung ke spreadsheet: ${details.name}`);
    } catch (err: any) {
      console.error('Connect custom sheet error:', err);
      showToast('error', err.message || 'Gagal menghubungkan spreadsheet');
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleAppsScriptSync = async (scriptUrl: string) => {
    setIsAppsScriptSyncing(true);
    try {
      const result = await saveToAppsScript(scriptUrl, year, month, monthName, pics, data);
      const nowStr =
        result.timestamp ||
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setAppsScriptLastSyncTime(nowStr);
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, nowStr);
      showToast('success', result.message || 'Laporan berhasil disinkronkan ke Google Sheets!');
    } catch (err: any) {
      console.error('Apps script sync error:', err);
      showToast('error', err.message || 'Gagal menyinkronkan data ke Google Sheets');
    } finally {
      setIsAppsScriptSyncing(false);
    }
  };

  const handleAppsScriptPull = async (scriptUrl: string) => {
    setIsAppsScriptSyncing(true);
    try {
      const result = await loadFromAppsScript(scriptUrl);
      if (result.pics && result.pics.length > 0) {
        setPics(result.pics);
      }
      if (result.data) {
        setData(result.data);
      }
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setAppsScriptLastSyncTime(nowStr);
      localStorage.setItem(STORAGE_LAST_SYNC_KEY, nowStr);
      showToast('success', 'Data checklist berhasil dimuat dari Google Sheets!');
    } catch (err: any) {
      console.error('Apps script pull error:', err);
      showToast('error', err.message || 'Gagal memuat data dari Apps Script');
    } finally {
      setIsAppsScriptSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-800 text-white border-rose-700'
                : 'bg-teal-800 text-white border-teal-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-300 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-teal-300 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Banner & Control Toolbar */}
      <HeaderBanner
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickCheck={() => setIsQuickCheckOpen(true)}
        onOpenManageTeam={() => setIsManageTeamOpen(true)}
        onExportCSV={() => exportToCSV(pics, data, month, year, totalDays)}
        onPrint={() => window.print()}
        onResetData={handleResetData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSheetsSync={() => setIsSheetsModalOpen(true)}
        isSheetsConnected={!!user && !!spreadsheet}
        spreadsheetUrl={spreadsheet?.url}
        lastSyncedTime={lastSyncedTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5">
        {/* Google Apps Script Real-Time Synchronization Banner (Matching User's Request) */}
        <GoogleSheetsSyncBanner
          onSyncNow={handleAppsScriptSync}
          onPullFromSheet={handleAppsScriptPull}
          isSyncing={isAppsScriptSyncing}
          lastSyncedTime={appsScriptLastSyncTime}
          activeSpreadsheetUrl={spreadsheet?.url}
          onToast={showToast}
        />

        {/* KPI & Summary Cards */}
        <div className="no-print">
          <SummaryCards
            pics={pics}
            data={data}
            selectedDay={selectedDay}
            totalDays={totalDays}
            monthName={monthName}
            year={year}
          />
        </div>

        {/* Quick Notification & Action Strip */}
        <div className="no-print mb-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-800">
              Monitoring Aktif Tanggal {selectedDay} {monthName} {year}:
            </span>
            <span className="text-slate-500 hidden md:inline">
              Klik kotak pada baris SPV untuk langsung checklist laporan.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQuickCheckOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Checklist Cepat Hari Ini</span>
            </button>

            <button
              onClick={handleCopyPlanToActual}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title="Salin template checklist Plan ke Laporan"
            >
              <Copy className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Salin Plan ke Realisasi</span>
            </button>
          </div>
        </div>

        {/* PRINT HEADER ONLY VISIBLE WHEN PRINTING */}
        <div className="hidden print:block mb-4 text-center">
          <h1 className="text-xl font-bold uppercase">
            LAPORAN HARIAN TEAM SPV OPR PERIODE {monthName} {year}
          </h1>
          <p className="text-xs text-slate-600">
            Departemen Operation & Controlling — Dicetak pada {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* Table Views */}
        {activeTab === 'comparison' ? (
          <ComparisonView
            pics={filteredPics}
            planData={data.plan}
            actualData={data.actual}
            totalDays={totalDays}
            year={year}
            month={month}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onToggleActualCell={(picId, day) => handleToggleCell('actual', picId, day)}
          />
        ) : (
          <div className="space-y-6">
            {/* Section 1: Plan Harian */}
            {(activeTab === 'both' || activeTab === 'plan') && (
              <ChecklistTable
                title="Plan Harian"
                type="plan"
                pics={filteredPics}
                tableData={data.plan}
                totalDays={totalDays}
                year={year}
                month={month}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                onToggleCell={(picId, day) => handleToggleCell('plan', picId, day)}
                onOpenCellMenu={(picId, day, e) => handleOpenCellMenu('plan', picId, day, e)}
                onBatchCheckPic={(picId) => handleBatchCheckPic('plan', picId)}
              />
            )}

            {/* Section 2: Laporan Harian (Realisasi Aktual) */}
            {(activeTab === 'both' || activeTab === 'actual') && (
              <ChecklistTable
                title="Laporan Harian"
                type="actual"
                pics={filteredPics}
                tableData={data.actual}
                totalDays={totalDays}
                year={year}
                month={month}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                onToggleCell={(picId, day) => handleToggleCell('actual', picId, day)}
                onOpenCellMenu={(picId, day, e) => handleOpenCellMenu('actual', picId, day, e)}
                onBatchCheckPic={(picId) => handleBatchCheckPic('actual', picId)}
              />
            )}
          </div>
        )}

        {/* Bottom Legend and Info Guide */}
        <div className="no-print mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700">Keterangan Simbol:</span>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-xs border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center text-emerald-700">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-slate-600 font-medium">Sudah Lapor / Sesuai Plan</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-xs border-2 border-slate-400 bg-white" />
              <span className="text-slate-600">Belum Lapor / Off</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-xs border-2 border-rose-600 bg-rose-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-xs" />
              </div>
              <span className="text-slate-600">Kendala Operasional</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-xs border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-[9px] font-black text-amber-800">
                C
              </div>
              <span className="text-slate-600">Cuti / Izin</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-black">
                Tgl Merah
              </span>
              <span className="text-slate-600">Hari Minggu / Libur</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Klik kiri: Checklist instan | Klik kanan: Detail status & catatan</span>
          </div>
        </div>
      </main>

      {/* Quick Daily Checklist Modal */}
      <TodayChecklistModal
        isOpen={isQuickCheckOpen}
        onClose={() => setIsQuickCheckOpen(false)}
        pics={pics}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        month={month}
        year={year}
        totalDays={totalDays}
        planData={data.plan}
        actualData={data.actual}
        onUpdateActualCell={handleUpdateActualCell}
        onBatchSetActualDay={handleBatchSetActualDay}
      />

      {/* Manage Team Members Modal */}
      <ManageTeamModal
        isOpen={isManageTeamOpen}
        onClose={() => setIsManageTeamOpen(false)}
        pics={pics}
        onAddPic={handleAddPic}
        onUpdatePic={handleUpdatePic}
        onDeletePic={handleDeletePic}
        onReorderPics={handleReorderPics}
      />

      {/* Cell Status & Notes Editor Popover */}
      <CellStatusPopover
        isOpen={popoverState.isOpen}
        onClose={() => setPopoverState((prev) => ({ ...prev, isOpen: false }))}
        picName={popoverState.picName}
        day={popoverState.day}
        monthName={monthName}
        year={year}
        tableType={popoverState.tableType}
        currentCell={popoverState.currentCell}
        onSave={handleSaveCellStatus}
      />

      {/* Google Sheets Sync & Management Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        spreadsheet={spreadsheet}
        isLoading={isSheetsLoading}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        onSaveToSheets={handleSaveToSheets}
        onLoadFromSheets={handleLoadFromSheets}
        onCreateNewSpreadsheet={handleCreateNewSpreadsheet}
        onConnectCustomSheet={handleConnectCustomSheet}
        lastSyncedTime={lastSyncedTime}
        monthName={monthName}
        year={year}
      />
    </div>
  );
}
