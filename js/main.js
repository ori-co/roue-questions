// Point d'entrée : initialise les données et la navigation.

(function () {
  'use strict';

  const store = RQ.store;
  const SCREENS = RQ.screens;
  const root = document.getElementById('app');

  // Navigation minimale : un seul écran à la fois, sans historique navigateur
  // (sur un stand, on ne veut pas de « précédent » accidentel).
  const nav = {
    current: null,
    go(name, params) {
      const screen = SCREENS[name] || SCREENS.home;
      root.textContent = '';
      root.className = 'app app--' + name;
      nav.current = name;
      screen.render(root, params || {}, nav);
      window.scrollTo(0, 0);
    },
  };

  store.init();
  nav.go('home');
})();
