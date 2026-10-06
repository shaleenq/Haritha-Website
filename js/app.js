/**
 * SOLID CEYLON GLOBAL LINK (PVT) LTD
 * Main Application Interactive Controller
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const logger = window.StructuredLogger;

  // --------------------------------------------------------------------------
  // 1. Navigation & Section Intersection Tracking (INFO Log Level)
  // --------------------------------------------------------------------------
  const navLinks = document.querySelectorAll('.nav-link, .nav-btn, .hero-btn');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', function () {
      const isExpanded = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
      const txId = 'tx_nav_menu_' + Date.now().toString(36);
      logger.info('navigation', `Mobile navigation toggled: ${isExpanded ? 'open' : 'closed'}`, {
        isExpanded
      }, txId);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const txId = 'tx_click_nav_' + Date.now().toString(36);
        logger.info('navigation', `User clicked navigation link: ${href}`, {
          targetSection: href,
          linkText: this.innerText.trim()
        }, txId);

        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      }
    });
  });

  // Section Observer for scroll tracking
  if ('IntersectionObserver' in window) {
    let lastObservedSection = '';
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            const currentId = entry.target.id;
            if (currentId !== lastObservedSection) {
              lastObservedSection = currentId;
              
              // Update nav active state
              document.querySelectorAll('.nav-link').forEach(l => {
                if (l.getAttribute('href') === `#${currentId}`) {
                  l.classList.add('active');
                } else {
                  l.classList.remove('active');
                }
              });

              // Log section visit
              const txId = 'tx_scroll_section_' + Date.now().toString(36);
              logger.info('navigation', `User scrolled into section: #${currentId}`, {
                sectionId: currentId,
                title: entry.target.querySelector('h2, h1')?.innerText || currentId
              }, txId);
            }
          }
        });
      },
      { threshold: [0.3] }
    );

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  // --------------------------------------------------------------------------
  // 2. Investment Yield Calculator (INFO for normal, ERROR for broken logic)
  // --------------------------------------------------------------------------
  const investmentSlider = document.getElementById('investmentSlider');
  const customAmountInput = document.getElementById('customAmountInput');
  const presetButtons = document.querySelectorAll('.calc-preset-btn');
  const year1ReturnEl = document.getElementById('calcYear1Return');
  const year2ReturnEl = document.getElementById('calcYear2Return');
  const year3ReturnEl = document.getElementById('calcYear3Return');
  const year3ProfitEl = document.getElementById('calcYear3Profit');
  const calcPrincipalDisplay = document.getElementById('calcPrincipalDisplay');
  const calcErrorBanner = document.getElementById('calcErrorBanner');
  const openInquiryBtn = document.getElementById('calcInvestCta');

  // Exact Official Growth Multipliers from SOLID CEYLON GLOBAL LINK schedule:
  // 100k -> Y1: 125k (1.25x), Y2: 154k (1.54x), Y3: 187k (1.87x)
  const MULTIPLIERS = {
    year1: 1.25,
    year2: 1.54,
    year3: 1.87
  };

  function formatLKR(amount) {
    return 'LKR ' + Math.round(amount).toLocaleString('en-US');
  }

  function calculateYields(principal) {
    const txId = 'tx_calc_' + Date.now().toString(36);

    // Functional logic validation
    if (isNaN(principal) || principal <= 0) {
      const errorMsg = 'Invalid principal amount: Value must be a positive number';
      if (calcErrorBanner) {
        calcErrorBanner.textContent = errorMsg;
        calcErrorBanner.style.display = 'block';
      }
      logger.error('functional_logic', errorMsg, {
        attemptedPrincipal: principal,
        context: 'investment_calculator'
      }, txId);
      return;
    }

    if (principal < 50000 || principal > 50000000) {
      const errorMsg = 'Principal out of official bounds (Min: LKR 50,000, Max: LKR 50,000,000)';
      if (calcErrorBanner) {
        calcErrorBanner.textContent = errorMsg;
        calcErrorBanner.style.display = 'block';
      }
      logger.error('functional_logic', errorMsg, {
        attemptedPrincipal: principal,
        min: 50000,
        max: 50000000
      }, txId);
      return;
    }

    // Clear error
    if (calcErrorBanner) {
      calcErrorBanner.style.display = 'none';
    }

    const y1 = principal * MULTIPLIERS.year1;
    const y2 = principal * MULTIPLIERS.year2;
    const y3 = principal * MULTIPLIERS.year3;
    const netProfitY3 = y3 - principal;

    if (calcPrincipalDisplay) calcPrincipalDisplay.textContent = formatLKR(principal);
    if (year1ReturnEl) year1ReturnEl.textContent = formatLKR(y1);
    if (year2ReturnEl) year2ReturnEl.textContent = formatLKR(y2);
    if (year3ReturnEl) year3ReturnEl.textContent = formatLKR(y3);
    if (year3ProfitEl) year3ProfitEl.textContent = `+${formatLKR(netProfitY3)} (87% Net Profit)`;

    // Log normal calculator interaction
    logger.info('navigation', `Investment calculator updated for ${formatLKR(principal)}`, {
      principal,
      year1Yield: y1,
      year2Yield: y2,
      year3Yield: y3,
      growth3YearPercent: 87
    }, txId);
  }

  if (investmentSlider && customAmountInput) {
    investmentSlider.addEventListener('input', function () {
      const val = parseInt(this.value, 10);
      customAmountInput.value = val;
      presetButtons.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.amount, 10) === val);
      });
      calculateYields(val);
    });

    customAmountInput.addEventListener('change', function () {
      const val = parseInt(this.value, 10);
      if (!isNaN(val)) {
        investmentSlider.value = Math.min(Math.max(val, 50000), 5000000);
        presetButtons.forEach(btn => {
          btn.classList.toggle('active', parseInt(btn.dataset.amount, 10) === val);
        });
      }
      calculateYields(val);
    });
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      presetButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const val = parseInt(this.dataset.amount, 10);
      if (investmentSlider) investmentSlider.value = val;
      if (customAmountInput) customAmountInput.value = val;
      calculateYields(val);
    });
  });

  if (openInquiryBtn) {
    openInquiryBtn.addEventListener('click', function () {
      const currentVal = customAmountInput ? customAmountInput.value : 500000;
      openConsultationModal('Investment Partner Program', `Interested in LKR ${parseInt(currentVal).toLocaleString()} Plan`);
    });
  }

  // Initial calculation
  if (customAmountInput) {
    calculateYields(parseInt(customAmountInput.value, 10) || 500000);
  }

  // --------------------------------------------------------------------------
  // 3. Modals Management (Video, Certificate, Inquiry, Lightbox)
  // --------------------------------------------------------------------------
  function openModal(modalId, contextName = '') {
    const modal = document.getElementById(modalId);
    if (!modal) {
      logger.warn('missing_media_asset', `Attempted to open non-existent modal: ${modalId}`);
      return;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const txId = 'tx_modal_open_' + Date.now().toString(36);
    logger.info('navigation', `Modal opened: ${modalId} (${contextName})`, {
      modalId,
      contextName
    }, txId);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // If closing video modal, pause video
    const video = modal.querySelector('video');
    if (video && !video.paused) {
      video.pause();
    }

    const txId = 'tx_modal_close_' + Date.now().toString(36);
    logger.info('navigation', `Modal closed: ${modalId}`, { modalId }, txId);
  }

  // Attach modal close buttons
  document.querySelectorAll('.modal-close, .modal-backdrop').forEach(closer => {
    closer.addEventListener('click', function () {
      const modal = this.closest('.modal-container');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Esc key to close modals
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-container.active');
      if (activeModal) {
        closeModal(activeModal.id);
      }
    }
  });

  // Video trigger
  const playVideoBtns = document.querySelectorAll('.play-promo-video-btn');
  playVideoBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      openModal('videoModal', 'Corporate Promotional Video');
      const video = document.getElementById('companyPromoVideo');
      if (video) {
        video.play().catch(err => {
          logger.warn('missing_media_asset', `Auto-play was blocked or stream interrupted: ${err.message}`, {
            error: err.message
          });
        });
      }
    });
  });

  // Certificate trigger
  const viewCertBtns = document.querySelectorAll('.view-certificate-btn');
  viewCertBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      openModal('certificateModal', 'Official Certificate of Incorporation PV 00364030');
    });
  });

  // Inquiry modal trigger
  window.openConsultationModal = function (category = '', prefilledNote = '') {
    const modal = document.getElementById('inquiryModal');
    if (modal) {
      const catSelect = document.getElementById('inquiryCategory');
      const noteInput = document.getElementById('inquiryMessage');
      if (catSelect && category) {
        catSelect.value = category;
      }
      if (noteInput && prefilledNote) {
        noteInput.value = prefilledNote;
      }
      openModal('inquiryModal', `Consultation Form: ${category}`);
    }
  };

  document.querySelectorAll('.open-inquiry-trigger').forEach(btn => {
    btn.addEventListener('click', function () {
      const cat = this.dataset.category || 'General Corporate Consultation';
      window.openConsultationModal(cat);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Inquiry Form Submission (Functional Logic Validation & Submission)
  // --------------------------------------------------------------------------
  const inquiryForm = document.getElementById('consultationForm');
  const inquiryStatusEl = document.getElementById('inquiryStatusMsg');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const txId = 'tx_submit_inquiry_' + Date.now().toString(36);
      const fullName = document.getElementById('inquiryFullName')?.value || '';
      const email = document.getElementById('inquiryEmail')?.value || '';
      const phone = document.getElementById('inquiryPhone')?.value || '';
      const inquiryType = document.getElementById('inquiryCategory')?.value || '';
      const investmentTier = document.getElementById('inquiryInvestmentTier')?.value || '';
      const message = document.getElementById('inquiryMessage')?.value || '';

      // Client-Side Validation
      const errors = [];
      if (!fullName.trim() || fullName.trim().length < 2) {
        errors.push('Full legal name is required (min 2 characters)');
      }
      if (!phone.trim() || phone.trim().length < 9) {
        errors.push('A valid telephone or WhatsApp number is required (min 9 digits)');
      }
      if (!inquiryType) {
        errors.push('Please select an inquiry category');
      }

      if (errors.length > 0) {
        // Emit Structured Log: ERROR (Broken functional logic / invalid user input)
        logger.error('functional_logic', 'Inquiry submission failed client-side validation', {
          errors,
          fieldsProvided: { fullName, phone, inquiryType }
        }, txId);

        if (inquiryStatusEl) {
          inquiryStatusEl.className = 'status-msg error';
          inquiryStatusEl.innerHTML = `⚠️ <strong>Validation Error:</strong><br>${errors.join('<br>')}`;
          inquiryStatusEl.style.display = 'block';
        }
        return;
      }

      // Valid form - Send to Backend
      if (inquiryStatusEl) {
        inquiryStatusEl.className = 'status-msg info';
        inquiryStatusEl.textContent = 'Transmitting inquiry to SOLID CEYLON GLOBAL LINK executive office...';
        inquiryStatusEl.style.display = 'block';
      }

      try {
        const payload = {
          transactionId: txId,
          fullName,
          email,
          phone,
          inquiryType,
          investmentTier,
          message
        };

        const response = await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Transaction-ID': txId
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          logger.info('inquiry_submission', `Inquiry successfully submitted: ${result.inquiryId}`, {
            inquiryId: result.inquiryId,
            fullName,
            inquiryType
          }, txId);

          if (inquiryStatusEl) {
            inquiryStatusEl.className = 'status-msg success';
            inquiryStatusEl.innerHTML = `✅ <strong>Inquiry Registered!</strong> Reference ID: <code>${result.inquiryId}</code>.<br>${result.message}`;
          }

          inquiryForm.reset();
        } else {
          throw new Error(result.message || result.errors?.join(', ') || 'Inquiry processing failed');
        }
      } catch (err) {
        logger.error('functional_logic', `Failed to transmit inquiry: ${err.message}`, {
          error: err.message
        }, txId);

        if (inquiryStatusEl) {
          inquiryStatusEl.className = 'status-msg error';
          inquiryStatusEl.innerHTML = `❌ <strong>Error:</strong> ${err.message}. Please reach our hotline directly at 070 110 7192.`;
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Bilingual Toggle (English / Sinhala)
  // --------------------------------------------------------------------------
  const langToggleBtn = document.getElementById('langToggleBtn');
  let currentLang = 'en';

  const translations = {
    en: {
      badge: 'Certified Corporation · PV 00364030',
      heroSub: 'Connecting Sri Lanka’s authentic natural bounty, premium spice cultivations, and global educational frontiers to worldwide markets.',
      motto: 'Trust · Stability · Transparent Future',
      invHeader: 'Secure High-Yield Investment Portfolios',
      sinhalaQuote: 'දේශීය නිෂ්පාදන අපනයනය තුළින් ඔබේ ආර්ථිකය රටේ ආර්ථිකය ශක්තිමත් කරන විශ්වාසනීය දේශීය සමාගම.'
    },
    si: {
      badge: 'ලියාපදිංචි සමාගම · PV 00364030',
      heroSub: 'දේශීය කුළුබඩු, කෘෂිකාර්මික වටිනාකම් දාමයන් සහ ගෝලීය අධ්‍යාපන අවස්ථා ලෝකය හා සම්බන්ධ කරන විශ්වාසනීය ශ්‍රී ලාංකේය සමාගම.',
      motto: 'විශ්වාසය · ස්ථාවරත්වය · පැහැදිලි අනාගතය',
      invHeader: 'සුරක්ෂිත ආයෝජනයෙන් උපරිම ප්‍රතිලාභ',
      sinhalaQuote: 'දේශීය නිෂ්පාදන අපනයනය තුළින් ඔබේ ආර්ථිකය රටේ ආර්ථිකය ශක්තිමත් කරන විශ්වාසනීය දේශීය සමාගම.'
    }
  };

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', function () {
      currentLang = currentLang === 'en' ? 'si' : 'en';
      langToggleBtn.textContent = currentLang === 'en' ? 'සිංහල' : 'English';

      const txId = 'tx_lang_toggle_' + Date.now().toString(36);
      logger.info('navigation', `Language switched to ${currentLang.toUpperCase()}`, {
        selectedLanguage: currentLang
      }, txId);

      const t = translations[currentLang];
      const heroBadge = document.querySelector('.hero-reg-badge span');
      const heroSubtitle = document.querySelector('.hero-subtitle');
      const mottoText = document.querySelector('.company-motto-text');
      const invTitle = document.querySelector('.investments-title');

      if (heroBadge) heroBadge.textContent = t.badge;
      if (heroSubtitle) heroSubtitle.textContent = t.heroSub;
      if (mottoText) mottoText.textContent = t.motto;
      if (invTitle) invTitle.textContent = t.invHeader;
    });
  }

  // --------------------------------------------------------------------------
  // 6. Live Audit & Structured Log Drawer (dev.log Inspector)
  // --------------------------------------------------------------------------
  const logDrawer = document.getElementById('logDrawer');
  const toggleDrawerBtn = document.getElementById('toggleLogDrawerBtn');
  const closeDrawerBtn = document.getElementById('closeLogDrawerBtn');
  const logStreamContainer = document.getElementById('logStreamContainer');
  const logCounterBadge = document.getElementById('logCounterBadge');
  const filterButtons = document.querySelectorAll('.log-filter-btn');
  const testWarnBtn = document.getElementById('testWarnMissingAsset');
  const testErrorBtn = document.getElementById('testErrorBrokenLogic');
  const testInfoBtn = document.getElementById('testInfoNavigation');
  const refreshDevLogBtn = document.getElementById('refreshDevLogBtn');
  const clearViewBtn = document.getElementById('clearLogViewBtn');

  let activeFilter = 'ALL';
  let totalLogsReceived = 0;

  function renderLogEntry(entry) {
    if (!logStreamContainer) return;

    if (activeFilter !== 'ALL' && entry.level !== activeFilter) {
      return;
    }

    const item = document.createElement('div');
    item.className = `log-entry level-${entry.level.toLowerCase()}`;
    item.innerHTML = `
      <div class="log-entry-header">
        <span class="log-badge ${entry.level.toLowerCase()}">${entry.level}</span>
        <span class="log-timestamp">${new Date(entry.timestamp).toLocaleTimeString()}</span>
        <span class="log-txid" title="Transaction ID">${entry.transactionId}</span>
        <span class="log-category">[${entry.category}]</span>
      </div>
      <div class="log-entry-msg">${escapeHtml(entry.message)}</div>
      ${entry.details && Object.keys(entry.details).length ? `<pre class="log-entry-details">${escapeHtml(JSON.stringify(entry.details, null, 2))}</pre>` : ''}
    `;

    logStreamContainer.prepend(item);

    // Limit visible DOM nodes for performance
    if (logStreamContainer.children.length > 80) {
      logStreamContainer.removeChild(logStreamContainer.lastChild);
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function updateLogBadge() {
    totalLogsReceived++;
    if (logCounterBadge) {
      logCounterBadge.textContent = totalLogsReceived;
      logCounterBadge.classList.add('pulse');
      setTimeout(() => logCounterBadge.classList.remove('pulse'), 400);
    }
  }

  // Subscribe to logger events
  logger.onLog(entry => {
    updateLogBadge();
    renderLogEntry(entry);
  });

  // Drawer Toggle
  if (toggleDrawerBtn && logDrawer) {
    toggleDrawerBtn.addEventListener('click', function () {
      logDrawer.classList.toggle('active');
      const isOpen = logDrawer.classList.contains('active');
      const txId = 'tx_drawer_toggle_' + Date.now().toString(36);
      logger.info('navigation', `Audit drawer ${isOpen ? 'opened' : 'closed'}`, { isOpen }, txId);
    });
  }

  if (closeDrawerBtn && logDrawer) {
    closeDrawerBtn.addEventListener('click', function () {
      logDrawer.classList.remove('active');
    });
  }

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      activeFilter = this.dataset.level;

      if (logStreamContainer) {
        logStreamContainer.innerHTML = '';
        logger.getRecentLogs().forEach(entry => renderLogEntry(entry));
      }
    });
  });

  // Simulation / Testing Buttons
  if (testWarnBtn) {
    testWarnBtn.addEventListener('click', function () {
      const brokenAsset = `/assets/non-existent-sample-${Date.now()}.png`;
      logger.simulateMissingMedia(brokenAsset);
    });
  }

  if (testErrorBtn) {
    testErrorBtn.addEventListener('click', function () {
      logger.simulateLogicError('User attempted mathematical calculation on corrupt data payload');
    });
  }

  if (testInfoBtn) {
    testInfoBtn.addEventListener('click', function () {
      logger.simulateNavigation('#investments-tier-simulation');
    });
  }

  if (refreshDevLogBtn) {
    refreshDevLogBtn.addEventListener('click', async function () {
      try {
        const res = await fetch('/api/logs?limit=50');
        const data = await res.json();
        if (data.logs && logStreamContainer) {
          logStreamContainer.innerHTML = '';
          data.logs.forEach(entry => renderLogEntry(entry));
          const txId = 'tx_fetch_dev_log_' + Date.now().toString(36);
          logger.info('system', `Loaded ${data.logs.length} latest entries from ./logs/dev.log`, {
            totalLinesInFile: data.totalLines
          }, txId);
        }
      } catch (err) {
        logger.error('functional_logic', `Failed to fetch dev.log: ${err.message}`);
      }
    });
  }

  if (clearViewBtn && logStreamContainer) {
    clearViewBtn.addEventListener('click', function () {
      logStreamContainer.innerHTML = '<div class="log-stream-empty">Display cleared. New events will appear in real time and continue logging to ./logs/dev.log</div>';
    });
  }

  // Prepopulate existing logs
  logger.getRecentLogs().forEach(entry => {
    totalLogsReceived++;
    renderLogEntry(entry);
  });
  if (logCounterBadge) logCounterBadge.textContent = totalLogsReceived;

});
