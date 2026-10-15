/**
 * CLEVORISE — SERVICES PAGE INTERACTIONS
 * Filtering, scroll-linked effects, deep links, interactive previews, booking modal.
 * Progressive enhancement: with JS off, every card is visible and every CTA is a
 * plain link to the enquiry form.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // Consent-gated by main.js's dispatcher; a no-op until the visitor opts in.
  function track(name, params) {
    try {
      var a = window.clevoriseAnalytics || window.corewisecorpAnalytics || window.kallistoAnalytics;
      if (a) a.trackEvent(name, params || {});
    } catch (e) { /* analytics must never break the page */ }
  }

  var grid = $('#svc-grid');
  var cards = $$('.svc-card');
  if (!grid || !cards.length) return;

  var smooth = function () { return reduceMotion.matches ? 'auto' : 'smooth'; };
  var hashId = function () {
    try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ''; }
  };

  /* ------------------------------------------------------------------------
     1. Scroll reveal
     ------------------------------------------------------------------------ */
  function initReveal() {
    var targets = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      root.classList.remove('svc-js');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        entry.target.style.setProperty('--d', (i * 80) + 'ms');
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     2. Scroll-linked UI: progress bar, sticky filter state, back-to-top
     ------------------------------------------------------------------------ */
  function initScrollUI() {
    var bar = $('.svc-progress');
    var filterbar = $('#svc-filterbar');
    var toTop = $('#svc-top');
    var ticking = false;

    function stickyTop() {
      var h = parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 84;
      return h + 8;
    }

    function update() {
      ticking = false;
      var max = root.scrollHeight - window.innerHeight;
      if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : 0);
      if (filterbar) filterbar.classList.toggle('is-stuck', filterbar.getBoundingClientRect().top <= stickyTop() + 1 && window.scrollY > 120);
      if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 700);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: smooth() }); });
    var cue = $('#svc-cue');
    if (cue) cue.addEventListener('click', function (e) { e.preventDefault(); grid.scrollIntoView({ behavior: smooth(), block: 'start' }); });
  }

  /* ------------------------------------------------------------------------
     3. Category filter (leave -> reflow -> enter), with stale-run protection
     ------------------------------------------------------------------------ */
  var tabs = $$('.svc-tab');
  var statusEl = $('#svc-status');
  var runToken = 0;

  function announce(key, shown) {
    if (!statusEl) return;
    var active = tabs.filter(function (t) { return t.dataset.filter === key; })[0];
    var label = active ? active.getAttribute('data-label') : '';
    statusEl.textContent = key === 'all'
      ? 'Showing all ' + cards.length + ' solutions'
      : 'Showing ' + shown + ' of ' + cards.length + ' solutions: ' + label;
  }

  function setFilter(key, opts) {
    opts = opts || {};
    var token = ++runToken;
    var want = cards.filter(function (c) { return key === 'all' || c.dataset.category === key; });
    var animate = !reduceMotion.matches && !opts.instant && typeof Element.prototype.animate === 'function';

    tabs.forEach(function (t) {
      var on = t.dataset.filter === key;
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on && opts.scrollTab !== false) {
        var scroller = t.parentElement;
        if (scroller && scroller.scrollWidth > scroller.clientWidth) {
          scroller.scrollTo({ left: t.offsetLeft - (scroller.clientWidth - t.offsetWidth) / 2, behavior: smooth() });
        }
      }
    });

    function apply() {
      cards.forEach(function (c) {
        c.getAnimations().forEach(function (a) { a.cancel(); });
        c.hidden = want.indexOf(c) === -1;
      });
      grid.dataset.mode = key === 'all' ? 'all' : 'filtered';
      announce(key, want.length);

      if (animate) {
        want.forEach(function (c, i) {
          c.animate(
            [{ opacity: 0, transform: 'translateY(16px) scale(0.985)' }, { opacity: 1, transform: 'none' }],
            { duration: 420, delay: i * 55, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }
          );
        });
      }
      // Keep the top of the grid in view when the sticky bar is used mid-page
      var top = grid.getBoundingClientRect().top;
      if (opts.scrollToGrid !== false && top < 0) grid.scrollIntoView({ behavior: smooth(), block: 'start' });
    }

    var leaving = cards.filter(function (c) { return !c.hidden && want.indexOf(c) === -1; });
    if (animate && leaving.length) {
      var anims = leaving.map(function (c) {
        return c.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(0.98)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
      });
      // Race against a timer so a throttled/background tab can never leave the filter half-applied
      var done = Promise.all(anims.map(function (a) { return a.finished; }));
      var timeout = new Promise(function (resolve) { setTimeout(resolve, 260); });
      Promise.race([done, timeout]).catch(function () { /* cancelled by a newer run */ }).then(function () {
        if (token === runToken) apply();
      });
    } else {
      apply();
    }
  }

  function initFilters() {
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        if (t.getAttribute('aria-pressed') === 'true') return;
        setFilter(t.dataset.filter);
        track('services_filter_changed', { filter: t.dataset.filter });
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Deep links (services.html#marketing etc.): reveal, scroll, highlight
     ------------------------------------------------------------------------ */
  var highlightTimer;
  function goTo(id, push) {
    var card = document.getElementById(id);
    if (!card || !card.classList.contains('svc-card')) return false;
    if (card.hidden) setFilter('all', { instant: true, scrollToGrid: false });
    requestAnimationFrame(function () {
      card.scrollIntoView({ behavior: smooth(), block: 'start' });
      if (push && history.pushState) history.pushState(null, '', '#' + id);
      cards.forEach(function (c) { c.classList.remove('is-target'); });
      card.classList.add('is-target');
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(function () { card.classList.remove('is-target'); }, 2200);
    });
    return true;
  }

  function initDeepLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href*="#"]') : null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      var id = '';
      try { id = decodeURIComponent(url.hash.slice(1)); } catch (err) { return; }
      if (goTo(id, true)) e.preventDefault();
    });
    window.addEventListener('hashchange', function () { goTo(hashId(), false); });

    if (location.hash) {
      // Initial arrival: fonts/images can shift layout, so settle on the target once everything has loaded.
      var initial = hashId();
      var settle = function () { goTo(initial, false); };
      if (document.readyState === 'complete') settle(); else window.addEventListener('load', settle, { once: true });
    }
  }

  /* ------------------------------------------------------------------------
     5. Pointer tilt + spotlight (fine pointers only, never with reduced motion)
     ------------------------------------------------------------------------ */
  function initTilt() {
    if (reduceMotion.matches || !finePointer.matches) return;
    cards.forEach(function (card) {
      var raf = 0, last;
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        last = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect();
          var x = last.clientX - r.left, y = last.clientY - r.top;
          card.style.setProperty('--mx', x + 'px');
          card.style.setProperty('--my', y + 'px');
          card.style.setProperty('--rx', (((y / r.height) - 0.5) * -5).toFixed(2) + 'deg');
          card.style.setProperty('--ry', (((x / r.width) - 0.5) * 5).toFixed(2) + 'deg');
        });
      });
      card.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. Interactive previews
     ------------------------------------------------------------------------ */
  function initPreviews() {
    // A) Storefront: device preview re-frames the illustration
    var visual = $('#svc-storefront-visual');
    $$('[data-device]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('[data-device]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        if (visual) visual.dataset.device = btn.dataset.device;
      });
    });

    // B) Storefront: illustrative speed benchmark
    var speedBtn = $('#svc-speed-btn');
    if (speedBtn) {
      var readout = $('#svc-speed-readout'), dot = $('#svc-speed-dot');
      var idle = speedBtn.innerHTML;
      speedBtn.addEventListener('click', function () {
        speedBtn.disabled = true;
        speedBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true" style="animation:svc-spin 1s linear infinite">progress_activity</span> Testing';
        readout.textContent = 'Profiling P99…';
        dot.classList.add('is-busy');
        setTimeout(function () {
          var speeds = ['0.72s', '0.76s', '0.78s', '0.69s'];
          readout.textContent = '<' + speeds[Math.floor(Math.random() * speeds.length)] + ' UK Speed';
          dot.classList.remove('is-busy');
          speedBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">check</span> Done';
          setTimeout(function () { speedBtn.innerHTML = idle; speedBtn.disabled = false; }, 1600);
        }, 900);
      });
    }

    // C) Social: geo-radius stepper
    var badge = $('#svc-footfall-badge'), metric = $('#svc-footfall-metric');
    $$('[data-radius]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('[data-radius]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        badge.textContent = btn.dataset.footfall + ' Footfall';
        metric.textContent = btn.dataset.footfall + ' High-Street Footfall';
        badge.classList.remove('svc-bounce'); void badge.offsetWidth; badge.classList.add('svc-bounce');
      });
    });

    // D) Stock: till scan decrements live stock; low stock triggers a reorder
    var stock = 14;
    var scanBtn = $('#svc-scan-btn'), stockVal = $('#svc-stock-val'), stockChip = $('#svc-stock-chip');
    var latency = $('#svc-sync-latency'), syncIcon = $('#svc-sync-icon');
    if (scanBtn) {
      var syncTimer;
      scanBtn.addEventListener('click', function () {
        var replenished = false;
        if (stock > 1) stock -= 1; else { stock = 14; replenished = true; }
        stockVal.textContent = stock;
        stockChip.classList.toggle('is-low', stock <= 3);
        stockChip.classList.remove('is-flash'); void stockChip.offsetWidth; stockChip.classList.add('is-flash');
        syncIcon.style.transform = 'rotate(180deg)';
        latency.textContent = 'Syncing…';
        clearTimeout(syncTimer);
        syncTimer = setTimeout(function () {
          syncIcon.style.transform = '';
          latency.textContent = replenished ? 'Stock replenished' : (stock <= 3 ? 'Reorder PO drafted' : '<12ms Instant Sync');
        }, 450);
      });
    }

    // E) Invoicing: payment model vs days sales outstanding
    var models = {
      1: { label: 'Instant Faster Payments (1.8d)', stat: '1.8 Days DSO', cls: 'svc-stat' },
      2: { label: 'Automated Direct Debit (5.2d)', stat: '5.2 Days DSO', cls: 'svc-stat svc-stat--accent' },
      3: { label: 'Standard BACS / Manual (28.0d)', stat: '28.0 Days DSO', cls: 'svc-stat' }
    };
    var range = $('#svc-dso-range'), dsoLabel = $('#svc-dso-label'), dsoStat = $('#svc-dso-stat');
    if (range) {
      var paint = function () {
        var m = models[range.value];
        dsoLabel.textContent = m.label;
        dsoLabel.className = m.cls;
        dsoLabel.style.color = range.value === '3' ? 'var(--svc-warn-ink)' : '';
        dsoStat.textContent = m.stat;
        range.setAttribute('aria-valuetext', m.label);
      };
      range.addEventListener('input', paint);
      paint();
    }
  }

  /* ------------------------------------------------------------------------
     7. Booking modal (native <dialog>): focus area -> pre-filled enquiry form
     ------------------------------------------------------------------------ */
  function initModal() {
    var dialog = $('#svc-modal');
    if (!dialog || typeof dialog.showModal !== 'function') return; // triggers stay plain links
    var cont = $('#svc-modal-continue');
    var radios = $$('input[name="svc_focus"]', dialog);
    var lastTrigger = null;

    function syncLink() {
      var checked = radios.filter(function (r) { return r.checked; })[0];
      cont.href = 'contact.html?service=' + encodeURIComponent(checked ? checked.value : 'all') + '#consultation-form';
    }
    radios.forEach(function (r) { r.addEventListener('change', syncLink); });

    function open(trigger) {
      lastTrigger = trigger || null;
      var svc = trigger && trigger.getAttribute('data-service');
      var match = radios.filter(function (r) { return r.value === svc; })[0];
      if (match) match.checked = true;
      syncLink();
      dialog.classList.remove('is-closing');
      dialog.showModal();
      root.classList.add('svc-lock');
      var checked = radios.filter(function (r) { return r.checked; })[0];
      if (checked) checked.focus();
      track('services_modal_opened', { service: checked ? checked.value : 'all' });
    }
    function close() {
      if (!dialog.open) return;
      if (reduceMotion.matches) { dialog.close(); return; }
      dialog.classList.add('is-closing');
      setTimeout(function () { dialog.close(); dialog.classList.remove('is-closing'); }, 160);
    }

    $$('[data-open-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(el); });
    });
    $$('[data-close-modal]', dialog).forEach(function (el) { el.addEventListener('click', close); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('close', function () {
      root.classList.remove('svc-lock');
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    });
    cont.addEventListener('click', function () {
      var checked = radios.filter(function (r) { return r.checked; })[0];
      track('services_cta_click', { service: checked ? checked.value : 'all', via: 'modal' });
    });
  }

  function initCtaTracking() {
    $$('a[data-track-service]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('services_cta_click', { service: a.getAttribute('data-track-service'), via: 'card' });
      });
    });
  }

  initReveal();
  initScrollUI();
  initFilters();
  initDeepLinks();
  initTilt();
  initPreviews();
  initModal();
  initCtaTracking();
})();
