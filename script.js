/* ============================================================
   MAGICAL BIRTHDAY CELEBRATION — Main Script
   GSAP · Three.js · Canvas
   ============================================================ */

'use strict';

// ─── CONFIGURATION ───────────────────────────────────────────
const CONFIG = {
  birthdayName: 'Shrushti', // Change this to the birthday person's name
  birthdayMessage: `Today is all about YOU.

May your life be filled with love,
success,
happiness,
good health,
and unforgettable memories.

Happy Birthday!`,
  balloonColors: ['#ff6b9d', '#a855f7', '#22d3ee', '#ffd700', '#ff7e5f', '#4ade80', '#f472b6', '#818cf8'],
  candleCount: 5,
  celebrationEmojis: ['🎂', '🎈', '🎉', '✨', '🎁', '💖', '🌟', '🥳', '🍰', '💫'],
};

// ─── GLOBAL STATE ────────────────────────────────────────────
const state = {
  currentScene: 'scene-landing',
  candlesLit: CONFIG.candleCount,
  cakeCut: false,
  giftOpened: false,
  landingComplete: false,
  rafIds: new Map(),
};

// ─── DOM REFERENCES ─────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const scenes = {
  landing: $('#scene-landing'),
  balloons: $('#scene-balloons'),
  cake: $('#scene-cake'),
  cutting: $('#scene-cutting'),
  message: $('#scene-message'),
  gift: $('#scene-gift'),
  finale: $('#scene-finale'),
};

const sceneOrder = [
  'scene-landing', 'scene-balloons', 'scene-cake', 'scene-cutting',
  'scene-message', 'scene-gift', 'scene-finale',
];

// ============================================================
// VISUAL FX — Sparkles, bursts (replaces audio feedback)
// ============================================================

class VisualFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 25, colors = CONFIG.balloonColors) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        type: Math.random() > 0.5 ? 'star' : 'circle',
      });
    }
    if (!state.rafIds.has('magic-sparkle')) this.animate();
  }

  sparkle(x, y) {
    this.burst(x, y, 15, ['#ffd700', '#fff', '#ff6b9d', '#22d3ee']);
  }

  pop(x, y) {
    this.burst(x, y, 30);
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 5,
        color: '#fff',
        life: 1,
        decay: 0.03,
        type: 'star',
      });
    }
  }

  drawStar(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? size : size * 0.4;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    const id = requestAnimationFrame(() => this.animate());
    state.rafIds.set('magic-sparkle', id);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = this.particles.filter(p => p.life > 0);

    if (this.particles.length === 0) {
      state.rafIds.delete('magic-sparkle');
      return;
    }

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.98;
      p.life -= p.decay;

      if (p.type === 'star') {
        this.drawStar(this.ctx, p.x, p.y, p.size, p.color, p.life);
      } else {
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
      }
    });
  }
}

const visualFX = new VisualFX($('#magic-sparkle-canvas'));

// ============================================================
// SHOOTING STARS
// ============================================================

class ShootingStars {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
    setInterval(() => this.spawn(), 2200);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawn() {
    this.stars.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height * 0.5,
      len: 80 + Math.random() * 120,
      speed: 8 + Math.random() * 6,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      life: 1,
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars = this.stars.filter(s => s.life > 0);
    this.stars.forEach(s => {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.015;

      const grad = this.ctx.createLinearGradient(s.x, s.y, s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
      grad.addColorStop(0.3, `rgba(200, 220, 255, ${s.life * 0.5})`);
      grad.addColorStop(1, 'transparent');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      this.ctx.stroke();
    });
  }
}

const shootingStars = new ShootingStars($('#shooting-stars-canvas'));

// ============================================================
// EMOJI RAIN — Scene transitions & celebrations
// ============================================================

function emojiRain(duration = 2500, density = 12) {
  const container = $('#emoji-rain');
  const interval = setInterval(() => {
    const el = document.createElement('span');
    el.className = 'emoji-drop';
    el.textContent = CONFIG.celebrationEmojis[Math.floor(Math.random() * CONFIG.celebrationEmojis.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = (2 + Math.random() * 2) + 's';
    el.style.fontSize = (20 + Math.random() * 20) + 'px';
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }, density);
  setTimeout(() => clearInterval(interval), duration);
}

// ============================================================
// CONFETTI SYSTEM
// ============================================================

class ConfettiSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.active = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, count = 80, spread = 360) {
    const colors = CONFIG.balloonColors;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180) + (-Math.PI / 2);
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed - 2,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        gravity: 0.15 + Math.random() * 0.1,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
    this.active = true;
    if (!state.rafIds.has('confetti')) this.animate();
  }

  cannon() {
    const w = this.canvas.width;
    this.burst(w * 0.2, this.canvas.height, 60, 60);
    this.burst(w * 0.8, this.canvas.height, 60, 60);
    setTimeout(() => this.burst(w * 0.5, this.canvas.height * 0.3, 100, 360), 300);
  }

  animate() {
    const id = requestAnimationFrame(() => this.animate());
    state.rafIds.set('confetti', id);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.particles.length === 0) {
      this.active = false;
      state.rafIds.delete('confetti');
      return;
    }

