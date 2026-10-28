import { byId } from '../utils/dom.js';

const DURATION_MS = 3000;
const TRANSITION_MS = 300;

const toast = byId('toast');
const iconEl = byId('toastIcon');
const messageEl = byId('toastMessage');
const supportsPopover = typeof toast.showPopover === 'function';

let hideTimer = null;
let removeTimer = null;

export function showToast(message, icon = '🚀') {
    iconEl.textContent = icon;
    messageEl.textContent = message;

    clearTimeout(hideTimer);
    clearTimeout(removeTimer);

    // Como popover, o toast aparece até por cima de um modal aberto
    if (supportsPopover && !toast.matches(':popover-open')) toast.showPopover();
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    hideTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        removeTimer = setTimeout(() => {
            if (supportsPopover && toast.matches(':popover-open')) toast.hidePopover();
        }, TRANSITION_MS);
    }, DURATION_MS);
}
