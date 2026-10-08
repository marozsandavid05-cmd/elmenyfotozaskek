/* Élményfotózás · core.js
   A kritikus működés (reveal, nav, menü, hero, űrlap, választók) gsap nélkül fut.
   A motion.js csak ráépül (Lenis, pin, parallax). */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var RM = w.matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('motion-on');
  w.EF = { RM: RM };

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---------- reveal (scroll-listener, idempotens) ---------- */
  var rev = $$('[data-reveal]');
  function reveal() {
    var lim = w.innerHeight * 0.92;
    for (var i = rev.length - 1; i >= 0; i--) {
      if (rev[i].getBoundingClientRect().top < lim) { rev[i].classList.add('in'); rev.splice(i, 1); }
    }
  }
  w.addEventListener('scroll', reveal, { passive: true });
  reveal(); setTimeout(reveal, 250); setTimeout(reveal, 1200);

  /* ---------- nav: szilárd háttér + hide-on-scroll hiszterézissel ---------- */
  var nav = $('[data-nav]'), lastY = w.scrollY, acc = 0;
  function onNav() {
    if (!nav || d.body.classList.contains('menu-open')) return;
    var y = w.scrollY, dy = y - lastY; lastY = y;
    nav.classList.toggle('is-solid', y > 40);
    if (y < 120) { nav.classList.remove('is-hidden'); acc = 0; return; }
    acc = (dy > 0) === (acc > 0) ? acc + dy : dy;
    if (acc > 48) nav.classList.add('is-hidden');
    else if (acc < -24) nav.classList.remove('is-hidden');
  }
  w.addEventListener('scroll', onNav, { passive: true }); onNav();

  /* ---------- mobil menü ---------- */
  var burger = $('.nav__burger');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
    if (w.EF.lenis) { open ? w.EF.lenis.stop() : w.EF.lenis.start(); }
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { nav.classList.remove('is-hidden'); var f = $('#menu a'); f && f.focus(); }
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* belépő hero-k: CSS átmenet egy osztállyal */
  $$('[data-enter]').forEach(function (h) { requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); }); });

  /* ---------- VAKU-HERO (signature) ---------- */
  var fl = $('[data-flash]');
  if (fl) {
    var frames = $$('.flash__frame', fl), dark = $('.flash__dark', fl), burst = $('.flash__burst', fl),
        cap = $('[data-flash-cap]', fl), trig = $('[data-flash-trig]', fl), idx = 0, lastFlash = 0, inView = true;
    requestAnimationFrame(function () { fl.classList.add('is-in'); });
    function show(i) {
      frames[idx].classList.remove('is-on', 'is-dev');
      idx = (i + frames.length) % frames.length;
      var f = frames[idx], img = $('img', f);
      if (img && img.loading === 'lazy') img.loading = 'eager';
      f.classList.add('is-on');
      if (!RM) { f.classList.remove('is-dev'); void f.offsetWidth; f.classList.add('is-dev'); }
      if (cap) cap.textContent = f.getAttribute('data-cap');
    }
    function flash() {
      lastFlash = performance.now();
      if (!RM && burst) { burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go'); }
      show(idx + 1);
    }
    if (trig) trig.addEventListener('click', flash);
    fl.addEventListener('click', function (e) { if (!e.target.closest('a,button')) flash(); });
    // következő kép előtöltése üresjáratban
    setTimeout(function () { frames.forEach(function (f) { var im = $('img', f); if (im) im.loading = 'eager'; }); }, 2500);

    if (!RM) {
      var tx = 0.62, ty = 0.42, x = tx, y = ty, r = 0, hasPtr = false, t0 = performance.now();
      var fine = w.matchMedia('(pointer:fine)').matches;
      fl.addEventListener('pointermove', function (e) {
        if (!fine) return;
        var b = fl.getBoundingClientRect(); hasPtr = true;
        tx = (e.clientX - b.left) / b.width; ty = (e.clientY - b.top) / b.height;
      });
      fl.addEventListener('pointerleave', function () { hasPtr = false; });
      if ('IntersectionObserver' in w) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }).observe(fl);
      lastFlash = performance.now();
      (function loop(now) {
        if (inView && !d.hidden) {
          var t = (now - t0) / 1000;
          if (!hasPtr) { tx = 0.5 + Math.sin(t * 0.23) * 0.24; ty = 0.4 + Math.sin(t * 0.31 + 1) * 0.12; }
          x += (tx - x) * 0.08; y += (ty - y) * 0.08;
          var since = (now - lastFlash) / 1000;
          var target = Math.max(w.innerWidth, w.innerHeight) * (since < 0.9 ? 0.9 - since * 0.62 : 0.34);
          r += (target - r) * 0.09;
          dark.style.setProperty('--x', (x * 100).toFixed(2) + '%');
          dark.style.setProperty('--y', (y * 100).toFixed(2) + '%');
          dark.style.setProperty('--r', r.toFixed(0) + 'px');
          if (since > 5.5) flash();
        }
        requestAnimationFrame(loop);
      })(performance.now());
    }
  }

  /* ---------- Pixie: beszélő buborék ---------- */
  var bub = $('[data-bubble]');
  if (bub) {
    var lines = JSON.parse(bub.getAttribute('data-bubble')), bi = 0,
        bl = $('.bubble__lang', bub), bt = $('.bubble__txt', bub);
    if (!RM) setInterval(function () {
      if (d.hidden) return;
      bub.classList.add('swap');
      setTimeout(function () { bi = (bi + 1) % lines.length; bl.textContent = lines[bi][0]; bt.textContent = lines[bi][1]; bt.lang = lines[bi][2]; bub.classList.remove('swap'); }, 320);
    }, 3200);
  }

  /* ---------- Selfiebox: óraválasztó ---------- */
  var hrs = $('[data-hours]');
  if (hrs) {
    var data = JSON.parse(hrs.getAttribute('data-hours')), pr = $('[data-hours-price]'), np = $('[data-hours-print]'), hr = $('[data-hours-h]'), go = $('[data-hours-go]');
    $$('button', hrs).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', hrs).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var o = data[b.value]; pr.textContent = o.ar; np.textContent = o.nyomat; hr.textContent = b.value + ' óra';
        if (go) go.href = 'ajanlatkeres.html?szolg=selfiebox&ora=' + b.value;
      });
    });
  }

  /* ---------- Hátterek: választó ---------- */
  var pick = $('[data-picker]');
  if (pick) {
    var view = $('.picker__view img'), vcap = $('[data-pick-cap]'), vnum = $('[data-pick-num]'), pgo = $('[data-pick-go]'), sws = $$('.sw', pick);
    function choose(sw, focus) {
      sws.forEach(function (s) { s.setAttribute('aria-checked', s === sw ? 'true' : 'false'); s.tabIndex = s === sw ? 0 : -1; });
      var src = sw.getAttribute('data-big');
      view.classList.add('fade');
      var n = new Image(); n.onload = n.onerror = function () { view.src = src; view.alt = sw.getAttribute('data-alt'); view.classList.remove('fade'); };
      n.src = src;
      vcap.textContent = sw.getAttribute('data-name'); vnum.textContent = sw.getAttribute('data-label');
      if (pgo) pgo.href = 'ajanlatkeres.html?hatter=' + sw.getAttribute('data-num');
      if (focus) sw.focus();
    }
    sws.forEach(function (sw, i) {
      sw.addEventListener('click', function () { choose(sw); });
      sw.addEventListener('keydown', function (e) {
        var k = e.key, j = -1, cols = w.innerWidth < 481 ? 3 : (w.innerWidth < 861 ? 4 : 3);
        if (k === 'ArrowRight') j = i + 1; else if (k === 'ArrowLeft') j = i - 1; else if (k === 'ArrowDown') j = i + cols; else if (k === 'ArrowUp') j = i - cols;
        if (j >= 0 && j < sws.length) { e.preventDefault(); choose(sws[j], true); }
      });
    });
  }

  /* ---------- Tudnivalók: fülek + ellenőrzőlista ---------- */
  var tabs = $$('[role="tab"]');
  if (tabs.length) {
    function sel(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        d.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
      try { history.replaceState(null, '', '#' + t.getAttribute('data-hash')); } catch (e) {}
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); sel(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true); }
      });
    });
    var h = location.hash.slice(1); tabs.forEach(function (t) { if (t.getAttribute('data-hash') === h) sel(t); });
  }
  $$('[data-check]').forEach(function (box) {
    var key = 'ef-check-' + box.getAttribute('data-check'), inputs = $$('input', box), bar = $('.check__bar i', box), done = $('.check__done', box), st = {};
    try { st = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
    function upd() {
      var n = 0; inputs.forEach(function (x, i) { if (x.checked) n++; st[i] = x.checked; });
      bar.style.width = (n / inputs.length * 100) + '%';
      done.hidden = n !== inputs.length;
      try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {}
    }
    inputs.forEach(function (x, i) { x.checked = !!st[i]; x.addEventListener('change', upd); });
    upd();
  });

  /* ---------- Rendezvényfotózás: kép-előnézet a sorokon + szűrő ---------- */
  var peek = $('.idx__peek');
  if (peek && w.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var pimgs = $$('img', peek), px = 0, py = 0, cx = 0, cy = 0, run = false;
    $$('.idx__row').forEach(function (row, i) {
      row.addEventListener('mouseenter', function () { pimgs.forEach(function (im, j) { im.classList.toggle('on', j === i); if (j === i) im.loading = 'eager'; }); peek.classList.add('on'); });
      row.addEventListener('mouseleave', function () { peek.classList.remove('on'); });
    });
    d.addEventListener('mousemove', function (e) {
      px = e.clientX; py = e.clientY;
      if (!run) { run = true; cx = px; cy = py; tick(); }
    });
    function tick() {
      cx += (px - cx) * (RM ? 1 : 0.16); cy += (py - cy) * (RM ? 1 : 0.16);
      var host = peek.parentNode.querySelector('.idx').getBoundingClientRect();
      peek.style.left = (host.right - peek.offsetWidth) + 'px';
      peek.style.top = cy + 'px';
      requestAnimationFrame(tick);
    }
  }
  var chips = $$('[data-filter]');
  if (chips.length) {
    var figs = $$('.pgrid figure'), live = $('[data-filter-live]');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-filter'), n = 0;
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        figs.forEach(function (g) { var on = f === 'mind' || g.getAttribute('data-cat') === f; g.classList.toggle('is-off', !on); if (on) n++; });
        if (live) live.textContent = n + ' fotó látható';
        if (w.ScrollTrigger) w.ScrollTrigger.refresh();
      });
    });
  }

  /* ---------- Selfiebox: ragadós kép cseréje lépésenként ---------- */
  var smedia = $('.steps__media');
  if (smedia && 'IntersectionObserver' in w) {
    var simgs = $$('img', smedia);
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = +e.target.getAttribute('data-step');
        simgs.forEach(function (im, j) { im.classList.toggle('on', j === i); if (j === i) im.loading = 'eager'; });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('[data-step]').forEach(function (li) { io.observe(li); });
  }

  /* ---------- Ajánlatkérés űrlap ---------- */
  var form = $('[data-form]');
  if (form) {
    var q = new URLSearchParams(location.search), szolg = q.get('szolg'), ora = q.get('ora'), hat = q.get('hatter');
    function setSvc(v) {
      var r = form.querySelector('input[name="szolgaltatas"][data-v="' + v + '"]'); if (r) r.checked = true; cond();
    }
    function cond() {
      var v = (form.querySelector('input[name="szolgaltatas"]:checked') || {}).getAttribute ? form.querySelector('input[name="szolgaltatas"]:checked').getAttribute('data-v') : '';
      $$('[data-when]', form).forEach(function (el) {
        var on = el.getAttribute('data-when').split(' ').indexOf(v) > -1;
        el.hidden = !on; $$('input,select,textarea', el).forEach(function (x) { x.disabled = !on; });
      });
    }
    $$('input[name="szolgaltatas"]', form).forEach(function (r) { r.addEventListener('change', cond); });
    if (szolg) setSvc(szolg); else cond();
    if (ora) { var s = form.querySelector('select[name="idotartam"]'); if (s) s.value = ora + ' óra'; }
    if (hat) { var hs = form.querySelector('select[name="hatter"]'); if (hs) hs.value = hat + '-es háttér'; if (!szolg) setSvc('selfiebox'); }

    function check(f) {
      var el = $('input,select,textarea', f); if (!el || el.disabled) return true;
      var ok = el.type === 'checkbox' ? el.checked : el.checkValidity() && (!el.required || el.value.trim() !== '');
      f.classList.toggle('is-bad', !ok); el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    $$('.f[data-req]', form).forEach(function (f) {
      var el = $('input,select,textarea', f);
      el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') check(f); });
      el.addEventListener('input', function () { if (f.classList.contains('is-bad')) check(f); });
      el.addEventListener('change', function () { if (f.classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var bad = $$('.f[data-req]', form).filter(function (f) { return !check(f); });
      if (bad.length) { e.preventDefault(); var el = $('input,select,textarea', bad[0]); el.focus(); return; }
      var key = form.querySelector('input[name="access_key"]').value;
      if (!key || /IDE_/.test(key) || location.protocol === 'file:') {
        // Az űrlap még nincs élesítve: levélként küldjük tovább.
        e.preventDefault();
        var fd = new FormData(form), lines = [];
        fd.forEach(function (v, k) { if (['access_key', 'subject', 'redirect', 'botcheck', 'from_name'].indexOf(k) < 0 && v) lines.push(k + ': ' + v); });
        var href = 'mailto:hello@elmenyfotozas.hu?subject=' + encodeURIComponent('Ajánlatkérés a weboldalról') + '&body=' + encodeURIComponent(lines.join('\n'));
        var note = $('[data-form-note]', form); note.hidden = false;
        $('a', note).href = href; $('a', note).focus();
      }
    });
    var red = form.querySelector('input[name="redirect"]');
    if (red && /^https?:/.test(location.protocol)) red.value = new URL('koszonjuk.html', location.href).href;
  }
})();
