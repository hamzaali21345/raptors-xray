// ===== CANVAS BACKGROUND =====
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], mouse = { x: -999, y: -999 };

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class P {
  constructor() { this.init(); }
  init() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.2 + 0.2;
    this.dx = (Math.random() - 0.5) * 0.25;
    this.dy = (Math.random() - 0.5) * 0.25;
    this.o = Math.random() * 0.35 + 0.05;
    this.bo = this.o;
    const rnd = Math.random();
    this.col = rnd > 0.75 ? '56,189,248' : rnd > 0.5 ? '167,139,250' : rnd > 0.3 ? '244,114,182' : '148,163,184';
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
    const dx = mouse.x - this.x, dy = mouse.y - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 180) {
      this.o = this.bo + (1 - d / 180) * 0.5;
    } else {
      this.o += (this.bo - this.o) * 0.04;
    }
    if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.init();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.col},${this.o})`;
    ctx.fill();
  }
}

const pCount = Math.min(100, Math.floor(W * 0.06));
for (let i = 0; i < pCount; i++) particles.push(new P());

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(56,189,248,${(1 - d / 100) * 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawLines();
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
