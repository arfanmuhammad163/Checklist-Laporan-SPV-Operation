import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PERMANENT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzoKEV-rJqCNAyKrLzVf-8Ifox4c_qj3hopVxUBUiPKfqR-MotSXE4cpWqakNQTm2a8/exec';

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
    const payload = req.body.payload || req.body;

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