    this.particles = this.particles.filter(p => p.opacity > 0.01 && p.y < this.canvas.height + 50);

    this.particles.forEach(p => {
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.005;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation * Math.PI / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
  }
}

const confetti = new ConfettiSystem($('#confetti-canvas'));

// ============================================================
// STARS CANVAS
// ============================================================

class StarsBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initStars(200);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: 0,
        targetOpacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.005 + Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        appearDelay: Math.random() * 3000,
        appeared: false,
        appearStart: Date.now(),
      });
    }
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const now = Date.now();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars.forEach(s => {
      if (!s.appeared) {
        if (now - s.appearStart > s.appearDelay) {
          s.opacity = Math.min(s.opacity + 0.02, s.targetOpacity);
          if (s.opacity >= s.targetOpacity) s.appeared = true;
        }
      } else {
        s.twinklePhase += s.twinkleSpeed;
        s.opacity = s.targetOpacity * (0.6 + 0.4 * Math.sin(s.twinklePhase));
      }

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      this.ctx.fill();

      if (s.size > 1.5) {
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(200, 220, 255, ${s.opacity * 0.15})`;
        this.ctx.fill();
      }
    });
  }
}

const starsBg = new StarsBackground($('#stars-canvas'));

// ============================================================
// AMBIENT PARTICLES (sparkles, bubbles, glow)
// ============================================================

class AmbientParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.spawn(65);
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawn(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const types = ['sparkle', 'bubble', 'glow'];
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 4 + 1,
      type: types[Math.floor(Math.random() * types.length)],
      color: CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)],
      speedY: -(0.2 + Math.random() * 0.5),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    };
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * 0.2;
      p.phase += 0.02;

      if (p.y < -10) {
        p.y = this.canvas.height + 10;
        p.x = Math.random() * this.canvas.width;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity * (0.5 + 0.5 * Math.sin(p.phase));

      if (p.type === 'sparkle') {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // cross sparkle
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - p.size * 2, p.y);
        this.ctx.lineTo(p.x + p.size * 2, p.y);
        this.ctx.moveTo(p.x, p.y - p.size * 2);
        this.ctx.lineTo(p.x, p.y + p.size * 2);
        this.ctx.stroke();
      } else if (p.type === 'bubble') {
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        this.ctx.stroke();
      } else {
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
  }
}

const ambientParticles = new AmbientParticles($('#particles-canvas'));

// ============================================================
// FIREWORKS ENGINE
// ============================================================

class FireworksEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rockets = [];
    this.particles = [];
    this.running = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launch(x, y, color) {
    const targetY = 80 + Math.random() * (this.canvas.height * 0.4);
    this.rockets.push({
      x: x ?? Math.random() * this.canvas.width,
      y: y ?? this.canvas.height,
      targetY,
      speed: 6 + Math.random() * 4,
      color: color ?? CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)],
      trail: [],
    });
    if (!this.running) {
      this.running = true;
      this.animate();
    }
  }

  explode(x, y, color) {
    const styles = ['circle', 'ring', 'heart', 'star'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const count = 60 + Math.floor(Math.random() * 40);

    for (let i = 0; i < count; i++) {
      let angle, speed;
      if (style === 'ring') {
        angle = (i / count) * Math.PI * 2;
        speed = 3 + Math.random();
      } else {
        angle = Math.random() * Math.PI * 2;
        speed = 2 + Math.random() * 5;
      }

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        gravity: 0.04,
        trail: [],
      });
    }

    // Screen shake
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 400);
  }

  burst(count = 3) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.launch(), i * 400);
    }
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());

    this.ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Rockets
    this.rockets = this.rockets.filter(r => {
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();
      r.y -= r.speed;
      r.speed *= 0.98;

      r.trail.forEach((t, i) => {
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 200, 100, ${i / r.trail.length * 0.5})`;
        this.ctx.fill();
      });

      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();

      if (r.y <= r.targetY) {
        this.explode(r.x, r.y, r.color);
        return false;
      }
      return true;
    });

    // Explosion particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.trail.push({ x: p.x, y: p.y, life: p.life });
      if (p.trail.length > 4) p.trail.shift();

      p.vx *= 0.98;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      p.trail.forEach((t, i) => {
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color.replace(')', `, ${t.life * 0.3})`).replace('rgb', 'rgba').replace('#', '');
        this.ctx.globalAlpha = t.life * 0.3;
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = t.life * 0.3;
        this.ctx.fill();
      });

      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });

    if (this.rockets.length === 0 && this.particles.length === 0) {
      this.running = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  startContinuous(interval = 1200) {
    this._continuousInterval = setInterval(() => {
      if (state.currentScene === 'scene-finale' || state.currentScene === 'scene-landing') {
        this.launch();
      }
    }, interval);
  }

  stopContinuous() {
    if (this._continuousInterval) clearInterval(this._continuousInterval);
  }
}

const landingFireworks = new FireworksEngine($('#landing-fireworks'));
const finaleFireworks = new FireworksEngine($('#finale-fireworks'));

// ============================================================
// CUSTOM CURSOR BALLOON
// ============================================================

