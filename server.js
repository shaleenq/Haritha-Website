/**
 * SOLID CEYLON GLOBAL LINK (PVT) LTD
 * High-Performance HTTP Application Server with Structured JSON Logging
 * Local Log Destination: ./logs/dev.log
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const DEV_LOG_FILE = path.join(LOGS_DIR, 'dev.log');

// Ensure required directories exist
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}
if (!fs.existsSync(DEV_LOG_FILE)) {
  fs.writeFileSync(DEV_LOG_FILE, '', 'utf8');
}

/**
 * Generate unique transaction ID
 * @param {string} prefix 
 * @returns {string}
 */
function generateTxId(prefix = 'tx') {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Append structured JSON log entry to ./logs/dev.log
 * @param {string} level - 'INFO' | 'WARN' | 'ERROR'
 * @param {string} transactionId - Unique event identifier
 * @param {string} category - Category of event (e.g. navigation, media, logic, api)
 * @param {string} message - Descriptive log message
 * @param {object} details - Arbitrary structured metadata
 * @param {string} source - 'backend' | 'frontend'
 */
function logStructured(level, transactionId, category, message, details = {}, source = 'backend') {
  const validLevels = ['INFO', 'WARN', 'ERROR'];
  const normalizedLevel = validLevels.includes(level?.toUpperCase()) ? level.toUpperCase() : 'INFO';
  const txId = transactionId || generateTxId('tx_srv');

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: normalizedLevel,
    transactionId: txId,
    category: category || 'general',
    source: source,
    message: message || '',
    details: details || {}
  };

  const jsonLine = JSON.stringify(logEntry) + '\n';

  try {
    fs.appendFileSync(DEV_LOG_FILE, jsonLine, 'utf8');
  } catch (err) {
    console.error('[LOGGER_FAILURE] Could not write to dev.log:', err);
  }

  // Console output for developer visibility
  const color = normalizedLevel === 'ERROR' ? '\x1b[31m' : normalizedLevel === 'WARN' ? '\x1b[33m' : '\x1b[36m';
  const reset = '\x1b[0m';
  console.log(`${color}[${normalizedLevel}]${reset} [${logEntry.timestamp}] [${txId}] [${category}]: ${message}`);

  return logEntry;
}

/**
 * Core Media Assets Catalog
 */
const REQUIRED_MEDIA_ASSETS = [
  'solid-ceylon-global-link-emblem.jpeg',
  'haritha-jayaweera-chairman.jpeg',
  'pubudu-gayashan-group-ceo.jpeg',
  'shantha-madushanka-astral-ceo.jpeg',
  'astral-institute-subsidiary.jpeg',
  'verdant-ceylon-cultivators.jpeg',
  'verdant-ceylon-collection-point.jpeg',
  'investment-plans-matrix.jpeg',
  'company-incorporation-certificate.pdf',
  'company-promotional-video.mp4',
  'ceylon-spices-export.jpeg',
  'global-maritime-logistics.jpeg'
];

/**
 * Verify Integrity of all registered media assets
 */
function verifyMediaAssets() {
  const startupTx = generateTxId('tx_startup_audit');
  logStructured('INFO', startupTx, 'system', 'Initiating asset catalog integrity audit', {
    catalogSize: REQUIRED_MEDIA_ASSETS.length
  });

  const missing = [];
  const verified = [];

  for (const assetName of REQUIRED_MEDIA_ASSETS) {
    const fullPath = path.join(ASSETS_DIR, assetName);
    if (!fs.existsSync(fullPath)) {
      missing.push(assetName);
      logStructured('WARN', startupTx, 'media_audit', `Missing registered media asset: ${assetName}`, {
        expectedPath: `/assets/${assetName}`
      });
    } else {
      const stats = fs.statSync(fullPath);
      verified.push({ name: assetName, size: stats.size });
    }
  }

  if (missing.length === 0) {
    logStructured('INFO', startupTx, 'media_audit', 'All media assets verified and present in ./assets/', {
      count: verified.length
    });
  } else {
    logStructured('WARN', startupTx, 'media_audit', `Detected ${missing.length} missing media asset(s)`, {
      missingList: missing
    });
  }

  return { missing, verified };
}

/**
 * MIME type dictionary
 */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

/**
 * In-memory inquiry store
 */
const INQUIRIES_DATABASE = [];

/**
 * Handle Range-enabled static file stream (crucial for video scrubbing & large PDFs)
 */
function serveStaticFile(req, res, filePath, contentType, transactionId) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      logStructured('WARN', transactionId, 'media_serving', `Static asset not found: ${filePath}`, {
        url: req.url
      });
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Asset not found', path: req.url }));
      return;
    }

    const range = req.headers.range;

    if (range && contentType.startsWith('video/')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;

      if (start >= stats.size) {
        res.writeHead(416, {
          'Content-Range': `bytes */${stats.size}`
        });
        return res.end();
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'X-Transaction-ID': transactionId
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'X-Transaction-ID': transactionId
      });

      fs.createReadStream(filePath).pipe(res);
    }
  });
}

