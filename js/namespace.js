// Espace de noms global de l'application.
// Chaque fichier JS est un script classique (pas de module ES) qui s'enregistre
// dans window.RQ : ainsi la page fonctionne aussi ouverte directement en file://.
// L'ordre de chargement des scripts dans index.html suit les dépendances.

window.RQ = window.RQ || { screens: {} };
