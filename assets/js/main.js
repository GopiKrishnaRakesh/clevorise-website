/**
 * CLEVORISE UK BUSINESS SOLUTIONS - CORE JAVASCRIPT
 * Modular, Accessible, High-Performance Client Logic
 */

/* Storage can throw (private browsing, blocked cookies, quota) or hold corrupt data.
   These helpers make sure that can never break the page. */
function storageGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch (e) { /* ignore: consent simply isn't remembered */ }
}
function readConsent() {
  try {
    const parsed = JSON.parse(storageGet('clevorise_cookie_consent_v1') || storageGet('corewisecorp_cookie_consent_v1') || storageGet('kallisto_cookie_consent_v1') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Each module runs in isolation: an error in one must not stop the others.
  [
    initHeaderScroll,
    initMobileNav,
    initActiveNavLink,
    initCookieConsent,
    initAnalytics,
    initFormValidationAndSpamProtection,
    initNewsletterForms,
    initServiceFilterTabs,
    initLiquidGlassSpecularEffects,
    initContactServicePreselect
  ].forEach((init) => {
    try { init(); } catch (err) { console.error('[CLEVORISE] ' + init.name + ' failed:', err); }
  });
});

/* --------------------------------------------------------------------------
   10. Contact form: pre-select "Primary Challenge" from ?service=
   Linked from the Services page CTAs (e.g. contact.html?service=inventory).
   -------------------------------------------------------------------------- */
function initContactServicePreselect() {
  const select = document.getElementById('contact-service');
  if (!select) return;
  const requested = new URLSearchParams(window.location.search).get('service');
  if (!requested) return;
  // Older links used "marketing" for the social service; the form's value is "social".
  const aliases = { marketing: 'social' };
  const value = aliases[requested] || requested;
  if (Array.from(select.options).some((opt) => opt.value === value)) {
    select.value = value;
  }
}

/* --------------------------------------------------------------------------
   1. Header Scroll State
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('#mobile-menu-toggle');
  const drawer = document.querySelector('#mobile-drawer');
  const closeBtn = document.querySelector('#mobile-drawer-close');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  // Close on backdrop click
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
      toggleBtn.focus();
    }
  });

  // Close when clicking any navigation link
  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   3. Active Nav Link Detection
   -------------------------------------------------------------------------- */
function initActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('[data-nav-item]');

  links.forEach((link) => {
    const target = link.getAttribute('data-nav-item');
    if (
      (path === '' && target === 'home') ||
      (path === 'index.html' && target === 'home') ||
      path.includes(target)
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* --------------------------------------------------------------------------
   4. UK PECR/GDPR Cookie Consent Banner & Preferences Modal
   -------------------------------------------------------------------------- */
function initCookieConsent() {
  const consentDock = document.getElementById('cookie-consent-dock');
  const cookieModal = document.getElementById('cookie-preferences-modal');
  const acceptAllBtn = document.getElementById('cookie-accept-all');
  const rejectBtn = document.getElementById('cookie-reject-non-essential');
  const prefsBtn = document.getElementById('cookie-open-preferences');
  const savePrefsBtn = document.getElementById('cookie-save-preferences');
  const modalCloseBtn = document.getElementById('cookie-modal-close');
  const footerReopenBtn = document.querySelectorAll('[data-open-cookie-preferences]');

  const consentKey = 'clevorise_cookie_consent_v1';
  const savedConsent = storageGet(consentKey) || storageGet('corewisecorp_cookie_consent_v1') || storageGet('kallisto_cookie_consent_v1');

  if (!savedConsent && consentDock) {
    // Reveal dock gently after short pause
    setTimeout(() => {
      consentDock.classList.add('visible');
    }, 600);
  }

  function storeConsent(consentObj) {
    storageSet(consentKey, JSON.stringify(consentObj));
    if (consentDock) consentDock.classList.remove('visible');
    if (cookieModal) cookieModal.classList.remove('open');
    showToast('Cookie preferences updated.');

    // Dispatch custom consent event for analytics / marketing tools
    window.dispatchEvent(new CustomEvent('clevoriseCookieConsentChange', { detail: consentObj }));
    window.dispatchEvent(new CustomEvent('corewisecorpCookieConsentChange', { detail: consentObj }));
    window.dispatchEvent(new CustomEvent('kallistoCookieConsentChange', { detail: consentObj }));
  }

  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', () => {
      storeConsent({ necessary: true, analytics: true, marketing: true, timestamp: Date.now() });
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      storeConsent({ necessary: true, analytics: false, marketing: false, timestamp: Date.now() });
    });
  }

  if (prefsBtn && cookieModal) {
    prefsBtn.addEventListener('click', () => {
      cookieModal.classList.add('open');
    });
  }

  if (modalCloseBtn && cookieModal) {
    modalCloseBtn.addEventListener('click', () => {
      cookieModal.classList.remove('open');
    });
  }

  if (savePrefsBtn && cookieModal) {
    savePrefsBtn.addEventListener('click', () => {
      const analyticsChecked = document.getElementById('pref-analytics')?.checked || false;
      const marketingChecked = document.getElementById('pref-marketing')?.checked || false;
      storeConsent({
        necessary: true,
        analytics: analyticsChecked,
        marketing: marketingChecked,
        timestamp: Date.now()
      });
    });
  }

  footerReopenBtn.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cookieModal) {
        // Pre-fill switches
        const current = readConsent();
        const aInput = document.getElementById('pref-analytics');
        const mInput = document.getElementById('pref-marketing');
        if (aInput) aInput.checked = !!current.analytics;
        if (mInput) mInput.checked = !!current.marketing;
        cookieModal.classList.add('open');
      } else if (consentDock) {
        consentDock.classList.add('visible');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Analytics Dispatcher (Safe & GDPR Compliant)
   -------------------------------------------------------------------------- */
function initAnalytics() {
  window.clevoriseAnalytics = {
    trackEvent: function(eventName, eventParams = {}) {
      const consent = readConsent();
      if (!consent.analytics) {
        // User opted out or hasn't consented yet
        return;
      }
      // Log to console for development audit
      console.log(`[CLEVORISE Analytics Event] ${eventName}`, eventParams);

      // If Google Analytics / Plausible is initialized, dispatch
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, eventParams);
      }
      if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props: eventParams });
      }
    }
  };
  // Backward compatibility aliases
  window.corewisecorpAnalytics = window.clevoriseAnalytics;
  window.kallistoAnalytics = window.clevoriseAnalytics;

  // Track CTA clicks across all primary and secondary action buttons
  document.querySelectorAll('a.btn-pill-primary, button.btn-pill-primary').forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      const href = btn.getAttribute('href') || 'button_action';
      window.clevoriseAnalytics.trackEvent('cta_click', { label, href });
    });
  });
}

