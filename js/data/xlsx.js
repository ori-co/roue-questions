// Lecture / écriture Excel (.xlsx) avec ExcelJS (vendor/exceljs.min.js).
// ExcelJS est chargé en script classique et expose window.ExcelJS.
// Les fonctions acceptent la librairie en paramètre pour pouvoir être
// réutilisées par l'outil Node qui génère le fichier modèle (tools/).

(function () {
  'use strict';

  const { THEMES, CATEGORIES, YES, NO } = RQ.config;
  const { questionsToRows } = RQ.schema;

  const SHEET = 'Questions';
  const LISTS = 'Listes';
  const VALIDATED_ROWS = 500;

  function lib(ExcelJS) {
    const found = ExcelJS || (typeof window !== 'undefined' ? window.ExcelJS : null);
    if (!found) throw new Error('ExcelJS n’est pas chargé.');
    return found;
  }

  function cellText(cell) {
    const v = cell.value;
    if (v == null) return '';
    if (typeof v === 'object') {
      if (v.richText) return v.richText.map((r) => r.text).join('');
      if (v.text != null) return String(v.text);
      if (v.result != null) return String(v.result);
    }
    return String(v);
  }

  /** ArrayBuffer d'un .xlsx -> tableau de lignes (feuille « Questions », sinon la première). */
  async function readXlsx(buffer, ExcelJS) {
    const wb = new (lib(ExcelJS).Workbook)();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet(SHEET) || wb.worksheets[0];
    if (!ws) return [];
    const rows = [];
    ws.eachRow({ includeEmpty: false }, (row) => {
      const values = [];
      for (let c = 1; c <= Math.max(4, row.cellCount); c += 1) values.push(cellText(row.getCell(c)));
      rows.push(values);
    });
    return rows;
  }

  /**
   * Questions -> classeur Excel, avec listes déroulantes (validation de données)
   * sur les colonnes Thème, Catégorie et Active.
   * @returns {Promise<ArrayBuffer>}
   */
  async function buildXlsx(questions, ExcelJS) {
    const wb = new (lib(ExcelJS).Workbook)();
    wb.creator = 'Roue des questions';
    wb.created = new Date();

    const ws = wb.addWorksheet(SHEET, { views: [{ state: 'frozen', ySplit: 1 }] });
    const lists = wb.addWorksheet(LISTS, { state: 'hidden' });

    // Feuille des listes autorisées
    lists.getCell('A1').value = 'Thèmes';
    lists.getCell('B1').value = 'Catégories';
    lists.getCell('C1').value = 'Active';
    THEMES.forEach((t, i) => { lists.getCell(i + 2, 1).value = t.label; });
    CATEGORIES.forEach((c, i) => { lists.getCell(i + 2, 2).value = c.label; });
    [YES, NO].forEach((v, i) => { lists.getCell(i + 2, 3).value = v; });

    // Données
    questionsToRows(questions).forEach((r) => ws.addRow(r));
    ws.columns = [{ width: 18 }, { width: 20 }, { width: 90 }, { width: 10 }];
    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D1F7A' } };
    ws.getColumn(3).alignment = { wrapText: true, vertical: 'top' };

    // Validation de données
    const end = (n) => '$' + n + '$' + (n === 'A' ? THEMES.length + 1 : n === 'B' ? CATEGORIES.length + 1 : 3);
    const rule = (col, title) => ({
      type: 'list',
      allowBlank: col === 'C',
      formulae: [`${LISTS}!$${col}$2:${end(col)}`],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: title,
      error: 'Choisissez une valeur dans la liste.',
    });
    const last = Math.max(VALIDATED_ROWS, questions.length + 50);
    for (let r = 2; r <= last; r += 1) {
      ws.getCell(r, 1).dataValidation = rule('A', 'Thème');
      ws.getCell(r, 2).dataValidation = rule('B', 'Catégorie');
      ws.getCell(r, 4).dataValidation = rule('C', 'Active');
    }

    return wb.xlsx.writeBuffer();
  }

  RQ.xlsx = { readXlsx, buildXlsx };
})();
