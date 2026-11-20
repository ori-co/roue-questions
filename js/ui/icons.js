// Pictos SVG en traits (24 x 24), les mêmes que sur les marque-pages.
// `currentColor` permet de les colorer depuis le CSS.

(function () {
  'use strict';

  const FILL = 'fill="currentColor" fill-opacity="0.22"';

  const PATHS = {
    // Thèmes
    loupe: `<circle cx="10.5" cy="10.5" r="7.2" ${FILL}/><path d="M15.8 15.8L21 21" stroke-width="3"/><path d="M8.7 8.7a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.5"/><circle cx="10.5" cy="14.3" r=".5" fill="currentColor"/>`,
    cadenas: `<path d="M7 11V7.5a5 5 0 0 1 10 0V11"/><rect x="4" y="11" width="16" height="10.5" rx="2.2" ${FILL}/><circle cx="12" cy="15.3" r="1.4" fill="currentColor"/><path d="M12 16.6v2"/>`,
    gyrophare: `<path d="M7 17v-4.5a5 5 0 0 1 10 0V17" ${FILL}/><rect x="5" y="17" width="14" height="3.6" rx="1"/><path d="M10 12.2a2 2 0 0 1 2-2"/><path d="M12 2.2v2.2"/><path d="M4.4 5.6l1.6 1.6"/><path d="M19.6 5.6L18 7.2"/><path d="M1.8 12h2.2"/><path d="M20 12h2.2"/>`,
    'coeur-main': `<path d="M12 11.6s-4.6-2.7-4.6-5.7a2.4 2.4 0 0 1 4.6-1.1 2.4 2.4 0 0 1 4.6 1.1c0 3-4.6 5.7-4.6 5.7z" ${FILL}/><path d="M2.5 14.6h3.3l3.5 1.1h3.2a1.4 1.4 0 0 1 0 2.8H9.4"/><path d="M12.5 18.5l5-2.5a1.6 1.6 0 0 1 2 2.4l-3.6 3.1a3 3 0 0 1-2 .8H6.6L2.5 21.5"/>`,

    // Catégories
    bulle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>',
    question: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.6-3 4.5"/><path d="M12 17.8h.01"/>',
    livre: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'idee-recue': '<circle cx="12" cy="12" r="10"/><text x="12" y="16.3" text-anchor="middle" font-family="Josefin Sans, sans-serif" font-size="11.5" font-weight="700" fill="currentColor" stroke="none">?!</text>',
    personnes: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    guillemets: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    coche: '<circle cx="12" cy="12" r="10"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',

    // Interface
    retour: '<path d="M15 18l-6-6 6-6"/>',
    suivant: '<path d="M5 4l10 8-10 8z"/><path d="M19 5v14"/>',
    grille: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    tourner: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
    reglages: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3"/><path d="M12 18.5v3"/><path d="M2.5 12h3"/><path d="M18.5 12h3"/><path d="M5.3 5.3l2.1 2.1"/><path d="M16.6 16.6l2.1 2.1"/><path d="M18.7 5.3l-2.1 2.1"/><path d="M7.4 16.6l-2.1 2.1"/>',
    importer: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>',
    exporter: '<path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M4 21h16"/>',
    ajouter: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    supprimer: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
    fermer: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
  };

  /**
   * Retourne le SVG d'un picto sous forme de chaîne.
   * @param {string} name  clé de PATHS
   * @param {object} [opts] { size, stroke }
   */
  function icon(name, opts = {}) {
    const size = opts.size || 24;
    const stroke = opts.stroke || 2;
    const body = PATHS[name] || PATHS.bulle;
    return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  /** Contenu brut (sans balise <svg>) pour l'insérer dans un autre SVG. */
  function iconPaths(name) {
    return PATHS[name] || PATHS.bulle;
  }

  RQ.icons = { icon, iconPaths };
})();
