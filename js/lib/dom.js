// Aides DOM minimales (pas de framework).

(function () {
  'use strict';

  /**
   * Crée un élément.
   * h('button', { class: 'btn', onclick: fn }, 'Texte', autreNoeud)
   * Les attributs `html` injectent du HTML déjà échappé (pictos SVG).
   */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        const value = attrs[key];
        if (value === undefined || value === null || value === false) return;
        if (key === 'class') el.className = value;
        else if (key === 'html') el.innerHTML = value;
        else if (key === 'style' && typeof value === 'object') {
          Object.keys(value).forEach((prop) => {
            // Les variables CSS (--x) passent obligatoirement par setProperty
            if (prop.startsWith('--')) el.style.setProperty(prop, value[prop]);
            else el.style[prop] = value[prop];
          });
        }
        else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
        else if (value === true) el.setAttribute(key, '');
        else el.setAttribute(key, value);
      });
    }
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      el.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return el;
  }

  /** Vide un conteneur puis y place les enfants. */
  function mount(container, ...children) {
    container.textContent = '';
    children.flat().forEach((c) => c && container.appendChild(c));
  }

  RQ.dom = { h, mount };
})();
