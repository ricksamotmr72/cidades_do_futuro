import { byId, prefersReducedMotion } from '../utils/dom.js';

/* ==========================================================================
   Fundo de estrelas
   - desenha a ~30 fps (suficiente para o brilho suave)
   - pausa enquanto um vídeo toca, liberando CPU/GPU para o player
   ========================================================================== */
const STAR_COUNT = 65;
const FRAME_INTERVAL = 1000 / 30;

const starCanvas = byId('space-bg');
const starCtx = starCanvas.getContext('2d');
let stars = [];
let starRaf = 0;
let lastFrame = 0;

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createStars() {
    const { width: w, height: h } = starCanvas;
    stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random(),
        s: Math.random() * 0.04 + 0.01,
        c: Math.random() > 0.5 ? '#00f3ff' : '#9d4edd',
    }));
}

function drawStars(advance = true) {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    for (const s of stars) {
        if (advance) {
            s.a += s.s;
            if (s.a > 1 || s.a < 0) s.s = -s.s;
        }
        starCtx.globalAlpha = Math.abs(s.a) * 0.5;
        starCtx.fillStyle = s.c;
        starCtx.beginPath();
        starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        starCtx.fill();
    }
}

function starLoop(time) {
    starRaf = requestAnimationFrame(starLoop);
    if (time - lastFrame < FRAME_INTERVAL) return;
    lastFrame = time;
    drawStars();
}

export const starfield = {
    init() {
        resizeCanvas(starCanvas);
        createStars();

        let resizeTimer = 0;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resizeCanvas(starCanvas);
                createStars();
                drawStars(false);
            }, 150);
        });

        if (prefersReducedMotion()) drawStars(false);
        else this.resume();
    },

    pause() {
        cancelAnimationFrame(starRaf);
        starRaf = 0;
    },

    resume() {
        if (starRaf || prefersReducedMotion()) return;
        starRaf = requestAnimationFrame(starLoop);
    },
};

/* ==========================================================================
   Partículas de estrela ao curtir
   O loop só roda enquanto existem partículas na tela.
   ========================================================================== */
const particleCanvas = byId('particle-canvas');
const particleCtx = particleCanvas.getContext('2d');
let particles = [];
let particleRaf = 0;

function particleLoop() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) return false;

        particleCtx.globalAlpha = p.alpha;
        particleCtx.fillStyle = p.color;
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        particleCtx.fill();
        return true;
    });

    particleRaf = particles.length ? requestAnimationFrame(particleLoop) : 0;
}

export function burstStars(x, y) {
    if (prefersReducedMotion()) return;

    if (particleCanvas.width !== window.innerWidth || particleCanvas.height !== window.innerHeight) {
        resizeCanvas(particleCanvas);
    }

    for (let i = 0; i < 20; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            size: Math.random() * 6 + 4,
            color: Math.random() > 0.5 ? '#ec4899' : '#00f3ff',
            alpha: 1,
        });
    }

    if (!particleRaf) particleRaf = requestAnimationFrame(particleLoop);
}
