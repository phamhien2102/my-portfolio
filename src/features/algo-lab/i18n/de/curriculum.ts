import type { LessonText } from "@/components/course/i18n";

/** German: the name of every module and the title and summary of every lesson. */
export const modules: Record<string, string> = {
  foundations: "01. Grundlagen",
  arrays: "02. Arrays & Strings",
  "linked-lists": "03. Verkettete Listen",
  "stacks-queues": "04. Stapel & Warteschlangen",
  hashing: "05. Hashing",
  trees: "06. Bäume",
  heaps: "07. Heaps",
  graphs: "08. Graphen",
  sorting: "09. Sortieren & Suchen",
  greedy: "10. Gierige Algorithmen",
  backtracking: "11. Backtracking",
  dp: "12. Dynamische Programmierung",
  bits: "13. Bitmanipulation",
  hard: "14. Schwierige Probleme",
};

export const lessons: Record<string, Pick<LessonText, "title" | "summary">> = {
  arrays: {
    title: "Arrays",
    summary:
      "Eine Reihe gleich großer Plätze nebeneinander im Speicher: sofortiges Lesen, teures Einfügen in der Mitte.",
  },
  "balanced-brackets": {
    title: "Ausgewogene Klammern",
    summary:
      "Prüfen, ob jede (, [ und { in der richtigen Reihenfolge geschlossen wird, mit einem Stapel der offenen.",
  },
  "balanced-trees": {
    title: "Balancierte Bäume",
    summary:
      "Einen Suchbaum durch Rotationen niedrig halten, damit jede Operation O(log n) bleibt.",
  },
  "bellman-ford": {
    title: "Bellman–Ford",
    summary:
      "Jede Kante V − 1 Mal relaxieren, um kürzeste Wege auch bei negativen Gewichten zu finden und negative Zyklen zu erkennen.",
  },
  "big-o": {
    title: "Big-O-Notation",
    summary:
      "Beschreiben, wie die Kosten eines Algorithmus mit der Eingabe wachsen, und alles andere ignorieren.",
  },
  "binary-heaps": {
    title: "Binäre Heaps",
    summary: "Ein Baum, in ein Array gepackt, der seinen kleinsten Wert immer oben hält.",
  },
  "binary-search-on-answer": {
    title: "Binärsuche auf der Antwort",
    summary:
      "Den Bereich möglicher Antworten mit einer Ja/Nein-Prüfung durchsuchen statt ein Array.",
  },
  "binary-search-trees": {
    title: "Binäre Suchbäume",
    summary:
      "Ein Baum, der seine Werte geordnet hält, sodass Suchen und Einfügen einem einzigen Pfad folgen.",
  },
  "binary-search": {
    title: "Binärsuche",
    summary:
      "Einen Wert in einer sortierten Liste finden, indem bei jedem Schritt die Hälfte des Rests verworfen wird.",
  },
  "binary-trees": {
    title: "Binärbäume",
    summary:
      "Das Vokabular von Bäumen lernen und warum ein Binärbaum in einem einfachen Array Platz hat.",
  },
  "bit-tricks": {
    title: "Bit-Tricks",
    summary:
      "Das niedrigste gesetzte Bit löschen, Zweierpotenzen erkennen, Bits zählen und mit XOR den Außenseiter finden.",
  },
  "bits-and-masks": {
    title: "Bits & Masken",
    summary:
      "Zahlen als Reihen von Bits lesen, sie mit UND, ODER, XOR und Verschiebungen kombinieren und ein einzelnes Bit anvisieren.",
  },
  bitsets: {
    title: "Bitsets",
    summary:
      "Eine Menge kleiner ganzer Zahlen mit einem Bit je möglichem Mitglied speichern und Bitoperationen darauf nutzen.",
  },
  "bloom-filters": {
    title: "Bloomfilter",
    summary:
      "Ein winziges Bit-Array, das „sicher nicht“ oder „wahrscheinlich ja“ sagt und Gewissheit gegen Platz tauscht.",
  },
  "breadth-first-search": {
    title: "Breitensuche",
    summary:
      "Einen Graphen Ring für Ring mit einer Warteschlange erkunden und kürzeste Abstände geschenkt bekommen.",
  },
  "bst-deletion": {
    title: "Löschen im BST",
    summary:
      "Einen Knoten aus einem binären Suchbaum in drei Fällen entfernen, ohne die Ordnung zu zerstören.",
  },
  "building-a-heap": {
    title: "Einen Heap aufbauen",
    summary:
      "Ein beliebiges Array in linearer Zeit zum Heap machen, indem man vom letzten Elternknoten bis zur Wurzel absinken lässt.",
  },
  "circular-buffer": {
    title: "Ringpuffer",
    summary:
      "Ein festes Array als Warteschlange, dessen Kopf- und Schwanzindex per Modulo umlaufen.",
  },
  "coin-change": {
    title: "Wechselgeld",
    summary:
      "Die wenigsten Münzen für einen Betrag finden und sehen, warum gieriges Wählen scheitern kann.",
  },
  "collision-handling": {
    title: "Kollisionsbehandlung",
    summary:
      "Zwei Schlüssel, ein Eimer: Verkettung und lineares Sondieren behalten beide, zu unterschiedlichen Kosten.",
  },
  "connected-components": {
    title: "Zusammenhangskomponenten",
    summary:
      "Einen Graphen in seine getrennten Teile zerlegen, indem man von jedem unbesuchten Knoten eine Suche startet.",
  },
  "counting-radix-sort": {
    title: "Zähl- & Radixsort",
    summary:
      "Sortieren ohne Vergleiche: kleine ganze Zahlen zählen, dann Ziffer für Ziffer sortieren.",
  },
  "cycle-detection": {
    title: "Zykluserkennung",
    summary:
      "Eine Schleife mit DFS finden: ein besuchter Nachbar, der nicht der Elternknoten ist (ungerichtet), eine Rückwärtskante (gerichtet).",
  },
  "depth-first-search": {
    title: "Tiefensuche",
    summary:
      "Einem Pfad so weit wie möglich folgen, dann zurück und den nächsten versuchen, mit Rekursion oder einem Stapel.",
  },
  deques: {
    title: "Deques",
    summary:
      "Eine doppelendige Warteschlange: an beiden Enden in O(1) einfügen und entnehmen, also als Stapel oder Warteschlange nutzbar.",
  },
  "divide-and-conquer": {
    title: "Teile und herrsche",
    summary: "Ein Problem in kleinere Kopien teilen, jede lösen und die Antworten kombinieren.",
  },
  "doubly-linked-lists": {
    title: "Doppelt verkettete Listen",
    summary:
      "Jeder Knoten kennt beide Nachbarn, daher lässt sich ein bereits gehaltener Knoten in O(1) entfernen.",
  },
  "dynamic-arrays": {
    title: "Dynamische Arrays",
    summary:
      "Ein Array, das durch Verdoppeln seiner Kapazität wächst, sodass Anhängen im Schnitt billig ist.",
  },
  "edit-distance": {
    title: "Editierdistanz",
    summary:
      "Die wenigsten Einfügungen, Löschungen und Ersetzungen zählen, die ein Wort in ein anderes verwandeln.",
  },
  "fast-slow": {
    title: "Schnelle & langsame Zeiger",
    summary:
      "Zwei Zeiger mit unterschiedlichem Tempo finden die Mitte einer Liste und erkennen einen Zyklus in einem Durchlauf.",
  },
  "floyd-warshall": {
    title: "Floyd–Warshall",
    summary:
      "Eine Distanzmatrix für jedes Knotenpaar füllen, indem jeder Knoten der Reihe nach als Zwischenstopp probiert wird.",
  },
  "graph-representation": {
    title: "Graphdarstellung",
    summary:
      "Knoten und Kanten in einer Matrix oder Adjazenzliste speichern und wissen, welche passt.",
  },
  "grid-paths": {
    title: "Gitterpfade",
    summary:
      "Die Wege durch ein Gitter zählen, wenn man nur nach rechts oder unten geht, Zelle für Zelle.",
  },
  "hash-tables": {
    title: "Hashtabellen",
    summary:
      "Einen Schlüssel in einen Array-Index verwandeln, sodass Suchen, Einfügen und Löschen im Schnitt O(1) kosten.",
  },
  "heap-sort": {
    title: "Heapsort",
    summary:
      "In place sortieren, indem man einen Max-Heap baut und seine Wurzel immer wieder ans Array-Ende legt.",
  },
  "huffman-coding": {
    title: "Huffman-Kodierung",
    summary:
      "Häufigen Symbolen kurze Bitcodes geben, indem die zwei leichtesten Knoten immer wieder zu einem Baum verschmolzen werden.",
  },
  "interval-scheduling": {
    title: "Intervallplanung",
    summary:
      "Die meisten überschneidungsfreien Meetings in einen Raum bekommen, indem man stets das früheste Ende wählt.",
  },
  kmp: {
    title: "KMP-Suche",
    summary:
      "Knuth-Morris-Pratt nutzt, was ein Teiltreffer verrät, sodass der Text nie erneut gelesen wird.",
  },
  knapsack: {
    title: "Rucksackproblem",
    summary:
      "Gegenstände wählen, um den Wert unter einer Gewichtsgrenze zu maximieren, und mit einer 2D-Tabelle über Nehmen oder Lassen entscheiden.",
  },
  "linked-lists": {
    title: "Einfach verkettete Listen",
    summary:
      "Knoten, die über next-Zeiger verbunden sind: vorn billig zu erweitern, langsam zu durchsuchen, leicht umzuverdrahten.",
  },
  "longest-increasing-subsequence": {
    title: "Längste aufsteigende Teilfolge",
    summary:
      "Die längste streng steigende Folge finden, die man der Reihe nach wählen kann, mit einer Tabelle der besten Längen.",
  },
  "lowest-common-ancestor": {
    title: "Niedrigster gemeinsamer Vorfahre",
    summary:
      "Den tiefsten Knoten finden, der über zwei gegebenen Knoten liegt, in allgemeinen Bäumen und Suchbäumen.",
  },
  "lru-cache": {
    title: "LRU-Cache",
    summary:
      "Eine Hashmap und eine doppelt verkettete Liste liefern O(1) für get und put und verdrängen immer den ältesten Schlüssel.",
  },
  matrices: {
    title: "2D-Arrays",
    summary:
      "Gitter aus Zeilen und Spalten: wie sie im Speicher liegen, wie man sie durchläuft und umformt.",
  },
  "maximum-subarray": {
    title: "Maximales Teilarray",
    summary:
      "Kadanes Algorithmus findet die beste zusammenhängende Folge in einem Durchlauf, indem er die beste hier endende Folge verfolgt.",
  },
  maze: {
    title: "Ein Labyrinth lösen",
    summary:
      "Einen Weg durch ein Gitterlabyrinth finden, indem man vorwärts geht und aus Sackgassen zurückweicht.",
  },
  "median-of-a-stream": {
    title: "Median eines Datenstroms",
    summary:
      "Den laufenden Median mit zwei Heaps verfolgen, die die Daten in eine untere und eine obere Hälfte teilen.",
  },
  memoization: {
    title: "Memoisierung",
    summary:
      "Die Antwort jedes Teilproblems merken, damit eine rekursive Funktion nie eines zweimal löst.",
  },
  memory: {
    title: "Speicher & Zeiger",
    summary:
      "RAM ist eine lange Reihe nummerierter Plätze; Zeiger sind nur Platznummern, die in anderen Plätzen stehen.",
  },
  "merge-intervals": {
    title: "Intervalle zusammenführen",
    summary:
      "Bereiche nach Start sortieren, dann einmal durchlaufen und jeden überlappenden in den vorigen falten.",
  },
  "merge-sort": {
    title: "Mergesort",
    summary:
      "Die Liste bis zu Einzelelementen halbieren, dann die sortierten Hälften wieder zusammenführen.",
  },
  "merge-sorted-lists": {
    title: "Sortierte Listen zusammenführen",
    summary:
      "Zwei sortierte verkettete Listen zu einer verweben, indem man immer den kleineren Kopf nimmt.",
  },
  "minimum-spanning-trees": {
    title: "Minimale Spannbäume",
    summary:
      "Alle Knoten mit den billigsten Kanten und ohne Zyklus verbinden, gierig aufgebaut mit Kruskals Methode.",
  },
  "monotonic-queue": {
    title: "Monotone Warteschlange",
    summary:
      "Gleitendes-Fenster-Maximum in O(n): ein Deque von Indizes, deren Werte absteigend bleiben.",
  },
  "monotonic-stack": {
    title: "Monotoner Stapel",
    summary:
      "Das nächste größere Element für jede Position in einem Durchlauf finden, mit einem Stapel, der sortiert bleibt.",
  },
  "n-queens": {
    title: "N-Damen",
    summary:
      "Vier Damen so auf ein 4x4-Brett stellen, dass keine eine andere bedroht, mit Rückzug aus Sackgassen.",
  },
  "p-vs-np": {
    title: "P gegen NP",
    summary:
      "Warum das Prüfen einer Antwort leicht sein kann, während das Finden schwer ist, und was das für dich bedeutet.",
  },
  "pattern-matching": {
    title: "Mustersuche",
    summary:
      "Der naive Weg, ein Muster in einem Text zu finden: jede Startstelle probieren und Buchstabe für Buchstabe vergleichen.",
  },
  permutations: {
    title: "Permutationen",
    summary:
      "Jede Anordnung einer Menge erzeugen, indem man ein Präfix erweitert, jedes ungenutzte Element probiert und zurücknimmt.",
  },
  "prefix-sums": {
    title: "Präfixsummen",
    summary:
      "Laufende Summen einmal vorberechnen, dann jede Bereichssummenfrage mit einer Subtraktion beantworten.",
  },
  "prims-algorithm": {
    title: "Prims Algorithmus",
    summary:
      "Einen Baum von einem Startknoten aus wachsen lassen, indem man stets die billigste Kante hinzufügt, die den Baum verlässt.",
  },
  "priority-queues": {
    title: "Prioritätswarteschlangen",
    summary:
      "Eine Sammlung, die immer ihr dringendstes Element herausgibt, und die Wege, eine zu bauen.",
  },
  queues: {
    title: "Warteschlangen",
    summary:
      "Wer zuerst kommt, geht zuerst: hinten anfügen, vorn entnehmen und beide Enden billig halten.",
  },
  "quick-sort": {
    title: "Quicksort",
    summary:
      "Ein Pivot wählen, kleinere Werte nach links und größere nach rechts verteilen, dann jede Seite genauso sortieren.",
  },
  quickselect: {
    title: "Quickselect",
    summary:
      "Das k-kleinste Element finden, indem man partitioniert und nur in die Seite rekursiert, die es enthält.",
  },
  recursion: {
    title: "Rekursion",
    summary:
      "Eine Funktion, die ein Problem löst, indem sie sich auf einem kleineren Stück selbst aufruft.",
  },
  resizing: {
    title: "Vergrößern & Rehashing",
    summary:
      "Den Lastfaktor niedrig halten, indem man die Tabelle verdoppelt und jeden Schlüssel neu einfügt.",
  },
  "reversing-a-list": {
    title: "Eine Liste umkehren",
    summary:
      "Jeden next-Pfeil mit drei Zeigern umdrehen und vor jeder Änderung den Rest der Liste sichern.",
  },
  "segment-trees": {
    title: "Segmentbäume",
    summary:
      "Bereichssummen-Abfragen und Punkt-Updates in O(log n) mit einem Baum aus Teilsummen beantworten.",
  },
  sequences: {
    title: "Folgen",
    summary:
      "Die längste gemeinsame Teilfolge zweier Strings mit einer 2D-Tabelle finden und die Antwort zurückverfolgen.",
  },
  "sets-and-maps": {
    title: "Mengen & Maps",
    summary:
      "Hashtabellen als freundliche API: Eine Map verbindet Schlüssel mit Werten, eine Menge behält nur Schlüssel.",
  },
  "shortest-paths": {
    title: "Kürzeste Wege",
    summary:
      "Dijkstras Algorithmus: den nächsten Knoten festsetzen, seine Kanten relaxieren, wiederholen, dann die Route zurückverfolgen.",
  },
  "simple-sorts": {
    title: "Einfache Sortierverfahren",
    summary:
      "Bubble-, Selection- und Insertion-Sort auf einem kleinen Array, mit gezählten Kosten.",
  },
  "sliding-window": {
    title: "Gleitendes Fenster",
    summary:
      "Einen Rahmen über einen Teil eines Arrays halten und ihn Element für Element aktualisieren, statt alles neu zu machen.",
  },
  "stability-and-limits": {
    title: "Stabilität & die Sortiergrenze",
    summary:
      "Warum es zählt, dass gleiche Schlüssel ihre Reihenfolge behalten, und warum kein Vergleichssort n log n schlägt.",
  },
  stacks: {
    title: "Stapel",
    summary:
      "Zuletzt hinein, zuerst heraus: die Struktur hinter Rückgängig, Aufrufstapel und Klammerprüfung.",
  },
  "strongly-connected-components": {
    title: "Starke Zusammenhangskomponenten",
    summary:
      "Einen gerichteten Graphen in Gruppen zerlegen, deren Knoten sich alle erreichen können, mit zwei DFS-Durchläufen.",
  },
  subsets: {
    title: "Teilmengen",
    summary:
      "Jede Teilmenge einer Menge auflisten, indem man für jedes Element entscheidet: aufnehmen oder weglassen.",
  },
  tabulation: {
    title: "Tabellierung",
    summary:
      "Eine Tabelle vom kleinsten Teilproblem aufwärts füllen, ohne Rekursion und ohne Aufrufstapel.",
  },
  "top-k": {
    title: "Top-K-Probleme",
    summary:
      "Die k größten Elemente eines Datenstroms mit einem kleinen Min-Heap behalten, statt alles zu sortieren.",
  },
  "topological-sort": {
    title: "Topologische Sortierung",
    summary:
      "Aufgaben so ordnen, dass jede Abhängigkeit zuerst kommt, mit Eingangsgraden und einer Warteschlange (Kahns Algorithmus).",
  },
  "tree-traversals": {
    title: "Baumdurchläufe",
    summary:
      "Jeden Knoten eines Binärbaums in vier klassischen Reihenfolgen besuchen und sehen, wann welche hilft.",
  },
  tries: {
    title: "Tries",
    summary:
      "Wörter als Pfade in einem Buchstabenbaum speichern, damit Präfixfragen in einem Durchlauf beantwortet werden.",
  },
  "two-pointers": {
    title: "Zwei Zeiger",
    summary:
      "Zwei Indizes durch ein Array laufen lassen, sodass ein Durchlauf eine verschachtelte Schleife ersetzt.",
  },
  "union-find": {
    title: "Union-Find",
    summary:
      "Mit einem Wald in einem Array verfolgen, welche Elemente zusammengehören, und Mengen in nahezu konstanter Zeit vereinen.",
  },
  "when-greedy-fails": {
    title: "Wenn Gier scheitert",
    summary:
      "Eine lokal beste Wahl ist nicht immer global die beste: Wechselgeld zeigt, wie man die Falle erkennt.",
  },
};
