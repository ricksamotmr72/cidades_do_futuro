import { store } from '../core/store.js';
import { byId, escapeHTML } from '../utils/dom.js';

const PLACEHOLDER = (text) =>
    `https://placehold.co/640x360/0b0f24/00f3ff?text=${encodeURIComponent(text)}`;

const grid = byId('videoGrid');
const countBadge = byId('videoCountBadge');
const noResults = byId('noResults');

let total = 0;

/** Remove acentos, símbolos e espaços: "3b", "3º B" e "Turma 3 b" encontram o mesmo vídeo. */
const normalize = (text) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[º°ª\s]/g, '').toLowerCase();

function cardTemplate(video, index) {
    const turma = escapeHTML(video.turma);
    // As 3 primeiras capas aparecem logo na tela: carregam com prioridade
    const loading = index < 3 ? 'eager' : 'lazy';

    return `
        <li class="card" data-id="${video.id}" data-search="${escapeHTML(normalize(video.turma))}">
            <button type="button" class="card__media" data-action="open-video" data-id="${video.id}" aria-label="Assistir ${turma}">
                <img class="card__img" src="${escapeHTML(video.capa)}" alt="" width="640" height="360"
                    loading="${loading}" decoding="async" data-fallback="${escapeHTML(PLACEHOLDER(video.turma))}">
                <span class="card__scan" aria-hidden="true"></span>
                <span class="card__preview-tag" aria-hidden="true"><span class="card__preview-dot"></span> Prévia</span>
                <span class="card__shade" aria-hidden="true"></span>
                <span class="card__watched-tag"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Visto!</span>
                <span class="card__play" aria-hidden="true"><span class="card__play-icon"><i class="fa-solid fa-play"></i></span></span>
            </button>
            <div class="card__body">
                <h4 class="card__title">${turma}</h4>
                <div class="card__actions">
                    <button type="button" class="toggle-btn toggle-btn--icon toggle-btn--like" data-action="toggle-like" data-id="${video.id}" aria-label="Curtir ${turma}" aria-pressed="false">
                        <i class="fa-regular fa-star" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="toggle-btn toggle-btn--icon toggle-btn--watch" data-action="toggle-watched" data-id="${video.id}" aria-label="Marcar ${turma} como visto" aria-pressed="false">
                        <i class="fa-solid fa-check" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </li>`;
}

/** Atualiza só o card afetado, sem redesenhar a grade inteira. */
function syncCard(id) {
    const card = grid.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;

    const watched = store.isWatched(id);
    const liked = store.isLiked(id);

    card.classList.toggle('is-watched', watched);
    card.querySelector('.toggle-btn--watch').setAttribute('aria-pressed', String(watched));

    const likeBtn = card.querySelector('.toggle-btn--like');
    likeBtn.setAttribute('aria-pressed', String(liked));
    likeBtn.querySelector('i').className = `fa-${liked ? 'solid' : 'regular'} fa-star`;
}

export const videoGrid = {
    /** @param {ReadonlyArray<import('../config/videos.js').Video>} videos */
    init(videos) {
        total = videos.length;
        grid.innerHTML = videos.map(cardTemplate).join('');
        videos.forEach((v) => syncCard(v.id));

        // Capa reserva caso a imagem falhe (erro não "borbulha": usa captura)
        grid.addEventListener('error', (event) => {
            const img = event.target;
            if (img instanceof HTMLImageElement && img.dataset.fallback && img.src !== img.dataset.fallback) {
                img.src = img.dataset.fallback;
            }
        }, true);

        store.subscribe(({ id }) => syncCard(id));
        this.filter('');
    },

    filter(query) {
        const term = normalize(query);
        let visible = 0;

        grid.querySelectorAll('.card').forEach((card) => {
            const match = card.dataset.search.includes(term);
            card.hidden = !match;
            if (match) visible++;
        });

        countBadge.textContent = `${visible} de ${total} turmas`;
        noResults.hidden = visible > 0;
    },
};