/**
 * Parse incoming JSON body
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Main HTTP Request Listener
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const reqTxId = req.headers['x-transaction-id'] || generateTxId('tx_req');

  // CORS headers for modern flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Transaction-ID');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API: POST /api/logs (Frontend structured JSON logging receiver)
  if (pathname === '/api/logs' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const level = data.level || 'INFO';
      const txId = data.transactionId || reqTxId;
      const category = data.category || 'frontend_event';
      const message = data.message || 'Frontend event recorded';
      const details = data.details || {};

      const recorded = logStructured(level, txId, category, message, details, 'frontend');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', recorded }));
    } catch (err) {
      logStructured('ERROR', reqTxId, 'api_logs', 'Failed to process frontend log submission', {
        error: err.message
      });
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
    }
    return;
  }

  // 2. API: GET /api/logs (Tail recent logs for live inspection drawer)
  if (pathname === '/api/logs' && req.method === 'GET') {
    try {
      const limit = parseInt(parsedUrl.query.limit, 10) || 50;
      if (!fs.existsSync(DEV_LOG_FILE)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ logs: [] }));
      }

      const fileContent = fs.readFileSync(DEV_LOG_FILE, 'utf8');
      const lines = fileContent.trim().split('\n').filter(Boolean);
      const recentLines = lines.slice(-limit).map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ logs: recentLines, totalLines: lines.length }));
    } catch (err) {
      logStructured('ERROR', reqTxId, 'api_logs', 'Failed to read dev.log', { error: err.message });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Could not read log file' }));
    }
    return;
  }

  // 3. API: POST /api/inquiries (Handle investment & export consultations)
  if (pathname === '/api/inquiries' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      const txId = data.transactionId || generateTxId('tx_inq');

      // Functional logic validation
      const errors = [];
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters');
      }
      if (!data.phone || data.phone.trim().length < 9) {
        errors.push('A valid telephone or WhatsApp contact number is required');
      }
      if (!data.inquiryType) {
        errors.push('Inquiry type category must be specified');
      }

      if (errors.length > 0) {
        // Log functional logic failure as ERROR
        logStructured('ERROR', txId, 'functional_logic', 'Inquiry submission failed validation', {
          errors,
          submittedData: {
            fullName: data.fullName,
            phone: data.phone,
            inquiryType: data.inquiryType
          }
        });

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          transactionId: txId,
          message: 'Functional validation failed',
          errors
        }));
        return;
      }

      // Valid inquiry
      const inquiryRecord = {
        id: `INQ-${Date.now().toString(36).toUpperCase()}`,
        transactionId: txId,
        submittedAt: new Date().toISOString(),
        fullName: data.fullName.trim(),
        email: data.email ? data.email.trim() : null,
        phone: data.phone.trim(),
        inquiryType: data.inquiryType,
        investmentTier: data.investmentTier || null,
        message: data.message || '',
        preferredContact: data.preferredContact || 'phone'
      };

      INQUIRIES_DATABASE.push(inquiryRecord);

      logStructured('INFO', txId, 'inquiry_submission', `New business inquiry registered: ${inquiryRecord.id}`, {
        inquiryType: inquiryRecord.inquiryType,
        investmentTier: inquiryRecord.investmentTier,
        fullName: inquiryRecord.fullName
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        transactionId: txId,
        inquiryId: inquiryRecord.id,
        message: 'Your inquiry has been successfully lodged with SOLID CEYLON GLOBAL LINK (PVT) LTD. Our executive leadership team will reach out promptly.'
      }));
    } catch (err) {
      logStructured('ERROR', reqTxId, 'functional_logic', 'Internal error processing inquiry payload', {
        error: err.message
      });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', error: 'Internal server error processing inquiry' }));
    }
    return;
  }

  // 4. API: GET /api/asset-check (Dynamic asset health verification)
  if (pathname === '/api/asset-check' && req.method === 'GET') {
    const auditResults = verifyMediaAssets();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: auditResults.missing.length === 0 ? 'healthy' : 'degraded',
      auditResults
    }));
    return;
  }

  // 5. API: GET /api/health (System status)
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      company: 'SOLID CEYLON GLOBAL LINK (PVT) LTD',
      companyNumber: 'PV 00364030',
      incorporationAct: 'Companies Act No. 7 of 2007',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 6. Static Asset Routing: /assets/*
  if (pathname.startsWith('/assets/')) {
    const assetFilename = path.basename(pathname);
    const assetFilePath = path.join(ASSETS_DIR, assetFilename);
    const ext = path.extname(assetFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (!fs.existsSync(assetFilePath)) {
      logStructured('WARN', reqTxId, 'media_request', `Requested asset not found in /assets: ${assetFilename}`, {
        pathname
      });
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Media asset not found', assetFilename }));
      return;
    }

    serveStaticFile(req, res, assetFilePath, contentType, reqTxId);
    return;
  }

  // 7. Public Web Files: /css/*, /js/*, /favicon.ico, /
  let relativeFilePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let targetFilePath = path.join(PUBLIC_DIR, relativeFilePath);

  // Security check: ensure within PUBLIC_DIR
  if (!targetFilePath.startsWith(PUBLIC_DIR)) {
    logStructured('WARN', reqTxId, 'security', `Attempted directory traversal: ${pathname}`);
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // If file doesn't exist, check fallback or 404
  if (!fs.existsSync(targetFilePath)) {
    // If requesting root or unknown route, serve index.html
    const fallback = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(fallback)) {
      targetFilePath = fallback;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(targetFilePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  serveStaticFile(req, res, targetFilePath, contentType, reqTxId);
});

// Start Server
server.listen(PORT, () => {
  const startupTx = generateTxId('tx_init');
  logStructured('INFO', startupTx, 'lifecycle', `SOLID CEYLON GLOBAL LINK server listening on http://localhost:${PORT}`, {
    port: PORT,
    environment: 'development',
    logFile: DEV_LOG_FILE
  });

  // Run initial media asset audit
  verifyMediaAssets();
});
