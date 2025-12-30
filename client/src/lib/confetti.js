// Lightweight confetti animation
export function fireConfetti(options = {}) {
  const {
    particleCount = 100,
    spread = 70,
    startVelocity = 30,
    decay = 0.95,
    gravity = 1,
    colors = ['#FF7A59', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899']
  } = options;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * startVelocity * (0.5 + Math.random() * 0.5),
      vy: Math.sin(angle) * startVelocity * (0.5 + Math.random() * 0.5) - Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  let frame = 0;
  const maxFrames = 150;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= decay;
      p.vy *= decay;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  animate();
}

export function fireworksConfetti() {
  const bursts = 5;
  for (let i = 0; i < bursts; i++) {
    setTimeout(() => {
      fireConfetti({
        particleCount: 50,
        startVelocity: 25 + Math.random() * 15,
        spread: 360
      });
    }, i * 200);
  }
}
