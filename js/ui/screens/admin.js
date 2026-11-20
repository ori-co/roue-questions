// Espace autrice : import / export du fichier, édition des questions,
// activation ou retrait de la roue, remise à zéro des tirages.

(function () {
  'use strict';

  const { THEMES, CATEGORIES, themeById } = RQ.config;
  const { h, mount } = RQ.dom;
  const { formatDate } = RQ.text;
  const { icon } = RQ.icons;
  const { button, topbar, toast } = RQ.parts;
  const store = RQ.store;
  const { importFile, exportXlsx, exportCsv } = RQ.files;

  function summary() {
    const { meta } = store.getState();
    const questions = store.filledQuestions();
    const active = questions.filter((q) => q.active).length;
    const parts = [`${active} question${active > 1 ? 's' : ''} dans la roue sur ${questions.length}`];
    if (meta.source) parts.push(`fichier « ${meta.source} » importé le ${formatDate(meta.importedAt)}`);
    if (meta.modifiedAt) parts.push(`modifié le ${formatDate(meta.modifiedAt)}`);
    return parts.join(' · ');
  }

  function themeSelect(q, rerender) {
    return h('select', {
      class: 'row__select',
      'aria-label': 'Catégorie',
      onchange: (e) => { store.updateQuestion(q.id, { theme: e.target.value }); rerender(); },
    }, [h('option', { value: '', selected: !themeById(q.theme) }, '—')]
      .concat(THEMES.map((t) => h('option', { value: t.id, selected: t.id === q.theme }, t.label))));
  }

  function categorySelect(q, rerender) {
    return h('select', {
      class: 'row__select',
      'aria-label': 'Type',
      onchange: (e) => store.updateQuestion(q.id, { category: e.target.value }),
    }, [h('option', { value: '', selected: !CATEGORIES.some((c) => c.id === q.category) }, '—')]
      .concat(CATEGORIES.map((c) => h('option', { value: c.id, selected: c.id === q.category }, c.label))));
  }

  // Tri automatique : par catégorie (thème) uniquement, jamais par type. Tri stable :
  // l'ordre d'origine est conservé à l'intérieur d'un même groupe.
  function sortedQuestions() {
    const rank = (list, id) => { const i = list.findIndex((x) => x.id === id); return i < 0 ? list.length : i; };
    return store.getState().questions.slice().sort((a, b) =>
      rank(THEMES, a.theme) - rank(THEMES, b.theme));
  }

  function questionRow(q, rerender) {
    const theme = themeById(q.theme);
    const checkbox = h('input', {
      type: 'checkbox',
      class: 'row__check',
      checked: q.active,
      'aria-label': 'Dans la roue',
      style: theme ? { accentColor: theme.color } : null,
      onchange: (e) => {
        store.updateQuestion(q.id, { active: e.target.checked });
        row.classList.toggle('is-off', !e.target.checked);
        refreshSummary();
      },
    });
    const text = h('textarea', {
      class: 'row__text',
      rows: 2,
      placeholder: 'Écrire la question…',
      'aria-label': 'Question',
      // Enregistré à chaque frappe : un export lancé juste après la saisie
      // contient bien la dernière question.
      oninput: (e) => {
        store.updateQuestion(q.id, { text: e.target.value.trim() });
        refreshSummary();
      },
    });
    text.value = q.text;
    text.dataset.id = q.id;
    const remove = h('button', {
      type: 'button',
      class: 'icon-btn',
      'aria-label': 'Supprimer la question',
      html: icon('supprimer', { size: 20 }),
      onclick: () => {
        if (window.confirm('Supprimer cette question ?')) {
          store.removeQuestion(q.id);
          rerender();
        }
      },
    });
    const row = h('div', { class: 'row' + (q.active ? '' : ' is-off') }, checkbox, themeSelect(q, rerender), categorySelect(q, rerender), text, remove);
    if (theme) row.style.setProperty('--theme', theme.color);
    return row;
  }

  let refreshSummary = () => {};

  function render(root, params, nav) {
    const info = h('p', { class: 'admin__summary' });
    refreshSummary = () => { info.textContent = summary(); };
    refreshSummary();

    const fileInput = h('input', {
      type: 'file',
      accept: '.xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      class: 'visually-hidden',
      onchange: async (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (store.hasQuestions() && !window.confirm('Remplacer toutes les questions actuelles par celles du fichier ?')) return;
        try {
          const { questions, errors } = await importFile(file);
          showErrors(errors);
          if (!questions.length) {
            toast('Aucune question importée.', 'error');
            return;
          }
          store.replaceAll(questions, file.name);
          toast(`${questions.length} questions importées.`);
          renderList();
          refreshSummary();
        } catch (err) {
          console.error(err);
          toast('Lecture du fichier impossible.', 'error');
        }
      },
    });

    const errorsBox = h('div', { class: 'admin__errors', hidden: true });
    function showErrors(errors) {
      errorsBox.hidden = !errors.length;
      mount(errorsBox,
        errors.length ? h('p', { class: 'admin__errors-title' }, `${errors.length} ligne(s) ignorée(s) :`) : null,
        h('ul', null, errors.slice(0, 20).map((e) => h('li', null, e))));
    }

    // Premier passage, liste encore vide : expliquer comment démarrer.
    const intro = h('div', { class: 'admin__intro' },
      h('p', { class: 'admin__intro-title' }, 'Commencez votre liste ici'),
      h('p', null, 'Choisissez un thème, ajoutez vos questions, puis téléchargez la liste en Excel ou en CSV pour la garder. Vous pouvez aussi importer un fichier existant.'));

    const list = h('div', { class: 'admin__list' });

    // Bouton d'import : masqué dès qu'une liste de questions existe.
    const importBtn = button('Importer un fichier', 'importer', () => fileInput.click(), 'secondary');

    // Bouton de téléchargement unique, avec un petit menu Excel / CSV.
    const download = (fn) => async () => {
      closeMenu();
      if (!store.hasQuestions()) { toast('Aucune question à télécharger.', 'error'); return; }
      try { await fn(store.filledQuestions()); } catch (err) { console.error(err); toast('Export impossible.', 'error'); }
    };
    const menu = h('div', { class: 'dl__menu', role: 'menu', hidden: true },
      h('button', { type: 'button', role: 'menuitem', class: 'dl__item', onclick: download(exportXlsx) }, 'Excel (.xlsx)'),
      h('button', { type: 'button', role: 'menuitem', class: 'dl__item', onclick: download(async (qs) => exportCsv(qs)) }, 'CSV (.csv)'));
    const dlBtn = button('Télécharger', 'exporter', (e) => {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
      dlBtn.setAttribute('aria-expanded', String(!menu.hidden));
    }, 'secondary', { 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
    function closeMenu() { menu.hidden = true; dlBtn.setAttribute('aria-expanded', 'false'); }
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !menu.contains(e.target)) closeMenu();
    });
    const downloadBox = h('div', { class: 'dl' }, dlBtn, menu);

    function renderList() {
      const questions = store.getState().questions;
      intro.hidden = questions.length > 0;
      importBtn.hidden = questions.length > 0;
      // Zone vide : on la retire pour ne pas garder son espacement.
      actions.hidden = questions.length > 0;
      const header = h('div', { class: 'row row--head', 'aria-hidden': 'true' },
        h('span'), h('span', null, 'Catégorie'), h('span', null, 'Type'), h('span', null, 'Question'), h('span'));
      const footer = h('div', { class: 'admin__list-foot' },
        button('Ajouter une question', 'ajouter', () => {
          const q = store.addQuestion('', '');
          renderList();
          refreshSummary();
          const area = list.querySelector(`textarea[data-id="${q.id}"]`);
          if (area) { area.scrollIntoView({ block: 'center' }); area.focus(); }
        }, 'ghost'),
        downloadBox);
      mount(list,
        questions.length ? header : null,
        questions.length ? sortedQuestions().map((q) => questionRow(q, renderList)) : h('p', { class: 'admin__empty' }, 'Aucune question pour le moment.'),
        footer);
    }

    const actions = h('div', { class: 'admin__actions' }, importBtn);
    const infoRow = h('div', { class: 'admin__info' },
      info,
      button('Réinitialiser les tirages', 'tourner', () => { store.resetDrawn(); toast('Toutes les questions peuvent de nouveau être tirées.'); }, 'ghost'));

    root.appendChild(h('section', { class: 'screen screen--admin' },
      topbar('Retour', () => nav.go('home'), h('h1', { class: 'admin__title' }, 'Espace autrice')),
      h('div', { class: 'admin__body' }, infoRow, intro, actions, errorsBox, fileInput, list)));

    renderList();

    // Arrivée depuis « Importer un fichier » de l'accueil : ouvrir directement
    // le sélecteur (on est encore dans le geste de l'utilisatrice).
    if (params.openImport) fileInput.click();
  }

  RQ.screens.admin = { render };
})();
