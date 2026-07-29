/* ═══════════ AMANDA AT THIRTY — interactions ═══════════ */
(() => {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('js');

  /* ── envelope intro ─────────────────────────────── */
  const screen = $('#envelopeScreen');
  const wrap   = $('#envelopeWrap');
  const envelope = $('.envelope');
  let opened = false;

  function openEnvelope() {
    if (opened) return; opened = true;
    envelope.classList.add('open');
    setTimeout(() => {
      screen.classList.add('opened');
      document.body.style.overflow = '';
      heroIn();
      burst(innerWidth / 2, innerHeight * 0.35);
    }, 950);
    setTimeout(() => screen.remove(), 2100);
  }
  document.body.style.overflow = 'hidden';
  wrap.addEventListener('click', openEnvelope);
  wrap.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && openEnvelope());

  /* ── hero entrance + 30 counter ─────────────────── */
  function heroIn() {
    $$('.hero .reveal').forEach((el, i) =>
      setTimeout(() => el.classList.add('shown'), 120 + i * 160));
    const num = $('#countNum');
    if (reduceMotion) return;
    const t0 = performance.now(), dur = 1600;
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      num.textContent = Math.round(30 * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ── scroll reveals (IntersectionObserver — no lib needed) ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('shown');
      if (en.target.classList.contains('letter-line'))
        $$('.hl', en.target).forEach((h, i) => setTimeout(() => h.classList.add('on'), 400 + i * 220));
      if (en.target.classList.contains('track'))
        setTimeout(() => en.target.classList.add('on'), (+en.target.dataset.i || 0) * 180);
      if (en.target.classList.contains('message-assembled'))
        $$('.ma-word', en.target).forEach((w, i) => setTimeout(() => w.classList.add('on'), 300 + i * 550));
      io.unobserve(en.target);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal:not(.hero .reveal), .letter-line, .card, .ff-caption, .section-head').forEach(el => io.observe(el));
  $$('.track').forEach((el, i) => { el.dataset.i = i; io.observe(el); });
  io.observe($('.message-assembled'));

  /* ── falling petals canvas ──────────────────────── */
  const canvas = $('#petals'), ctx = canvas.getContext('2d');
  let W, H, petals = [];
  const PETAL_COLORS = ['#f6dfd9', '#f0c7bc', '#e9b4ad', '#e9d5ae', '#f4d7cf'];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  function newPetal(seedY) {
    return {
      x: Math.random() * W, y: seedY ? Math.random() * H : -20,
      r: 4 + Math.random() * 7, tilt: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * 0.03, vy: 0.4 + Math.random() * 0.9,
      sway: 0.3 + Math.random() * 0.9, phase: Math.random() * Math.PI * 2,
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      alpha: 0.5 + Math.random() * 0.5
    };
  }
  const COUNT = reduceMotion ? 0 : (innerWidth < 700 ? 16 : 30);
  for (let i = 0; i < COUNT; i++) petals.push(newPetal(true));
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.tilt);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r * 0.6, p.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  (function loop(t) {
    if (!COUNT) return;
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.y += p.vy; p.phase += 0.012;
      p.x += Math.sin(p.phase) * p.sway;
      p.tilt += p.spin;
      if (p.y > H + 24) Object.assign(p, newPetal(false));
      drawPetal(p);
    });
    requestAnimationFrame(loop);
  })();

  /* ── heart cursor + click bursts ────────────────── */
  const dot = $('#cursorDot');
  if (matchMedia('(hover:hover)').matches && !reduceMotion) {
    addEventListener('mousemove', e => {
      document.body.classList.add('has-cursor');
      dot.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 14}px)`;
    });
  }
  addEventListener('pointerdown', e => {
    if (opened && !e.target.closest('.blow-btn, .ff-frame, iframe, a')) miniHearts(e.clientX, e.clientY);
  });
  function miniHearts(x, y) {
    for (let i = 0; i < 6; i++) {
      const h = document.createElement('span');
      h.textContent = ['❤', '🌸', '✨'][(Math.random() * 3) | 0];
      Object.assign(h.style, {
        position: 'fixed', left: x + 'px', top: y + 'px', zIndex: 98,
        pointerEvents: 'none', fontSize: 10 + Math.random() * 12 + 'px',
        transition: 'transform 1s cubic-bezier(.22,1,.36,1), opacity 1s ease',
        transform: 'translate(-50%,-50%)', opacity: 1
      });
      document.body.appendChild(h);
      requestAnimationFrame(() => {
        const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
        h.style.transform = `translate(${Math.cos(a) * d - 8}px, ${Math.sin(a) * d - 40}px) rotate(${(Math.random() - .5) * 90}deg)`;
        h.style.opacity = 0;
      });
      setTimeout(() => h.remove(), 1100);
    }
  }

  /* ── scroll progress flower ─────────────────────── */
  const fill = $('#progressFill'), flower = $('#progressFlower');
  addEventListener('scroll', () => {
    const p = scrollY / (document.documentElement.scrollHeight - innerHeight);
    fill.style.height = p * 100 + '%';
    flower.style.top = p * 100 + '%';
  }, { passive: true });

  /* ── tilt microinteraction ──────────────────────── */
  if (matchMedia('(hover:hover)').matches && !reduceMotion) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - .5) * -10;
        const ry = ((e.clientX - r.left) / r.width - .5) * 10;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(900px)';
        el.style.transition = 'transform .5s ease';
        setTimeout(() => el.style.transition = '', 500);
      });
    });
  }

  /* ── feature film: parallax + viewport autoplay ── */
  const ffFrame = $('#ffFrame'), ffVideo = $('#ffVideo');
  if (ffFrame && ffVideo) {
    // only spend bandwidth/battery while it's on screen
    new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) ffVideo.play().catch(() => {});
        else ffVideo.pause();
      });
    }, { threshold: 0.25 }).observe(ffFrame);

    if (!reduceMotion) {
      let ffTick = false;
      const ffParallax = () => {
        ffTick = false;
        const r = ffFrame.getBoundingClientRect();
        if (r.bottom < -80 || r.top > innerHeight + 80) return;
        // -1 (below viewport) .. 0 (centered) .. 1 (above viewport)
        const p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
        ffFrame.style.transform = `translateY(${p * 26}px) scale(${1 - Math.abs(p) * 0.05})`;
        ffVideo.style.transform = `translateY(${p * -7}%)`;
      };
      addEventListener('scroll', () => {
        if (!ffTick) { ffTick = true; requestAnimationFrame(ffParallax); }
      }, { passive: true });
      ffParallax();
    }
  }

  /* ── confetti helpers ───────────────────────────── */
  const CONF_COLORS = ['#d4707c', '#c39a4e', '#f6dfd9', '#b84a5a', '#e9d5ae', '#ffffff'];
  function burst(x, y) {
    if (typeof confetti === 'undefined' || reduceMotion) return;
    confetti({
      particleCount: 90, spread: 75, startVelocity: 38,
      origin: { x: x / innerWidth, y: y / innerHeight },
      colors: CONF_COLORS, scalar: 0.9
    });
  }

  /* ── cake: hold to blow ─────────────────────────── */
  const blowBtn = $('#blowBtn'), cake = $('#cake'), wishNote = $('#wishNote'), finaleMsg = $('#finaleMessage');
  let holdTimer = null, blown = false, holdStart = null;
  const HOLD_MS = 1600;

  function startHold(e) {
    if (blown) return;
    e.preventDefault();
    holdStart = { x: e.clientX, y: e.clientY };
    blowBtn.classList.add('holding');
    wishNote.textContent = 'keep blowing… 🌬️';
    holdTimer = setTimeout(blowOut, HOLD_MS);
  }
  function moveCheck(e) {
    if (!holdStart || blown) return;
    if (Math.hypot(e.clientX - holdStart.x, e.clientY - holdStart.y) > 14) cancelHold();
  }
  function cancelHold() {
    if (blown) return;
    holdStart = null;
    clearTimeout(holdTimer);
    blowBtn.classList.remove('holding');
    wishNote.textContent = 'so close! hold it a little longer 🕯️';
  }
  function blowOut() {
    blown = true;
    cake.classList.add('blown');
    blowBtn.classList.remove('holding');
    blowBtn.querySelector('.blow-label').textContent = 'wish sealed 🤍';
    blowBtn.disabled = true;
    wishNote.textContent = 'It’s already coming true. I can feel it.';
    finaleMsg.hidden = false;
    finaleMsg.animate?.(
      [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }],
      { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
    );
    if (typeof confetti !== 'undefined' && !reduceMotion) {
      const end = Date.now() + 2600;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors: CONF_COLORS });
        confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors: CONF_COLORS });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
      setTimeout(() => confetti({
        particleCount: 160, spread: 100, startVelocity: 45,
        origin: { y: 0.6 }, colors: CONF_COLORS,
        shapes: ['circle', 'square'], scalar: 1.1
      }), 300);
    }
  }
  blowBtn.addEventListener('pointerdown', startHold);
  blowBtn.addEventListener('pointermove', moveCheck);
  blowBtn.addEventListener('pointerup', cancelHold);
  blowBtn.addEventListener('pointerleave', cancelHold);
  blowBtn.addEventListener('pointercancel', cancelHold);
})();
