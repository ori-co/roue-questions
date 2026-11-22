// Effets sonores synthétisés avec Web Audio (aucun fichier audio à charger).
// Le contexte audio ne peut démarrer qu'après un geste de l'utilisateur : on le crée
// et on le relance au premier toucher (iOS/Safari l'exige).

(function () {
  'use strict';

  let ctx = null;
  let lastTick = 0;

  function context() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** Une note courte : fréquence (Hz, éventuellement glissante), durée (s), volume, forme d'onde. */
  function blip(c, { freq, to, start = 0, dur = 0.08, vol = 0.15, type = 'sine' }) {
    const t = c.currentTime + start;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const sound = {
    /** À appeler sur un geste utilisateur pour débloquer l'audio. */
    unlock() { context(); },

    /** Petit « pop » au toucher d'un bouton. */
    tap() {
      const c = context();
      if (!c) return;
      blip(c, { freq: 520, to: 780, dur: 0.07, vol: 0.12, type: 'triangle' });
    },

    /** « Clac » du cliquet de la roue à chaque quartier franchi. */
    tick() {
      const c = context();
      if (!c) return;
      const now = performance.now();
      if (now - lastTick < 30) return;
      lastTick = now;
      const f = 900 + Math.random() * 120;
      blip(c, { freq: f, to: f * 0.55, dur: 0.045, vol: 0.1, type: 'square' });
    },

    /** Glissando de départ quand la roue est lancée. */
    spin() {
      const c = context();
      if (!c) return;
      blip(c, { freq: 220, to: 660, dur: 0.35, vol: 0.09, type: 'sawtooth' });
    },

    /** Petit arpège joyeux quand la question est révélée. */
    reveal() {
      const c = context();
      if (!c) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
        blip(c, { freq, start: i * 0.09, dur: i === 3 ? 0.5 : 0.2, vol: 0.14, type: 'triangle' }));
    },
  };

  // Son au toucher uniquement sur les boutons de l'animation : choix du thème (cartes de l'accueil)
  // et écran de la roue. Pas l'admin, ni les raccourcis marque-pages.
  document.addEventListener('pointerdown', (e) => {
    sound.unlock();
    const target = e.target.closest && e.target.closest('.fan__card, .screen--wheel button');
    if (target && !target.disabled) sound.tap();
  }, true);

  RQ.sound = sound;
})();
