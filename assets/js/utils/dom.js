/** Busca um elemento pelo id e falha cedo se ele não existir no HTML. */
export function byId(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Elemento #${id} não encontrado`);
    return el;
}

/** Escapa texto para uso seguro dentro de templates HTML. */
export function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
