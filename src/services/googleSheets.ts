import { CellRecord, CellStatusType, MonthTableData, PicMember } from '../types';
import { getAccessToken } from './googleAuth';

export const SPREADSHEET_TITLE = 'Checklist Laporan SPV Operation - Database';
export const STORAGE_SHEET_ID_KEY = 'spv_google_spreadsheet_id';
export const STORAGE_SHEET_URL_KEY = 'spv_google_spreadsheet_url';

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

/**
 * Extract spreadsheet ID from either a raw ID or full Google Sheet URL
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Search Drive for an existing database spreadsheet
 */
export async function findDatabaseSpreadsheet(): Promise<SpreadsheetInfo | null> {
  const token = await getAccessToken();
  if (!token) throw new Error('Anda belum login dengan akun Google');

  const q = encodeURIComponent(
    `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)&pageSize=5`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mencari spreadsheet di Google Drive');
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    const file = data.files[0];
    return {
      id: file.id,
      name: file.name,
      url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`,
    };
  }

  return null;
}

/**
 * Fetch spreadsheet metadata by ID
 */
export async function getSpreadsheetDetails(spreadsheetId: string): Promise<SpreadsheetInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('Anda belum login dengan akun Google');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Spreadsheet tidak ditemukan atau tidak memiliki akses');
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    name: data.properties?.title || 'Checklist Database',
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
  };
}

/**
 * Create a new Google Spreadsheet configured with initial sheets
 */
export async function createDatabaseSpreadsheet(customTitle?: string): Promise<SpreadsheetInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('Anda belum login dengan akun Google');

  const title = customTitle || SPREADSHEET_TITLE;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Tim_SPV', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'Plan_Harian', gridProperties: { frozenRowCount: 1, frozenColumnCount: 4 } } },
        { properties: { title: 'Actual_Harian', gridProperties: { frozenRowCount: 1, frozenColumnCount: 4 } } },
        { properties: { title: 'Catatan_Kendala', gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membuat Google Spreadsheet baru');
  }

  const data = await res.json();
  const info: SpreadsheetInfo = {
    id: data.spreadsheetId,
    name: data.properties?.title || title,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
  };

  // Cache in localStorage
  localStorage.setItem(STORAGE_SHEET_ID_KEY, info.id);
  localStorage.setItem(STORAGE_SHEET_URL_KEY, info.url);

  return info;
}

/**
 * Ensure required sheets exist in spreadsheet
 */
async function ensureSheetTabsExist(spreadsheetId: string, requiredTabs: string[]) {
  const token = await getAccessToken();
  if (!token) return;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return;
  const data = await res.json();
  const existingTabs: string[] = (data.sheets || []).map((s: any) => s.properties.title);

  const missingTabs = requiredTabs.filter((tab) => !existingTabs.includes(tab));
  if (missingTabs.length === 0) return;

  const requests = missingTabs.map((title) => ({
    addSheet: {
      properties: { title },
    },
  }));

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });
}

function cellToSheetString(cell?: CellRecord): string {
  if (!cell) return '-';
  switch (cell.status) {
    case 'checked':
      return 'V';
    case 'problem':
      return cell.note ? `KENDALA: ${cell.note}` : 'KENDALA';
    case 'disabled':
      return cell.note ? `CUTI: ${cell.note}` : 'CUTI/OFF';
    case 'leave':
      return cell.note ? `IZIN: ${cell.note}` : 'IZIN';
    case 'unchecked':
    default:
      return '-';
  }
}

function sheetStringToCell(val: any): CellRecord {
  if (val === null || val === undefined) return { status: 'unchecked' };
  const str = String(val).trim();
  if (!str || str === '-') return { status: 'unchecked' };

  const upper = str.toUpperCase();
  if (upper === 'V' || upper === 'CHECKED' || upper === '1' || upper === 'TRUE' || upper === 'HADIR') {
    return { status: 'checked' };
  }

  if (upper.startsWith('KENDALA') || upper.startsWith('PROBLEM') || upper === 'X') {
    const note = str.includes(':') ? str.split(':').slice(1).join(':').trim() : 'Kendala operasional';
    return { status: 'problem', note };
  }

  if (upper.startsWith('CUTI') || upper.startsWith('OFF') || upper.startsWith('LIBUR') || upper.startsWith('DISABLED')) {
    const note = str.includes(':') ? str.split(':').slice(1).join(':').trim() : 'Cuti / Libur';
    return { status: 'disabled', note };
  }

  if (upper.startsWith('IZIN') || upper.startsWith('LEAVE') || upper.startsWith('SAKIT')) {
    const note = str.includes(':') ? str.split(':').slice(1).join(':').trim() : 'Izin / Sakit';
    return { status: 'leave', note };
  }

  return { status: 'unchecked' };
}

/**
 * Save entire month data & PICs to Google Sheets
 */
export async function saveAllToGoogleSheets(
  spreadsheetId: string,
  year: number,
  month: number, // 0-11
  monthName: string,
  pics: PicMember[],
  data: MonthTableData
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Anda belum login dengan akun Google');

  await ensureSheetTabsExist(spreadsheetId, ['Tim_SPV', 'Plan_Harian', 'Actual_Harian', 'Catatan_Kendala']);

  // 1. Prepare Tim_SPV rows
  const timHeader = ['ID SPV', 'Nama Personil', 'Jabatan / Posisi', 'Status'];
  const timRows = pics.map((p) => [p.id, p.name, p.role || 'SPV Operation', p.active ? 'Aktif' : 'Non-Aktif']);
  const timValues = [timHeader, ...timRows];

  // 2. Prepare Plan & Actual headers: [Tahun, Bulan, ID SPV, Nama, Jabatan, 1, 2, ..., 31]
  const daysHeader = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const matrixHeader = ['Tahun', 'Bulan', 'ID SPV', 'Nama Personil', 'Jabatan', ...daysHeader];

  // Plan rows
  const planRows = pics.map((p) => {
    const row = [String(year), monthName, p.id, p.name, p.role || 'SPV Operation'];
    for (let d = 1; d <= 31; d++) {
      row.push(cellToSheetString(data.plan[p.id]?.[d]));
    }
    return row;
  });

  // Actual rows
  const actualRows = pics.map((p) => {
    const row = [String(year), monthName, p.id, p.name, p.role || 'SPV Operation'];
    for (let d = 1; d <= 31; d++) {
      row.push(cellToSheetString(data.actual[p.id]?.[d]));
    }
    return row;
  });

  // Notes rows
  const notesHeader = ['Waktu Simpan', 'Kategori', 'Tahun', 'Bulan', 'Hari', 'ID SPV', 'Nama Personil', 'Status', 'Catatan Kendala'];
  const notesRows: string[][] = [];
  const nowStr = new Date().toLocaleString('id-ID');

  (['plan', 'actual'] as const).forEach((type) => {
    pics.forEach((p) => {
      for (let d = 1; d <= 31; d++) {
        const cell = data[type][p.id]?.[d];
        if (cell?.note) {
          notesRows.push([
            nowStr,
            type.toUpperCase(),
            String(year),
            monthName,
            String(d),
            p.id,
            p.name,
            cell.status,
            cell.note,
          ]);
        }
      }
    });
  });

  // Batch update sheets values
  const payload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Tim_SPV!A1:D50',
        values: timValues,
      },
      {
        range: 'Plan_Harian!A1:AJ50',
        values: [matrixHeader, ...planRows],
      },
      {
        range: 'Actual_Harian!A1:AJ50',
        values: [matrixHeader, ...actualRows],
      },
      {
        range: 'Catatan_Kendala!A1:I100',
        values: [notesHeader, ...notesRows],
      },
    ],
  };

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyimpan data ke Google Sheets');
  }
}

/**
 * Load month data & PICs from Google Sheets
 */
export async function loadFromGoogleSheets(
  spreadsheetId: string,
  picsCurrent: PicMember[]
): Promise<{
  pics: PicMember[];
  data: MonthTableData;
  foundData: boolean;
}> {
  const token = await getAccessToken();
  if (!token) throw new Error('Anda belum login dengan akun Google');

  const ranges = [
    'Tim_SPV!A2:D50',
    'Plan_Harian!A2:AJ50',
    'Actual_Harian!A2:AJ50',
    'Catatan_Kendala!A2:I150',
  ];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges
    .map((r) => `ranges=${encodeURIComponent(r)}`)
    .join('&')}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membaca data dari Google Sheets');
  }

  const resData = await res.json();
  const valueRanges = resData.valueRanges || [];

  const timRows: any[][] = valueRanges[0]?.values || [];
  const planRows: any[][] = valueRanges[1]?.values || [];
  const actualRows: any[][] = valueRanges[2]?.values || [];
  const notesRows: any[][] = valueRanges[3]?.values || [];

  // Parse PICs if exists
  let loadedPics = [...picsCurrent];
  if (timRows.length > 0) {
    loadedPics = timRows
      .filter((r) => r[1] && String(r[1]).trim())
      .map((r, idx) => ({
        id: r[0] ? String(r[0]).trim() : `pic-${idx + 1}`,
        name: String(r[1]).trim(),
        role: r[2] ? String(r[2]).trim() : 'SPV Operation',
        active: r[3] ? String(r[3]).toLowerCase() !== 'non-aktif' : true,
      }));
  }

  // Parse Plan and Actual
  const plan: Record<string, Record<number, CellRecord>> = {};
  const actual: Record<string, Record<number, CellRecord>> = {};

  loadedPics.forEach((p) => {
    plan[p.id] = {};
    actual[p.id] = {};
    for (let d = 1; d <= 31; d++) {
      plan[p.id][d] = { status: 'unchecked' };
      actual[p.id][d] = { status: 'unchecked' };
    }
  });

  let foundData = false;

  // Populate plan
  planRows.forEach((row) => {
    const picId = row[2];
    const picName = row[3];
    // Find matching pic
    const target = loadedPics.find((p) => p.id === picId || p.name === picName);
    if (target) {
      for (let d = 1; d <= 31; d++) {
        const val = row[4 + d]; // index 0:Tahun, 1:Bulan, 2:ID, 3:Nama, 4:Jabatan, 5:D1 ...
        if (val !== undefined) {
          plan[target.id][d] = sheetStringToCell(val);
          foundData = true;
        }
      }
    }
  });

  // Populate actual
  actualRows.forEach((row) => {
    const picId = row[2];
    const picName = row[3];
    const target = loadedPics.find((p) => p.id === picId || p.name === picName);
    if (target) {
      for (let d = 1; d <= 31; d++) {
        const val = row[4 + d];
        if (val !== undefined) {
          actual[target.id][d] = sheetStringToCell(val);
          foundData = true;
        }
      }
    }
  });

  // Attach notes from Catatan_Kendala if available
  notesRows.forEach((row) => {
    const type = String(row[1] || '').toLowerCase() === 'plan' ? 'plan' : 'actual';
    const day = Number(row[4]);
    const picId = row[5];
    const picName = row[6];
    const status = (row[7] as CellStatusType) || 'problem';
    const note = row[8];

    const target = loadedPics.find((p) => p.id === picId || p.name === picName);
    if (target && day >= 1 && day <= 31 && note) {
      const existing = (type === 'plan' ? plan : actual)[target.id]?.[day];
      if (existing) {
        existing.note = String(note);
        if (status) existing.status = status;
      }
    }
  });

  return {
    pics: loadedPics,
    data: { plan, actual },
    foundData,
  };
}
