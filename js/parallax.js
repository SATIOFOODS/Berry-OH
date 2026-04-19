(function initParallax() {
  const bite = document.getElementById('hero-bite');
  if (!bite) return;

  /* Skip parallax on touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  const FACTOR = 0.01;   // 0.01× mouse offset — subtle
  const LERP   = 0.07;   // smoothing factor

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) * FACTOR;
    targetY = (e.clientY - cy) * FACTOR;
  });

  function tick() {
    currentX += (targetX - currentX) * LERP;
    currentY += (targetY - currentY) * LERP;

    /* Preserve the base rotate(5deg) set in CSS */
    bite.style.transform = `rotate(5deg) translate(${currentX}px, ${currentY}px)`;

    requestAnimationFrame(tick);
  }

  tick();
}());
