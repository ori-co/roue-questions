// Configuration fixe de l'application : thèmes, catégories, réglages.
// Les questions, elles, viennent du fichier Excel ou CSV importé.

(function () {
  'use strict';

  const APP_VERSION = '0.2.0';

  const BOOK = {
    title: 'Le Goût du Réglisse salé',
    author: 'Blanche Forestier',
  };

  // Thèmes : identiques aux 4 versos des marque-pages.
  // `aliases` permet de reconnaître le thème dans le fichier importé
  // (comparaison sans accents ni majuscules).
  const THEMES = [
    { id: 'notions', label: 'Notions clés', color: '#8E63D9', icon: 'loupe', aliases: ['notions', 'notions cles', 'les mots pour le dire'] },
    { id: 'silence', label: 'Le silence', color: '#2D1F7A', icon: 'cadenas', aliases: ['silence', 'le silence'] },
    { id: 'violences', label: 'Les violences', color: '#5A1E9E', icon: 'gyrophare', aliases: ['violences', 'les violences'] },
    { id: 'voir-agir', label: 'Voir & agir', color: '#4B3BC4', icon: 'coeur-main', aliases: ['voir & agir', 'voir et agir', 'voir agir', 'aidants'] },
  ];

  // Catégories transverses, communes à tous les thèmes.
  const CATEGORIES = [
    { id: 'reflexion', label: 'Réflexion', icon: 'bulle', aliases: ['reflexion', 'debat', 'sujet de reflexion'] },
    { id: 'question', label: 'Question', icon: 'question', aliases: ['question'] },
    { id: 'idee-recue', label: 'Idée reçue', icon: 'idee-recue', aliases: ['idee recue', 'vrai ou faux', 'vrai faux'] },
    { id: 'definition', label: 'Le Saviez-vous ?', icon: 'livre', aliases: ['definition', 'le savez vous'] },
    { id: 'extrait', label: 'Extrait du livre', icon: 'guillemets', aliases: ['extrait du livre', 'extrait', 'citation'] },
  ];

  // Colonnes du fichier (ordre d'export). L'import accepte les en-têtes
  // sans accents et dans n'importe quel ordre.
  const COLUMNS = {
    theme: 'Thème',
    category: 'Catégorie',
    question: 'Question',
    active: 'Active',
  };

  const YES = 'oui';
  const NO = 'non';

  const SETTINGS = {
    // Durée d'appui pour ouvrir l'espace autrice (ms).
    longPressMs: 1200,
    // Distance de glissement vers le bas pour faire apparaître l'accès (px).
    pullDownPx: 70,
    // Durée pendant laquelle l'accès reste visible (ms).
    revealMs: 6000,
    // Durée de rotation de la roue (ms).
    spinMs: 4200,
    // Nombre de tours complets avant l'arrêt.
    spinTurns: 5,
  };

  const STORAGE_KEYS = {
    questions: 'rq.questions.v1',
    meta: 'rq.meta.v1',
    drawn: 'rq.drawn.v1',
    prefs: 'rq.prefs.v1',
  };

  function themeById(id) {
    return THEMES.find((t) => t.id === id) || null;
  }

  function categoryById(id) {
    return CATEGORIES.find((c) => c.id === id) || null;
  }

  RQ.config = { APP_VERSION, BOOK, THEMES, CATEGORIES, COLUMNS, YES, NO, SETTINGS, STORAGE_KEYS, themeById, categoryById };
})();
