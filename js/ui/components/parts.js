// Petits morceaux d'interface réutilisés par plusieurs écrans.

(function () {
  'use strict';

  const { h } = RQ.dom;
  const { icon } = RQ.icons;

  /** Bouton avec picto. variant : 'primary' | 'secondary' | 'ghost' */
  function button(label, iconName, onClick, variant = 'secondary', extra = {}) {
    return h('button', Object.assign({ type: 'button', class: `btn btn--${variant}`, onclick: onClick }, extra),
      iconName ? h('span', { class: 'btn__icon', html: icon(iconName, { size: 20 }) }) : null,
      h('span', null, label));
  }

  /** Pastille ronde colorée contenant un picto. */
  function badge(iconName, color, size = 44) {
    return h('span', {
      class: 'badge',
      style: { background: color, width: size + 'px', height: size + 'px' },
      html: icon(iconName, { size: Math.round(size * 0.55) }),
    });
  }

  /** Rappel du thème (pastille + nom) affiché en haut à droite. */
  function themeTag(theme) {
    return h('div', { class: 'theme-tag', style: { color: theme.color } },
      badge(theme.icon, theme.color, 44),
      h('span', { class: 'theme-tag__label' }, theme.label));
  }

  /** Barre du haut : un bouton retour à gauche, un contenu libre à droite. */
  function topbar(backLabel, onBack, right) {
    return h('header', { class: 'topbar' },
      onBack ? button(backLabel, 'retour', onBack, 'ghost') : h('span'),
      right || h('span'));
  }

  /** Message éphémère en bas de l'écran. */
  function toast(message, kind = 'info') {
    const el = h('div', { class: `toast toast--${kind}`, role: 'status' }, message);
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));
    setTimeout(() => {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 400);
    }, kind === 'error' ? 6000 : 3000);
  }

  RQ.parts = { button, badge, themeTag, topbar, toast };
})();