class BalloonCursor {
  constructor() {
    this.el = $('#cursor-balloon');
    this.sparkleCanvas = $('#cursor-sparkle-canvas');
    this.sparkleCtx = this.sparkleCanvas.getContext('2d');
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.sparkles = [];
    this.colorIndex = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('mousemove', (e) => {
        this.targetX = e.clientX;
        this.targetY = e.clientY;
        this.addSparkle(e.clientX, e.clientY);
      });
      document.addEventListener('click', (e) => {
        confetti.burst(e.clientX, e.clientY, 20, 180);
        visualFX.sparkle(e.clientX, e.clientY);
      });
      this.animate();
      setInterval(() => this.changeColor(), 3000);
    }
  }

  resize() {
    this.sparkleCanvas.width = window.innerWidth;
    this.sparkleCanvas.height = window.innerHeight;
  }

  changeColor() {
    this.colorIndex = (this.colorIndex + 1) % CONFIG.balloonColors.length;
    this.el.style.setProperty('--cursor-color', CONFIG.balloonColors[this.colorIndex]);
  }

  addSparkle(x, y) {
    if (Math.random() > 0.3) return;
    this.sparkles.push({
      x, y,
      life: 1,
      size: 2 + Math.random() * 3,
      color: CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)],
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.x += (this.targetX - this.x) * 0.15;
    this.y += (this.targetY - this.y) * 0.15;
    this.el.style.left = this.x + 'px';
    this.el.style.top = this.y + 'px';

    this.sparkleCtx.clearRect(0, 0, this.sparkleCanvas.width, this.sparkleCanvas.height);
    this.sparkles = this.sparkles.filter(s => s.life > 0);
    this.sparkles.forEach(s => {
      s.life -= 0.03;
      this.sparkleCtx.globalAlpha = s.life;
      this.sparkleCtx.fillStyle = s.color;
      this.sparkleCtx.beginPath();
      this.sparkleCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.sparkleCtx.fill();
    });
    this.sparkleCtx.globalAlpha = 1;
  }
}

const balloonCursor = new BalloonCursor();

// ============================================================
// SCENE MANAGER — Transitions with GSAP
// ============================================================

function goToScene(sceneId, direction = 1) {
  const fromEl = $(`#${state.currentScene}`);
  const toEl = $(`#${sceneId}`);
  if (!toEl || sceneId === state.currentScene) return;

  const tl = gsap.timeline();

  tl.to(fromEl, {
    opacity: 0,
    scale: direction > 0 ? 0.95 : 1.05,
    filter: 'blur(10px)',
    duration: 0.6,
    ease: 'power2.inOut',
    onComplete: () => {
      fromEl.classList.remove('active');
      gsap.set(fromEl, { clearProps: 'all' });
    },
  });

  tl.add(() => {
    toEl.classList.add('active');
    gsap.set(toEl, { opacity: 0, scale: direction > 0 ? 1.05 : 0.95, filter: 'blur(10px)' });
  });

  tl.to(toEl, {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      const header = toEl.querySelector('.scene-header, .message-container, .finale-content, .landing-content');
      if (header) gsap.from(header, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' });
    },
  });

  // Update nav dots
  const idx = sceneOrder.indexOf(sceneId);
  $$('.nav-dot').forEach((dot, i) => dot.classList.toggle('active', i === idx));

  state.currentScene = sceneId;
  emojiRain(1800, 18);
  onSceneEnter(sceneId);
}

function onSceneEnter(sceneId) {
  switch (sceneId) {
    case 'scene-balloons': balloonScene.start(); break;
    case 'scene-cake': cakeScene.start(); break;
    case 'scene-cutting': cuttingScene.start(); break;
    case 'scene-message': messageScene.start(); break;
    case 'scene-gift': break;
    case 'scene-finale': finaleScene.start(); break;
  }
}

// ============================================================
// LANDING ANIMATION
// ============================================================

function initLanding() {
  const title = $('.landing-title');
  const subtitle = $('.landing-subtitle');
  const btn = $('#btn-celebrate');

  const tl = gsap.timeline({ delay: 0.5 });

  tl.to(title, { opacity: 1, duration: 2, ease: 'power2.out' })
    .from('.title-line', { y: 40, opacity: 0, stagger: 0.3, duration: 1.2, ease: 'power3.out' }, '-=1.5')
    .to(subtitle, { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.5');

  // Landing balloons
  setTimeout(() => spawnLandingBalloons(15), 2000);

  // Fireworks
  setTimeout(() => {
    landingFireworks.burst(4);
    setInterval(() => {
      if (state.currentScene === 'scene-landing') landingFireworks.launch();
    }, 2000);
  }, 2500);

  // Show button with shimmer
  setTimeout(() => {
    btn.classList.remove('hidden');
    $('.title-accent').classList.add('title-shimmer');
    gsap.from(btn, { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' });
    gsap.to(btn, { boxShadow: '0 0 40px rgba(255,107,157,0.6)', repeat: -1, yoyo: true, duration: 1.5 });
  }, 4000);

  btn.addEventListener('click', (e) => {
    createRipple(e, btn);
    confetti.cannon();
    emojiRain(3000, 10);
    visualFX.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
    $('#scene-nav').classList.remove('hidden');
    state.landingComplete = true;
    goToScene('scene-balloons');
  });
}

function spawnLandingBalloons(count) {
  const container = $('#landing-balloons');
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'landing-balloon';
      const size = 30 + Math.random() * 40;
      const color = CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)];
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size * 1.2}px;
        background: radial-gradient(circle at 35% 30%, ${lighten(color, 40)}, ${color});
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        animation-duration: ${8 + Math.random() * 6}s;
        animation-delay: ${Math.random() * 2}s;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), 16000);
    }, i * 300);
  }
}

