import { CellRecord, CellStatusType, MonthTableData, PicMember } from '../types';

export const STORAGE_APPS_SCRIPT_URL_KEY = 'spv_apps_script_url';
export const STORAGE_SHEET_WEB_URL_KEY = 'spv_apps_script_sheet_url';
export const STORAGE_IS_LOCKED_KEY = 'spv_apps_script_is_locked';
export const STORAGE_LAST_SYNC_KEY = 'spv_apps_script_last_sync';

// Default Apps Script Web App URL from user screenshot
export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx07SSqMaf41yU6jrsmfH2jnN_example/exec';

export interface AppsScriptSyncResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    pics?: PicMember[];
    monthData?: MonthTableData;
    year?: number;
    month?: number;
    monthName?: string;
  };
  sheetUrl?: string;
  sheetName?: string;
  timestamp?: string;
}

/**
 * Clean and format Google Apps Script Web App URL
 */
export function formatAppsScriptUrl(url: string): string {
  let cleaned = url.trim();
  if (cleaned && !cleaned.endsWith('/exec') && cleaned.includes('/macros/s/')) {
    if (cleaned.endsWith('/')) {
      cleaned = cleaned + 'exec';
    } else {
      cleaned = cleaned + '/exec';
    }
  }
  return cleaned;
}

/**
 * Test connectivity to Google Apps Script Web App
 */
export async function pingAppsScript(scriptUrl: string): Promise<{
  success: boolean;
  message: string;
  sheetUrl?: string;
  sheetName?: string;
}> {
  const url = formatAppsScriptUrl(scriptUrl);
  if (!url) throw new Error('URL Google Apps Script belum diisi');

  try {
    const res = await fetch(`${url}?action=ping&t=${Date.now()}`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) {
      throw new Error(`Server merespon dengan status ${res.status}`);
    }

    const json = (await res.json()) as AppsScriptSyncResponse;
    if (json.status === 'success') {
      return {
        success: true,
        message: json.message || 'Terhubung ke Google Apps Script',
        sheetUrl: json.sheetUrl,
        sheetName: json.sheetName,
      };
    } else {
      throw new Error(json.message || 'Gagal tersambung ke Google Apps Script');
    }
  } catch (err: any) {
    console.error('Ping Apps Script error:', err);
    throw new Error(
      err.message ||
        'Gagal menghubungi Apps Script. Pastikan Web App disetel ke "Siapa saja (Anyone)"'
    );
  }
}

/**
 * Save checklist data to Google Sheets via Apps Script Web App
 */
