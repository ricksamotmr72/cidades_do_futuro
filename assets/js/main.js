/**
 * Ponto de entrada: inicializa os módulos e liga as ações da interface.
 * Os botões declaram a ação no HTML (data-action) e um único listener
 * trata todos os cliques (delegação de eventos).
 */
import { VIDEOS } from './config/videos.js';
import { store } from './core/store.js';
import { sound } from './services/sound.js';
import { achievements } from './ui/achievements.js';
import { burstStars, starfield } from './ui/effects.js';
import { videoGrid } from './ui/grid.js';
import { hero } from './ui/hero.js';
import { player } from './ui/player.js';
import { showToast } from './ui/toast.js';
import { byId } from './utils/dom.js';

const videosById = new Map(VIDEOS.map((v) => [v.id, v]));
const badgeModal = byId('badgeModal');
const searchInput = byId('searchInput');
const clearSearchBtn = byId('clearSearchBtn');
const soundBtn = byId('soundBtn');

/* ---------- Ações ---------- */
function openVideo(id) {
    const video = videosById.get(id);
    if (!video) return;
    sound.play('whoosh');
    store.setWatched(id, true);
    player.open(video);
}

function toggleLike(id, event) {
    const liked = store.toggleLiked(id);
    sound.play('star');
    if (liked && event.detail > 0 && !event.target.closest('dialog')) burstStars(event.clientX, event.clientY);
    showToast(liked ? 'Estrela adicionada! ⭐' : 'Curtida removida', '⭐');
}

function toggleWatched(id) {
    const watched = store.toggleWatched(id);
    sound.play(watched ? 'success' : 'click');
    showToast(watched ? 'Marcado como visto! 🎉' : 'Desmarcado', '✅');
}

function toggleSound() {
    const enabled = sound.toggle();
    soundBtn.setAttribute('aria-pressed', String(enabled));
    soundBtn.querySelector('i').className = `fa-solid ${enabled ? 'fa-volume-high' : 'fa-volume-xmark'}`;
    showToast(enabled ? 'Sons ativados!' : 'Sons desativados.', enabled ? '🔔' : '🔕');
}

const actions = {
    'open-video': (id) => openVideo(id),
    'toggle-like': (id, event) => toggleLike(id, event),
    'toggle-watched': (id) => toggleWatched(id),
    'play-hero': () => openVideo(hero.currentVideo.id),
    'hero-prev': () => { sound.play('click'); hero.prev(); },
    'hero-next': () => { sound.play('click'); hero.next(); },
    'hero-go': (_, __, el) => { sound.play('click'); hero.goTo(Number(el.dataset.index)); },
    'open-badges': () => { sound.play('whoosh'); badgeModal.showModal(); },
    'close-modal': (_, __, el) => { sound.play('click'); el.closest('dialog')?.close(); },
    'toggle-sound': () => toggleSound(),
};

document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const handler = actions[el.dataset.action];
    if (!handler) return;
    handler(Number(el.dataset.id), event, el);
});

/* ---------- Busca ---------- */
searchInput.addEventListener('input', () => {
    clearSearchBtn.hidden = !searchInput.value.trim();
    videoGrid.filter(searchInput.value);
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.hidden = true;
    videoGrid.filter('');
    searchInput.focus();
});

/* ---------- Modal de conquistas: fecha ao clicar no fundo ---------- */
badgeModal.addEventListener('click', (event) => {
    if (event.target === badgeModal) badgeModal.close();
});

/* ---------- Inicialização ---------- */
starfield.init();
hero.init(VIDEOS);
videoGrid.init(VIDEOS);
achievements.init(VIDEOS.length);

// Enquanto o vídeo toca, animações de fundo param para não disputar CPU/GPU
player.init({
    onOpen: () => { hero.pause(); starfield.pause(); },
    onClose: () => { hero.resume(); starfield.resume(); },
});

// Economiza recursos quando a aba está em segundo plano
document.addEventListener('visibilitychange', () => {
    if (document.hidden) hero.pause();
    else if (!byId('videoModal').open) hero.resume();
});

window.__CINE_FUTURO_READY__ = true;
