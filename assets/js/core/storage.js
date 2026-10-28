/**
 * Acesso seguro ao localStorage: nunca lança erro (modo anônimo,
 * iframes com sandbox ou cota cheia simplesmente ignoram a gravação).
 */
export function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* sem persistência disponível */
    }
}
