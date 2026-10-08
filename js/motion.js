/* Élményfotózás · motion.js
   Lenis (saját rAF, nem gsap.ticker) + ScrollTrigger. Csak ráépül a core.js-re:
   ha a vendor nem tölt be vagy csökkentett a mozgás, az oldal teljes marad. */
(function () {
  'use strict';
  var w = window, d = document;
  if (!w.EF || w.EF.RM) return;

  var lenis = null;
  if (w.Lenis) {
    try {
      lenis = new w.Lenis({ smoothWheel: true, syncTouch: false, lerp: 0.11 });
      w.EF.lenis = lenis;
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    } catch (e) { lenis = null; }
  }
  if (!w.gsap || !w.ScrollTrigger) return;
  var gsap = w.gsap, ST = w.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  if (lenis) lenis.on('scroll', ST.update);

  var mm = gsap.matchMedia();

  /* Pixie: Nobu-galéria vízszintesen, asztalon pinnelve */
  mm.add('(min-width: 861px)', function () {
    var strip = d.querySelector('[data-hpin]');
    if (!strip) return;
    var track = strip.querySelector('.hstrip__track');
    strip.classList.add('is-pinned');
    var dist = function () { return Math.max(0, track.scrollWidth - w.innerWidth); };
    var tw = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: strip.parentNode, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, pinSpacing: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    return function () { strip.classList.remove('is-pinned'); tw.scrollTrigger && tw.scrollTrigger.kill(); gsap.set(track, { clearProps: 'x' }); };
  });

  /* finom parallax a kiemelt full-bleed képeken (egy driver elemenként) */
  gsap.utils.toArray('[data-par]').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    img.style.scale = '1.14';
  });

  /* AI Selfie: a két karakter-kép eltérő sebességgel úszik */
  gsap.utils.toArray('[data-drift]').forEach(function (el) {
    var v = parseFloat(el.getAttribute('data-drift')) || 40;
    gsap.fromTo(el, { y: v }, { y: -v, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Pixie hero: az óriás név lassabban mozdul, mint a lap */
  var word = d.querySelector('.px-hero__word');
  if (word) gsap.to(word, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.px-hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* újraszámolás csak görgetés-csendben */
  var lastS = 0, q = null, tries = 0;
  w.addEventListener('scroll', function () { lastS = performance.now(); }, { passive: true });
  function queue() {
    if (q) return;
    q = setTimeout(function run() {
      if (performance.now() - lastS < 500 && tries++ < 40) { q = setTimeout(run, 300); return; }
      q = null; tries = 0; ST.refresh();
    }, 300);
  }
  w.addEventListener('load', queue);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(queue);
  Array.prototype.forEach.call(d.querySelectorAll('img[loading="lazy"]'), function (im) { im.addEventListener('load', queue, { once: true }); });
  setTimeout(queue, 2500); setTimeout(queue, 6000);
})();
