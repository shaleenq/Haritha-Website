/**
 * SOLID CEYLON GLOBAL LINK (PVT) LTD
 * Client-Side Structured JSON Logging System
 * 
 * Features:
 * - Generates unique Transaction IDs for every distinct user event
 * - Mandatory Log Levels:
 *   - INFO: Normal navigation, tab switches, modal toggles, user interactions
 *   - WARN: Missing media assets, broken image/video paths, network fallbacks
 *   - ERROR: Broken functional logic, validation faults, JS runtime exceptions
 * - Asynchronous beacon / fetch streaming to POST /api/logs -> written to ./logs/dev.log
 * - Live Event Bus for the interactive in-page Audit Console
 */

(function (window) {
  'use strict';

  // Transaction ID Generator
  function generateTxId(prefix = 'tx_fe') {
    const timestamp = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${rand}`;
  }

  // Session ID for correlation across events
  const SESSION_ID = 'ses_' + Math.random().toString(36).substring(2, 9);
  
  // Local in-memory log buffer for the Live Audit Console
  const localLogBuffer = [];
  const logListeners = [];

  const StructuredLogger = {
    sessionId: SESSION_ID,

    /**
     * Dispatch structured log
     * @param {'INFO'|'WARN'|'ERROR'} level 
     * @param {string} category 
     * @param {string} message 
     * @param {object} details 
     * @param {string|null} customTxId 
     * @returns {object}
     */
    log: function (level, category, message, details = {}, customTxId = null) {
      const txId = customTxId || generateTxId();
      const validLevels = ['INFO', 'WARN', 'ERROR'];
      const normalizedLevel = validLevels.includes(level?.toUpperCase()) ? level.toUpperCase() : 'INFO';

      const entry = {
        timestamp: new Date().toISOString(),
        level: normalizedLevel,
        transactionId: txId,
        sessionId: SESSION_ID,
        category: category || 'general',
        source: 'frontend',
        message: message || '',
        details: {
          url: window.location.href,
          pathname: window.location.pathname,
          hash: window.location.hash,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          ...details
        }
      };

      // Add to local memory buffer
      localLogBuffer.push(entry);
      if (localLogBuffer.length > 200) {
        localLogBuffer.shift();
      }

      // Notify in-page UI listeners
      logListeners.forEach(listener => {
        try {
          listener(entry);
        } catch (e) {
          console.error('Error in log listener:', e);
        }
      });

      // Mirror to browser console with styled badges
      const colors = {
        INFO: 'background: #0284c7; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
        WARN: 'background: #d97706; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
        ERROR: 'background: #dc2626; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
      };
      console.log(`%c${entry.level}%c [${entry.transactionId}] [${entry.category}] ${entry.message}`, colors[entry.level], 'color: inherit', entry.details);

      // Transmit to Backend for writing into ./logs/dev.log
      this._transmit(entry);

      return entry;
    },

    info: function (category, message, details = {}, txId = null) {
      return this.log('INFO', category, message, details, txId);
    },

    warn: function (category, message, details = {}, txId = null) {
      return this.log('WARN', category, message, details, txId);
    },

    error: function (category, message, details = {}, txId = null) {
      return this.log('ERROR', category, message, details, txId);
    },

    /**
     * Transmit payload to server via fetch
     */
    _transmit: function (entry) {
      try {
        const payload = JSON.stringify(entry);
        if (window.fetch) {
          fetch('/api/logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Transaction-ID': entry.transactionId
            },
            body: payload,
            keepalive: true
          }).catch(err => {
            console.warn('[Logger] Backend log dispatch failed:', err.message);
          });
        } else if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/logs', payload);
        }
      } catch (err) {
        console.warn('[Logger] Network log transmission failure:', err);
      }
    },

    getRecentLogs: function () {
      return [...localLogBuffer];
    },

    onLog: function (callback) {
      if (typeof callback === 'function') {
        logListeners.push(callback);
      }
    },

    /**
     * Test Helpers for verifying logging behaviors
     */
    simulateMissingMedia: function (brokenPath = '/assets/non-existent-sample.jpg') {
      const txId = generateTxId('tx_sim_media');
      const testImg = new Image();
      testImg.src = brokenPath;
      testImg.onerror = () => {
        StructuredLogger.warn(
          'missing_media_asset',
          `Simulated media asset failed to load: ${brokenPath}`,
          { attemptedUrl: brokenPath, simulated: true },
          txId
        );
      };
      return txId;
    },

    simulateLogicError: function (reason = 'Manual calculation division by zero test') {
      const txId = generateTxId('tx_sim_error');
      try {
        throw new Error(`Broken Functional Logic: ${reason}`);
      } catch (err) {
        StructuredLogger.error(
          'functional_logic',
          `Simulated logic exception: ${err.message}`,
          { stack: err.stack, simulated: true },
          txId
        );
      }
      return txId;
    },

    simulateNavigation: function (target = '#investments') {
      const txId = generateTxId('tx_sim_nav');
      StructuredLogger.info(
        'navigation',
        `Simulated navigation to ${target}`,
        { targetSection: target, simulated: true },
        txId
      );
      return txId;
    }
  };

  // Attach Global Runtime Exception Interceptors (Level: ERROR)
  window.addEventListener('error', function (event) {
    // Check if error originated from an HTML element (e.g. <img>, <script>, <video>)
    const target = event.target;
    if (target && (target.tagName === 'IMG' || target.tagName === 'VIDEO' || target.tagName === 'SOURCE')) {
      const mediaSrc = target.src || target.currentSrc || target.getAttribute('src');
      StructuredLogger.warn(
        'missing_media_asset',
        `Media element failed to load resource: ${mediaSrc || 'unknown source'}`,
        {
          tagName: target.tagName,
          id: target.id || null,
          className: target.className || null,
          mediaSrc: mediaSrc
        }
      );
      return;
    }

    // Otherwise functional script runtime error
    StructuredLogger.error(
      'functional_logic',
      `Unhandled JavaScript Exception: ${event.message}`,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? event.error.stack : null
      }
    );
  }, true); // Capture phase to catch media load errors!

  window.addEventListener('unhandledrejection', function (event) {
    StructuredLogger.error(
      'functional_logic',
      `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
      {
        reason: String(event.reason)
      }
    );
  });

  // Automated Navigation & Interaction Tracking (Level: INFO)
  document.addEventListener('DOMContentLoaded', function () {
    const initTx = generateTxId('tx_dom_ready');
    StructuredLogger.info(
      'navigation',
      'Web application loaded and DOM initialized',
      {
        referrer: document.referrer || 'direct',
        title: document.title
      },
      initTx
    );

    // Track hash changes
    window.addEventListener('hashchange', function () {
      StructuredLogger.info('navigation', `User navigated via hash to ${window.location.hash}`, {
        newHash: window.location.hash
      });
    });

    // Instrument all media tags with explicit error handlers
    function instrumentMedia() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.dataset.monitored) {
          img.dataset.monitored = 'true';
          img.addEventListener('error', function () {
            StructuredLogger.warn(
              'missing_media_asset',
              `Image resource failed to load: ${img.src}`,
              {
                alt: img.alt,
                naturalWidth: img.naturalWidth,
                src: img.src
              }
            );
          });
        }
      });

      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (!video.dataset.monitored) {
          video.dataset.monitored = 'true';
          video.addEventListener('error', function () {
            StructuredLogger.warn(
              'missing_media_asset',
              `Video playback/resource error: ${video.currentSrc || video.src}`,
              {
                networkState: video.networkState,
                readyState: video.readyState,
                error: video.error ? video.error.code : null
              }
            );
          });
        }
      });
    }

    instrumentMedia();

    // Re-check dynamically added media elements
    const observer = new MutationObserver(() => instrumentMedia());
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Export to global scope
  window.StructuredLogger = StructuredLogger;

})(window);
