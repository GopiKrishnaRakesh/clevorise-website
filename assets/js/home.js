/**
 * CLEVORISE — HOMEPAGE INTERACTIONS (below the hero)
 * Scroll reveal, count-up stats, roadmap rail, card tilt.
 * Progressive enhancement: without JS everything is simply visible.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hasIO = 'IntersectionObserver' in window;
  if (!hasIO || reduce) root.classList.remove('hm-js');

  /* Count-up: <span data-count="1400" data-prefix="" data-suffix="+" data-decimals="0"> */
  function format(el, n) {
    var d = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var v = d ? n.toFixed(d) : Math.round(n).toLocaleString('en-GB');
    el.textContent = (el.getAttribute('data-prefix') || '') + v + (el.getAttribute('data-suffix') || '');
  }
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    if (reduce) { format(el, target); return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      format(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var stats = $$('[data-count]');
  // Show the final values immediately if animation can't run
  if (!hasIO || reduce) stats.forEach(function (el) { format(el, parseFloat(el.getAttribute('data-count'))); });

  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        var el = entry.target;
        el.style.setProperty('--d', (i * 90) + 'ms');
        el.classList.add('is-in');
        $$('[data-count]', el).forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    $$('[data-hm-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* Card tilt (fine pointers only) */
  if (!reduce && fine) {
    $$('.hm-card').forEach(function (card) {
      var raf = 0, last;
      card.addEventListener('pointermove', function (e) {
        last = e;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect();
          card.style.setProperty('--rx', ((((last.clientY - r.top) / r.height) - 0.5) * -4).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((((last.clientX - r.left) / r.width) - 0.5) * 4).toFixed(2) + 'deg');
        });
      });
      card.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
