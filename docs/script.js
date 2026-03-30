// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.baseOpacity = this.opacity;
    this.color = Math.random() > 0.7 ? '56,189,248' : Math.random() > 0.5 ? '167,139,250' : '148,163,184';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Mouse interaction
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      this.opacity = this.baseOpacity + (1 - dist / 150) * 0.4;
      this.size += 0.02;
    } else {
      this.opacity += (this.baseOpacity - this.opacity) * 0.05;
    }

    if (this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.fill();
  }
}

// Create particles
const particleCount = Math.min(120, Math.floor(window.innerWidth * 0.08));
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const opacity = (1 - dist / 120) * 0.06;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// ===== SCROLL REVEAL =====
const sections = document.querySelectorAll('.section');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('.metric-val');
let countersDone = false;

function animateCounters() {
  if (countersDone) return;
  countersDone = true;
  counters.forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// Trigger when hero is visible
const heroObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) animateCounters();
}, { threshold: 0.5 });
const heroMetrics = document.querySelector('.hero-metrics');
if (heroMetrics) heroObs.observe(heroMetrics);

// ===== SCORE BAR ANIMATION =====
const scoreBars = document.querySelectorAll('.sb-fill');
const scoreObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fills = entry.target.querySelectorAll('.sb-fill');
      fills.forEach(fill => {
        const w = fill.dataset.width;
        fill.style.setProperty('--target-width', w * 4); // scale up for visual
        fill.classList.add('animate');
      });
    }
  });
}, { threshold: 0.3 });

const scoreSection = document.querySelector('.score-bars');
if (scoreSection) scoreObs.observe(scoreSection);

// ===== FEATURE CARD MOUSE TRACKING =====
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

// ===== NAV SCROLL EFFECT =====
const nav = document.querySelector('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 100) {
    nav.style.borderBottomColor = 'rgba(56,189,248,0.1)';
    nav.style.background = 'rgba(4,6,14,0.9)';
  } else {
    nav.style.borderBottomColor = 'rgba(56,189,248,0.06)';
    nav.style.background = 'rgba(4,6,14,0.75)';
  }
  lastScroll = y;
}, { passive: true });
