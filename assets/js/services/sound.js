/**
 * Efeitos sonoros sintetizados (sem arquivos de áudio para baixar).
 * Um único AudioContext é reaproveitado — criar um por clique vaza memória
 * e o navegador limita a quantidade de contextos abertos.
 */

const PRESETS = {
    click:   { freqs: [[400, 0], [800, 0.08, 'exp']], gain: 0.1, duration: 0.08 },
    star:    { freqs: [[523, 0], [659, 0.08], [783, 0.16]], gain: 0.15, duration: 0.25 },
    success: { freqs: [[300, 0], [900, 0.2, 'exp']], gain: 0.15, duration: 0.2 },
    whoosh:  { freqs: [[600, 0], [200, 0.12, 'exp']], gain: 0.08, duration: 0.12 },
};

let ctx = null;
let enabled = true;

function getContext() {
    if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

export const sound = {
    get enabled() {
        return enabled;
    },

    toggle() {
        enabled = !enabled;
        return enabled;
    },

    /** @param {keyof typeof PRESETS} type */
    play(type) {
        const preset = PRESETS[type];
        if (!enabled || !preset) return;

        try {
            const audio = getContext();
            if (!audio) return;

            const osc = audio.createOscillator();
            const gain = audio.createGain();
            osc.connect(gain).connect(audio.destination);

            const now = audio.currentTime;
            for (const [freq, at, ramp] of preset.freqs) {
                if (ramp === 'exp') osc.frequency.exponentialRampToValueAtTime(freq, now + at);
                else osc.frequency.setValueAtTime(freq, now + at);
            }

            gain.gain.setValueAtTime(preset.gain, now);
            gain.gain.linearRampToValueAtTime(0.01, now + preset.duration);
            osc.start(now);
            osc.stop(now + preset.duration);
        } catch {
            /* áudio indisponível: segue sem som */
        }
    },
};