function lighten(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// SCENE 1: FLYING BALLOONS (Canvas)
// ============================================================

class BalloonScene {
  constructor() {
    this.canvas = $('#balloons-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.balloons = [];
    this.running = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      this.handleClick({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: true });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.balloons = [];
    emojiRain(2000, 20);
    for (let i = 0; i < 120; i++) {
      this.spawnBalloon(true);
    }
    this.animate();
    // Continuous spawn
    this._spawnInterval = setInterval(() => {
      if (state.currentScene === 'scene-balloons' && this.balloons.length < 150) {
        this.spawnBalloon(false);
      }
    }, 800);
  }

  stop() {
    this.running = false;
    if (this._spawnInterval) clearInterval(this._spawnInterval);
  }

  spawnBalloon(randomY) {
    const size = 25 + Math.random() * 45;
    this.balloons.push({
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : this.canvas.height + size,
      size,
      color: CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)],
      speed: 0.5 + Math.random() * 1.2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      swayAmount: 10 + Math.random() * 20,
      hasRibbon: Math.random() > 0.4,
      ribbonLength: 30 + Math.random() * 40,
      popping: false,
      popProgress: 0,
    });
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      const dx = mx - b.x;
      const dy = my - (b.y - b.size * 0.3);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < b.size * 0.6 && !b.popping) {
        b.popping = true;
        visualFX.pop(e.clientX, e.clientY);
        confetti.burst(e.clientX, e.clientY, 50, 360);
        break;
      }
    }
  }

  drawBalloon(b) {
    const ctx = this.ctx;
    const swayX = Math.sin(b.sway) * b.swayAmount;

    if (b.popping) {
      b.popProgress += 0.1;
      if (b.popProgress >= 1) return false;

      ctx.save();
      ctx.globalAlpha = 1 - b.popProgress;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = b.popProgress * b.size * 2;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x + swayX + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    }

    // Ribbon
    if (b.hasRibbon) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x + swayX, b.y + b.size * 0.5);
      const ribbonSway = Math.sin(b.sway * 2) * 5;
      ctx.quadraticCurveTo(b.x + swayX + ribbonSway, b.y + b.size * 0.5 + b.ribbonLength * 0.5, b.x + swayX + ribbonSway * 0.5, b.y + b.size * 0.5 + b.ribbonLength);
      ctx.stroke();
    }

    // Balloon body
    const grad = ctx.createRadialGradient(b.x + swayX - b.size * 0.2, b.y - b.size * 0.2, 0, b.x + swayX, b.y, b.size);
    grad.addColorStop(0, lighten(b.color, 60));
    grad.addColorStop(0.7, b.color);
    grad.addColorStop(1, darken(b.color, 30));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(b.x + swayX, b.y, b.size * 0.5, b.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(b.x + swayX - b.size * 0.15, b.y - b.size * 0.2, b.size * 0.1, b.size * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Knot
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(b.x + swayX - 4, b.y + b.size * 0.55);
    ctx.lineTo(b.x + swayX + 4, b.y + b.size * 0.55);
    ctx.lineTo(b.x + swayX, b.y + b.size * 0.65);
    ctx.fill();

    return true;
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.balloons = this.balloons.filter(b => {
      b.y -= b.speed;
      b.sway += b.swaySpeed;

      if (b.y < -b.size * 2 && !b.popping) return false;

      return this.drawBalloon(b);
    });
  }
}

function darken(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0xff) - percent);
  const b = Math.max(0, (num & 0xff) - percent);
  return `rgb(${r},${g},${b})`;
}

const balloonScene = new BalloonScene();

// ============================================================
// SCENE 2: THREE.JS BIRTHDAY CAKE
// ============================================================

class CakeScene {
  constructor() {
    this.container = $('#cake-container');
    this.candles = [];
    this.flames = [];
    this.smokeParticles = [];
    this.initialized = false;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.cakeGroup = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.analyser = null;
    this._animating = false;
  }

  start() {
    if (!this.initialized) {
      this.initThree();
      this.initialized = true;
    }
    state.candlesLit = CONFIG.candleCount;
    this.resetCandles();
    if (!this._animating) {
      this._animating = true;
      this.animate();
    }
    this.setupInteractions();
  }

