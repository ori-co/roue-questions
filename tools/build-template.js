// Génère data/modele-questions.xlsx à partir de data/questions-exemple.csv,
// avec les mêmes fichiers que l'application (même format, mêmes listes déroulantes).
// Les scripts de l'appli sont des scripts navigateur (window.RQ) : on les exécute
// dans un contexte Node isolé qui imite `window`.
//
// Usage : npm install && npm run template

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ExcelJS = require('exceljs');

const root = path.join(__dirname, '..');
const context = { console, Date, Math, String, Number, Object, Array, Promise, Set };
context.window = context;
vm.createContext(context);

['namespace', 'config', 'lib/text', 'data/schema', 'data/csv', 'data/xlsx'].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', file + '.js'), 'utf8'), context, { filename: file + '.js' });
});

(async () => {
  const { RQ } = context;
  const csv = fs.readFileSync(path.join(root, 'data/questions-exemple.csv'), 'utf8');
  const { questions, errors } = RQ.schema.rowsToQuestions(RQ.csv.parseCsv(csv));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  const buffer = await RQ.xlsx.buildXlsx(questions, ExcelJS);
  fs.writeFileSync(path.join(root, 'data/modele-questions.xlsx'), Buffer.from(buffer));
  console.log(`data/modele-questions.xlsx : ${questions.length} questions`);
})();
