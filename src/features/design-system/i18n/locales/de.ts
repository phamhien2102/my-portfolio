import type { LocaleBundle, Translations } from "@/components/course/i18n";

import type { DesignUi } from "../types";

/**
 * German, in one file: the Design System course's own words, the name of every module, and
 * the lessons. Every lesson has its title and summary. Lessons translated in full also have
 * `goals`, `takeaways`, `hud`, `labels` (the names on the diagram) and `steps` (see LessonText;
 * a step's `labels` are keyed as in mapScene, in ../index.ts). A lesson without `steps` is shown
 * in English under its translated title, with a note saying so. To translate another lesson, give
 * its entry in `lessons` the same fields as "request-lifecycle".
 */
const ui: DesignUi = {
  nav: { learn: "Lernen", practice: "Üben", designLab: "Design-Labor", cheatsheets: "Spickzettel" },
  searchPlaceholder: "Lektionen & Konzepte suchen…",
  legend: {
    request: "Anfrage",
    response: "Antwort",
    handshake: "Handshake",
    failed: "fehlgeschlagen",
  },
  goesDown: (name) => `${name} fällt aus`,
  isBack: (name) => `${name} ist wieder da`,
  traffic: (label) => `Verkehr: ${label}`,
  focusOn: (name) => `Fokus auf ${name}`,
};

const modules: Translations["modules"] = {
  foundations: "01. Grundlagen",
  scaling: "02. Skalierung",
  data: "03. Daten & Speicher",
  communication: "04. Kommunikation",
  reliability: "05. Zuverlässigkeit",
  architecture: "06. Architektur",
  security: "07. Sicherheit",
  shipping: "08. Auslieferung",
  "whole-systems": "09. Gesamtsysteme",
};