  initThree() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 3, 8);
    this.camera.lookAt(0, 1.5, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const pinkLight = new THREE.PointLight(0xff6b9d, 0.6, 20);
    pinkLight.position.set(-3, 4, 3);
    this.scene.add(pinkLight);

    const goldLight = new THREE.PointLight(0xffd700, 0.4, 15);
    goldLight.position.set(3, 2, -2);
    this.scene.add(goldLight);

    this.cakeGroup = new THREE.Group();
    this.buildCake();
    this.scene.add(this.cakeGroup);

    window.addEventListener('resize', () => this.onResize());
  }

  buildCake() {
    // Bottom layer — chocolate
    const layer1 = this.createLayer(3, 1.2, 0x5C3317, 0x3E2723);
    layer1.position.y = 0.6;
    this.cakeGroup.add(layer1);

    // Middle layer — cream
    const layer2 = this.createLayer(2.4, 1, 0xFFF8E7, 0xFFECB3);
    layer2.position.y = 1.7;
    this.cakeGroup.add(layer2);

    // Top layer — pink frosting
    const layer3 = this.createLayer(1.8, 0.8, 0xFF6B9D, 0xE91E63);
    layer3.position.y = 2.6;
    this.cakeGroup.add(layer3);

    // Frosting drips
    this.addFrostingDrips(layer3, 0xFF6B9D);

    // Fruits on top
    const fruitColors = [0xFF0000, 0xFF6347, 0xFFD700, 0x32CD32];
    const fruitPositions = [[-0.5, 3.1, 0.3], [0.4, 3.15, -0.2], [-0.2, 3.1, -0.5], [0.5, 3.12, 0.4], [0, 3.08, 0.1]];
    fruitPositions.forEach((pos, i) => {
      const fruit = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + Math.random() * 0.05, 16, 16),
        new THREE.MeshStandardMaterial({ color: fruitColors[i % fruitColors.length], roughness: 0.3, metalness: 0.1 })
      );
      fruit.position.set(...pos);
      fruit.castShadow = true;
      this.cakeGroup.add(fruit);
    });

    // Candles
    this.candles = [];
    this.flames = [];
    const candleSpacing = 0.35;
    const startX = -((CONFIG.candleCount - 1) * candleSpacing) / 2;

    for (let i = 0; i < CONFIG.candleCount; i++) {
      const candleGroup = new THREE.Group();
      candleGroup.position.set(startX + i * candleSpacing, 3.3, 0);

      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: [0xFF6B9D, 0x22D3EE, 0xFFD700, 0xA855F7, 0x4ADE80][i], roughness: 0.5 })
      );
      candle.position.y = 0.25;
      candle.castShadow = true;
      candleGroup.add(candle);

      // Flame
      const flameGroup = new THREE.Group();
      flameGroup.position.y = 0.55;

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFF6600, transparent: true, opacity: 0.9 })
      );
      flame.scale.set(1, 1.5, 1);
      flameGroup.add(flame);

      const innerFlame = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFCC00, transparent: true, opacity: 0.95 })
      );
      innerFlame.position.y = 0.03;
      innerFlame.scale.set(1, 1.3, 1);
      flameGroup.add(innerFlame);

      // Glow
      const glow = new THREE.PointLight(0xFF6600, 0.5, 2);
      glow.position.y = 0.05;
      flameGroup.add(glow);

      candleGroup.add(flameGroup);
      candleGroup.userData = { lit: true, index: i, flameGroup, glow, flame, innerFlame };
      this.candles.push(candleGroup);
      this.flames.push(flameGroup);
      this.cakeGroup.add(candleGroup);
    }

    // Plate
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.3 })
    );
    plate.position.y = -0.05;
    plate.receiveShadow = true;
    this.cakeGroup.add(plate);
  }

  createLayer(radius, height, color, sideColor) {
    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(radius, radius, height, 32);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Side frosting band
    const bandGeo = new THREE.TorusGeometry(radius, 0.08, 8, 32);
    const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.4 }));
    band.rotation.x = Math.PI / 2;
    band.position.y = height / 2 - 0.05;
    group.add(band);

    return group;
  }

  addFrostingDrips(layer, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const drip = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      );
      drip.position.set(Math.cos(angle) * 0.9, 2.95, Math.sin(angle) * 0.9);
      drip.scale.y = 1.5 + Math.random();
      this.cakeGroup.add(drip);
    }
  }

  resetCandles() {
    this.candles.forEach(c => {
      c.userData.lit = true;
      c.userData.flameGroup.visible = true;
      c.userData.glow.intensity = 0.5;
    });
  }

  extinguishCandle(candleGroup) {
    if (!candleGroup.userData.lit) return;
    candleGroup.userData.lit = false;
    state.candlesLit--;

    gsap.to(candleGroup.userData.flameGroup.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.in' });
    gsap.to(candleGroup.userData.glow, { intensity: 0, duration: 0.5 });

    setTimeout(() => { candleGroup.userData.flameGroup.visible = false; }, 500);

    this.addSmoke(candleGroup.position);
    visualFX.burst(window.innerWidth / 2, window.innerHeight / 2, 20, ['#888', '#aaa', '#666']);
    confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 30, 360);

    if (state.candlesLit <= 0) {
      setTimeout(() => this.allCandlesOut(), 800);
    }
  }

  addSmoke(position) {
    const worldPos = new THREE.Vector3();
    this.candles.find(c => c.position.equals(position))?.getWorldPosition(worldPos);
    for (let i = 0; i < 15; i++) {
      this.smokeParticles.push({
        x: (Math.random() - 0.5) * 0.3,
        y: 0.6 + Math.random() * 0.2,
        z: (Math.random() - 0.5) * 0.3,
        life: 1,
        size: 0.05 + Math.random() * 0.05,
        vx: (Math.random() - 0.5) * 0.01,
        vy: 0.02 + Math.random() * 0.02,
      });
    }
  }

  allCandlesOut() {
    const wish = $('#wish-message');
    wish.classList.remove('hidden');
    gsap.from(wish, { scale: 0, opacity: 0, duration: 1, ease: 'back.out(2)' });
    confetti.cannon();
    landingFireworks.burst(5);
    visualFX.burst(window.innerWidth / 2, window.innerHeight / 2, 60, ['#ffd700', '#ff6b9d', '#fff']);
    emojiRain(2000, 15);
    $('#btn-cake-next').classList.remove('hidden');
    gsap.from('#btn-cake-next', { y: 30, opacity: 0, duration: 0.6, delay: 0.5 });
  }

  setupInteractions() {
    const canvas = this.renderer.domElement;

    const handlePointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.candles, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.lit && obj.userData.lit !== false) {
          if (obj.userData.lit !== undefined) break;
          obj = obj.parent;
        }
        const candleGroup = this.candles.find(c => c.children.includes(intersects[0].object) || c === intersects[0].object.parent);
        if (candleGroup) this.extinguishCandle(candleGroup);
      }
    };

    canvas.onclick = (e) => handlePointer(e.clientX, e.clientY);
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    // Swipe detection
    let swipeStart = null;
    canvas.addEventListener('touchstart', (e) => { swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
    canvas.addEventListener('touchend', (e) => {
      if (!swipeStart) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x;
      const dy = e.changedTouches[0].clientY - swipeStart.y;
      if (Math.abs(dx) + Math.abs(dy) > 30) {
        this.candles.filter(c => c.userData.lit).forEach(c => this.extinguishCandle(c));
      }
      swipeStart = null;
    });

    // Blow all button
    $('#btn-blow-all').onclick = () => {
      const lit = [...this.candles.filter(c => c.userData.lit)];
      lit.forEach((c, i) => {
        setTimeout(() => this.extinguishCandle(c), i * 200);
      });
      gsap.from('#btn-blow-all', { scale: 0.9, duration: 0.2, yoyo: true, repeat: 1 });
    };
  }

  onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (state.currentScene !== 'scene-cake') return;

    if (this.cakeGroup) {
      this.cakeGroup.rotation.y += 0.005;
      this.cakeGroup.position.y = Math.sin(Date.now() * 0.001) * 0.08;
    }

    // Animate flames
    this.flames.forEach(f => {
      if (f.visible) {
        f.children[0].scale.x = 1 + Math.sin(Date.now() * 0.01) * 0.15;
        f.children[0].scale.z = 1 + Math.cos(Date.now() * 0.012) * 0.1;
        f.position.y = 0.55 + Math.sin(Date.now() * 0.008) * 0.02;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

const cakeScene = new CakeScene();

// ============================================================
// SCENE 3: CAKE CUTTING
// ============================================================

class CuttingScene {
  constructor() {
    this.canvas = $('#cutting-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.knife = $('#knife');
    this.cutProgress = 0;
    this.isDragging = false;
    this.cutPath = [];
    this.slices = [];
    this.initialized = false;
  }

  start() {
    this.resize();
    if (!this.initialized) {
      this.setupKnife();
      this.initialized = true;
    }
    this.cutProgress = 0;
    this.cutPath = [];
    this.slices = [];
    state.cakeCut = false;
    $('#cutting-done').classList.add('hidden');
    $('#btn-cutting-next').classList.add('hidden');
    this.draw();
  }

  resize() {
    const area = $('#cutting-area');
    this.canvas.width = area.clientWidth;
    this.canvas.height = area.clientHeight;
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 20;
    const radius = Math.min(w, h) * 0.3;

    // Draw cake slices
    const sliceCount = 8;
    const cutAngle = (this.cutProgress / 100) * Math.PI * 2;

    for (let i = 0; i < sliceCount; i++) {
      const startAngle = (i / sliceCount) * Math.PI * 2 - Math.PI / 2;
      const endAngle = ((i + 1) / sliceCount) * Math.PI * 2 - Math.PI / 2;
      const separation = state.cakeCut ? 15 : 0;
      const midAngle = (startAngle + endAngle) / 2;
      const offsetX = Math.cos(midAngle) * separation;
      const offsetY = Math.sin(midAngle) * separation;

      ctx.save();
      ctx.translate(cx + offsetX, cy + offsetY);

      // Slice body
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, '#FF6B9D');
      grad.addColorStop(0.5, '#FFF8E7');
      grad.addColorStop(1, '#5C3317');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Frosting top
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.85, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = '#FF6B9D';
      ctx.fill();

      ctx.restore();
    }

    // Cut line
    if (this.cutProgress > 0 && this.cutProgress < 100) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const angle = (this.cutProgress / 100) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (!state.cakeCut) {
      requestAnimationFrame(() => this.draw());
    }
  }

  setupKnife() {
    const knife = this.knife;
    let offsetX = 0, offsetY = 0;

    const startDrag = (clientX, clientY) => {
      this.isDragging = true;
      const rect = knife.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;
      knife.style.transition = 'none';
    };

    const moveDrag = (clientX, clientY) => {
      if (!this.isDragging) return;
      const area = $('#cutting-area').getBoundingClientRect();
      const x = clientX - area.left - offsetX;
      const y = clientY - area.top - offsetY;
      knife.style.left = x + 'px';
      knife.style.top = y + 'px';

      // Calculate cut progress based on knife position relative to cake center
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2 + 20;
      const kx = x + 30;
      const ky = y + 75;
      const angle = Math.atan2(ky - cy, kx - cx) + Math.PI / 2;
      let progress = ((angle + Math.PI) / (Math.PI * 2)) * 100;
      progress = Math.max(0, Math.min(100, progress));

      if (progress > this.cutProgress) {
        this.cutProgress = progress;
        visualFX.sparkle(kx + area.left, ky + area.top);
      }

      if (this.cutProgress >= 95 && !state.cakeCut) {
        this.completeCut();
      }
    };

    const endDrag = () => {
      this.isDragging = false;
      knife.style.transition = 'transform 0.3s';
    };

    knife.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', endDrag);

    knife.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    document.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    document.addEventListener('touchend', endDrag);
  }

  completeCut() {
    state.cakeCut = true;
    confetti.cannon();
    emojiRain(2500, 14);
    visualFX.burst(window.innerWidth / 2, window.innerHeight / 2, 40);

    const done = $('#cutting-done');
    done.classList.remove('hidden');
    gsap.from(done, { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' });

    $('#btn-cutting-next').classList.remove('hidden');
    gsap.from('#btn-cutting-next', { y: 30, opacity: 0, duration: 0.6, delay: 0.5 });

    // Animate slices apart
    gsap.fromTo({}, { frame: 0 }, {
      frame: 15,
      duration: 1,
      onUpdate: () => this.draw(),
    });
  }
}

const cuttingScene = new CuttingScene();

// ============================================================
// SCENE 4: TYPING MESSAGE
// ============================================================

class MessageScene {
  constructor() {
    this.textEl = $('#typing-text');
    this.cursor = $('.typing-cursor');
    this.started = false;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.textEl.textContent = '';
    const text = CONFIG.birthdayMessage;
    let i = 0;

    const type = () => {
      if (i < text.length) {
        const char = text[i];
        if (char === '\n') {
          this.textEl.innerHTML += '<br>';
        } else if (char === ' ') {
          this.textEl.innerHTML += ' ';
        } else {
          this.textEl.innerHTML += `<span class="letter-glow">${char}</span>`;
        }
        i++;
        const delay = char === '\n' ? 300 : (char === ' ' ? 50 : 40 + Math.random() * 40);
        setTimeout(type, delay);
      } else {
        this.cursor.style.display = 'none';
        $('#btn-message-next').classList.remove('hidden');
        gsap.from('#btn-message-next', { y: 30, opacity: 0, duration: 0.6 });
      }
    };

    setTimeout(type, 800);
  }
}

const messageScene = new MessageScene();

// ============================================================
// SCENE 5: GIFT BOX
// ============================================================

function initGiftBox() {
  const box = $('#gift-box');
  box.addEventListener('click', () => {
    if (state.giftOpened) return;
    state.giftOpened = true;

    box.classList.add('opened');
    confetti.cannon();
    emojiRain(3000, 12);
    visualFX.burst(window.innerWidth / 2, window.innerHeight / 2, 80, ['#ffd700', '#fff', '#ff6b9d']);

    setTimeout(() => {
      const msg = $('#gift-message');
      msg.classList.remove('hidden');
      gsap.from(msg, { scale: 0, opacity: 0, duration: 1, ease: 'back.out(2)' });
    }, 1200);

    setTimeout(() => {
      $('#btn-gift-next').classList.remove('hidden');
      gsap.from('#btn-gift-next', { y: 30, opacity: 0, duration: 0.6 });
    }, 2000);
  });
}

// ============================================================
// SCENE 7: FINALE
// ============================================================

class FinaleScene {
  start() {
    $('#birthday-name').textContent = CONFIG.birthdayName;

    gsap.to('.finale-title', { opacity: 1, duration: 1.5, ease: 'power2.out' });

    finaleFireworks.startContinuous(800);
    confetti.cannon();

    this.spawnHearts();
    this.spawnBalloons();

    setTimeout(() => {
      const dreams = $('#finale-dreams');
      dreams.classList.remove('hidden');
      gsap.from(dreams, { y: 20, opacity: 0, duration: 1 });
    }, 3000);

    setTimeout(() => {
      const love = $('#finale-love');
      love.classList.remove('hidden');
      gsap.from(love, { scale: 0, opacity: 0, duration: 1, ease: 'back.out(2)' });
      confetti.cannon();
    }, 5500);
  }

  spawnHearts() {
    const container = $('#finale-hearts');
    setInterval(() => {
      if (state.currentScene !== 'scene-finale') return;
      const heart = document.createElement('div');
      heart.className = 'finale-heart';
      heart.textContent = ['❤️', '💖', '💕', '💗'][Math.floor(Math.random() * 4)];
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = (6 + Math.random() * 4) + 's';
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 10000);
    }, 600);
  }

  spawnBalloons() {
    const container = $('#finale-balloons');
    setInterval(() => {
      if (state.currentScene !== 'scene-finale') return;
      const el = document.createElement('div');
      el.className = 'landing-balloon';
      const size = 25 + Math.random() * 30;
      const color = CONFIG.balloonColors[Math.floor(Math.random() * CONFIG.balloonColors.length)];
      el.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size * 1.2}px;
        background: radial-gradient(circle at 35% 30%, ${lighten(color, 40)}, ${color});
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        animation-duration: ${10 + Math.random() * 5}s;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), 16000);
    }, 1500);
  }
}

const finaleScene = new FinaleScene();

// ============================================================
// DECORATIVE ELEMENTS
// ============================================================

function initDecorations() {
  // Floating hearts
  const heartsContainer = $('#floating-hearts');
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '♥';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (12 + Math.random() * 16) + 'px';
    heart.style.animationDuration = (12 + Math.random() * 8) + 's';
    heart.style.animationDelay = (Math.random() * 10) + 's';
    heartsContainer.appendChild(heart);
  }

  // Floating celebration emojis
  for (let i = 0; i < 10; i++) {
    const emoji = document.createElement('div');
    emoji.className = 'floating-emoji';
    emoji.textContent = CONFIG.celebrationEmojis[i % CONFIG.celebrationEmojis.length];
    emoji.style.left = Math.random() * 100 + '%';
    emoji.style.animationDuration = (14 + Math.random() * 10) + 's';
    emoji.style.animationDelay = (Math.random() * 12) + 's';
    emoji.style.fontSize = (16 + Math.random() * 14) + 'px';
    heartsContainer.appendChild(emoji);
  }

  // Butterflies
  const butterflyContainer = $('#butterflies');
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('div');
    b.className = 'butterfly';
    b.style.left = Math.random() * 80 + 10 + '%';
    b.style.animationDelay = (i * 3) + 's';
    b.innerHTML = '<div class="butterfly-wing left"></div><div class="butterfly-wing right"></div>';
    butterflyContainer.appendChild(b);
  }

  // Ribbons
  const ribbonContainer = $('#ribbons');
  for (let i = 0; i < 16; i++) {
    const ribbon = document.createElement('div');
    ribbon.className = 'ribbon-strand';
    ribbon.style.left = Math.random() * 100 + '%';
    ribbon.style.animationDuration = (8 + Math.random() * 6) + 's';
    ribbon.style.animationDelay = (Math.random() * 8) + 's';
    ribbon.style.background = `linear-gradient(to bottom, ${CONFIG.balloonColors[i % CONFIG.balloonColors.length]}, transparent)`;
    ribbonContainer.appendChild(ribbon);
  }
}

