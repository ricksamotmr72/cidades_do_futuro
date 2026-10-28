import { store } from '../core/store.js';
import { resolveExternalLink, resolveSources } from '../services/video-source.js';
import { byId } from '../utils/dom.js';
import { showToast } from './toast.js';

const dialog = byId('videoModal');
const badge = byId('modalTurmaBadge');
const loader = byId('playerLoader');
const iframe = byId('modalIframe');
const nativeVideo = byId('modalVideoNative');
const externalBtn = byId('modalExternalBtn');
const externalLabel = byId('modalExternalLabel');
const likeBtn = byId('modalLikeBtn');
const watchBtn = byId('modalWatchBtn');

let current = null;
let sources = [];
let attempt = 0;
let hooks = { onOpen() {}, onClose() {} };

const setLoading = (loading) => {
    loader.hidden = !loading;
};

/** Para tudo e libera a rede/memória do vídeo anterior. */
function resetMedia() {
    iframe.onload = null;
    iframe.src = 'about:blank';
    iframe.hidden = true;

    nativeVideo.pause();
    nativeVideo.removeAttribute('src');
    nativeVideo.removeAttribute('poster');
    nativeVideo.load();
    nativeVideo.hidden = true;
}

/** Tenta a próxima fonte da lista (local → YouTube → Drive). */
function playNextSource() {
    const source = sources[attempt++];

    if (!source) {
        setLoading(false);
        showToast('Não foi possível carregar este vídeo.', '⚠️');
        return;
    }

    if (source.type === 'native') {
        iframe.hidden = true;
        nativeVideo.hidden = false;
        nativeVideo.poster = current.capa;
        nativeVideo.src = source.src;
        // Autoplay pode ser bloqueado pelo navegador; os controles continuam visíveis
        nativeVideo.play().catch(() => setLoading(false));
    } else {
        nativeVideo.hidden = true;
        iframe.hidden = false;
        iframe.onload = () => setLoading(false);
        iframe.src = source.src;
    }
}

function syncButtons() {
    if (!current) return;
    const liked = store.isLiked(current.id);
    const watched = store.isWatched(current.id);

    likeBtn.dataset.id = watchBtn.dataset.id = String(current.id);
    likeBtn.setAttribute('aria-pressed', String(liked));
    watchBtn.setAttribute('aria-pressed', String(watched));
    likeBtn.querySelector('span').textContent = liked ? 'Curtido' : 'Curtir';
    watchBtn.querySelector('span').textContent = watched ? 'Visto' : 'Marcar Visto';
}

export const player = {
    /** @param {{ onOpen?: () => void, onClose?: () => void }} [options] */
    init(options = {}) {
        hooks = { ...hooks, ...options };

        // Feedback de buffering no vídeo nativo
        nativeVideo.addEventListener('canplay', () => setLoading(false));
        nativeVideo.addEventListener('waiting', () => setLoading(true));
        nativeVideo.addEventListener('playing', () => setLoading(false));
        nativeVideo.addEventListener('error', () => {
            if (!dialog.open || !nativeVideo.getAttribute('src')) return;
            nativeVideo.removeAttribute('src');
            nativeVideo.hidden = true;
            setLoading(true);
            playNextSource(); // arquivo local ausente: cai para YouTube/Drive
        });

        // Fecha clicando fora do conteúdo (no fundo escuro)
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });

        // Disparado tanto pelo botão quanto pela tecla Esc
        dialog.addEventListener('close', () => {
            resetMedia();
            current = null;
            hooks.onClose();
        });

        store.subscribe(({ id }) => {
            if (current && current.id === id) syncButtons();
        });
    },

    /** @param {import('../config/videos.js').Video} video */
    open(video) {
        resetMedia();
        current = video;
        sources = resolveSources(video);
        attempt = 0;

        badge.textContent = video.turma;
        const external = resolveExternalLink(video);
        externalBtn.hidden = !external;
        if (external) {
            externalBtn.href = external.href;
            externalLabel.textContent = external.label;
            externalBtn.setAttribute('aria-label', external.label);
        }

        syncButtons();
        setLoading(true);

        if (!dialog.open) dialog.showModal();
        hooks.onOpen();
        playNextSource();
    },

    close() {
        if (dialog.open) dialog.close();
    },
};
