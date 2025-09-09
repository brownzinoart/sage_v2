// Minimal static server + CORS proxy for Ollama
// Usage: npm install && npm start

const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 3000;
const TARGET = process.env.OLLAMA_TARGET || 'http://localhost:11434';

const app = express();

// Enhanced health check that tests Ollama connectivity
app.get('/healthz', async (_req, res) => {
  const http = require('http');
  const url = require('url');
  
  try {
    const targetUrl = new url.URL(`${TARGET}/api/tags`);
    
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || 80,
      path: targetUrl.pathname,
      method: 'GET',
      timeout: 5000
    };

    let responseHandled = false;

    const testRequest = http.request(options, (response) => {
      if (responseHandled) return;
      responseHandled = true;
      
      const ollamaStatus = response.statusCode === 200 ? 'connected' : 'error';
      const ollamaError = response.statusCode === 200 ? null : `HTTP ${response.statusCode}`;
      
      res.json({ 
        ok: true, 
        target: TARGET, 
        ollama: { 
          status: ollamaStatus, 
          error: ollamaError 
        },
        timestamp: new Date().toISOString()
      });
    });

    testRequest.on('error', (error) => {
      if (responseHandled) return;
      responseHandled = true;
      
      res.json({ 
        ok: false, 
        target: TARGET, 
        ollama: { 
          status: 'unreachable', 
          error: error.message 
        },
        timestamp: new Date().toISOString()
      });
    });

    testRequest.on('timeout', () => {
      if (responseHandled) return;
      responseHandled = true;
      
      testRequest.destroy();
      res.json({ 
        ok: false, 
        target: TARGET, 
        ollama: { 
          status: 'timeout', 
          error: 'Connection timeout' 
        },
        timestamp: new Date().toISOString()
      });
    });

    testRequest.end();
  } catch (error) {
    res.json({ 
      ok: false, 
      target: TARGET, 
      ollama: { 
        status: 'error', 
        error: error.message 
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Static site
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Enhanced CORS proxy to Ollama with better error handling
app.use(
  '/ollama',
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    pathRewrite: { '^/ollama': '' },
    timeout: 120000, // 2 minutes timeout
    onProxyReq(proxyReq, req, res) {
      console.log(`Proxying ${req.method} ${req.originalUrl} → ${TARGET}${req.url}`);
      // Add timeout headers
      proxyReq.setTimeout(120000);
    },
    onProxyRes(proxyRes, req, res) {
      // Enhanced CORS headers
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization, X-Requested-With';
      proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-credentials'] = 'false';
      proxyRes.headers['access-control-max-age'] = '86400';
      
      console.log(`Proxy response: ${proxyRes.statusCode} from ${TARGET}`);
      
      // Handle different response types
      if (proxyRes.statusCode >= 400) {
        console.warn(`Ollama returned error status: ${proxyRes.statusCode}`);
      }
    },
    onError(err, req, res) {
      console.error('=== PROXY ERROR ===');
      console.error('Error:', err.message);
      console.error('Request URL:', req.originalUrl);
      console.error('Target:', TARGET);
      
      // Provide helpful error response
      const errorResponse = {
        error: 'Proxy error',
        detail: err.message,
        target: TARGET,
        suggestion: err.code === 'ECONNREFUSED' 
          ? 'Make sure Ollama is running on the target port'
          : 'Check network connectivity and target configuration'
      };
      
      res.status(502).json(errorResponse);
    }
  })
);

// The proxy middleware handles OPTIONS requests automatically

app.listen(PORT, () => {
  console.log(`Sage dev server running at http://localhost:${PORT}`);
  console.log(`Proxying /ollama → ${TARGET}`);
});

