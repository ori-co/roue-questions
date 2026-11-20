// Petites fonctions de texte partagées.

(function () {
  'use strict';

  /** Minuscules, sans accents, espaces normalisés : pour comparer des libellés. */
  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[’']/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /** Échappe une chaîne pour l'insérer dans du HTML. */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Interprète oui/non, vrai/faux, 1/0, x… Vide = valeur par défaut. */
  function parseBoolean(value, fallback = true) {
    const v = normalize(value);
    if (v === '') return fallback;
    if (['oui', 'o', 'yes', 'y', 'true', 'vrai', '1', 'x'].includes(v)) return true;
    if (['non', 'n', 'no', 'false', 'faux', '0'].includes(v)) return false;
    return fallback;
  }

  /** Date courte lisible : « 18/11 à 21:14 ». */
  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** Nom de fichier horodaté : questions_2026-11-18_21h14.xlsx */
  function timestampedName(base, ext) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${base}_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}h${pad(d.getMinutes())}.${ext}`;
  }

  RQ.text = { normalize, escapeHtml, parseBoolean, formatDate, timestampedName };
})();
