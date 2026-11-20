// Roue SVG : un quartier par question, le picto de sa catégorie au centre du quartier.
// La roue tourne vers un quartier choisi à l'avance (tirage équitable).

(function () {
  'use strict';

  const { categoryById, SETTINGS } = RQ.config;
  const { iconPaths } = RQ.icons;

  const SIZE = 460;
  const C = SIZE / 2;
  const R = C - 8;

  /** Mélange une couleur hex avec du blanc (ratio 0..1). */
  function lighten(hex, ratio) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (v) => Math.round(v + (255 - v) * ratio);
    const r = mix((n >> 16) & 255);
    const g = mix((n >> 8) & 255);
    const b = mix(n & 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function polar(angleDeg, radius) {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
  }

  function sectorPath(i, n) {
    const step = 360 / n;
    const [x0, y0] = polar(i * step, R);
    const [x1, y1] = polar((i + 1) * step, R);
    const large = step > 180 ? 1 : 0;
    return `M${C},${C} L${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
  }

  /**
   * Crée la roue.
   * @param {Array} questions  questions actives du thème (ordre = ordre des quartiers)
   * @param {object} theme     thème (couleur)
   * @param {Set<string>} drawn identifiants déjà tirés (affichés en plus pâle)
   */
  function createWheel(questions, theme, drawn) {
    const n = questions.length;
    const colors = [theme.color, lighten(theme.color, 0.3), lighten(theme.color, 0.15)];
    const step = 360 / Math.max(n, 1);
    const iconSize = Math.max(18, Math.min(44, (Math.PI * R * 0.62 * 2) / Math.max(n, 1) * 0.55));

    let sectors = '';
    questions.forEach((q, i) => {
      // Nombre impair : le dernier quartier prend une 3e teinte pour ne pas toucher le premier.
      const fill = n > 1 && n % 2 === 1 && i === n - 1 ? colors[2] : colors[i % 2];
      const faded = drawn.has(q.id) ? ' is-drawn' : '';
      const shape = n === 1
        ? `<circle cx="${C}" cy="${C}" r="${R}" fill="${fill}"/>`
        : `<path d="${sectorPath(i, n)}" fill="${fill}"/>`;
      const [ix, iy] = polar((i + 0.5) * step, n === 1 ? 0 : R * 0.68);
      const cat = categoryById(q.category);
      const k = iconSize / 24;
      const rot = n === 1 ? 0 : (i + 0.5) * step;
      sectors += `<g class="wheel__sector${faded}" data-id="${q.id}">${shape}` +
        `<g transform="translate(${ix.toFixed(1)},${iy.toFixed(1)}) rotate(${rot.toFixed(1)}) translate(${(-iconSize / 2).toFixed(1)},${(-iconSize / 2).toFixed(1)}) scale(${k.toFixed(3)})" class="wheel__icon">` +
        `${iconPaths(cat ? cat.icon : 'bulle')}</g></g>`;
    });

    const wrap = document.createElement('div');
    wrap.className = 'wheel';
    wrap.innerHTML =
      `<svg class="wheel__pointer" viewBox="0 0 36 32" aria-hidden="true"><path d="M2 2h32L18 30z"/></svg>` +
      `<svg class="wheel__disc" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="Roue des questions">` +
      `<g class="wheel__rotor">${sectors}` +
      `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${theme.color}" stroke-width="4"/></g></svg>`;

    // On fait tourner l'élément <svg> entier : plus fiable que transformer un <g> sur les vieux Safari.
    const rotor = wrap.querySelector('.wheel__disc');
    let rotation = 0;

    /** Index du quartier sous le pointeur, d'après l'angle affiché à l'instant (transition en cours comprise). */
    function sectorAtPointer() {
      const m = /matrix\(\s*([^,]+),\s*([^,]+)/.exec(getComputedStyle(rotor).transform || '');
      const deg = m ? (Math.atan2(parseFloat(m[2]), parseFloat(m[1])) * 180) / Math.PI : 0;
      const angle = ((-deg % 360) + 360) % 360;
      return Math.min(n - 1, Math.floor(angle / step));
    }

    /**
     * Fait tourner la roue jusqu'à la question d'index `index`.
     * @param {function(number)} [onSector] appelée à chaque changement de quartier sous le pointeur
     * @returns {Promise<void>} résolue à l'arrêt
     */
    function spinTo(index, onSector) {
      const center = (index + 0.5) * step;
      const jitter = n > 1 ? (Math.random() - 0.5) * step * 0.6 : 0;
      const current = ((rotation % 360) + 360) % 360;
      let delta = (360 - center - jitter - current) % 360;
      if (delta < 0) delta += 360;
      rotation += SETTINGS.spinTurns * 360 + delta;
      rotor.style.transition = `transform ${SETTINGS.spinMs}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
      rotor.style.transform = `rotate(${rotation}deg)`;

      let last = -1;
      let frame = 0;
      function track() {
        const i = sectorAtPointer();
        if (i !== last) {
          last = i;
          onSector(i);
        }
        frame = requestAnimationFrame(track);
      }
      if (onSector) frame = requestAnimationFrame(track);

      return new Promise((resolve) => setTimeout(() => {
        cancelAnimationFrame(frame);
        if (onSector && last !== index) onSector(index);
        resolve();
      }, SETTINGS.spinMs + 150));
    }

    /** Pâlit le quartier d'une question qui vient d'être tirée. */
    function markDrawn(id) {
      const sector = wrap.querySelector(`.wheel__sector[data-id="${id}"]`);
      if (sector) sector.classList.add('is-drawn');
    }

    return { el: wrap, spinTo, markDrawn };
  }

  RQ.wheelView = { createWheel };
})();
