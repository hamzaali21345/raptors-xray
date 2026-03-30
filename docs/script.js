// ===== CANVAS BACKGROUND — CINEMATIC X-RAY =====
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], mouse = { x: -999, y: -999 }, t = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// --- GRID ---
function drawGrid() {
  const gap = 60;
  const scrollY = window.scrollY * 0.15;
  ctx.strokeStyle = 'rgba(56,189,248,0.018)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += gap) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -scrollY % gap; y < H; y += gap) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Crosshair dots at intersections near mouse
  for (let x = 0; x < W; x += gap) {
    for (let y = -scrollY % gap; y < H; y += gap) {
      const dx = mouse.x - x, dy = mouse.y - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 200) {
        const o = (1 - d / 200) * 0.25;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${o})`;
        ctx.fill();
      }
    }
  }
}

// --- PULSING RINGS ---
const rings = [];
for (let i = 0; i < 3; i++) {
  rings.push({
    x: Math.random() * 0.6 + 0.2,
    y: Math.random() * 0.4 + 0.1,
    phase: Math.random() * Math.PI * 2,
    speed: 0.008 + Math.random() * 0.006,
    maxR: 80 + Math.random() * 120,
    col: i === 0 ? '56,189,248' : i === 1 ? '167,139,250' : '244,114,182'
  });
}

function drawRings() {
  rings.forEach(r => {
    const cx = r.x * W, cy = r.y * H;
    const pulse = (Math.sin(t * r.speed + r.phase) + 1) / 2;
    for (let i = 0; i < 3; i++) {
      const radius = r.maxR * (0.3 + pulse * 0.7) + i * 25;
      const alpha = (0.03 - i * 0.008) * (1 - pulse * 0.4);
      if (alpha <= 0) continue;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r.col},${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

// --- DNA HELIX (vertical) ---
function drawHelix() {
  const cx = W * 0.88;
  const amp = 30;
  const step = 8;
  const scrollOff = window.scrollY * 0.3;
  for (let y = -20; y < H + 20; y += step) {
    const phase = (y + scrollOff) * 0.025 + t * 0.012;
    const x1 = cx + Math.sin(phase) * amp;
    const x2 = cx + Math.sin(phase + Math.PI) * amp;
    const depth1 = (Math.sin(phase) + 1) / 2;
    const depth2 = (Math.sin(phase + Math.PI) + 1) / 2;

    // Strand dots
    ctx.beginPath();
    ctx.arc(x1, y, 1.5 + depth1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(56,189,248,${0.06 + depth1 * 0.08})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x2, y, 1.5 + depth2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167,139,250,${0.06 + depth2 * 0.08})`;
    ctx.fill();

    // Connecting bars every few steps
    if (y % (step * 4) < step) {
      ctx.beginPath();
      ctx.moveTo(x1, y); ctx.lineTo(x2, y);
      ctx.strokeStyle = 'rgba(148,163,184,0.03)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

// --- FLOATING PARTICLES ---
class P {
  constructor() { this.init(); }
  init() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.8 + 0.3;
    this.dx = (Math.random() - 0.5) * 0.2;
    this.dy = (Math.random() - 0.5) * 0.2;
    this.o = Math.random() * 0.3 + 0.04;
    this.bo = this.o;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.01 + Math.random() * 0.02;
    const rnd = Math.random();
    this.col = rnd > 0.7 ? '56,189,248' : rnd > 0.45 ? '167,139,250' : rnd > 0.25 ? '244,114,182' : '52,211,153';
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.pulse += this.pulseSpeed;
    const pulseFactor = (Math.sin(this.pulse) + 1) / 2;

    const dx = mouse.x - this.x, dy = mouse.y - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 220) {
      this.o = this.bo + (1 - d / 220) * 0.6;
      // Gentle repulsion
      this.x -= dx * 0.002;
      this.y -= dy * 0.002;
    } else {
      this.o += (this.bo - this.o) * 0.03;
    }
    this.drawR = this.r + pulseFactor * 0.8;
    if (this.x < -30 || this.x > W + 30 || this.y < -30 || this.y > H + 30) this.init();
  }
  draw() {
    // Glow
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.drawR * 4);
    grad.addColorStop(0, `rgba(${this.col},${this.o * 0.5})`);
    grad.addColorStop(1, `rgba(${this.col},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.drawR * 4, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.drawR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.col},${this.o})`;
    ctx.fill();
  }
}

const pCount = Math.min(80, Math.floor(W * 0.045));
for (let i = 0; i < pCount; i++) particles.push(new P());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(56,189,248,${(1 - d / 130) * 0.06})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// --- SCAN LINE (horizontal sweep) ---
function drawScanLine() {
  const scanY = ((t * 0.4) % (H + 200)) - 100;
  const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
  grad.addColorStop(0, 'rgba(56,189,248,0)');
  grad.addColorStop(0.5, 'rgba(56,189,248,0.03)');
  grad.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 40, W, 80);

  ctx.beginPath();
  ctx.moveTo(0, scanY);
  ctx.lineTo(W, scanY);
  ctx.strokeStyle = 'rgba(56,189,248,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// --- MAIN LOOP ---
function loop() {
  t++;
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  drawRings();
  drawHelix();
  drawScanLine();
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(loop);
}
loop();

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ===== MOBILE MENU =====
const menuBtn = document.getElementById('menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const navR = document.querySelector('.nav-r');
    navR.classList.toggle('open');
    menuBtn.classList.toggle('active');
  });
}

// ===== SECTION REVEAL =====
const sections = document.querySelectorAll('.section');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
sections.forEach(s => secObs.observe(s));

// ===== COUNTER ANIMATION =====
let countersDone = false;
function animateCounters() {
  if (countersDone) return;
  countersDone = true;
  document.querySelectorAll('.proof-big').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.textContent.includes('%') ? '%' : '';
    const dur = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

const proofEl = document.querySelector('.proof');
if (proofEl) {
  const proofObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) animateCounters();
  }, { threshold: 0.5 });
  proofObs.observe(proofEl);
}

// ===== DIM BAR ANIMATION =====
const dimFills = document.querySelectorAll('.dim-fill');
const dimObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.dim-fill').forEach(f => f.classList.add('go'));
    }
  });
}, { threshold: 0.3 });
const dimParent = document.querySelector('.dim-bars');
if (dimParent) dimObs.observe(dimParent);

// ===== TERMINAL TYPEWRITER =====
const termBody = document.getElementById('termBody');
let termAnimated = false;
if (termBody) {
  const lines = termBody.querySelectorAll('p');
  const termObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !termAnimated) {
      termAnimated = true;
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('show'), i * 120);
      });
    }
  }, { threshold: 0.2 });
  termObs.observe(termBody);
}

// ===== BEFORE/AFTER CARD ENTRANCE =====
const baCards = document.querySelectorAll('.ba-card');
const baObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

baCards.forEach(c => {
  c.style.opacity = '0';
  c.style.transform = 'translateY(30px)';
  c.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  baObs.observe(c);
});

// ===== FEATURE CARD MOUSE GLOW =====
document.querySelectorAll('.feat-card:not(.feat-hero-card)').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});