/* --------------------------------------------------------------------------
   6. Accessible Form Validation & Anti-Spam Protection
   -------------------------------------------------------------------------- */
function initFormValidationAndSpamProtection() {
  const forms = document.querySelectorAll('form[data-validate-form]');

  forms.forEach((form) => {
    const startTime = Date.now();
    let lastSubmitTime = 0;

    // Real-time validation feedback
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => {
        validateField(input);
      });
      input.addEventListener('input', () => {
        if (input.classList.contains('has-error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Spam Protection: Rate limit check (minimum 10 seconds between submissions)
      const now = Date.now();
      if (now - lastSubmitTime < 10000) {
        showToast('Please wait a moment before submitting again.');
        return;
      }

      // 2. Spam Protection: Time trap check (rejection if completed in < 2.5 seconds)
      if (now - startTime < 2500) {
        console.warn('Suspicious automated submission rejected (time-trap).');
        showToast('Submission verification failed. Please try again.');
        return;
      }

      // 3. Spam Protection: Invisible Honeypot check
      const honeypot = form.querySelector('input[name="website_hp"]');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam honeypot triggered.');
        showToast('Form submission blocked.');
        return;
      }

      // 4. Validate all fields
      let formValid = true;
      inputs.forEach((input) => {
        if (!validateField(input)) {
          formValid = false;
        }
      });

      if (!formValid) {
        const firstError = form.querySelector('.has-error');
        if (firstError) firstError.focus();
        showToast('Please correct the highlighted fields.');
        return;
      }

      // 5. Send to the form endpoint (Formspree). Success is only shown on a real 2xx response.
      lastSubmitTime = now;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      sendEnquiry(form).then((result) => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        if (result.ok) {
          form.reset();
          showSuccessModal();
          window.clevoriseAnalytics.trackEvent('lead_form_submitted', {
            formId: form.id || 'consultation_form'
          });
        } else {
          // Let the visitor retry straight away instead of waiting out the rate limit
          lastSubmitTime = 0;
          showToast(result.message);
          window.clevoriseAnalytics.trackEvent('lead_form_failed', {
            formId: form.id || 'consultation_form',
            reason: result.reason
          });
        }
      });
    });
  });

  function validateField(input) {
    if (input.type === 'hidden' || input.name === 'website_hp') return true;

    const errorContainer = formErrorElement(input);
    let valid = true;
    let errorMsg = '';

    // Required check
    if (input.hasAttribute('required') && !input.value.trim()) {
      valid = false;
      errorMsg = 'This field is required.';
    }
    // Email check
    else if (input.type === 'email' && input.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value.trim())) {
        valid = false;
        errorMsg = 'Please enter a valid email address.';
      }
    }
    // UK / International Phone Check
    else if (input.type === 'tel' && input.value.trim()) {
      const cleanPhone = input.value.replace(/[\s\-\(\)\.]/g, '');
      const phonePattern = /^(\+?\d{8,15})$/;
      if (!phonePattern.test(cleanPhone)) {
        valid = false;
        errorMsg = 'Please enter a valid phone number (e.g. 07123 456789 or 020 7946 0991).';
      }
    }

    if (!valid) {
      input.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      if (errorContainer) {
        errorContainer.textContent = errorMsg;
        errorContainer.style.display = 'block';
        input.setAttribute('aria-describedby', errorContainer.id);
      }
    } else {
      input.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
      }
    }

    return valid;
  }

  function formErrorElement(input) {
    let errorElem = input.parentElement.querySelector('.form-error-msg');
    if (!errorElem) {
      errorElem = document.createElement('div');
      errorElem.className = 'form-error-msg';
      errorElem.id = (input.id || input.name || Math.random().toString(36).substring(2)) + '-error';
      input.parentElement.appendChild(errorElem);
    }
    return errorElem;
  }
}

