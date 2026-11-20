// Fin d'échange : on montre le marque-page du thème (recto + verso) à remettre au visiteur.

(function () {
  'use strict';

  const { themeById } = RQ.config;
  const { h } = RQ.dom;
  const { button, themeTag } = RQ.parts;

  function render(root, params, nav) {
    const theme = themeById(params.themeId);
    root.appendChild(h('section', { class: 'screen screen--bookmark' },
      h('header', { class: 'topbar' }, h('span'), themeTag(theme)),
      h('div', { class: 'bookmark-layout' },
        h('div', { class: 'bookmark__intro' },
          h('h1', { class: 'title' }, 'Merci pour cet échange'),
          h('p', { class: 'subtitle' }, `Voici votre marque-page « ${theme.label} », à garder dans un livre.`),
          button('Revenir à l’accueil', 'grille', () => nav.go('home'), 'primary')),
        h('div', { class: 'bookmark__pair' },
          h('img', { class: 'bookmark__img bookmark__img--recto', src: 'assets/marque-pages/recto.jpg', alt: 'Recto du marque-page' }),
          h('img', { class: 'bookmark__img bookmark__img--verso', src: `assets/marque-pages/${theme.id}-verso.jpg`, alt: `Verso du marque-page ${theme.label}` })))));
  }

  RQ.screens.bookmark = { render };
})();
