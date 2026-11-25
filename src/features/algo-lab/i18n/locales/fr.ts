import type { LocaleBundle, Translations } from "@/components/course/i18n";

import type { AlgoUi } from "../types";

/**
 * French, in one file: Algo Lab's own words, the name of every module, and the lessons.
 * Every lesson has its title and summary. Lessons translated in full also have `goals`,
 * `takeaways`, `hud`, `pseudocode` and `steps` (see LessonText); a lesson without `steps` is
 * shown in English under its translated title, with a note saying so. To translate another lesson,
 * give its entry in `lessons` the same fields as "big-o".
 */
const ui: AlgoUi = {
  nav: {
    learn: "Apprendre",
    practice: "S’entraîner",
    cheatsheets: "Antisèches",
    challenges: "Défis",
    progress: "Progression",
  },
  searchPlaceholder: "Rechercher leçons et notions…",
  legend: { active: "en cours", found: "trouvé", settled: "réglé", problem: "problème" },
  tones: {
    plain: "normal",
    active: "actif",
    found: "trouvé",
    done: "terminé",
    warn: "en alerte",
    mark: "marqué",
    muted: "estompé",
    ghost: "vide",
  },
  isNow: (name, tone) => `${name} est maintenant ${tone}`,
  moved: (name) => `${name} a bougé`,
  pointer: (text) => `Pointeur ${text}`,
};

const modules: Translations["modules"] = {
  foundations: "01. Fondamentaux",
  arrays: "02. Tableaux & Chaînes",
  "linked-lists": "03. Listes chaînées",
  "stacks-queues": "04. Piles & Files",
  hashing: "05. Hachage",
  trees: "06. Arbres",
  heaps: "07. Tas",
  graphs: "08. Graphes",
  sorting: "09. Tri & Recherche",
  greedy: "10. Algorithmes gloutons",
  backtracking: "11. Retour sur trace",
  dp: "12. Programmation dynamique",
  bits: "13. Manipulation de bits",
  hard: "14. Problèmes difficiles",
};

