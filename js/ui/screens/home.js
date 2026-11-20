// Accueil : les 4 thèmes en éventail. Accès caché à l'espace autrice :
// glisser vers le bas depuis le haut de l'écran fait apparaître un petit
// picto, qu'il faut ensuite maintenir appuyé.

(function () {
  'use strict';

  const { THEMES, BOOK, SETTINGS } = RQ.config;
  const { h } = RQ.dom;
  const { onLongPress, onPullDown } = RQ.gestures;
  const { icon } = RQ.icons;
  const { button } = RQ.parts;
  const store = RQ.store;

  function card(theme, index, nav) {
    const count = store.questionsOf(theme.id, true).length;
    return h('button', {
      type: 'button',
      class: `fan__card fan__card--${index}`,
      disabled: count === 0,
      'aria-label': `Thème ${theme.label}`,
      onclick: () => nav.go('wheel', { themeId: theme.id }),
    },
    h('span', { class: 'card-head', style: { background: theme.color } },
      h('span', { class: 'card-head__disc', style: { color: theme.color }, html: icon(theme.icon, { size: 28 }) }),
      h('span', { class: 'card-head__title' }, theme.label)),
    h('span', { class: 'card-lines' },
      h('span'), h('span'), h('span')));
  }

  // Raccourcis vers les marque-pages, sans passer par la roue.
  function bookmarkLinks(nav) {
    return h('nav', { class: 'home__bookmarks', 'aria-label': 'Ouvrir un marque-page' },
      h('span', { class: 'home__bookmarks-label' }, 'Marque-pages'),
      h('div', { class: 'home__bookmarks-list' }, THEMES.map((t) =>
        h('button', {
          type: 'button',
          class: 'btn btn--bookmark',
          style: { '--theme': t.color },
          'aria-label': `Marque-page ${t.label}`,
          onclick: () => nav.go('bookmark', { themeId: t.id }),
        },
        h('span', { class: 'btn__icon', html: icon(t.icon, { size: 20 }) }),
        h('span', null, t.label)))));
  }

  function render(root, params, nav) {
    const adminHandle = h('button', { type: 'button', class: 'admin-handle', 'aria-label': 'Espace autrice (maintenir appuyé)', html: icon('reglages', { size: 22 }) });
    let hideTimer = null;
    const reveal = () => {
      adminHandle.classList.add('is-revealed');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => adminHandle.classList.remove('is-revealed'), SETTINGS.revealMs);
    };
    onLongPress(adminHandle, SETTINGS.longPressMs, () => nav.go('admin'));

    const empty = !store.hasQuestions();

    const screen = h('section', { class: 'screen screen--home' },
      h('header', { class: 'topbar topbar--home' },
        h('span', { class: 'brand' }, BOOK.title),
        adminHandle),
      h('div', { class: 'home__intro' },
        h('h1', { class: 'title' }, 'Choisissez un thème'),
        h('p', { class: 'subtitle' }, empty
          ? 'Aucune question pour l’instant.'
          : 'Touchez une carte, la roue choisira la question')),
      empty
        ? h('div', { class: 'home__empty' },
            h('p', null, 'Créez votre liste directement ici, ou importez un fichier.'),
            h('div', { class: 'home__empty-actions' },
              button('Créer ma liste', 'ajouter', () => nav.go('admin'), 'primary'),
              button('Importer un fichier', 'importer', () => nav.go('admin', { openImport: true }), 'secondary')))
        : h('div', { class: 'fan' }, THEMES.map((t, i) => card(t, i, nav))),
      bookmarkLinks(nav));

    onPullDown(screen, { zone: 140, distance: SETTINGS.pullDownPx, onPull: reveal });
    root.appendChild(screen);
  }

  RQ.screens.home = { render };
})();
