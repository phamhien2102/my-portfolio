import type { LessonText } from "@/components/course/i18n";

/** The whole Big-O lesson. The title and summary come from curriculum.ts. */
export const bigO: LessonText = {
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
};
