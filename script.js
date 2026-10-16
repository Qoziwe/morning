/**
 * Good Morning interactive script for Adalyat
 * Handles timezones, iOS audio playback on user gesture, and particle canvas.
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------
  // 1. Timezone Clocks (Malaysia vs Czechia)
  // -------------------------------------------------------------
  const lekimTimeEl = document.getElementById("lekim-time");
  const adalyatTimeEl = document.getElementById("adalyat-time");
  const currentDateEl = document.getElementById("current-date");

  const updateTimes = () => {
    const now = new Date();

    // Malaysia Time (Lekim)
    const lekimFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kuala_Lumpur",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    lekimTimeEl.textContent = lekimFormatter.format(now);

    // Czechia Time (Adalyat)
    const czechFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Prague",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    adalyatTimeEl.textContent = czechFormatter.format(now);

    // Date Display
    const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Prague",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    currentDateEl.textContent = dateFormatter.format(now);
  };

  updateTimes();
  setInterval(updateTimes, 1000);

  // -------------------------------------------------------------
  // 2. Audio & Envelope Interactions (iOS Safari Compliant)
  // -------------------------------------------------------------
  const envelope = document.getElementById("envelope");
  const sealBtn = document.getElementById("seal-btn");
  const bgMusic = document.getElementById("bg-music");
  const musicIndicator = document.getElementById("music-indicator");
  let isEnvelopeOpen = false;

  // Handle user gesture activation for iOS
  const handleOpenLetter = () => {
    if (isEnvelopeOpen) return;
    isEnvelopeOpen = true;

    // Open the envelope
    envelope.classList.add("is-open");

    // Play audio directly on user touch/click
    bgMusic
      .play()
      .then(() => {
        musicIndicator.classList.add("is-visible");
      })
      .catch((err) => {
        console.warn("Audio playback restricted by browser policy:", err);
        // Even if restricted, display indicator so user can tap manually
        musicIndicator.classList.add("is-visible");
      });

    // Trigger celebratory heart burst
    burstHearts();
  };

  sealBtn.addEventListener("click", handleOpenLetter);

  // Allow toggling play/pause via the bottom music pill
  musicIndicator.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicIndicator.classList.add("is-visible");
    } else {
      bgMusic.pause();
      musicIndicator.classList.remove("is-visible");
    }
  });

  // -------------------------------------------------------------
  // 3. Canvas Ambient Particles & Heart Burst
  // -------------------------------------------------------------
  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, isHeartBurst = false) {
      this.x = x ?? Math.random() * canvas.width;
      this.y = y ?? canvas.height + Math.random() * 20;
      this.size = isHeartBurst ? Math.random() * 8 + 6 : Math.random() * 3 + 1;
      this.speedY = isHeartBurst
        ? (Math.random() - 0.7) * 7
        : -(Math.random() * 0.8 + 0.3);
      this.speedX = isHeartBurst
        ? (Math.random() - 0.5) * 8
        : (Math.random() - 0.5) * 0.5;
      this.alpha = 1;
      this.fadeRate = isHeartBurst ? Math.random() * 0.015 + 0.01 : 0.002;
      this.isHeart = isHeartBurst || Math.random() > 0.65;
      this.color = isHeartBurst ? "#c05c54" : "#e4a59f";
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.fadeRate;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.fillStyle = this.color;

      if (this.isHeart) {
        // Draw heart shape
        const s = this.size;
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
        ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
        ctx.fill();
      } else {
        // Draw circular ambient dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  const burstHearts = () => {
    const rect = sealBtn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 35; i++) {
      particles.push(new Particle(originX, originY, true));
    }
  };

  // Animation Loop
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn ambient particles periodically
    if (particles.length < 40 && Math.random() < 0.1) {
      particles.push(new Particle());
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();

      if (particles[i].alpha <= 0 || particles[i].y < -20) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  };

  animate();
});
