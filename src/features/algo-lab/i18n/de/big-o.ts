import type { LessonText } from "@/components/course/i18n";

/** The whole Big-O lesson. The title and summary come from curriculum.ts. */
export const bigO: LessonText = {
  goals: [
    "Was Big-O misst und warum es Konstanten ignoriert",
    "Die sechs Wachstumsraten, die dir am häufigsten begegnen",
    "Bester, durchschnittlicher und schlechtester Fall",
    "Zeitkomplexität gegenüber Speicherkomplexität",
  ],
  takeaways: [
    "Big-O beschreibt, wie die Zahl der Schritte mit der Eingabe wächst, nicht wie viele Sekunden ein Lauf dauert.",
    "Konstanten und Terme niedrigerer Ordnung weglassen: 3n + 5 und 100n sind beide O(n).",
    "Sag immer, welchen Fall und welche Ressource du meinst: die Zeit im schlechtesten Fall und der zusätzliche Speicher können sich unterscheiden.",
  ],
  hud: ["n", "Schritte", "Wachstum", "Zusatzspeicher"],
  pseudocode: [
    "analyze(items):",
    "    x = items[3]                  # O(1): ein Schritt",
    "    for each item in items:       # O(n): jedes Element berühren",
    "        total = total + item",
    "    while size > 1:               # O(log n): jedes Mal halbieren",
    "        size = size / 2",
    "    for each a in items:          # O(n^2): Schleife in der Schleife",
    "        for each b in items:",
    "            compare(a, b)",
    "    return total",
  ],
  steps: [
    {
      short: "Warum",
      title: "Schritte zählen, nicht Sekunden",
      body: [
        "Eine Stoppuhr sagt dir, wie schnell ein Programm auf einer Maschine lief. Sie sagt nichts darüber, was passiert, wenn die Eingabe zehnmal größer ist.",
        "Big-O zählt grundlegende Schritte als Funktion der Eingabegröße `n`. Hier ist `n = 8`, und jede Zelle ist ein Element, das ein Algorithmus eventuell ansehen muss.",
      ],
      labels: {
        cap: "n = 8 Elemente",
      },
    },
    {
      short: "O(1)",
      title: "O(1): konstante Zeit",
      body: [
        "Das Lesen von `a[3]` dauert einen Schritt, egal ob das Array 8 oder 8 Millionen Elemente hat. Die Kosten hängen überhaupt nicht von `n` ab.",
        "Konstant heißt nicht „schnell“, sondern „flach“.",
      ],
      callout: "Array-Zugriff per Index, Push auf einen Stapel und Hash-Lookups sind O(1).",
      labels: {
        cap: "ein Schritt, egal wie groß n",
      },
    },
    {
      short: "O(n)",
      title: "O(n): lineare Zeit",
      body: [
        "Das Summieren des Arrays besucht jedes Element einmal: 8 Elemente, 8 Schritte. Verdoppelst du die Eingabe, verdoppelt sich die Arbeit.",
        "Lineare Suche, das Finden des Maximums und das Kopieren einer Liste sind alle O(n).",
      ],
      labels: {
        cap: "jedes Element einmal berühren: 8 Schritte",
      },
    },
    {
      short: "O(log n)",
      title: "O(log n): das Problem halbieren",
      body: [
        "Wenn jeder Schritt die Hälfte des Rests verwirft, schrumpfen 8 Elemente auf 4, dann 2, dann 1: nur 3 Schritte. Tausend Elemente brauchen nur etwa 10, eine Milliarde etwa 30.",
        "Darum fühlt sich die Binärsuche auf sortierten Daten augenblicklich an.",
      ],
      callout: "log n ist „wie oft kann ich n halbieren, bevor ich bei 1 ankomme“.",
      labels: {
        cap: "8 → 4 → 2 → 1: drei Halbierungen",
      },
    },
    {
      short: "O(n²)",
      title: "O(n²): eine Schleife in einer Schleife",
      body: [
        "Jedes Element mit jedem anderen zu vergleichen kostet `n × n` Schritte. Bei `n = 6` sind das schon 36 Zellen Arbeit, und eine Verdopplung von `n` vervierfacht sie.",
        "Verschachtelte Schleifen über dieselben Daten sind die übliche Quelle von O(n²).",
      ],
      callout: "Gut für Hunderte von Elementen, qualvoll für Millionen.",
      labels: {
        cap: "6 × 6 = 36 Paare",
      },
    },
    {
      short: "Vergleich",
      title: "Nebeneinander bei n = 8",
      body: [
        "Hier sind die Schrittzahlen für dasselbe `n = 8`: 1, 3, 8, 24 (`n log n`), 64 und 256 (`2ⁿ`).",
        "Die letzten beiden explodieren. O(2ⁿ) taucht auf, wenn man jede Teilmenge probiert; bei `n = 40` sind es schon über eine Billion Schritte.",
      ],
      metrics: [null, "1 bis 256", null],
    },
    {
      short: "Konstanten",
      title: "Konstanten und kleine Terme weglassen",
      body: [
        "Eine Schleife, die pro Element 3 Dinge tut plus 5 Vorbereitungsschritte, kostet `3n + 5`. Für riesiges `n` ist die `5` Rauschen und die `3` nur eine Maßeinheit, also schreiben wir O(n).",
        "Big-O behält nur den am schnellsten wachsenden Term. `n² + n` ist O(n²), denn bei `n = 1000` macht das `n` nur 0,1 % aus.",
      ],
      callout:
        "Konstanten zählen für die echte Geschwindigkeit; Big-O beantwortet nur „wie skaliert es“.",
      labels: {
        l2: "↓ die 5 weglassen",
        l4: "↓ die 3 weglassen",
      },
    },
    {
      short: "Fälle",
      title: "Bester, durchschnittlicher und schlechtester Fall",
      body: [
        "Eine lineare Suche nach einem Ziel in 6 Elementen trifft es vielleicht gleich beim ersten (1 Schritt, bester Fall), in der Mitte (etwa 3, Durchschnitt) oder beim letzten bzw. gar nicht (6 Schritte, schlechtester Fall).",
        "Wenn nichts anderes gesagt wird, nennt Big-O den schlechtesten Fall, weil er ein Versprechen ist, auf das man sich verlassen kann.",
      ],
      metrics: [null, null, "O(n) schlechtester"],
      labels: {
        best: "beste: 1",
        worst: "schlechteste: 6",
        cap: "derselbe Code, drei verschiedene Eingaben",
      },
    },
    {
      short: "Speicher",
      title: "Zeit ist nicht der einzige Preis",
      body: [
        "Speicherkomplexität zählt den zusätzlichen Speicher, den ein Algorithmus über seine Eingabe hinaus braucht. Ein Array an Ort und Stelle umzukehren braucht O(1) Zusatzspeicher; es in ein neues Array zu kopieren braucht O(n).",
        "Oft kann man das eine gegen das andere tauschen, etwa indem man Ergebnisse in einer Tabelle ablegt, um sie nicht neu zu berechnen.",
      ],
      callout: "Nenne beides: „O(n log n) Zeit, O(n) Zusatzspeicher“.",
      metrics: [null, "O(1) gegenüber O(n)"],
      labels: {
        ghostnote: "an Ort und Stelle: O(1)",
        copynote: "Kopie: O(n)",
        cap: "gleiche Antwort, andere Speicherrechnung",
      },
    },
  ],
};
