/**
 * Good Morning Card — Animation & Interaction Script
 *
 * Flawless Single-Element Flow:
 * 1. Envelope sits centered on screen with seal & tap button.
 * 2. Click envelope/button/seal:
 *    - Music starts & music pill appears.
 *    - Seal pops & fades with heart burst.
 *    - Envelope flap rotates open 180° upwards.
 * 3. Folded paper (.letter) slides UP out from inside the envelope pocket.
 * 4. Envelope pieces (.env-fall) drop DOWN off the screen.
 * 5. That EXACT SAME paper (.letter) glides to screen center and UNFOLDS!
 * 6. Internal scroll enabled on card, page remains strictly locked at 100dvh.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──
  const stage = document.getElementById('stage');
  const tapBtn = document.getElementById('tap-btn');
  const seal = document.getElementById('seal');
  const flap = document.getElementById('flap');
  const letter = document.getElementById('letter');
  const letterInner = document.getElementById('letter-inner');
  const replayBtn = document.getElementById('replay-btn');
  const envFallElements = document.querySelectorAll('.env-fall');
  const bgMusic = document.getElementById('bg-music');
  const musicPill = document.getElementById('music-pill');
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  let opened = false;
  let particles = [];

  // Prevent browser from caching audio when user replaces music.mp3
  bgMusic.src = `music.mp3?t=${Date.now()}`;
  bgMusic.load();

  // ── Canvas Setup ──
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // ── Particle System ──
  class Particle {
    constructor(x, y, type = 'ambient') {
      this.type = type;
      this.x = x ?? Math.random() * canvas.width;
      this.y = y ?? Math.random() * canvas.height;

      if (type === 'heart') {
        this.size = Math.random() * 10 + 8;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.75) * 7.5;
        this.gravity = 0.12;
        this.alpha = 1;
        this.fadeRate = Math.random() * 0.012 + 0.008;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.08;
        this.color = ['#e8617a', '#f0b866', '#ff708d', '#ffb3c1', '#f06292'][
          Math.floor(Math.random() * 5)
        ];
      } else if (type === 'sparkle') {
        this.size = Math.random() * 3.5 + 2;
        this.speedX = (Math.random() - 0.5) * 4.5;
        this.speedY = -(Math.random() * 5 + 1.5);
        this.gravity = 0.06;
        this.alpha = 1;
        this.fadeRate = Math.random() * 0.018 + 0.01;
        this.color = '#f0b866';
        this.rotation = 0;
        this.rotSpeed = 0;
      } else {
        // Ambient dust / stars
        this.size = Math.random() * 2 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = -(Math.random() * 0.35 + 0.1);
        this.gravity = 0;
        this.alpha = Math.random() * 0.4 + 0.1;
        this.fadeRate = 0.0005;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.color =
          Math.random() > 0.5
            ? 'rgba(240, 184, 102, 0.45)'
            : 'rgba(232, 97, 122, 0.35)';
        this.rotation = 0;
        this.rotSpeed = 0;
      }
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.alpha -= this.fadeRate;
      this.rotation += this.rotSpeed;

      if (this.type === 'ambient') {
        this.twinkle += this.twinkleSpeed;
        this.alpha = Math.max(0, Math.sin(this.twinkle) * 0.25 + 0.2);
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);

      if (this.type === 'heart') {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s, -s, -s * 0.4, 0, s * 0.5);
        ctx.bezierCurveTo(s, -s * 0.4, s * 0.5, -s, 0, -s * 0.3);
        ctx.fill();
      } else if (this.type === 'sparkle') {
        ctx.fillStyle = this.color;
        const s = this.size;
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i;
          ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
          const mid = angle + Math.PI / 4;
          ctx.lineTo(Math.cos(mid) * s * 0.3, Math.sin(mid) * s * 0.3);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    isDead() {
      return this.alpha <= 0 || this.y > canvas.height + 60 || this.y < -60;
    }
  }

  const burstHearts = (cx, cy, count = 35) => {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(cx, cy, 'heart'));
    }
    for (let i = 0; i < 16; i++) {
      particles.push(new Particle(cx, cy, 'sparkle'));
    }
  };

  // Animation Loop
  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ambientCount = particles.filter((p) => p.type === 'ambient').length;
    if (ambientCount < 40 && Math.random() < 0.08) {
      particles.push(
        new Particle(Math.random() * canvas.width, canvas.height + 10, 'ambient')
      );
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateParticles);
  };
  animateParticles();

  // ── Open Envelope Flow ──
  const handleOpen = () => {
    if (opened) return;
    opened = true;

    // 1. Play Background Music
    bgMusic
      .play()
      .then(() => musicPill.classList.add('visible'))
      .catch(() => musicPill.classList.add('visible'));

    // 2. Hide Tap Button
    tapBtn.style.opacity = '0';
    tapBtn.style.pointerEvents = 'none';
    tapBtn.style.transform = 'translateY(16px)';
    tapBtn.style.transition = 'all 0.35s ease';

    // 3. Seal Pops with Heart Burst
    const sealRect = seal.getBoundingClientRect();
    burstHearts(
      sealRect.left + sealRect.width / 2,
      sealRect.top + sealRect.height / 2,
      35
    );
    seal.classList.add('hidden');

    // 4. Envelope Flap Opens Upwards
    flap.classList.add('open');

    // 5. Letter slides UP out of envelope pocket (650ms)
    setTimeout(() => {
      letter.classList.add('slide-up');
    }, 650);

    // 6. Envelope falls DOWN off the screen (1500ms)
    setTimeout(() => {
      envFallElements.forEach((el) => {
        el.classList.add('falling');
      });
    }, 1500);

    // 7. The SAME paper unfolds into screen center! (1850ms)
    setTimeout(() => {
      letter.classList.remove('slide-up');
      letter.classList.add('unfolded');
      if (letterInner) {
        letterInner.scrollTop = 0;
      }

      // Heart celebration burst at screen center
      burstHearts(window.innerWidth / 2, window.innerHeight * 0.42, 45);
    }, 1850);
  };

  // ── Bind Opening Triggers ──
  tapBtn.addEventListener('click', handleOpen);
  seal.addEventListener('click', handleOpen);
  flap.addEventListener('click', handleOpen);
  stage.addEventListener('click', (e) => {
    // If not already opened, allow opening by clicking the stage
    if (!opened) {
      handleOpen();
    }
  });

  // ── Prevent ANY scrolling while envelope is closed on screen ──
  window.addEventListener(
    'wheel',
    (e) => {
      if (!letter.classList.contains('unfolded')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!letter.classList.contains('unfolded')) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // ── Music Pill Toggle ──
  musicPill.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicPill.querySelectorAll('.eq-bars span').forEach((b) => {
        b.style.animationPlayState = 'running';
      });
    } else {
      bgMusic.pause();
      musicPill.querySelectorAll('.eq-bars span').forEach((b) => {
        b.style.animationPlayState = 'paused';
      });
    }
  });

  // ── Replay Button ──
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.reload();
    });
  }
});
