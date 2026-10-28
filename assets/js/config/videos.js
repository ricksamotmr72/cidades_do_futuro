/**
 * Catálogo dos vídeos do projeto.
 *
 * Cada vídeo pode ter até três fontes. O player usa a primeira disponível,
 * nesta ordem de prioridade (da mais rápida para a mais lenta):
 *
 *   1. arquivoLocal — MP4 na pasta assets/videos (carrega mais rápido; veja
 *                     scripts/otimizar-videos.ps1 para preparar os arquivos)
 *   2. youtubeId    — vídeo "não listado" no YouTube (streaming adaptativo)
 *   3. driveId      — arquivo público no Google Drive (mais lento)
 *
 * Se o arquivo local não existir ou falhar, o player cai automaticamente
 * para o YouTube/Drive.
 *
 * @typedef {Object} Video
 * @property {number} id            Identificador único (usado no progresso salvo)
 * @property {string} turma         Nome exibido
 * @property {string} capa          Imagem de capa (16:9)
 * @property {string|null} [arquivoLocal]
 * @property {string|null} [youtubeId]
 * @property {string|null} [driveId]
 */

const capa = (unsplashId) =>
    `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=640&q=70`;

/** @type {ReadonlyArray<Video>} */
export const VIDEOS = Object.freeze([
    { id: 1, turma: 'Turma 3º A', capa: capa('1508614589041-895b88991e3e'), arquivoLocal: null, driveId: '1dBTWgRO30goEZl9aEZCYAHZELOpysSL2' },
    { id: 2, turma: 'Turma 3º B', capa: capa('1518005020951-eccb494ad742'), arquivoLocal: null, driveId: '19LOBXrs6HtEP29BN1_dd1n4ub5NTFNv_' },
    { id: 3, turma: 'Turma 3º C', capa: capa('1530836369250-ef72a3f5cda8'), arquivoLocal: null, driveId: '1i9ES98fCpUvLh9VkS1LN80WL23FDM9On' },
    { id: 4, turma: 'Turma 3º D', capa: capa('1485827404703-89b55fcc595e'), arquivoLocal: null, driveId: '1R_hGPo9QpZddkdXn0SF_pvQkKpMx4hV-' },
    { id: 5, turma: 'Turma 3º E', capa: capa('1519331379826-f10be5486c6f'), arquivoLocal: null, driveId: '1Sgg9XdYVdnG9c9VF5Fx1WZr1klVZ3tgu' },
    { id: 6, turma: 'Turma 3º F', capa: capa('1526374965328-7f61d4dc18c5'), arquivoLocal: null, driveId: '1clHb-y82Y51BuUyAQqkJyTaWS_TuhACt' },
    { id: 7, turma: 'Turma 3º G', capa: capa('1470071459604-3b5ec3a7fe05'), arquivoLocal: null, driveId: '1oSe-GqDER2FbjDH8TAOim18r7rNmJEuD' },
    { id: 8, turma: 'Turma 3º H', capa: capa('1466611653911-95081537e5b7'), arquivoLocal: null, driveId: '1JmsRIaBAib342hfrHOCcA2l4Iked0d4a' },
    { id: 9, turma: 'Turma 3º I', capa: capa('1519501025264-65ba15a82390'), arquivoLocal: null, driveId: '1sJJhRH7m5zYTv5H1PfULW0-D3qO5V8p-' },
]);
