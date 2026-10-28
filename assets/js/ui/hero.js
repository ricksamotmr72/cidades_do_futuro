import { byId, escapeHTML } from '../utils/dom.js';

const AUTOPLAY_MS = 3000; // tempo de cada destaque na tela

const section = byId('heroSection');
const bg = byId('heroBgImage');
const title = byId('heroTurmaName');
const counter = byId('heroCounter');
const dotsEl = byId('heroDots');

let items = [];
let current = 0;
let timer = 0;
let paused = false;

/** Baixa a capa antes de exibir, para a troca não "piscar". */
function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => resolve();
        img.src = src;
    });
}

async function render(index) {
    current = index;
    const item = items[index];

    title.textContent = item.turma;
    counter.textContent = `${index + 1} / ${items.length}`;
    dotsEl.querySelectorAll('.hero__dot').forEach((dot, i) => {
        dot.setAttribute('aria-current', String(i === index));
    });

    bg.classList.add('is-changing');
    await preloadImage(item.capa);
    if (current !== index) return; // usuário já trocou de slide
    bg.style.backgroundImage = `url("${item.capa}")`;
    bg.classList.remove('is-changing');

    // Adianta o download da próxima capa
    preloadImage(items[(index + 1) % items.length].capa);
}

function schedule() {
    clearInterval(timer);
    if (!paused) timer = setInterval(() => hero.next(), AUTOPLAY_MS);
}

export const hero = {
    /** @param {ReadonlyArray<import('../config/videos.js').Video>} videos */
    init(videos) {
        items = videos;
        dotsEl.innerHTML = items
            .map((v, i) => `<button type="button" class="hero__dot" data-action="hero-go" data-index="${i}" aria-label="Ir para ${escapeHTML(v.turma)}"></button>`)
            .join('');

        // Pausa ao passar o mouse ou focar com o teclado. No toque o
        // "mouseenter" ficaria preso até tocar em outro lugar, por isso só mouse.
        section.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && this.pause());
        section.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && this.resume());
        section.addEventListener('focusin', () => this.pause());
        section.addEventListener('focusout', () => this.resume());

        this.enableSwipe();

        render(0);
        schedule();
    },

    /** Deslizar o dedo para os lados troca o destaque (celulares e tablets). */
    enableSwipe() {
        const MIN_DISTANCE = 40;
        let startX = 0;
        let startY = 0;

        section.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        section.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            // Ignora gestos verticais (rolagem da página)
            if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
            this.goTo((current + (dx < 0 ? 1 : -1) + items.length) % items.length);
        }, { passive: true });
    },

    get currentVideo() {
        return items[current];
    },

    next() {
        render((current + 1) % items.length);
    },

    prev() {
        render((current - 1 + items.length) % items.length);
    },

    goTo(index) {
        render(index);
        schedule(); // reinicia a contagem após interação manual
    },

    pause() {
        paused = true;
        clearInterval(timer);
    },

    resume() {
        paused = false;
        schedule();
    },
};
