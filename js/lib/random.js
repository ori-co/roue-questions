// Tirage au sort équitable.

(function () {
  'use strict';

  /** Entier aléatoire dans [0, max[ (crypto si disponible). */
  function randomInt(max) {
    if (max <= 0) return 0;
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      const limit = Math.floor(0xffffffff / max) * max;
      let x;
      do {
        window.crypto.getRandomValues(buf);
        x = buf[0];
      } while (x >= limit);
      return x % max;
    }
    return Math.floor(Math.random() * max);
  }

  /** Élément au hasard dans un tableau (ou null). */
  function pick(list) {
    if (!list.length) return null;
    return list[randomInt(list.length)];
  }

  /** Copie mélangée du tableau (Fisher-Yates). */
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  RQ.random = { randomInt, pick, shuffle };
})();
