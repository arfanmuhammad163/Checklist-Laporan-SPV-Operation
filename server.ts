import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PERMANENT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzoKEV-rJqCNAyKrLzVf-8Ifox4c_qj3hopVxUBUiPKfqR-MotSXE4cpWqakNQTm2a8/exec';

function normalizeMonthData(monthData: any) {
  if (!monthData || typeof monthData !== 'object') return monthData;
  const result: any = { plan: {}, actual: {} };
  ['plan', 'actual'].forEach((type) => {
    result[type] = {};
    const table = monthData[type] || {};
    Object.keys(table).forEach((picId) => {
      result[type][picId] = {};
      const days = table[picId] || {};
      Object.keys(days).forEach((d) => {
        const cell = days[d];
        if (!cell) {
          result[type][picId][d] = { status: 'unchecked' };
          return;
        }
        if (cell.status === 'sick') {
          result[type][picId][d] = { ...cell, note: cell.note || 'Sakit' };
          return;
        }
        if (cell.status === 'leave' && cell.note && typeof cell.note === 'string') {
          if (cell.note.toUpperCase().includes('SAKIT')) {
            const clean = cell.note.replace(/^IZIN:\s*/i, '').replace(/^SAKIT:\s*/i, '').trim();
            result[type][picId][d] = { ...cell, status: 'sick', note: clean || 'Sakit' };
            return;
          }
        }
        result[type][picId][d] = { ...cell };
      });
    });
  });
  return result;
}

function prepareMonthData(monthData: any) {
  if (!monthData || typeof monthData !== 'object') return monthData;
  const result: any = { plan: {}, actual: {} };
  ['plan', 'actual'].forEach((type) => {
    result[type] = {};
    const table = monthData[type] || {};
    Object.keys(table).forEach((picId) => {
      result[type][picId] = {};
      const days = table[picId] || {};
      Object.keys(days).forEach((d) => {
        const cell = days[d];
        if (!cell) {
          result[type][picId][d] = { status: 'unchecked' };
          return;
        }
        if (cell.status === 'sick') {
          const noteText = cell.note?.trim();
          const encoded = noteText && !noteText.toUpperCase().startsWith('SAKIT')
            ? `SAKIT: ${noteText}`
            : (noteText || 'SAKIT');
          result[type][picId][d] = { ...cell, status: 'leave', note: encoded };
        } else {
          result[type][picId][d] = { ...cell };
        }
      });
    });
  });
  return result;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy GET to Google Apps Script (bypasses browser CORS & redirects)
app.get('/api/apps-script/load', async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || PERMANENT_APPS_SCRIPT_URL;
    const action = (req.query.action as string) || 'read';
    const separator = rawUrl.includes('?') ? '&' : '?';
    const targetUrl = `${rawUrl}${separator}action=${encodeURIComponent(action)}&t=${Date.now()}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'error',
        message: `Google Apps Script returned status ${response.status}`,
      });
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (data && data.status === 'success' && data.data && data.data.monthData) {
        data.data.monthData = normalizeMonthData(data.data.monthData);
      }
      res.json(data);
    } catch {
      res.send(text);
    }
  } catch (error: any) {
    console.error('Server proxy load error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to proxy request to Google Apps Script',
    });
  }
});

// Proxy POST to Google Apps Script (bypasses browser CORS & redirects)
app.post('/api/apps-script/save', async (req, res) => {
  try {
    const rawUrl = req.body.url || PERMANENT_APPS_SCRIPT_URL;
    let payload = req.body.payload || req.body;

    if (typeof payload === 'object' && payload !== null) {
      if (payload.data) {
        payload = {
          ...payload,
          data: prepareMonthData(payload.data),
        };
      }
    }

    const response = await fetch(rawUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch {
      res.send(text);
    }
  } catch (error: any) {
    console.error('Server proxy save error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save data to Google Apps Script',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BSS Parking Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
