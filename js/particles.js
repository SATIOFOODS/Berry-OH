(function initCanvas() {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');

  const berryImg  = new Image();
  const kunafaImg = new Image();

  const STAR_COUNT   = 100;
  const BERRY_COUNT  = 7;
  const KUNAFA_COUNT = 8;

  let stars   = [];
  let berries = [];
  let kunafas = [];
  let animId  = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  /* ── Build stars (static positions, redrawn each frame cheaply) ── */
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

  /* ── Glow ── */
  function drawGlow() {
    const cx = canvas.width * 0.46;
    const cy = canvas.height * 0.32;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 460);
    gradient.addColorStop(0, 'rgba(180, 20, 80, 0.28)');
    gradient.addColorStop(1, 'rgba(180, 20, 80, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx2 = canvas.width * 0.62;
    const cy2 = canvas.height * 0.28;
    const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 220);
    gradient2.addColorStop(0, 'rgba(200, 30, 90, 0.20)');
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

  /* ── Update positions with boundary wrap ── */
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
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  /* ── Stars initialise immediately; loop starts only after both images load ── */
  resize();

  Promise.all([
    new Promise(r => { berryImg.onload  = r; berryImg.src  = 'assets/berry.png';  }),
    new Promise(r => { kunafaImg.onload = r; kunafaImg.src = 'assets/kunafa.png'; }),
  ]).then(() => {
    requestAnimationFrame(frame);
  });
}());
