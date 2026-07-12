/** 加载屏星空动画（从 index 内联脚本迁出） */
export function startLoadingScreen(): void {
  const canvas = document.getElementById('loading-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];
  const resize = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 30 + 10,
      alpha: Math.random() * 0.5 + 0.3,
    });
  }

  const draw = (): void => {
    ctx.fillStyle = '#050515';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.y += s.speed * 0.016;
      if (s.y > canvas.height + 5) {
        s.y = -5;
        s.x = Math.random() * canvas.width;
      }
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
    if (!(window as StgWindow)._loadingDone) requestAnimationFrame(draw);
  };
  draw();

  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  let progress = 0;
  const messages = ['加载核心引擎...', '初始化战斗系统...', '加载武器模块...', '准备就绪!'];
  const interval = window.setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 95) progress = 95;
    if (bar) bar.style.width = `${progress}%`;
    if (text) text.textContent = messages[Math.min(Math.floor(progress / 25), messages.length - 1)];
    if ((window as StgWindow)._loadingDone) {
      if (bar) bar.style.width = '100%';
      if (text) text.textContent = '准备就绪!';
      window.clearInterval(interval);
    }
  }, 150);
}

interface StgWindow extends Window {
  _loadingDone?: boolean;
}

declare const window: StgWindow;
