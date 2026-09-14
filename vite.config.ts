import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const PERMANENT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzoKEV-rJqCNAyKrLzVf-8Ifox4c_qj3hopVxUBUiPKfqR-MotSXE4cpWqakNQTm2a8/exec';

function appsScriptProxyPlugin(): Plugin {
  return {
    name: 'apps-script-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        // 1. GET /api/apps-script/load
        if (req.url.startsWith('/api/apps-script/load')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const targetUrl = urlObj.searchParams.get('url') || PERMANENT_APPS_SCRIPT_URL;
            const action = urlObj.searchParams.get('action') || 'read';
            const separator = targetUrl.includes('?') ? '&' : '?';
            const fullUrl = `${targetUrl}${separator}action=${encodeURIComponent(action)}&t=${Date.now()}`;

            const response = await fetch(fullUrl, {
              method: 'GET',
              redirect: 'follow',
            });

            const text = await response.text();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = response.ok ? 200 : response.status;
            res.end(text);
            return;
          } catch (err: any) {
            console.error('Vite proxy load error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ status: 'error', message: err.message }));
            return;
          }
        }

        // 2. POST /api/apps-script/save
        if (req.url.startsWith('/api/apps-script/save')) {
          try {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                let parsed: any = {};
                try {
                  parsed = JSON.parse(body);
                } catch {
                  parsed = { payload: body };
                }
                const targetUrl = parsed.url || PERMANENT_APPS_SCRIPT_URL;
                const payload = parsed.payload || parsed;

                const response = await fetch(targetUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                  },
                  body: typeof payload === 'string' ? payload : JSON.stringify(payload),
                  redirect: 'follow',
                });

                const text = await response.text();
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = response.ok ? 200 : response.status;
                res.end(text);
              } catch (err: any) {
                console.error('Vite proxy save inner error:', err);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ status: 'error', message: err.message }));
              }
            });
            return;
          } catch (err: any) {
            console.error('Vite proxy save error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ status: 'error', message: err.message }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), appsScriptProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
