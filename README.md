# Roue des questions

Animation de stand pour *Le Goût du Réglisse salé* (Blanche Forestier).
Le visiteur choisit un thème, la roue tire une question, on en discute, puis on lui remet le marque-page du thème.

Page **statique** : ouvrir `index.html` dans un navigateur, sans serveur ni compilation.
Les questions sont mémorisées dans le navigateur (`localStorage`).

## Installer sur l'iPad

Copier le dossier sur l'iPad et ouvrir `index.html` avec une app qui exécute le JavaScript des pages locales.
À tester tôt : l'aperçu de l'app Fichiers n'exécute probablement pas le JavaScript.
Si ça bloque, le dossier peut aussi être mis tel quel sur n'importe quel hébergement statique.

## Utilisation

| Écran | Rôle |
|---|---|
| Accueil | 4 cartes de thème en éventail |
| Roue | à gauche la roue (un quartier par question active, picto de la catégorie) et la légende dessous ; à droite une carte qui fait défiler les questions pendant la rotation puis garde celle tirée. « Autre question » relance la roue, « Terminé » passe au marque-page |
| Marque-page | recto + verso du thème à remettre, puis retour à l'accueil |
| Espace autrice | import / export, édition, activation, remise à zéro des tirages |

**Démarrer sans fichier** : tant qu'il n'y a aucune question, l'accueil propose « Créer ma liste » (espace autrice, liste vide) ou « Importer un fichier ». On ajoute ses questions thème par thème, puis on les télécharge en Excel ou CSV. Les lignes laissées vides ne sont ni tirées ni exportées.

**Accès à l'espace autrice** : sur l'accueil, glisser vers le bas depuis le haut de l'écran fait apparaître un petit picto en haut à droite (6 s), puis **le maintenir appuyé 1,2 s**. Réglages dans `js/config.js` (`SETTINGS`).

**Tirage** : équitable parmi les questions actives non encore tirées ; quand tout a été tiré dans un thème, on repart de zéro. Les quartiers déjà tirés apparaissent plus pâles. « Réinitialiser les tirages » remet tout à zéro.

## Format des données

Une question par ligne, feuille `Questions` (sinon la première feuille) :

| Thème | Catégorie | Question | Active |
|---|---|---|---|
| Le silence | Idée reçue | On dit que « le silence est d'or »… | oui |

- **Thème** : Notions clés, Le silence, Les violences, Voir & agir
- **Catégorie** : Réflexion, Question, Idée reçue, Le Saviez-vous ?, Extrait du livre
- **Active** : oui / non (vide = oui)
- En-têtes reconnus sans accents ni majuscules, colonnes dans n'importe quel ordre.
- CSV : séparateur `;` ou `,` détecté automatiquement, UTF-8.
- Les lignes invalides sont ignorées et listées après l'import.

`data/modele-questions.xlsx` est un modèle avec **listes déroulantes** (validation de données) sur Thème, Catégorie et Active. Il est généré depuis `data/questions-exemple.csv` par `npm run template`.

Les questions modifiées dans l'appli pendant le salon se récupèrent avec « Télécharger en Excel » (mêmes listes déroulantes) ou « Télécharger en CSV ».

## Architecture

```
index.html              page unique, charge les scripts dans l'ordre
css/
  fonts.css             polices embarquées (Josefin Sans, Caveat)
  base.css              variables, reset, typo
  components.css        boutons, pastilles, cartes, toast
  screens.css           mise en page de chaque écran
js/
  namespace.js          crée window.RQ (chargé en premier)
  main.js               démarrage, navigation entre écrans
  config.js             thèmes, catégories, colonnes, réglages
  data/
    store.js            état + persistance localStorage
    schema.js           lignes de fichier <-> questions (validation)
    csv.js              lecture / écriture CSV
    xlsx.js             lecture / écriture Excel (ExcelJS)
    files.js            import / téléchargement depuis l'interface
  lib/                  outils génériques (dom, gestes, hasard, texte)
  ui/
    icons.js            pictos SVG
    components/         roue SVG, éléments partagés
    screens/            un fichier par écran : render(root, params, nav)
vendor/exceljs.min.js   ExcelJS 4.4.0 (MIT)
assets/                 polices, icônes, images des marque-pages
data/                   CSV d'exemple, modèle Excel
tools/                  génération du modèle Excel (Node, `npm run template`)
```

Principes :
- Scripts classiques, pas de modules ES : chaque fichier est une fonction auto-exécutée qui s'enregistre dans `window.RQ` (ex. `RQ.store`, `RQ.screens.home`). D'où le fonctionnement en `file://`.
- Chaque écran expose `render(root, params, nav)` et redessine tout ; `nav.go(nom, params)` change d'écran.
- Les données passent uniquement par `store.js` (sauvegarde automatique dans le `localStorage` de l'iPad).
- Pas de syntaxe récente (`?.`, `??`…) et des CSS avec valeurs de repli, pour les Safari anciens.

## Limites connues

- Les données vivent dans le navigateur de l'iPad : vider ses données les efface. Penser à **télécharger l'Excel en fin de salon**.
- Images des marque-pages : générées depuis les PDF d'impression ; à régénérer si les marque-pages changent.