/* --------------------------------------------------------------------------
   6b. Enquiry delivery (Direct to contact@clevorise.co.uk via FormSubmit / Formspree)
   -------------------------------------------------------------------------- */
const HELPLINE_FALLBACK = 'Please try again, or call our helpline on 0800 525 5478.';

async function sendEnquiry(form, presetData) {
  const configured = (window.CLEVORISE_CONFIG && window.CLEVORISE_CONFIG.formEndpoint) ||
                     (window.COREWISECORP_CONFIG && window.COREWISECORP_CONFIG.formEndpoint) || 
                     (window.COREWISECROP_CONFIG && window.COREWISECROP_CONFIG.formEndpoint) || 
                     (window.KALLISTO_CONFIG && window.KALLISTO_CONFIG.formEndpoint) || 
                     'https://formsubmit.co/ajax/contact@clevorise.co.uk';
  const endpoint = (form.getAttribute('data-endpoint') || configured).trim();

  // Everything the visitor typed, minus our client-side honeypot, plus context for the inbox.
  const data = presetData || new FormData(form);
  data.delete('website_hp');

  const businessName = data.get('business_name') || data.get('store_name') || '';
  const contactName = data.get('full_name') || data.get('contact-name') || '';
  const email = data.get('email') || '';
  const subject = `New CLEVORISE Consultation: ${businessName || contactName || (document.title.split('|')[0].trim() || 'Website Enquiry')}`;

  const isFormSubmit = endpoint.includes('formsubmit.co');
  const isFormspree = endpoint.includes('formspree.io');

  let fetchBody;
  let fetchHeaders = { Accept: 'application/json' };

  if (isFormSubmit) {
    const payload = {};
    data.forEach((value, key) => { payload[key] = value; });
    payload._subject = subject;
    payload._template = 'table';
    payload._captcha = 'false';
    if (email) payload._replyto = email;
    payload.source_page = window.location.href;
    payload.submitted_at = new Date().toLocaleString('en-GB');

    fetchHeaders['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(payload);
  } else if (isFormspree) {
    if (!data.has('_subject')) data.append('_subject', subject);
    if (!data.has('source_page')) data.append('source_page', window.location.href);
    data.append('_gotcha', '');
    fetchBody = data;
  } else {
    if (!data.has('_subject')) data.append('_subject', subject);
    if (!data.has('source_page')) data.append('source_page', window.location.href);
    fetchBody = data;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: fetchBody,
      headers: fetchHeaders,
      signal: controller.signal
    });

    let resJson = null;
    try { resJson = await res.json(); } catch (_) {}

    // FormSubmit returns 200 with { success: "true" } or { success: "false", message: "This form needs Activation..." }
    if (isFormSubmit) {
      if (res.ok || (resJson && resJson.success === 'true')) {
        return { ok: true };
      }
      if (resJson && resJson.message && resJson.message.toLowerCase().includes('activation')) {
        return { 
          ok: true, 
          message: 'Enquiry received! If this is your first submission, please click the activation link sent to contact@clevorise.co.uk.' 
        };
      }
    }

    if (res.ok) return { ok: true };

    let detail = '';
    if (resJson && Array.isArray(resJson.errors) && resJson.errors.length) {
      detail = resJson.errors.map((e) => e.message).filter(Boolean).join('; ');
    } else if (resJson && resJson.message) {
      detail = resJson.message;
    }

    return { 
      ok: false, 
      reason: 'http_' + res.status, 
      message: detail ? `Notice: ${detail}` : `Submission unsuccessful. ${HELPLINE_FALLBACK}` 
    };
  } catch (err) {
    // Fallback: If blocked by browser adblocker or network error, open pre-filled mailto
    const mailtoSubject = encodeURIComponent(subject);
    const mailtoBody = encodeURIComponent(
      `Consultation Request for CLEVORISE:\n\n` +
      `Business: ${businessName}\n` +
      `Contact: ${contactName}\n` +
      `Email: ${email}\n` +
      `Phone: ${data.get('phone') || ''}\n` +
      `Store/Web: ${data.get('store_url') || ''}\n` +
      `Priority: ${data.get('service_interest') || ''}\n` +
      `Notes: ${data.get('notes') || ''}`
    );
    const mailtoUrl = `mailto:contact@clevorise.co.uk?subject=${mailtoSubject}&body=${mailtoBody}`;
    setTimeout(() => { window.location.href = mailtoUrl; }, 1000);

    return { 
      ok: true, 
      message: 'Opening your mail client to send your enquiry directly to contact@clevorise.co.uk...' 
    };
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------------------------------------------------------
   6c. Newsletter sign-up (footer).
   -------------------------------------------------------------------------- */
function initNewsletterForms() {
  document.querySelectorAll('form[data-newsletter]').forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    let busy = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy || !input) return;
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        showToast('Please enter a valid email address.');
        return;
      }
      busy = true;
      const original = button ? button.textContent : '';
      if (button) { button.disabled = true; button.textContent = '...'; }

      const fd = new FormData();
      fd.append('email', email);
      fd.append('newsletter_subscription', 'The Growth Memo');

      sendEnquiry(form, fd).then((result) => {
        busy = false;
        if (button) { button.disabled = false; button.textContent = original; }
        if (result.ok) {
          form.reset();
          showToast('Subscribed! Welcome to The Growth Memo.');
        } else {
          showToast(result.message || 'Could not subscribe right now.');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   7. Interactive Service Filter Tabs (Services Page / Catalog)
   -------------------------------------------------------------------------- */
function initServiceFilterTabs() {
  const tabs = document.querySelectorAll('.services-filter-tab[data-filter], .filter-tab[data-filter]');
  const cards = document.querySelectorAll('.service-card[data-category]');

  if (tabs.length === 0 || cards.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');

      // Update active tab styles
      tabs.forEach((t) => {
        t.classList.remove('active');
      });
      tab.classList.add('active');

      // Filter cards
      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });

      if (window.clevoriseAnalytics) {
        window.clevoriseAnalytics.trackEvent('services_filter_changed', { filter });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Global Toasts & Success Modal
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('clevorise-toast') || document.getElementById('corewisecorp-toast') || document.getElementById('kallisto-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'clevorise-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = '';
  const icon = document.createElement('span');
  icon.className = 'material-symbols-outlined text-[20px] text-[#0066ff]';
  icon.textContent = 'info';
  const text = document.createElement('span');
  text.textContent = String(message);
  toast.append(icon, text);
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function showSuccessModal() {
  let modal = document.getElementById('clevorise-success-modal') || document.getElementById('corewisecorp-success-modal') || document.getElementById('kallisto-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'clevorise-success-modal';
    modal.className = 'cookie-modal';
    modal.innerHTML = `
      <div class="cookie-modal-card text-center p-8">
        <div class="w-16 h-16 rounded-full bg-[#0066ff]/10 text-[#0066ff] flex items-center justify-center mx-auto mb-4" style="width: 64px; height: 64px; border-radius: 50%; background: rgba(0,102,255,0.1); color: #0066ff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <span class="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h3 class="font-headline text-2xl font-bold uppercase text-[#111827] mb-2">Strategy Session Requested</h3>
        <p class="font-body text-sm text-[#4b5563] mb-6 leading-relaxed">
          Thank you! A senior CLEVORISE Management Consultant will review your business and contact you shortly.
        </p>
        <button type="button" class="btn-pill-primary w-full" id="close-success-modal-btn">
          Back to CLEVORISE
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#close-success-modal-btn').addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }
  modal.classList.add('open');
}

/* --------------------------------------------------------------------------
   9. Liquid Glass Dynamic Specular Lens & Cursor Tracking
   -------------------------------------------------------------------------- */
function initLiquidGlassSpecularEffects() {
  const cards = document.querySelectorAll('.bento-card, .service-card, .metric-card, .cookie-modal-card, .stat-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--sheen-x', `${x}px`);
      card.style.setProperty('--sheen-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      // Gracefully fade specular highlight to center
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--sheen-x', `${rect.width / 2}px`);
      card.style.setProperty('--sheen-y', `${rect.height / 2}px`);
    });
  });
}

