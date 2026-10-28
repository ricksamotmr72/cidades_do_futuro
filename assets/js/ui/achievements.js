import { ACHIEVEMENTS } from '../config/achievements.js';
import { store } from '../core/store.js';
import { byId, escapeHTML } from '../utils/dom.js';

const progressText = byId('progressText');
const progressVal = byId('badgeProgressVal');
const progressTrack = byId('badgeProgress');
const progressBar = byId('badgeProgressBar');
const list = byId('achievementsContainer');

let total = 0;

function render() {
    const count = store.watchedCount();
    const percent = total ? Math.round((count / total) * 100) : 0;

    progressText.textContent = `${count}/${total}`;
    progressVal.textContent = `${count} / ${total} (${percent}%)`;
    progressBar.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(percent));

    list.innerHTML = ACHIEVEMENTS.map((a) => {
        const unlocked = count >= a.req;
        return `
            <li class="achievement${unlocked ? ' is-unlocked' : ''}">
                <span class="achievement__icon" aria-hidden="true">${a.icon}</span>
                <div>
                    <div class="achievement__title">${escapeHTML(a.title)}${unlocked ? '' : ' <span class="sr-only">(bloqueada)</span>'}</div>
                    <div class="achievement__desc">${escapeHTML(a.desc)}</div>
                </div>
            </li>`;
    }).join('');
}

export const achievements = {
    init(totalVideos) {
        total = totalVideos;
        store.subscribe(({ kind }) => {
            if (kind === 'watched') render();
        });
        render();
    },
};
