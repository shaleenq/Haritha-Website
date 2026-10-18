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
  // 2. Ratnapura Tourism & Tour Inquiries Handler
  // --------------------------------------------------------------------------
  const ratnapuraTourForm = document.getElementById('ratnapuraTourForm');
  const tourSuccessMsg = document.getElementById('tourSuccessMsg');

  if (ratnapuraTourForm) {
    ratnapuraTourForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const fullName = document.getElementById('tourFullName')?.value.trim();
      const contact = document.getElementById('tourContact')?.value.trim();
      const selectedPackage = document.getElementById('tourPackageSelect')?.value;
      const txId = 'tx_tour_' + Date.now().toString(36);

      logger.info('navigation', `Ratnapura tour inquiry submitted for ${selectedPackage}`, {
        fullName,
        contact,
        selectedPackage
      }, txId);

      try {
        await fetch('/api/inquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Transaction-ID': txId
          },
          body: JSON.stringify({
            fullName: fullName,
            phone: contact,
            inquiryType: 'Ratnapura Tourism & Gem Trails',
            message: `Requested Package: ${selectedPackage}. Contact: ${contact}`
          })
        });
      } catch (err) {
        logger.error('functional_logic', `Could not post tour inquiry to API: ${err.message}`, { error: err.message }, txId);
      }

      if (tourSuccessMsg) {
        tourSuccessMsg.style.display = 'block';
      }
      ratnapuraTourForm.reset();
    });
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
      tourHeader: "Discover Ratnapura: Ceylon's Jewel & Nature Capital",
      sinhalaQuote: 'දේශීය නිෂ්පාදන අපනයනය තුළින් ඔබේ ආර්ථිකය රටේ ආර්ථිකය ශක්තිමත් කරන විශ්වාසනීය දේශීය සමාගම.'
    },
    si: {
      badge: 'ලියාපදිංචි සමාගම · PV 00364030',
      heroSub: 'දේශීය කුළුබඩු, කෘෂිකාර්මික වටිනාකම් දාමයන් සහ ගෝලීය අධ්‍යාපන අවස්ථා ලෝකය හා සම්බන්ධ කරන විශ්වාසනීය ශ්‍රී ලාංකේය සමාගම.',
      motto: 'විශ්වාසය · ස්ථාවරත්වය · පැහැදිලි අනාගතය',
      tourHeader: 'රත්නපුර සංචාරක අත්දැකීම: මැණික් හා සොබාදම් අගනගරය',
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
      const tourTitle = document.querySelector('#tourism .section-title');

      if (heroBadge) heroBadge.textContent = t.badge;
      if (heroSubtitle) heroSubtitle.textContent = t.heroSub;
      if (mottoText) mottoText.textContent = t.motto;
      if (tourTitle) tourTitle.textContent = t.tourHeader;
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
      logger.simulateNavigation('#tourism');
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