const lessons: Translations["lessons"] = {
  arrays: {
    title: "Tableaux",
    summary:
      "Une rangée de cases égales côte à côte en mémoire : lecture instantanée, insertion au milieu coûteuse.",
  },
  "balanced-brackets": {
    title: "Parenthèses équilibrées",
    summary:
      "Vérifier que chaque (, [ et { est fermé dans le bon ordre grâce à une pile des ouvrants.",
  },
  "balanced-trees": {
    title: "Arbres équilibrés",
    summary:
      "Garder un arbre de recherche peu profond avec des rotations pour que chaque opération reste en O(log n).",
  },
  "bellman-ford": {
    title: "Bellman–Ford",
    summary:
      "Relâcher chaque arête V − 1 fois pour obtenir les plus courts chemins même avec des poids négatifs, et repérer les cycles négatifs.",
  },
  "big-o": {
    title: "Notation grand O",
    summary:
      "Décrire comment le coût d’un algorithme croît avec son entrée, en ignorant tout le reste.",
    goals: [
      "Ce que mesure le grand O et pourquoi il ignore les constantes",
      "Les six vitesses de croissance les plus courantes",
      "Meilleur cas, cas moyen et pire cas",
      "Complexité en temps et complexité en espace",
    ],
    takeaways: [
      "Le grand O décrit comment le nombre d’étapes croît avec l’entrée, pas combien de secondes dure une exécution.",
      "On abandonne les constantes et les termes d’ordre inférieur : 3n + 5 et 100n sont tous deux en O(n).",
      "Précisez toujours quel cas et quelle ressource : le temps dans le pire cas et la mémoire supplémentaire peuvent différer.",
    ],
    hud: ["n", "Étapes", "Croissance", "Mémoire en plus"],
    pseudocode: [
      "analyze(items):",
      "    x = items[3]                  # O(1) : une étape",
      "    for each item in items:       # O(n) : toucher chaque élément",
      "        total = total + item",
      "    while size > 1:               # O(log n) : diviser par deux à chaque fois",
      "        size = size / 2",
      "    for each a in items:          # O(n^2) : boucle dans une boucle",
      "        for each b in items:",
      "            compare(a, b)",
      "    return total",
    ],
    steps: [
      {
        short: "Pourquoi",
        title: "Compter les étapes, pas les secondes",
        body: [
          "Un chronomètre vous dit à quelle vitesse un programme a tourné sur une machine. Il ne dit rien de ce qui se passe quand l’entrée est dix fois plus grande.",
          "Le grand O compte les étapes de base en fonction de la taille de l’entrée `n`. Ici `n = 8`, et chaque case est un élément qu’un algorithme pourrait devoir regarder.",
        ],
        labels: {
          cap: "n = 8 éléments",
        },
      },
      {
        short: "O(1)",
        title: "O(1) : temps constant",
        body: [
          "Lire `a[3]` prend une étape, que le tableau contienne 8 éléments ou 8 millions. Le coût ne dépend pas du tout de `n`.",
          "Constant ne veut pas dire « rapide », cela veut dire « plat ».",
        ],
        callout:
          "L’accès à un tableau par indice, l’empilement et la recherche dans une table de hachage sont en O(1).",
        labels: {
          cap: "une étape, quel que soit n",
        },
      },
      {
        short: "O(n)",
        title: "O(n) : temps linéaire",
        body: [
          "Additionner le tableau visite chaque élément une fois : 8 éléments, 8 étapes. Doublez l’entrée et le travail double.",
          "La recherche linéaire, la recherche du maximum et la copie d’une liste sont toutes en O(n).",
        ],
        labels: {
          cap: "toucher chaque élément une fois : 8 étapes",
        },
      },
      {
        short: "O(log n)",
        title: "O(log n) : diviser le problème par deux",
        body: [
          "Si chaque étape écarte la moitié de ce qui reste, 8 éléments passent à 4, puis 2, puis 1 : seulement 3 étapes. Mille éléments n’en demandent qu’environ 10, un milliard environ 30.",
          "C’est pourquoi la recherche dichotomique sur des données triées paraît instantanée.",
        ],
        callout: "log n, c’est « combien de fois puis-je couper n en deux avant d’arriver à 1 ».",
        labels: {
          cap: "8 → 4 → 2 → 1 : trois divisions par deux",
        },
      },
      {
        short: "O(n²)",
        title: "O(n²) : une boucle dans une boucle",
        body: [
          "Comparer chaque élément à tous les autres prend `n × n` étapes. Avec `n = 6`, cela fait déjà 36 cases de travail, et doubler `n` le multiplie par quatre.",
          "Les boucles imbriquées sur les mêmes données sont la source habituelle du O(n²).",
        ],
        callout: "Acceptable pour des centaines d’éléments, pénible pour des millions.",
        labels: {
          cap: "6 × 6 = 36 paires",
        },
      },
      {
        short: "Comparer",
        title: "Côte à côte pour n = 8",
        body: [
          "Voici le nombre d’étapes pour le même `n = 8` : 1, 3, 8, 24 (`n log n`), 64 et 256 (`2ⁿ`).",
          "Les deux derniers explosent. O(2ⁿ) apparaît quand on essaie tous les sous-ensembles ; à `n = 40`, on dépasse déjà mille milliards d’étapes.",
        ],
        metrics: [null, "1 à 256", null],
      },
      {
        short: "Constantes",
        title: "Abandonner les constantes et les petits termes",
        body: [
          "Une boucle qui fait 3 choses par élément plus 5 étapes de mise en place coûte `3n + 5`. Pour un `n` énorme, le `5` n’est que du bruit et le `3` une simple unité de mesure ; on écrit donc O(n).",
          "Le grand O ne garde que le terme qui croît le plus vite. `n² + n` est en O(n²), car à `n = 1000` le `n` n’ajoute que 0,1 %.",
        ],
        callout:
          "Les constantes comptent pour la vitesse réelle ; le grand O répond seulement à « comment ça passe à l’échelle ».",
        labels: {
          l2: "↓ enlever le 5",
          l4: "↓ enlever le 3",
        },
      },
      {
        short: "Cas",
        title: "Meilleur cas, cas moyen et pire cas",
        body: [
          "Une recherche linéaire d’une cible dans 6 éléments peut la trouver dès le premier (1 étape, le meilleur cas), au milieu (environ 3, en moyenne) ou en dernier, voire pas du tout (6 étapes, le pire cas).",
          "Sauf indication contraire, le grand O donne le pire cas, car c’est une promesse sur laquelle on peut compter.",
        ],
        metrics: [null, null, "O(n) pire cas"],
        labels: {
          best: "meilleur : 1",
          worst: "pire : 6",
          cap: "même code, trois entrées différentes",
        },
      },
      {
        short: "Espace",
        title: "Le temps n’est pas le seul coût",
        body: [
          "La complexité en espace compte la mémoire supplémentaire dont un algorithme a besoin en plus de son entrée. Inverser un tableau sur place utilise O(1) d’espace en plus ; le copier dans un nouveau tableau en utilise O(n).",
          "On peut souvent échanger l’un contre l’autre, par exemple en stockant des résultats dans une table pour éviter de les recalculer.",
        ],
        callout: "Dites les deux : « O(n log n) en temps, O(n) d’espace en plus ».",
        metrics: [null, "O(1) contre O(n)"],
        labels: {
          ghostnote: "sur place : O(1)",
          copynote: "copie : O(n)",
          cap: "même réponse, facture mémoire différente",
        },
      },
    ],
  },
  "binary-heaps": {
    title: "Tas binaires",
    summary: "Un arbre rangé dans un tableau qui garde toujours sa plus petite valeur au sommet.",
  },
  "binary-search-on-answer": {
    title: "Recherche dichotomique sur la réponse",
    summary:
      "Explorer l’intervalle des réponses possibles avec un test oui/non au lieu de parcourir un tableau.",
  },
  "binary-search-trees": {
    title: "Arbres binaires de recherche",
    summary:
      "Un arbre qui garde ses valeurs ordonnées pour que la recherche et l’insertion suivent un seul chemin.",
  },
  "binary-search": {
    title: "Recherche dichotomique",
    summary:
      "Trouver une valeur dans une liste triée en écartant la moitié du reste à chaque étape.",
  },
  "binary-trees": {
    title: "Arbres binaires",
    summary:
      "Apprendre le vocabulaire des arbres et pourquoi un arbre binaire peut tenir dans un simple tableau.",
  },
  "bit-tricks": {
    title: "Astuces sur les bits",
    summary:
      "Effacer le bit à 1 le plus bas, repérer les puissances de deux, compter les bits et trouver l’intrus avec XOR.",
  },
  "bits-and-masks": {
    title: "Bits et masques",
    summary:
      "Lire les nombres comme des rangées de bits, les combiner avec ET, OU, XOR et décalages, et viser un seul bit.",
  },
  bitsets: {
    title: "Ensembles de bits",
    summary:
      "Stocker un ensemble de petits entiers avec un bit par membre possible et utiliser des opérations sur les bits.",
  },
  "bloom-filters": {
    title: "Filtres de Bloom",
    summary:
      "Un minuscule tableau de bits qui répond « sûrement pas » ou « probablement oui », échangeant la certitude contre de la place.",
  },
  "breadth-first-search": {
    title: "Parcours en largeur",
    summary:
      "Explorer un graphe anneau par anneau avec une file, et obtenir les plus courtes distances gratuitement.",
  },
  "bst-deletion": {
    title: "Suppression dans un ABR",
    summary: "Retirer un nœud d’un arbre binaire de recherche selon trois cas sans casser l’ordre.",
  },
  "building-a-heap": {
    title: "Construire un tas",
    summary:
      "Transformer n’importe quel tableau en tas en temps linéaire en faisant descendre du dernier parent jusqu’à la racine.",
  },
  "circular-buffer": {
    title: "Tampon circulaire",
    summary:
      "Un tableau de taille fixe utilisé comme file, dont les indices de tête et de queue bouclent grâce au modulo.",
  },
  "coin-change": {
    title: "Rendu de monnaie",
    summary:
      "Trouver le moins de pièces pour atteindre un montant, et voir pourquoi le choix glouton peut échouer.",
  },
  "collision-handling": {
    title: "Gestion des collisions",
    summary:
      "Deux clés, un seul panier : le chaînage et le sondage linéaire gardent les deux, à des coûts différents.",
  },
  "connected-components": {
    title: "Composantes connexes",
    summary:
      "Séparer un graphe en ses morceaux distincts en lançant une recherche depuis chaque sommet non visité.",
  },
  "counting-radix-sort": {
    title: "Tri par comptage et tri par base",
    summary:
      "Trier sans comparer les éléments : compter les petits entiers, puis trier chiffre par chiffre.",
  },
  "cycle-detection": {
    title: "Détection de cycles",
    summary:
      "Trouver une boucle avec un DFS : un voisin déjà visité qui n’est pas le parent (non orienté), une arête retour (orienté).",
  },
  "depth-first-search": {
    title: "Parcours en profondeur",
    summary:
      "Plonger le long d’un chemin aussi loin que possible, puis remonter pour essayer le suivant, par récursion ou avec une pile.",
  },
  deques: {
    title: "Files à double extrémité",
    summary:
      "Une file à deux bouts : empiler et dépiler aux deux extrémités en O(1), donc utilisable comme pile ou comme file.",
  },
  "divide-and-conquer": {
    title: "Diviser pour régner",
    summary:
      "Découper un problème en copies plus petites, résoudre chacune, puis combiner les réponses.",
  },
  "doubly-linked-lists": {
    title: "Listes doublement chaînées",
    summary:
      "Chaque nœud connaît ses deux voisins, donc un nœud déjà en main peut être retiré en O(1).",
  },
  "dynamic-arrays": {
    title: "Tableaux dynamiques",
    summary:
      "Un tableau qui grandit en doublant sa capacité, de sorte qu’ajouter coûte peu en moyenne.",
  },
  "edit-distance": {
    title: "Distance d’édition",
    summary:
      "Compter le moins d’insertions, suppressions et remplacements qui transforment un mot en un autre.",
  },
  "fast-slow": {
    title: "Pointeurs rapide et lent",
    summary:
      "Deux pointeurs à des vitesses différentes trouvent le milieu d’une liste et détectent un cycle en un seul passage.",
  },
  "floyd-warshall": {
    title: "Floyd–Warshall",
    summary:
      "Remplir une matrice de distances pour chaque paire de nœuds en essayant tour à tour chaque nœud comme étape.",
  },
  "graph-representation": {
    title: "Représentation des graphes",
    summary:
      "Stocker sommets et arêtes dans une matrice ou une liste d’adjacence, et savoir laquelle convient.",
  },
  "grid-paths": {
    title: "Chemins dans une grille",
    summary:
      "Compter les trajets à travers une grille en n’allant qu’à droite ou vers le bas, case par case.",
  },
  "hash-tables": {
    title: "Tables de hachage",
    summary:
      "Transformer une clé en indice de tableau pour que recherche, ajout et suppression coûtent O(1) en moyenne.",
  },
  "heap-sort": {
    title: "Tri par tas",
    summary:
      "Trier sur place en construisant un tas max et en rangeant sans cesse sa racine à la fin du tableau.",
  },
  "huffman-coding": {
    title: "Codage de Huffman",
    summary:
      "Donner des codes binaires courts aux symboles fréquents en fusionnant sans cesse les deux nœuds les plus légers en un arbre.",
  },
  "interval-scheduling": {
    title: "Ordonnancement d’intervalles",
    summary:
      "Caser le plus de réunions sans chevauchement dans une salle en choisissant toujours celle qui finit le plus tôt.",
  },
  kmp: {
    title: "Recherche KMP",
    summary:
      "Knuth-Morris-Pratt réutilise ce qu’une correspondance partielle nous apprend, si bien que le texte n’est jamais relu.",
  },
  knapsack: {
    title: "Sac à dos",
    summary:
      "Choisir des objets pour maximiser la valeur sous une limite de poids, en décidant prendre ou laisser avec un tableau 2D.",
  },
  "linked-lists": {
    title: "Listes simplement chaînées",
    summary:
      "Des nœuds reliés par des pointeurs next : pas cher à agrandir au début, lent à parcourir, facile à recâbler.",
  },
  "longest-increasing-subsequence": {
    title: "Plus longue sous-suite croissante",
    summary:
      "Trouver la plus longue suite strictement croissante qu’on peut prendre dans l’ordre, avec un tableau des meilleures longueurs.",
  },
  "lowest-common-ancestor": {
    title: "Plus proche ancêtre commun",
    summary:
      "Trouver le nœud le plus profond situé au-dessus de deux nœuds donnés, dans les arbres généraux et les arbres de recherche.",
  },
  "lru-cache": {
    title: "Cache LRU",
    summary:
      "Une table de hachage et une liste doublement chaînée donnent get et put en O(1) et évincent toujours la clé la plus ancienne.",
  },
  matrices: {
    title: "Tableaux 2D",
    summary:
      "Des grilles de lignes et de colonnes : comment elles se rangent en mémoire, comment les parcourir et les transformer.",
  },
  "maximum-subarray": {
    title: "Sous-tableau de somme maximale",
    summary:
      "L’algorithme de Kadane trouve la meilleure suite contiguë en un passage en suivant la meilleure suite qui finit ici.",
  },
  maze: {
    title: "Résoudre un labyrinthe",
    summary:
      "Trouver un chemin dans un labyrinthe en grille en avançant et en reculant devant les impasses.",
  },
  "median-of-a-stream": {
    title: "Médiane d’un flux",
    summary:
      "Suivre la médiane courante avec deux tas qui séparent les données en une moitié basse et une moitié haute.",
  },
  memoization: {
    title: "Mémoïsation",
    summary:
      "Mémoriser la réponse à chaque sous-problème pour qu’une fonction récursive n’en résolve jamais un deux fois.",
  },
  memory: {
    title: "Mémoire et pointeurs",
    summary:
      "La RAM est une longue rangée de cases numérotées ; les pointeurs sont de simples numéros de case stockés dans d’autres cases.",
  },
  "merge-intervals": {
    title: "Fusionner des intervalles",
    summary:
      "Trier les intervalles par début, puis balayer une fois et replier chaque intervalle qui chevauche dans le précédent.",
  },
  "merge-sort": {
    title: "Tri fusion",
    summary:
      "Couper la liste en moitiés jusqu’aux éléments seuls, puis refusionner les moitiés triées.",
  },
  "merge-sorted-lists": {
    title: "Fusionner des listes triées",
    summary:
      "Entrelacer deux listes chaînées triées en une seule en prenant toujours la plus petite tête.",
  },
  "minimum-spanning-trees": {
    title: "Arbres couvrants minimaux",
    summary:
      "Relier tous les nœuds avec les arêtes les moins chères et sans cycle, construit goulûment avec la méthode de Kruskal.",
  },
  "monotonic-queue": {
    title: "File monotone",
    summary:
      "Maximum d’une fenêtre glissante en O(n) : une file à double extrémité d’indices dont les valeurs restent décroissantes.",
  },
  "monotonic-stack": {
    title: "Pile monotone",
    summary:
      "Trouver l’élément suivant plus grand pour chaque position en un passage avec une pile qui reste triée.",
  },
  "n-queens": {
    title: "Problème des N reines",
    summary:
      "Placer quatre reines sur un échiquier 4x4 sans qu’aucune n’en attaque une autre, en revenant en arrière devant les impasses.",
  },
  "p-vs-np": {
    title: "P contre NP",
    summary:
      "Pourquoi vérifier une réponse peut être facile alors qu’en trouver une est difficile, et ce que cela signifie pour vous.",
  },
  "pattern-matching": {
    title: "Recherche de motif",
    summary:
      "La méthode naïve pour trouver un motif dans un texte : essayer chaque position de départ et comparer lettre par lettre.",
  },
  permutations: {
    title: "Permutations",
    summary:
      "Générer tous les ordres d’un ensemble en prolongeant un préfixe, en essayant chaque élément inutilisé puis en annulant.",
  },
  "prefix-sums": {
    title: "Sommes préfixes",
    summary:
      "Précalculer les totaux cumulés une fois, puis répondre à toute question de somme sur un intervalle avec une soustraction.",
  },
  "prims-algorithm": {
    title: "Algorithme de Prim",
    summary:
      "Faire pousser un arbre depuis un nœud de départ en ajoutant toujours l’arête la moins chère qui sort de l’arbre.",
  },
  "priority-queues": {
    title: "Files de priorité",
    summary:
      "Une collection qui rend toujours son élément le plus urgent, et les façons d’en construire une.",
  },
  queues: {
    title: "Files",
    summary:
      "Premier entré, premier sorti : ajouter à l’arrière, retirer à l’avant, et garder les deux bouts peu coûteux.",
  },
  "quick-sort": {
    title: "Tri rapide",
    summary:
      "Choisir un pivot, placer les petites valeurs à gauche et les grandes à droite, puis trier chaque côté de la même façon.",
  },
  quickselect: {
    title: "Quickselect",
    summary:
      "Trouver le k-ième plus petit en partitionnant et en ne recourant que dans le côté qui le contient.",
  },
  recursion: {
    title: "Récursivité",
    summary:
      "Une fonction qui résout un problème en s’appelant elle-même sur un morceau plus petit.",
  },
  resizing: {
    title: "Redimensionnement et re-hachage",
    summary: "Garder un facteur de charge bas en doublant la table et en réinsérant chaque clé.",
  },
  "reversing-a-list": {
    title: "Inverser une liste",
    summary:
      "Retourner chaque flèche next avec trois pointeurs, en sauvegardant le reste de la liste avant chaque changement.",
  },
  "segment-trees": {
    title: "Arbres de segments",
    summary:
      "Répondre à des requêtes de somme sur intervalle et à des mises à jour ponctuelles en O(log n) avec un arbre de sommes partielles.",
  },
  sequences: {
    title: "Séquences",
    summary:
      "Trouver la plus longue sous-séquence commune de deux chaînes avec un tableau 2D et remonter la réponse.",
  },
  "sets-and-maps": {
    title: "Ensembles et dictionnaires",
    summary:
      "Les tables de hachage comme API conviviale : un dictionnaire associe clés et valeurs, un ensemble ne garde que des clés.",
  },
  "shortest-paths": {
    title: "Plus courts chemins",
    summary:
      "Algorithme de Dijkstra : fixer le nœud le plus proche, relâcher ses arêtes, recommencer, puis remonter la route.",
  },
  "simple-sorts": {
    title: "Tris simples",
    summary:
      "Tri à bulles, par sélection et par insertion sur un petit tableau, en comptant le coût.",
  },
  "sliding-window": {
    title: "Fenêtre glissante",
    summary:
      "Garder un cadre sur une partie du tableau et le mettre à jour élément par élément au lieu de tout refaire.",
  },
  "stability-and-limits": {
    title: "Stabilité et limite du tri",
    summary:
      "Pourquoi garder l’ordre des clés égales compte, et pourquoi aucun tri par comparaison ne bat n log n.",
  },
  stacks: {
    title: "Piles",
    summary:
      "Dernier entré, premier sorti : la structure derrière l’annulation, la pile d’appels et la vérification des parenthèses.",
  },
  "strongly-connected-components": {
    title: "Composantes fortement connexes",
    summary:
      "Séparer un graphe orienté en groupes dont les nœuds peuvent tous s’atteindre, avec deux parcours DFS.",
  },
  subsets: {
    title: "Sous-ensembles",
    summary:
      "Lister tous les sous-ensembles d’un ensemble en décidant d’inclure ou d’exclure chaque élément.",
  },
  tabulation: {
    title: "Tabulation",
    summary:
      "Remplir un tableau du plus petit sous-problème vers le haut, sans récursivité ni pile d’appels.",
  },
  "top-k": {
    title: "Problèmes Top-K",
    summary:
      "Garder les k plus grands éléments d’un flux avec un petit tas min au lieu de tout trier.",
  },
  "topological-sort": {
    title: "Tri topologique",
    summary:
      "Ordonner des tâches pour que chaque dépendance passe d’abord, avec les degrés entrants et une file (algorithme de Kahn).",
  },
  "tree-traversals": {
    title: "Parcours d’arbres",
    summary:
      "Visiter chaque nœud d’un arbre binaire dans quatre ordres classiques et voir quand chacun aide.",
  },
  tries: {
    title: "Tries",
    summary:
      "Stocker des mots comme des chemins dans un arbre de lettres pour répondre aux questions de préfixe en un seul parcours.",
  },
  "two-pointers": {
    title: "Deux pointeurs",
    summary:
      "Parcourir un tableau avec deux indices pour qu’un seul passage remplace une double boucle.",
  },
  "union-find": {
    title: "Union-Find",
    summary:
      "Suivre quels éléments sont regroupés avec une forêt dans un tableau, en fusionnant les ensembles en temps quasi constant.",
  },
  "when-greedy-fails": {
    title: "Quand le glouton échoue",
    summary:
      "Un choix localement optimal n’est pas toujours globalement optimal : le rendu de monnaie montre comment repérer le piège.",
  },
};

const fr: LocaleBundle<AlgoUi> = { ui, translations: { modules, lessons } };

export default fr;
