// Lecture / écriture CSV, sans dépendance.
// Excel en français exporte en « ; » : le séparateur est détecté automatiquement.

(function () {
  'use strict';

  function detectSeparator(text) {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const count = (ch) => firstLine.split(ch).length - 1;
    const candidates = [';', ',', '\t'];
    return candidates.reduce((best, ch) => (count(ch) > count(best) ? ch : best), ';');
  }

  /** Texte CSV -> tableau de lignes. Gère les guillemets et retours à la ligne dans une cellule. */
  function parseCsv(text) {
    const src = text.replace(/^﻿/, '');
    const sep = detectSeparator(src);
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < src.length; i += 1) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"') {
          if (src[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === sep) {
        row.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && src[i + 1] === '\n') i += 1;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
    if (field !== '' || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  /** Tableau de lignes -> texte CSV (« ; » + BOM, pour Excel en français). */
  function toCsv(rows) {
    const escape = (value) => {
      const s = String(value == null ? '' : value);
      return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return '﻿' + rows.map((r) => r.map(escape).join(';')).join('\r\n');
  }

  RQ.csv = { parseCsv, toCsv };
})();
