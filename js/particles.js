(function initCanvas() {
  const canvas       = document.getElementById('particles-canvas');
  const ctx          = canvas.getContext('2d');

  const berryImg     = new Image();
  const whitechocImg = new Image();

  const STAR_COUNT      = 100;
  const BERRY_COUNT     = 7;
  const WHITECHOC_COUNT = 5;

  let stars      = [];
  let berries    = [];
  let kunafaStrands = [];
  let whitechocs = [];
  let animId     = null;
  let kunafaTime = 0;

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

  /* ── Build kunafa strands ── */
  function buildKunafaStrands() {
    const isMobile = canvas.width < 600;
    const count    = isMobile ? 5 : 8;
    kunafaStrands  = Array.from({ length: count }, () => {
      const length = isMobile
        ? rand(80, 120)
        : rand(80, 180);
      return {
        x:         rand(0, canvas.width),
        y:         rand(-length, canvas.height),
        length,
        amplitude: rand(6, 16),
        frequency: rand(0.3, 0.7),
        speed:     rand(0.4, 1.0),
        vy:        rand(0.3, 0.7),
        opacity:   rand(0.25, 0.45),
        width:     rand(1.5, 2.5),
      };
    });
  }

  /* ── Build white choc particles ── */
  function buildWhitechocs() {
    whitechocs = [];
    for (let i = 0; i < WHITECHOC_COUNT; i++) {
      const r = rand(12, 25);
      whitechocs.push({
        x:       edgeX(),
        y:       rand(0, canvas.height),
        r,
        opacity: rand(0.55, 0.70),
        vx:      (Math.random() - 0.5) * 0.6,
        vy:      rand(0.4, 0.7),
      });
    }
  }

  /* ── Glow ── */
  function drawGlow() {
    const isMobile = canvas.width < 600;
    const radius   = Math.min(canvas.width, canvas.height) * 0.6;

    const cx = canvas.width * 0.46;
    const cy = isMobile ? canvas.height * 0.28 : canvas.height * 0.32;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(180, 20, 80, 0.38)');
    gradient.addColorStop(1, 'rgba(180, 20, 80, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx2     = isMobile ? canvas.width * 0.6 : canvas.width * 0.64;
    const cy2     = isMobile ? canvas.height * 0.22 : canvas.height * 0.28;
    const radius2 = radius * 0.65;
    const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, radius2);
    gradient2.addColorStop(0, 'rgba(200, 30, 90, 0.18)');
    gradient2.addColorStop(1, 'rgba(200, 30, 90, 0)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ── Draw stars ── */
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

  /* ── Draw kunafa strands ── */
  function drawKunafaStrand(strand, time) {
    const segments = 24;
    const segH     = strand.length / segments;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(220, 150, 20, ${strand.opacity})`;
    ctx.lineWidth   = strand.width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    ctx.moveTo(strand.x, strand.y);
    for (let i = 1; i <= segments; i++) {
      const segY = strand.y + i * segH;
      const wave = Math.sin(i * strand.frequency + time * strand.speed) * strand.amplitude;
      ctx.lineTo(strand.x + wave, segY);
    }
    ctx.stroke();
  }

  function drawKunafaStrands() {
    kunafaStrands.forEach(s => drawKunafaStrand(s, kunafaTime));
  }

  /* ── Draw berries ── */
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

  /* ── Draw white choc ── */
  function drawWhitechocs() {
    const isMobile = canvas.width < 600;
    const chocW    = isMobile ? 32 : 45;
    const chocH    = (whitechocImg.height / whitechocImg.width) * chocW;
    whitechocs.forEach(w => {
      ctx.globalAlpha = w.opacity;
      ctx.drawImage(whitechocImg, w.x, w.y, chocW, chocH);
    });
    ctx.globalAlpha = 1;
  }

  /* ── Update positions ── */
  function update() {
    kunafaTime += 0.02;

    kunafaStrands.forEach(s => {
      s.y += s.vy;
      if (s.y > canvas.height + s.length) {
        s.y = -s.length;
        s.x = rand(0, canvas.width);
      }
    });

    berries.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r)                b.x = canvas.width  + b.r;
      if (b.x > canvas.width  + b.r) b.x = -b.r;
      if (b.y < -b.r)                b.y = canvas.height + b.r;
      if (b.y > canvas.height + b.r) b.y = -b.r;
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
    drawKunafaStrands();  /* mid-layer — behind berries and choc */
    drawBerries();
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
    buildKunafaStrands();
    buildWhitechocs();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();

  Promise.all([
    new Promise(r => { berryImg.onload     = r; berryImg.src     = 'assets/berry.png';     }),
    new Promise(r => { whitechocImg.onload = r; whitechocImg.src = 'assets/whitechoc.png'; }),
  ]).then(() => {
    requestAnimationFrame(frame);
  });
}());