export async function saveToAppsScript(
  scriptUrl: string,
  year: number,
  month: number,
  monthName: string,
  pics: PicMember[],
  data: MonthTableData
): Promise<{ success: boolean; message: string; sheetUrl?: string; timestamp?: string }> {
  const url = formatAppsScriptUrl(scriptUrl);
  if (!url) throw new Error('URL Google Apps Script belum diatur');

  const payload = {
    action: 'save',
    year,
    month,
    monthName,
    pics,
    data,
    savedAt: new Date().toISOString(),
  };

  try {
    // Note: We use Content-Type text/plain so browser skips CORS preflight on redirects,
    // Apps Script e.postData.contents parses it as plain text JSON correctly!
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Gagal menyimpan: HTTP ${res.status}`);
    }

    const text = await res.text();
    let json: AppsScriptSyncResponse;
    try {
      json = JSON.parse(text);
    } catch {
      // If response is not direct JSON (e.g. HTML redirect), consider it processed if 200
      return {
        success: true,
        message: 'Laporan berhasil disinkronkan ke Google Sheets',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
    }

    if (json.status === 'success') {
      return {
        success: true,
        message: json.message || 'Laporan berhasil disimpan ke Google Sheets',
        sheetUrl: json.sheetUrl,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
    } else {
      throw new Error(json.message || 'Gagal menyimpan data');
    }
  } catch (err: any) {
    console.error('Save to Apps Script error:', err);
    throw new Error(
      err.message || 'Terjadi kendala saat menyinkronkan data ke Apps Script'
    );
  }
}

/**
 * Load checklist data from Google Sheets via Apps Script Web App
 */
export async function loadFromAppsScript(
  scriptUrl: string
): Promise<{
  pics?: PicMember[];
  data?: MonthTableData;
  sheetUrl?: string;
  sheetName?: string;
}> {
  const url = formatAppsScriptUrl(scriptUrl);
  if (!url) throw new Error('URL Google Apps Script belum diatur');

  try {
    const res = await fetch(`${url}?action=read&t=${Date.now()}`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) {
      throw new Error(`Gagal membaca data: HTTP ${res.status}`);
    }

    const json = (await res.json()) as AppsScriptSyncResponse;
    if (json.status === 'success' && json.data) {
      return {
        pics: json.data.pics,
        data: json.data.monthData,
        sheetUrl: json.sheetUrl,
        sheetName: json.sheetName,
      };
    } else {
      throw new Error(json.message || 'Format data dari Google Sheets tidak valid');
    }
  } catch (err: any) {
    console.error('Load from Apps Script error:', err);
    throw new Error(
      err.message || 'Gagal memuat data dari Apps Script. Pastikan akses Web App publik.'
    );
  }
}

/**
 * Standard complete Google Apps Script code to provide to the user
 */
export const APPS_SCRIPT_CODE = `/**
 * =======================================================
 * BSS PARKING SYSTEM - GOOGLE APPS SCRIPT DATABASE CONNECTOR (v3.0 - PERMANENT)
 * Sinkronisasi Real-Time Dua Arah & Penyimpanan Permanen Anti-Hilang
 * =======================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) || 'read';

    if (action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        sheetName: ss.getName(),
        sheetUrl: ss.getUrl(),
        message: 'Google Apps Script Database siap digunakan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Read full database data
    var data = readFullDatabase(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: data,
      sheetName: ss.getName(),
      sheetUrl: ss.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    }

    var result = saveFullDatabase(ss, postData);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data berhasil disinkronkan ke Google Sheets',
      sheetUrl: ss.getUrl(),
      result: result,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function cellToSheetString(cell) {
  if (!cell) return '-';
  if (cell.status === 'checked') return 'V';
  if (cell.status === 'problem') return cell.note ? 'KENDALA: ' + cell.note : 'KENDALA';
  if (cell.status === 'disabled') return cell.note ? 'CUTI: ' + cell.note : 'CUTI/OFF';
  if (cell.status === 'leave') return cell.note ? 'IZIN: ' + cell.note : 'IZIN';
  return '-';
}

function sheetStringToCell(val) {
  if (val === null || val === undefined) return { status: 'unchecked' };
  var str = String(val).trim();
  if (!str || str === '-') return { status: 'unchecked' };
  var upper = str.toUpperCase();
  if (upper === 'V' || upper === 'CHECKED' || upper === '1' || upper === 'HADIR') {
    return { status: 'checked' };
  }
  if (upper.indexOf('KENDALA') === 0 || upper === 'X') {
    var note = str.indexOf(':') !== -1 ? str.substring(str.indexOf(':') + 1).trim() : 'Kendala operasional';
    return { status: 'problem', note: note };
  }
  if (upper.indexOf('CUTI') === 0 || upper.indexOf('OFF') === 0 || upper.indexOf('LIBUR') === 0) {
    var note = str.indexOf(':') !== -1 ? str.substring(str.indexOf(':') + 1).trim() : 'Cuti / Libur';
    return { status: 'disabled', note: note };
  }
  if (upper.indexOf('IZIN') === 0 || upper.indexOf('SAKIT') === 0) {
    var note = str.indexOf(':') !== -1 ? str.substring(str.indexOf(':') + 1).trim() : 'Izin / Sakit';
    return { status: 'leave', note: note };
  }
  return { status: 'unchecked' };
}

function saveFullDatabase(ss, payload) {
  var pics = payload.pics || [];
  var data = payload.data || {};
  var year = payload.year || new Date().getFullYear();
  var monthName = payload.monthName || 'Bulan';

  // 1. Tim_SPV
  var sTim = ensureSheet(ss, 'Tim_SPV');
  sTim.clear();
  var timRows = [['ID SPV', 'Nama Personil', 'Jabatan / Posisi', 'Status']];
  pics.forEach(function(p) {
    timRows.push([p.id, p.name, p.role || 'SPV Operation', p.active ? 'Aktif' : 'Non-Aktif']);
  });
  sTim.getRange(1, 1, timRows.length, timRows[0].length).setValues(timRows);
  sTim.getRange('A1:D1').setFontWeight('bold').setBackground('#E2E8F0');

  // Headers for Plan & Actual
  var daysHeader = [];
  for (var i = 1; i <= 31; i++) daysHeader.push(String(i));
  var matrixHeader = ['Tahun', 'Bulan', 'ID SPV', 'Nama Personil', 'Jabatan'].concat(daysHeader);

  // 2. Plan_Harian
  var sPlan = ensureSheet(ss, 'Plan_Harian');
  sPlan.clear();
  var planRows = [matrixHeader];
  pics.forEach(function(p) {
    var row = [String(year), monthName, p.id, p.name, p.role || 'SPV Operation'];
    for (var d = 1; d <= 31; d++) {
      var cell = (data.plan && data.plan[p.id]) ? data.plan[p.id][d] : null;
      row.push(cellToSheetString(cell));
    }
    planRows.push(row);
  });
  sPlan.getRange(1, 1, planRows.length, planRows[0].length).setValues(planRows);
  sPlan.getRange(1, 1, 1, planRows[0].length).setFontWeight('bold').setBackground('#E2E8F0');

  // 3. Actual_Harian
  var sActual = ensureSheet(ss, 'Actual_Harian');
  sActual.clear();
  var actualRows = [matrixHeader];
  pics.forEach(function(p) {
    var row = [String(year), monthName, p.id, p.name, p.role || 'SPV Operation'];
    for (var d = 1; d <= 31; d++) {
      var cell = (data.actual && data.actual[p.id]) ? data.actual[p.id][d] : null;
      row.push(cellToSheetString(cell));
    }
    actualRows.push(row);
  });
  sActual.getRange(1, 1, actualRows.length, actualRows[0].length).setValues(actualRows);
  sActual.getRange(1, 1, 1, actualRows[0].length).setFontWeight('bold').setBackground('#E2E8F0');

  // 4. Catatan_Kendala
  var sNotes = ensureSheet(ss, 'Catatan_Kendala');
  sNotes.clear();
  var notesRows = [['Waktu Simpan', 'Kategori', 'Tahun', 'Bulan', 'Hari', 'ID SPV', 'Nama Personil', 'Status', 'Catatan Kendala']];
  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');

  ['plan', 'actual'].forEach(function(type) {
    pics.forEach(function(p) {
      for (var d = 1; d <= 31; d++) {
        var cell = (data[type] && data[type][p.id]) ? data[type][p.id][d] : null;
        if (cell && cell.note) {
          notesRows.push([
            nowStr,
            type.toUpperCase(),
            String(year),
            monthName,
            String(d),
            p.id,
            p.name,
            cell.status,
            cell.note
          ]);
        }
      }
    });
  });

  if (notesRows.length > 0) {
    sNotes.getRange(1, 1, notesRows.length, notesRows[0].length).setValues(notesRows);
    sNotes.getRange('A1:I1').setFontWeight('bold').setBackground('#E2E8F0');
  }

  return { status: 'ok', updatedRows: planRows.length + actualRows.length };
}

function readFullDatabase(ss) {
  var sTim = ss.getSheetByName('Tim_SPV');
  var sPlan = ss.getSheetByName('Plan_Harian');
  var sActual = ss.getSheetByName('Actual_Harian');

  var pics = [];
  if (sTim && sTim.getLastRow() > 1) {
    var timValues = sTim.getRange(2, 1, sTim.getLastRow() - 1, 4).getValues();
    pics = timValues.map(function(r, idx) {
      return {
        id: String(r[0] || 'pic-' + (idx + 1)),
        name: String(r[1] || ''),
        role: String(r[2] || 'SPV Operation'),
        active: String(r[3] || '').toLowerCase() !== 'non-aktif'
      };
    }).filter(function(p) { return p.name.trim() !== ''; });
  }

  var plan = {};
  var actual = {};
  pics.forEach(function(p) {
    plan[p.id] = {};
    actual[p.id] = {};
    for (var d = 1; d <= 31; d++) {
      plan[p.id][d] = { status: 'unchecked' };
      actual[p.id][d] = { status: 'unchecked' };
    }
  });

  if (sPlan && sPlan.getLastRow() > 1) {
    var planValues = sPlan.getRange(2, 1, sPlan.getLastRow() - 1, 36).getValues();
    planValues.forEach(function(r) {
      var picId = String(r[2]);
      var p = pics.find(function(x) { return x.id === picId; });
      if (p) {
        for (var d = 1; d <= 31; d++) {
          plan[p.id][d] = sheetStringToCell(r[4 + d]);
        }
      }
    });
  }

  if (sActual && sActual.getLastRow() > 1) {
    var actValues = sActual.getRange(2, 1, sActual.getLastRow() - 1, 36).getValues();
    actValues.forEach(function(r) {
      var picId = String(r[2]);
      var p = pics.find(function(x) { return x.id === picId; });
      if (p) {
        for (var d = 1; d <= 31; d++) {
          actual[p.id][d] = sheetStringToCell(r[4 + d]);
        }
      }
    });
  }

  return {
    pics: pics,
    monthData: { plan: plan, actual: actual }
  };
}`;