// ============================================================
// PARALLAX — Mouse-reactive scene depth
// ============================================================

function initParallax() {
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function update() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    $$('.ambient-glow').forEach((glow, i) => {
      const factor = (i + 1) * 8;
      glow.style.transform = glow.classList.contains('glow-3')
        ? `translate(calc(-50% + ${currentX * factor}px), calc(-50% + ${currentY * factor}px))`
        : `translate(${currentX * factor}px, ${currentY * factor}px)`;
    });

    const activeContent = document.querySelector('.scene.active .landing-content, .scene.active .scene-header, .scene.active .finale-content');
    if (activeContent) {
      activeContent.style.transform = `translate(${currentX * 6}px, ${currentY * 6}px)`;
    }

    requestAnimationFrame(update);
  }
  update();
}

// ============================================================
// DOUBLE-CLICK CONFETTI CANNON
// ============================================================

function initDoubleClickCelebration() {
  let lastClick = 0;
  document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClick < 350) {
      confetti.burst(e.clientX, e.clientY, 60, 360);
      visualFX.burst(e.clientX, e.clientY, 35);
      emojiRain(1500, 25);
    }
    lastClick = now;
  });
}

// ============================================================
// BUTTON RIPPLE EFFECT
// ============================================================

function createRipple(e, btn) {
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);

  if (btn.classList.contains('btn-primary')) {
    btn.style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
    btn.style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
  }
}

function initButtons() {
  $$('.btn-primary, .btn-secondary, .btn-next').forEach(btn => {
    btn.addEventListener('click', (e) => createRipple(e, btn));
  });

  $$('.scene-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.next;
      if (next) goToScene(next);
    });
  });

  $$('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      if (!state.landingComplete && dot.dataset.scene !== '0') return;
      const idx = parseInt(dot.dataset.scene);
      goToScene(sceneOrder[idx]);
    });
  });
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  $('#birthday-name').textContent = CONFIG.birthdayName;

  initLanding();
  initDecorations();
  initGiftBox();
  initParallax();
  initDoubleClickCelebration();
  initButtons();
});
