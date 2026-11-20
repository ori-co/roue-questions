// Gestes tactiles (et souris pour tester sur ordinateur).
// On écoute touch* ET mouse* : les Pointer Events n'existent pas sur les vieux Safari.

(function () {
  'use strict';

  function point(e) {
    const t = e.touches && e.touches[0] ? e.touches[0] : (e.changedTouches && e.changedTouches[0]) || e;
    return { x: t.clientX, y: t.clientY };
  }

  /**
   * Appui long sur un élément.
   * @returns {Function} pour retirer les écouteurs
   */
  function onLongPress(el, ms, callback) {
    let timer = null;
    let start = null;

    const cancel = () => {
      clearTimeout(timer);
      timer = null;
      el.classList.remove('is-pressing');
    };
    const begin = (e) => {
      start = point(e);
      el.classList.add('is-pressing');
      el.style.setProperty('--press-ms', ms + 'ms');
      timer = setTimeout(() => {
        cancel();
        callback();
      }, ms);
    };
    const move = (e) => {
      if (!timer || !start) return;
      const p = point(e);
      if (Math.abs(p.x - start.x) > 12 || Math.abs(p.y - start.y) > 12) cancel();
    };

    el.addEventListener('touchstart', begin, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
    el.addEventListener('mousedown', begin);
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      cancel();
      ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'mousedown', 'mousemove', 'mouseup', 'mouseleave'].forEach((t) => {
        el.removeEventListener(t, begin);
        el.removeEventListener(t, move);
        el.removeEventListener(t, cancel);
      });
    };
  }

  /**
   * Glissement vers le bas qui démarre dans la zone haute de l'écran.
   * @param {HTMLElement} el     surface qui écoute
   * @param {object} opts        { zone: px depuis le haut, distance: px, onPull }
   */
  function onPullDown(el, opts) {
    const zone = opts.zone || 120;
    let start = null;

    const begin = (e) => {
      const p = point(e);
      const top = el.getBoundingClientRect().top;
      start = p.y - top <= zone ? p : null;
    };
    const move = (e) => {
      if (!start) return;
      const p = point(e);
      if (p.y - start.y >= opts.distance && Math.abs(p.x - start.x) < opts.distance) {
        start = null;
        opts.onPull();
      }
    };
    const end = () => {
      start = null;
    };

    el.addEventListener('touchstart', begin, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end);
    el.addEventListener('mousedown', begin);
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseup', end);
  }

  RQ.gestures = { onLongPress, onPullDown };
})();
