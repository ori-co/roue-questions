// Import et export de fichiers depuis l'interface.

(function () {
  'use strict';

  const { parseCsv, toCsv } = RQ.csv;
  const { readXlsx, buildXlsx } = RQ.xlsx;
  const { rowsToQuestions, questionsToRows } = RQ.schema;
  const { timestampedName } = RQ.text;

  const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  function readAs(file, method) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader[method](file);
    });
  }

  /**
   * Lit un fichier .xlsx ou .csv choisi par l'utilisatrice.
   * @returns {Promise<{questions: Array, errors: string[]}>}
   */
  async function importFile(file) {
    const name = (file.name || '').toLowerCase();
    let rows;
    if (name.endsWith('.csv') || name.endsWith('.txt') || file.type === 'text/csv') {
      rows = parseCsv(await readAs(file, 'readAsText'));
    } else if (name.endsWith('.xlsx') || file.type === XLSX_MIME) {
      rows = await readXlsx(await readAs(file, 'readAsArrayBuffer'));
    } else {
      return { questions: [], errors: ['Format non reconnu : choisissez un fichier .xlsx ou .csv.'] };
    }
    return rowsToQuestions(rows);
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function exportXlsx(questions) {
    const buffer = await buildXlsx(questions);
    download(new Blob([buffer], { type: XLSX_MIME }), timestampedName('questions', 'xlsx'));
  }

  function exportCsv(questions) {
    const text = toCsv(questionsToRows(questions));
    download(new Blob([text], { type: 'text/csv;charset=utf-8' }), timestampedName('questions', 'csv'));
  }

  RQ.files = { importFile, exportXlsx, exportCsv };
})();
