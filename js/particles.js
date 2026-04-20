(function initCanvas() {
  const canvas    = document.getElementById('particles-canvas');
  const ctx       = canvas.getContext('2d');

  const berryImg    = new Image();
  const kunafaImg   = new Image();
  const whitechocImg = new Image();

  const STAR_COUNT      = 100;
  const BERRY_COUNT     = 7;
  const KUNAFA_COUNT    = 8;
  const WHITECHOC_COUNT = 5;

  let stars      = [];
  let berries    = [];
  let kunafas    = [];
  let whitechocs = [];
  let animId     = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function edgeX() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    return side === 'left'
      ? Math.random() * canvas.width * 0.20
      : canvas.width * 0.80 + Math.random() * canvas.width * 0.20;
  }

  /* ── Build stars ── */
  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:       rand(0, canvas.width),
        y:       rand(0, canvas.height),
        r:       rand(0.5, 1.5),
        opacity: rand(0.2, 0.6),
        pink:    Math.random() > 0.72,
      });
    }
  }

  /* ── Build berry particles ── */
  function buildBerries() {
    berries = [];
    for (let i = 0; i < BERRY_COUNT; i++) {
      const speed = rand(0.1, 0.3);
      const angle = rand(0, Math.PI * 2);
      berries.push({
        x:             rand(0, canvas.width),
        y:             rand(0, canvas.height),
        r:             rand(12, 25),
        opacity:       rand(0.3, 0.7),
        vx:            Math.cos(angle) * speed,
        vy:            Math.sin(angle) * speed,
        rotation:      Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
      });
    }
  }

  /* ── Build kunafa particles ── */
  function buildKunafas() {
    kunafas = [];
    for (let i = 0; i < KUNAFA_COUNT; i++) {
      const speed = rand(0.1, 0.3);
      const angle = rand(0, Math.PI * 2);
      const s     = rand(22, 42);
      kunafas.push({
        x:       rand(0, canvas.width),
        y:       rand(0, canvas.height),
        size:    s,
        opacity: rand(0.10, 0.20),
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
      });
    }
  }

  /* ── Build white choc particles — edge-only spawn, downward drift ── */
  function buildWhitechocs() {
    whitechocs = [];
    for (let i = 0; i < WHITECHOC_COUNT; i++) {
      const r = rand(12, 25);
      whitechocs.push({
        x:       edgeX(),
        y:       rand(0, canvas.height),
        r:       r,
        opacity: rand(0.55, 0.70),
        vx:      (Math.random() - 0.5) * 0.6,
        vy:      rand(0.4, 0.7),
      });
    }
  }

  /* ── Glow ── */
  function drawGlow() {
    const isMobile = canvas.width < 600;
    const radius = Math.min(canvas.width, canvas.height) * 0.6;

    const cx = canvas.width * 0.46;
    const cy = isMobile ? canvas.height * 0.28 : canvas.height * 0.32;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(180, 20, 80, 0.38)');
    gradient.addColorStop(1, 'rgba(180, 20, 80, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx2 = isMobile ? canvas.width * 0.6 : canvas.width * 0.64;
    const cy2 = isMobile ? canvas.height * 0.22 : canvas.height * 0.28;
    const radius2 = radius * 0.65;
    const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, radius2);
    gradient2.addColorStop(0, 'rgba(200, 30, 90, 0.18)');
    gradient2.addColorStop(1, 'rgba(200, 30, 90, 0)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ── Draw ── */
  function drawStars() {
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.pink
        ? `rgba(255,210,235,${s.opacity})`
        : `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
    });
  }

  function drawBerries() {
    berries.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);
      ctx.globalAlpha = b.opacity;
      ctx.drawImage(berryImg, -b.r, -b.r, b.r * 2, b.r * 2);
      ctx.restore();
      ctx.globalAlpha = 1;
      b.rotation += b.rotationSpeed;
    });
  }

  function drawKunafas() {
    ctx.globalCompositeOperation = 'screen';
    kunafas.forEach(k => {
      const size = k.size * 2;
      ctx.globalAlpha = k.opacity;
      ctx.drawImage(kunafaImg, k.x - k.size, k.y - k.size, size, size);
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawWhitechocs() {
    const isMobile = canvas.width < 600;
    const chocW = isMobile ? 32 : 45;
    const chocH = (whitechocImg.height / whitechocImg.width) * chocW;
    whitechocs.forEach(w => {
      ctx.globalAlpha = w.opacity;
      ctx.drawImage(whitechocImg, w.x, w.y, chocW, chocH);
    });
    ctx.globalAlpha = 1;
  }

  /* ── Update positions ── */
  function update() {
    berries.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r)                b.x = canvas.width  + b.r;
      if (b.x > canvas.width  + b.r) b.x = -b.r;
      if (b.y < -b.r)                b.y = canvas.height + b.r;
      if (b.y > canvas.height + b.r) b.y = -b.r;
    });

    kunafas.forEach(k => {
      k.x += k.vx;
      k.y += k.vy;
      const pad = 14;
      if (k.x < -pad)                k.x = canvas.width  + pad;
      if (k.x > canvas.width  + pad) k.x = -pad;
      if (k.y < -pad)                k.y = canvas.height + pad;
      if (k.y > canvas.height + pad) k.y = -pad;
    });

    whitechocs.forEach(w => {
      w.x += w.vx;
      w.y += w.vy;
      if (w.y > canvas.height + w.r) {
        w.y = -w.r;
        w.x = edgeX();
      }
    });
  }

  /* ── Animation loop ── */
  let lastTime = 0;
  function frame(timestamp) {
    animId = requestAnimationFrame(frame);
    if (timestamp - lastTime < 32) return;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGlow();
    drawStars();
    drawBerries();
    drawKunafas();
    drawWhitechocs();
    update();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(frame);
    }
  });

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
    buildBerries();
    buildKunafas();
    buildWhitechocs();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();

  Promise.all([
    new Promise(r => { berryImg.onload     = r; berryImg.src     = 'assets/berry.png';      }),
    new Promise(r => { kunafaImg.onload    = r; kunafaImg.src    = 'assets/kunafa.png';     }),
    new Promise(r => { whitechocImg.onload = r; whitechocImg.src = 'assets/whitechoc.png';  }),
  ]).then(() => {
    requestAnimationFrame(frame);
  });
}());
