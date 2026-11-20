// Passage « lignes brutes d'un fichier » -> questions de l'application.
// Utilisé par l'import CSV et l'import Excel.

(function () {
  'use strict';

  const { THEMES, CATEGORIES, COLUMNS, YES, NO } = RQ.config;
  const { normalize, parseBoolean } = RQ.text;

  let counter = 0;
  function newId() {
    counter += 1;
    return 'q' + Date.now().toString(36) + counter.toString(36);
  }

  function findByLabel(list, value) {
    const v = normalize(value);
    if (!v) return null;
    return list.find((item) => item.id === v || normalize(item.label) === v || (item.aliases || []).includes(v)) || null;
  }

  const findTheme = (value) => findByLabel(THEMES, value);
  const findCategory = (value) => findByLabel(CATEGORIES, value);

  /**
   * Repère l'index de chaque colonne attendue dans la ligne d'en-tête.
   * @returns {{map: object, missing: string[]}}
   */
  function mapHeader(headerRow) {
    const wanted = {
      theme: ['theme', 'themes'],
      category: ['categorie', 'categories', 'type'],
      question: ['question', 'questions', 'sujet', 'sujet de reflexion'],
      active: ['active', 'actif', 'activee', 'dans la roue'],
    };
    const map = {};
    headerRow.forEach((cell, index) => {
      const v = normalize(cell);
      Object.keys(wanted).forEach((key) => {
        if (map[key] === undefined && wanted[key].includes(v)) map[key] = index;
      });
    });
    const missing = ['theme', 'category', 'question'].filter((k) => map[k] === undefined).map((k) => COLUMNS[k]);
    return { map, missing };
  }

  /**
   * Convertit un tableau de lignes (la première = en-têtes) en questions.
   * Les lignes invalides sont ignorées et listées dans `errors`.
   * @param {Array<Array<string>>} rows
   */
  function rowsToQuestions(rows) {
    const errors = [];
    const questions = [];
    const nonEmpty = rows.filter((r) => r && r.some((c) => String(c == null ? '' : c).trim() !== ''));
    if (!nonEmpty.length) return { questions, errors: ['Le fichier est vide.'] };

  const { map, missing } = mapHeader(nonEmpty[0]);
    if (missing.length) {
      return { questions, errors: [`Colonnes introuvables : ${missing.join(', ')}. La première ligne doit contenir les en-têtes.`] };
    }

    nonEmpty.slice(1).forEach((row, i) => {
      const line = i + 2;
      const cell = (key) => (map[key] === undefined ? '' : String(row[map[key]] == null ? '' : row[map[key]]).trim());
      const text = cell('question');
      if (!text) return;
      const theme = findTheme(cell('theme'));
      const category = findCategory(cell('category'));
      if (!theme) {
        errors.push(`Ligne ${line} : thème « ${cell('theme')} » inconnu.`);
        return;
      }
      if (!category) {
        errors.push(`Ligne ${line} : catégorie « ${cell('category')} » inconnue.`);
        return;
      }
      questions.push({
        id: newId(),
        theme: theme.id,
        category: category.id,
        text,
        active: parseBoolean(cell('active'), true),
      });
    });

    return { questions, errors };
  }

  /** Questions -> lignes (en-tête comprise), avec les libellés lisibles. */
  function questionsToRows(questions) {
    const header = [COLUMNS.theme, COLUMNS.category, COLUMNS.question, COLUMNS.active];
    const body = questions.map((q) => {
      const theme = THEMES.find((t) => t.id === q.theme);
      const category = CATEGORIES.find((c) => c.id === q.category);
      return [theme ? theme.label : q.theme, category ? category.label : q.category, q.text, q.active ? YES : NO];
    });
    return [header].concat(body);
  }

  RQ.schema = { newId, findTheme, findCategory, mapHeader, rowsToQuestions, questionsToRows };
})();
