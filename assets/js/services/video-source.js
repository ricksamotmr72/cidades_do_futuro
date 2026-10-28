/**
 * Converte um item do catálogo em fontes de reprodução, já ordenadas
 * da mais rápida para a mais lenta. O player tenta uma por vez.
 *
 * @typedef {{ type: 'native' | 'iframe', src: string }} Source
 */

const driveEmbed = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const driveView = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;

// youtube-nocookie carrega menos scripts de rastreamento que o embed padrão
const youtubeEmbed = (id) =>
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`;
const youtubeWatch = (id) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;

/** @returns {Source[]} */
export function resolveSources(video) {
    const sources = [];
    if (video.arquivoLocal) sources.push({ type: 'native', src: video.arquivoLocal });
    if (video.youtubeId) sources.push({ type: 'iframe', src: youtubeEmbed(video.youtubeId) });
    if (video.driveId) sources.push({ type: 'iframe', src: driveEmbed(video.driveId) });
    return sources;
}

/** Link para abrir o vídeo fora do site (nova aba). */
export function resolveExternalLink(video) {
    if (video.youtubeId) return { href: youtubeWatch(video.youtubeId), label: 'Abrir no YouTube' };
    if (video.driveId) return { href: driveView(video.driveId), label: 'Abrir no Drive' };
    if (video.arquivoLocal) return { href: video.arquivoLocal, label: 'Abrir arquivo' };
    return null;
}
