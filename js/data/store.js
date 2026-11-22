// État de l'application, persistant dans le localStorage de l'iPad.
// Tout changement passe par les fonctions exportées, qui sauvegardent
// puis préviennent les abonnés.

(function () {
  'use strict';

  const { STORAGE_KEYS } = RQ.config;
  const { newId } = RQ.schema;

  const state = {
    questions: [],
    meta: { source: null, importedAt: null, modifiedAt: null },
    // Questions déjà tirées depuis le dernier « Réinitialiser les tirages »
    drawn: [],
  };

  const listeners = new Set();

  function load(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(state.questions));
      window.localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(state.meta));
      window.localStorage.setItem(STORAGE_KEYS.drawn, JSON.stringify(state.drawn));
    } catch (e) {
      // Stockage plein ou navigation privée : l'appli continue en mémoire.
      console.warn('Sauvegarde impossible', e);
    }
  }

  function emit() {
    listeners.forEach((fn) => fn(state));
  }

  function touch() {
    state.meta.modifiedAt = new Date().toISOString();
    save();
    emit();
  }

  function init() {
    state.questions = load(STORAGE_KEYS.questions, []);
    state.meta = Object.assign(state.meta, load(STORAGE_KEYS.meta, {}));
    state.drawn = load(STORAGE_KEYS.drawn, []);
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  const getState = () => state;

  // Une ligne ajoutée mais jamais remplie n'est pas une vraie question :
  // elle reste visible dans l'éditeur, mais ne part ni sur la roue ni à l'export.
  const isFilled = (q) => Boolean(q.text && q.text.trim());
  const filledQuestions = () => state.questions.filter(isFilled);
  const hasQuestions = () => state.questions.some(isFilled);

  /**
   * Questions d'un thème. Avec onlyActive, seulement celles qui peuvent
   * tomber sur la roue (cochées et remplies) ; sinon toutes les lignes.
   */
  function questionsOf(themeId, onlyActive) {
    return state.questions.filter((q) => q.theme === themeId && (!onlyActive || (q.active && isFilled(q))));
  }

  /** Remplace toutes les questions (import d'un fichier). */
  function replaceAll(questions, source) {
    state.questions = questions;
    state.drawn = [];
    state.meta = { source, importedAt: new Date().toISOString(), modifiedAt: null };
    save();
    emit();
  }

  function updateQuestion(id, patch) {
    const q = state.questions.find((x) => x.id === id);
    if (!q) return;
    Object.assign(q, patch);
    touch();
  }

  function addQuestion(themeId, categoryId) {
    const q = { id: newId(), theme: themeId, category: categoryId, text: '', active: true };
    state.questions.push(q);
    touch();
    return q;
  }

  function removeQuestion(id) {
    state.questions = state.questions.filter((q) => q.id !== id);
    state.drawn = state.drawn.filter((d) => d !== id);
    touch();
  }

  /** Supprime toutes les questions et les tirages. */
  function clearAll() {
    state.questions = [];
    state.drawn = [];
    touch();
  }

  function markDrawn(id) {
    if (!state.drawn.includes(id)) state.drawn.push(id);
    save();
  }

  function resetDrawn() {
    state.drawn = [];
    save();
    emit();
  }

  RQ.store = { init, subscribe, getState, hasQuestions, filledQuestions, questionsOf, replaceAll, updateQuestion, addQuestion, removeQuestion, clearAll, markDrawn, resetDrawn };
})();
