import { readJSON, writeJSON } from './storage.js';

// Chaves mantidas iguais às da versão anterior para preservar o progresso dos alunos.
const KEYS = Object.freeze({
    watched: 'cine_futuro_watched',
    liked: 'cine_futuro_liked',
});

const watched = new Set(readJSON(KEYS.watched, []));
const liked = new Set(readJSON(KEYS.liked, []));
const listeners = new Set();

function persist() {
    writeJSON(KEYS.watched, [...watched]);
    writeJSON(KEYS.liked, [...liked]);
}

function emit(change) {
    listeners.forEach((fn) => fn(change));
}

function setFlag(set, kind, id, value) {
    if (set.has(id) === value) return value;
    value ? set.add(id) : set.delete(id);
    persist();
    emit({ kind, id, value });
    return value;
}

/** Estado do usuário (vistos e curtidos), com notificação de mudanças. */
export const store = {
    isWatched: (id) => watched.has(id),
    isLiked: (id) => liked.has(id),
    watchedCount: () => watched.size,

    setWatched: (id, value) => setFlag(watched, 'watched', id, value),
    toggleWatched: (id) => setFlag(watched, 'watched', id, !watched.has(id)),
    toggleLiked: (id) => setFlag(liked, 'liked', id, !liked.has(id)),

    /** @param {(change: {kind: string, id: number, value: boolean}) => void} fn */
    subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    },
};
