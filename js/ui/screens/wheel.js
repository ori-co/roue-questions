// Écran de la roue pour un thème : la roue (un quartier par question active) à gauche,
// à droite la carte de la question, qui fait défiler les questions pendant la rotation
// puis garde celle tirée, avec « Autre question » et « Terminé » dessous.

(function () {
  'use strict';

  const { themeById, categoryById, CATEGORIES } = RQ.config;
  const { h, mount } = RQ.dom;
  const { randomInt } = RQ.random;
  const { createWheel } = RQ.wheelView;
  const { topbar, themeTag, badge, button } = RQ.parts;
  const store = RQ.store;

  /**
   * Choisit la question à tirer : parmi celles pas encore tirées, sauf `excludeId`.
   * Quand tout a été tiré, on repart de zéro pour ce thème.
   */
  function chooseIndex(questions, excludeId) {
    const drawn = new Set(store.getState().drawn);
    const indexes = questions.map((q, i) => i);
    let pool = indexes.filter((i) => !drawn.has(questions[i].id) && questions[i].id !== excludeId);
    if (!pool.length) pool = indexes.filter((i) => questions[i].id !== excludeId);
    if (!pool.length) pool = indexes;
    return pool[randomInt(pool.length)];
  }

  function legend(questions, theme) {
    const present = new Set(questions.map((q) => q.category));
    return h('ul', { class: 'legend' },
      CATEGORIES.filter((c) => present.has(c.id)).map((c) =>
        h('li', { class: 'legend__item' }, badge(c.icon, theme.color, 30), h('span', null, c.label))));
  }

  /** Carte de papier à droite de la roue : invite au départ, puis la question sous le pointeur. */
  function questionCard(theme) {
    const cat = h('div', { class: 'paper-card__cat wheel-card__cat', style: { color: theme.color } });
    const text = h('p', { class: 'wheel-card__text' }, 'Tournez la roue !');
    const el = h('article', { class: 'paper-card wheel-card is-idle', 'aria-live': 'polite' },
      h('span', { class: 'tape tape--left' }),
      h('span', { class: 'tape tape--right' }),
      cat,
      text);

    function show(q) {
      const c = categoryById(q.category);
      mount(cat, badge(c ? c.icon : 'bulle', theme.color, 36), h('span', null, c ? c.label : ''));
      text.textContent = q.text;
      el.classList.remove('is-idle');
    }

    return {
      el,
      show,
      setSpinning(on) {
        el.classList.toggle('is-spinning', on);
        if (on) el.classList.remove('is-landed');
      },
      land() { el.classList.add('is-landed'); },
    };
  }

  /**
   * params : { themeId }
   */
  function render(root, params, nav) {
    const theme = themeById(params.themeId);
    const questions = store.questionsOf(theme.id, true);
    const drawn = new Set(store.getState().drawn);

    const header = topbar('Thèmes', () => nav.go('home'), themeTag(theme));

    if (!questions.length) {
      root.appendChild(h('section', { class: 'screen' }, header,
        h('div', { class: 'center-message' }, 'Aucune question active pour ce thème.')));
      return;
    }

    const wheel = createWheel(questions, theme, drawn);
    const card = questionCard(theme);
    let spinning = false;
    let currentId = null; // question affichée, exclue du tirage suivant

    const spinButton = h('button', { type: 'button', class: 'wheel__spin', onclick: spin }, 'Tourner');
    wheel.el.appendChild(spinButton);

    // Actions masquées tant qu'aucune question n'est tirée (place réservée pour éviter les sauts).
    const actions = h('div', { class: 'actions wheel-actions' },
      questions.length > 1 ? button('Autre question', 'tourner', spin, 'secondary') : null,
      button('Terminé', 'check', () => nav.go('bookmark', { themeId: theme.id }), 'primary'));

    async function spin() {
      if (spinning) return;
      spinning = true;
      spinButton.disabled = true;
      actions.classList.remove('is-visible');
      card.setSpinning(true);
      const index = chooseIndex(questions, currentId);
      await wheel.spinTo(index, (i) => card.show(questions[i]));
      const q = questions[index];
      currentId = q.id;
      store.markDrawn(q.id);
      wheel.markDrawn(q.id);
      card.setSpinning(false);
      card.land();
      actions.classList.add('is-visible');
      spinButton.disabled = false;
      spinning = false;
    }

    root.appendChild(h('section', { class: 'screen screen--wheel' },
      header,
      h('div', { class: 'wheel-layout' },
        h('div', { class: 'wheel-col' }, wheel.el, legend(questions, theme)),
        h('div', { class: 'card-col' }, card.el, actions))));
  }

  RQ.screens.wheel = { render };
})();
