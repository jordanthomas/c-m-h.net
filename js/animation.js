class ParticleSystem {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "0";
    document.body.appendChild(this.canvas);

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const particleCount = Math.floor(
      (window.innerWidth * window.innerHeight) / 15000
    );
    this.particles = [];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getRandomColor(),
      });
    }
  }

  getRandomColor() {
    const colors = [
      "rgba(255, 107, 107, ",
      "rgba(78, 205, 196, ",
      "rgba(69, 183, 209, ",
      "rgba(150, 206, 180, ",
      "rgba(255, 234, 167, ",
      "rgba(255, 255, 255, ",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());

    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener("click", (e) => {
      this.createRipple(e.clientX, e.clientY);
    });
  }

  createRipple(x, y) {
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + (Math.random() - 0.5) * 0.75;
      const velocity = 2 + Math.random() * 2;

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 3 + 2,
        opacity: 0.8,
        color: this.getRandomColor(),
        life: 90,
        maxLife: 90,
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;

      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distanceToCursor = Math.sqrt(dx * dx + dy * dy);

      if (distanceToCursor < 100) {
        const force = (100 - distanceToCursor) / 100;
        particle.vx -= (dx / distanceToCursor) * force * 0.01;
        particle.vy -= (dy / distanceToCursor) * force * 0.01;
      }

      // click-spawned particles die after a bit
      if (particle.life !== undefined) {
        particle.life--;
        particle.opacity = (particle.life / particle.maxLife) * 0.8;

        if (particle.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      }

      // wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      particle.vx *= 0.999;
      particle.vy *= 0.999;
    }
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle) => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color + particle.opacity + ")";
      this.ctx.fill();

      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color + "0.3)";
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    this.drawConnections();
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = ((120 - distance) / 120) * 0.1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    this.updateParticles();
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const particleSystem = new ParticleSystem();

  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 1s ease-in-out";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
});