const lessons: Translations["lessons"] = {
  apis: {
    title: "REST, RPC & GraphQL",
    summary: "Drei Arten, eine API zu gestalten, und wie man zwischen ihnen wählt.",
  },
  authentication: {
    title: "Authentifizierung",
    summary:
      "Beweisen, wer anruft: Passwort-Hashing, Sitzungen, Token und was passiert, wenn Zugangsdaten durchsickern.",
  },
  authorization: {
    title: "Autorisierung",
    summary:
      "Entscheiden, was ein bekannter Aufrufer tun darf: Rollen, Besitz, Scopes und wo die Prüfung liegen muss.",
  },
  "batch-stream": {
    title: "Batch- & Stream-Verarbeitung",
    summary:
      "Daten in großen geplanten Blöcken oder Ereignis für Ereignis verarbeiten und nach Aktualität und Kosten wählen.",
  },
  caching: {
    title: "Caching",
    summary: "Bereits berechnete Antworten in der Nähe halten und den Preis dafür kennen.",
  },
  cap: {
    title: "CAP & Konsistenz",
    summary:
      "Wenn das Netzwerk sich teilt, muss ein replizierter Speicher zwischen Antworten und Richtigsein wählen.",
  },
  cdn: {
    title: "Inhaltsauslieferung",
    summary:
      "Kopien deiner Inhalte nahe bei den Nutzern ablegen, damit die meisten Anfragen nie bis zum Ursprung reisen.",
  },
  cicd: {
    title: "CI/CD & Deployments",
    summary:
      "Einen Commit mit automatischen Prüfungen, sicheren Rollouts und einem schnellen Weg zurück in laufende Software verwandeln.",
  },
  consensus: {
    title: "Konsens & Leader-Wahl",
    summary:
      "Wie ein Cluster unzuverlässiger Maschinen sich mit Mehrheiten und Amtszeiten auf einen Leader und ein Log einigt.",
  },
  "consistent-hashing": {
    title: "Consistent Hashing",
    summary:
      "Schlüssel so über viele Server verteilen, dass das Hinzufügen oder Verlieren eines Servers nur einen kleinen Ausschnitt verschiebt.",
  },
  "design-chat": {
    title: "Ein Chat-System entwerfen",
    summary:
      "Millionen Live-Verbindungen halten, Nachrichten zwischen Servern weiterleiten und keine verlieren oder umsortieren.",
  },
  "design-news-feed": {
    title: "Einen News-Feed entwerfen",
    summary:
      "Eine Timeline bauen, die für Millionen Leser schnell lädt, vom Fan-out über das Ranking bis zu den Caches.",
  },
  encryption: {
    title: "Verschlüsselung & Geheimnisse",
    summary:
      "Daten auf der Leitung und auf der Platte schützen und die Schlüssel und Passwörter selbst aus der Gefahrenzone halten.",
  },
  files: {
    title: "Dateien & Medien",
    summary: "Große Dateien speichern, hochladen und ausliefern, ohne die App-Server zu ersticken.",
  },
  "hld-lld": {
    title: "HLD & LLD",
    summary:
      "Von einer vagen Anforderung zu Kästchen und Pfeilen kommen und dann auf Klassen und APIs hineinzoomen.",
  },
  indexes: {
    title: "Indizes",
    summary:
      "Ein wenig Schreibkosten und Plattenplatz gegen Abfragen tauschen, die fast die ganze Tabelle überspringen.",
  },
  "latency-throughput": {
    title: "Latenz & Durchsatz",
    summary:
      "Zwei Zahlen, die ähnlich klingen, aber verschiedene Fragen beantworten, und wie die Last sie verbindet.",
  },
  "load-balancing": {
    title: "Lastverteilung",
    summary: "Den Verkehr auf viele Server verteilen und weiter bedienen, wenn einer ausfällt.",
  },
  "message-queues": {
    title: "Nachrichtenwarteschlangen",
    summary:
      "Langsame Arbeit an eine Reihe von Workern übergeben, damit der Nutzer nicht darauf warten muss.",
  },
  microservices: {
    title: "Monolith vs. Microservices",
    summary:
      "Wann ein einziges Deployable ein Geschenk ist, wann es zum Engpass wird und was das Aufteilen wirklich kostet.",
  },
  "napkin-math": {
    title: "Überschlagsrechnung",
    summary:
      "Verkehr, Speicher und Bandbreite im Kopf schätzen, nah genug, um ein Design zu wählen.",
  },
  observability: {
    title: "Observability",
    summary:
      "Mit Logs, Metriken und Traces sehen, was ein laufendes System tut und warum es wehtut.",
  },
  pubsub: {
    title: "Pub/Sub & Ereignisse",
    summary:
      "Bekanntgeben, was passiert ist, und beliebig viele Dienste reagieren lassen, ohne dass sie einander kennen.",
  },
  "rate-limiting": {
    title: "Ratenbegrenzung",
    summary:
      "Deinen Dienst vor Clients schützen, die zu viel verlangen, aus Versehen oder absichtlich.",
  },
  realtime: {
    title: "Echtzeit-Updates",
    summary:
      "Änderungen in dem Moment zu den Nutzern schieben, in dem sie passieren: Polling, Long Polling, SSE und WebSockets.",
  },
  redundancy: {
    title: "Redundanz & Failover",
    summary:
      "Einzelne Ausfallpunkte mit Reservekapazität, Health Checks und einer sauberen Umschaltung beseitigen.",
  },
  replication: {
    title: "Replikation",
    summary: "Kopien deiner Daten auf mehreren Maschinen halten, für Tempo und fürs Überleben.",
  },
  "request-lifecycle": {
    title: "Wie eine Anfrage reist",
    summary:
      "Einen Seitenaufruf Hop für Hop verfolgen und herausfinden, wohin die Zeit wirklich geht.",
    goals: [
      "Was DNS tut und warum seine Antworten zwischengespeichert werden",
      "Warum eine Verbindung Hin- und Rückwege kostet",
      "Der Weg: Browser → Server → Datenbank → zurück",
      "Wohin die Ladezeit einer Seite wirklich geht",
      "Fälle: eine langsame Abfrage und ein weit entfernter Nutzer",
    ],
    takeaways: [
      "Ein Seitenaufruf ist eine Kette von Stationen: DNS, Verbindung, Anfrage, Datenbank, Antwort.",
      "Handshakes kosten Hin- und Rückwege, daher zählen Entfernung und das Wiederverwenden von Verbindungen.",
      "Die meiste Zeit wird mit Warten verbracht. Miss, wohin sie geht, bevor du irgendetwas optimierst.",
    ],
    hud: ["DNS-Auflösung", "Verbindung", "Anfrage + Server", "Download", "Gesamt"],
    labels: {
      you: "du",
      "dns.sub": "Resolver",
      web: "Webserver",
      db: "Datenbank",
    },
    steps: [
      {
        short: "Enter",
        title: "Nutzer sagen, der Shop fühlt sich langsam an",
        body: [
          "Bevor du etwas schneller machen kannst, musst du wissen, wohin die Zeit geht. Verfolgen wir also einen einzelnen Seitenaufruf.",
          "Du tippst `shop.example` und drückst Enter. Etwa eine Sechstelsekunde später erscheint die Seite. Dazwischen passiert eine Menge.",
        ],
        callout:
          "Jede Web-Anfrage ist ein Gespräch zwischen Maschinen. Jeder Schritt kostet Zeit, und die Kosten summieren sich.",
      },
      {
        short: "Adresse finden",
        title: "Die Adresse finden (DNS)",
        body: [
          "Netzwerke routen nach numerischer IP-Adresse, nicht nach Namen. Der Browser fragt also zuerst einen DNS-Resolver: Wo ist `shop.example`?",
          "Die Antwort, `203.0.113.7`, kommt nach etwa 20 ms zurück.",
        ],
        callout:
          "Antworten werden für eine Lebensdauer (TTL) zwischengespeichert. In den nächsten Minuten überspringen wiederholte Besuche diesen Schritt ganz.",
        labels: {
          "linkLabels.q": "wo ist shop.example?",
        },
      },
      {
        short: "Verbinden",
        title: "Eine Verbindung öffnen",
        body: [
          "Jetzt verbindet sich der Browser mit `203.0.113.7`. Ein TCP-Handshake einigt sich aufs Reden; ein TLS-Handshake richtet die Verschlüsselung ein.",
          "Jeder Handshake ist ein Hin- und Rückweg: eine Nachricht hinaus und eine Antwort zurück. Bei einer 30-ms-Verbindung sind das schon 60 ms, bevor ein einziges Byte deiner Seite bewegt wurde.",
        ],
        callout:
          "Entfernung zählt. Licht in Glasfaser legt etwa 200 km pro Millisekunde zurück, daher kostet ein Server auf der anderen Seite eines Ozeans bei jedem Hin- und Rückweg echte Zeit.",
        labels: {
          "linkLabels.q": "gecacht · 5 Min.",
        },
      },
      {
        short: "Anfrage",
        title: "Die Anfrage senden",
        body: [
          "Über die offene Verbindung sendet der Browser `GET /products`. Der Webserver empfängt sie und beginnt, die Seite zu bauen.",
          "Doch die Produktliste liegt in einer Datenbank, also kann der Server nicht allein antworten.",
        ],
        labels: {
          "linkLabels.q": "gecacht · 5 Min.",
        },
      },
      {
        short: "Daten holen",
        title: "Der Server fragt die Datenbank",
        body: [
          "Der Server führt eine Abfrage wie `SELECT * FROM products` aus, wartet auf die Zeilen und füllt die HTML-Vorlage.",
          "Beachte, was der Server die meiste Zeit tut: warten. Eine langsame Abfrage lässt jeden Nutzer mitwarten.",
        ],
        callout:
          "Eine einzige langsame Abfrage ist der häufigste Grund für eine langsame Seite. Miss sie, bevor du nach mehr Servern greifst.",
        labels: {
          "linkLabels.q": "gecacht · 5 Min.",
        },
      },
      {
        short: "Antwort",
        title: "Die Seite kommt zurück",
        chapter: "Lösung",
        body: [
          "Der Server schickt die fertige Seite über dieselbe Verbindung zurück, und der Browser zeichnet sie.",
          "Rechne zusammen: DNS 20 ms, Handshakes 60 ms, Anfrage und Datenbank 55 ms, Download 20 ms. Rund 155 ms, davon 130 Warten auf das Netzwerk.",
        ],
        labels: {
          "bubbles.you": "Seite fertig · 155 ms",
          "linkLabels.q": "gecacht · 5 Min.",
        },
      },
      {
        short: "Mehr Dateien",
        title: "Eine Seite, viele Anfragen",
        body: [
          "Das HTML ist nur der Anfang. Es verweist auf ein Stylesheet, ein Skript und Bilder, und der Browser holt jedes davon.",
          "Sie laufen über die bereits offene Verbindung, also gibt es keine neuen Handshakes. Aber jede Datei muss trotzdem reisen, und die Seite ist erst fertig, wenn die wichtigen angekommen sind.",
        ],
        callout:
          "Weniger und kleinere Dateien laden schneller. Sie im Browser oder auf einem CDN zu cachen, spart ganze Anfragen.",
        labels: {
          "bubbles.you": "40 Dateien · 1 Verbindung",
          "linkLabels.q": "gecacht · 5 Min.",
          "linkLabels.h": "HTTP/2 · viele Anfragen gleichzeitig",
        },
      },
      {
        short: "Langsame Abfrage",
        title: "Fall: Die Abfrage dauert 400 ms",
        chapter: "Problem",
        body: [
          "Nehmen wir an, die Produkttabelle ist gewachsen und die Abfrage durchsucht jede Zeile. Die Datenbank braucht 400 ms statt 35.",
          "Am Netzwerk hat sich nichts geändert, doch die Seite ist viermal langsamer, und jeder Nutzer sieht es.",
        ],
        callout:
          "Mehr Webserver würden hier nicht helfen: Sie würden alle auf dieselbe langsame Abfrage warten. Behebe sie mit einem Index oder einem Cache.",
        labels: {
          "bubbles.db": "400 ms · Scan",
          "linkLabels.q": "gecacht · 5 Min.",
        },
      },
      {
        short: "Weit weg",
        title: "Fall: Der Nutzer ist auf einem anderen Kontinent",
        chapter: "Problem",
        body: [
          "Ein Kunde in Sydney erreicht einen Server in Virginia. Allein das Licht braucht etwa 80 ms pro Richtung, und echte Routen sind länger, also liegt ein Hin- und Rückweg eher bei 200 ms.",
          "Zwei Handshakes und eine Anfrage kosten jetzt mehrere Hin- und Rückwege, und die Seite braucht deutlich über eine halbe Sekunde, bevor irgendeine Arbeit getan ist.",
        ],
        callout:
          "Du kannst Licht nicht schneller machen. Bring stattdessen den Inhalt näher zum Nutzer (ein CDN oder ein Server in seiner Region).",
        labels: {
          "labels.you": "du · Sydney",
          "linkLabels.q": "gecacht · 5 Min.",
          "linkLabels.h": "≈ 200 ms pro Hin- und Rückweg",
        },
      },
      {
        short: "Fazit",
        title: "Wohin die Zeit ging",
        body: [
          "Ein normaler Seitenaufruf: DNS 20 ms, Handshakes 60 ms, Anfrage und Server 55 ms, Download 20 ms. Insgesamt etwa 155 ms.",
          "Beachte, wie wenig davon dein Code war. Die meiste Zeit ging fürs Warten auf das Netzwerk drauf, daher bestehen die großen Gewinne darin, Stationen zu entfernen, zu verkürzen oder parallel auszuführen.",
        ],
        callout:
          "Die meisten späteren Lektionen sind Tricks, um eine Station zu entfernen (Caching), zu verkürzen (CDNs) oder parallel auszuführen (horizontales Skalieren).",
        labels: {
          "bubbles.you": "Seite fertig · 155 ms",
          "panels.0.title": "Wohin die Zeit ging",
          "panels.0.line0": "DNS-Auflösung\t20 ms",
          "panels.0.line1": "Verbindung\t60 ms",
          "panels.0.line2": "Anfrage + Server\t55 ms",
          "panels.0.line3": "Download\t20 ms",
          "panels.0.line4": "Gesamt\t155 ms",
          "panels.0.line5": "130 ms davon sind Warten",
        },
      },
    ],
  },
  sagas: {
    title: "Sagas & verteilte Transaktionen",
    summary:
      "Eine Geschäftsaktion über mehrere Dienste konsistent halten, ohne jede Datenbank gleichzeitig zu sperren.",
  },
  "service-discovery": {
    title: "Service Discovery & Gateways",
    summary:
      "Wie Aufrufer gesunde Instanzen finden, die kommen und gehen, und warum ein Gateway an der Haustür sitzt.",
  },
  sharding: {
    title: "Sharding",
    summary:
      "Einen riesigen Datensatz auf Maschinen aufteilen, damit keine einzelne Datenbank alles halten muss.",
  },
  "sql-nosql": {
    title: "SQL vs. NoSQL",
    summary:
      "Die Datenbank an die Form deiner Daten und die Garantien anpassen, die deine Abfragen brauchen.",
  },
  stateless: {
    title: "Zustandslose Dienste",
    summary:
      "Den Speicher pro Nutzer von den Webservern fernhalten, damit jeder Server jede Anfrage beantworten kann.",
  },
  "storage-engines": {
    title: "Storage-Engines",
    summary:
      "B-Bäume und LSM-Bäume danach vergleichen, wie sie Schreibvorgänge in Plattenarbeit verwandeln, und nach Last wählen.",
  },
  testing: {
    title: "Testen",
    summary:
      "Günstig Vertrauen aufbauen: Unit-, Integrations- und End-to-End-Tests, Fakes, Flakiness und was in der CI läuft.",
  },
  "timeouts-retries": {
    title: "Timeouts & Wiederholungen",
    summary:
      "Begrenzen, wie lange man wartet, nur Sicheres wiederholen und vermeiden, aus einem Hänger einen Ausfall zu machen.",
  },
  transactions: {
    title: "Transaktionen & Isolation",
    summary:
      "Gleichzeitige Schreibvorgänge korrekt halten: atomare Commits, Isolationsstufen, Sperren und Versionen.",
  },
  "unique-ids": {
    title: "Eindeutige IDs im großen Maßstab",
    summary:
      "Millionen eindeutiger, grob zeitlich geordneter IDs pro Sekunde ohne einen einzelnen Engpass erzeugen.",
  },
  "url-shortener": {
    title: "Einen URL-Verkürzer entwerfen",
    summary:
      "Die Teile zusammensetzen: IDs, Speicher, Caching und Lesezugriffe, die Schreibzugriffe 100 zu 1 übertreffen.",
  },
  "vertical-horizontal": {
    title: "Vertikal vs. horizontal skalieren",
    summary:
      "Eine größere Maschine kaufen oder mehr Maschinen hinzufügen: was jedes kostet und wo jedes aufhört.",
  },
};

const de: LocaleBundle<DesignUi> = { ui, translations: { modules, lessons } };

export default de;
