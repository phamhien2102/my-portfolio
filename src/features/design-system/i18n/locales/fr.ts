import type { LocaleBundle, Translations } from "@/components/course/i18n";

import type { DesignUi } from "../types";

/**
 * French, in one file: the Design System course's own words, the name of every module, and
 * the lessons. Every lesson has its title and summary. Lessons translated in full also have
 * `goals`, `takeaways`, `hud`, `labels` (the names on the diagram) and `steps` (see LessonText;
 * a step's `labels` are keyed as in mapScene, in ../index.ts). A lesson without `steps` is shown
 * in English under its translated title, with a note saying so. To translate another lesson, give
 * its entry in `lessons` the same fields as "request-lifecycle".
 */
const ui: DesignUi = {
  nav: {
    learn: "Apprendre",
    practice: "S’entraîner",
    designLab: "Atelier de conception",
    cheatsheets: "Antisèches",
  },
  searchPlaceholder: "Rechercher leçons et notions…",
  legend: {
    request: "requête",
    response: "réponse",
    handshake: "poignée de main",
    failed: "échec",
  },
  goesDown: (name) => `${name} tombe en panne`,
  isBack: (name) => `${name} est rétabli`,
  traffic: (label) => `Trafic : ${label}`,
  focusOn: (name) => `Focus sur ${name}`,
};

const modules: Translations["modules"] = {
  foundations: "01. Fondamentaux",
  scaling: "02. Passage à l’échelle",
  data: "03. Données & Stockage",
  communication: "04. Communication",
  reliability: "05. Fiabilité",
  architecture: "06. Architecture",
  security: "07. Sécurité",
  shipping: "08. Livraison",
  "whole-systems": "09. Systèmes complets",
};

const lessons: Translations["lessons"] = {
  apis: {
    title: "REST, RPC et GraphQL",
    summary: "Trois façons de concevoir une API, et comment choisir entre elles.",
  },
  authentication: {
    title: "Authentification",
    summary:
      "Prouver qui appelle : hachage des mots de passe, sessions, jetons, et ce qui se passe quand des identifiants fuient.",
  },
  authorization: {
    title: "Autorisation",
    summary:
      "Décider ce qu’un appelant connu a le droit de faire : rôles, propriété, périmètres, et où la vérification doit se trouver.",
  },
  "batch-stream": {
    title: "Traitement par lots et en flux",
    summary:
      "Traiter les données par gros blocs planifiés ou un événement à la fois, et choisir selon la fraîcheur et le coût.",
  },
  caching: {
    title: "Mise en cache",
    summary: "Garder à portée de main les réponses déjà calculées, et connaître le prix à payer.",
  },
  cap: {
    title: "CAP et cohérence",
    summary:
      "Quand le réseau se coupe, un magasin répliqué doit choisir entre répondre et avoir raison.",
  },
  cdn: {
    title: "Diffusion de contenu",
    summary:
      "Placer des copies du contenu près des utilisateurs pour que la plupart des requêtes n’atteignent jamais l’origine.",
  },
  cicd: {
    title: "CI/CD et déploiements",
    summary:
      "Transformer un commit en logiciel en production avec des contrôles automatiques, des déploiements sûrs et un retour arrière rapide.",
  },
  consensus: {
    title: "Consensus et élection de leader",
    summary:
      "Comment un cluster de machines peu fiables s’accorde sur un leader et un journal, avec des majorités et des mandats.",
  },
  "consistent-hashing": {
    title: "Hachage cohérent",
    summary:
      "Répartir les clés sur de nombreux serveurs pour qu’en ajouter ou en perdre un ne déplace qu’une petite tranche.",
  },
  "design-chat": {
    title: "Concevoir un système de chat",
    summary:
      "Tenir des millions de connexions en direct, acheminer les messages entre serveurs, et ne jamais en perdre ni en désordonner un seul.",
  },
  "design-news-feed": {
    title: "Concevoir un fil d’actualité",
    summary:
      "Construire une chronologie qui se charge vite pour des millions de lecteurs, du fan-out au classement et aux caches.",
  },
  encryption: {
    title: "Chiffrement et secrets",
    summary:
      "Protéger les données en transit et sur disque, et mettre les clés et mots de passe eux-mêmes à l’abri.",
  },
  files: {
    title: "Fichiers et médias",
    summary:
      "Stocker, téléverser et livrer de gros fichiers sans étouffer vos serveurs d’application.",
  },
  "hld-lld": {
    title: "HLD et LLD",
    summary:
      "Passer d’un besoin flou à des boîtes et des flèches, puis zoomer sur les classes et les API.",
  },
  indexes: {
    title: "Index",
    summary:
      "Échanger un peu de coût d’écriture et d’espace disque contre des recherches qui évitent presque toute la table.",
  },
  "latency-throughput": {
    title: "Latence et débit",
    summary:
      "Deux nombres qui se ressemblent mais répondent à des questions différentes, et comment la charge les relie.",
  },
  "load-balancing": {
    title: "Répartition de charge",
    summary:
      "Répartir le trafic sur plusieurs serveurs, et continuer à servir quand l’un d’eux tombe.",
  },
  "message-queues": {
    title: "Files de messages",
    summary:
      "Confier le travail lent à une file de workers pour que l’utilisateur n’ait pas à l’attendre.",
  },
  microservices: {
    title: "Monolithe contre microservices",
    summary:
      "Quand un seul déployable est un cadeau, quand il devient un goulot, et ce que coûte vraiment son découpage.",
  },
  "napkin-math": {
    title: "Calculs de coin de table",
    summary:
      "Estimer trafic, stockage et bande passante de tête, assez près pour choisir une conception.",
  },
  observability: {
    title: "Observabilité",
    summary:
      "Utiliser journaux, métriques et traces pour voir ce que fait un système en marche et pourquoi il souffre.",
  },
  pubsub: {
    title: "Pub/Sub et événements",
    summary:
      "Annoncer ce qui s’est passé et laisser n’importe quel nombre de services réagir, sans se connaître.",
  },
  "rate-limiting": {
    title: "Limitation de débit",
    summary: "Protéger votre service des clients qui demandent trop, par accident ou exprès.",
  },
  realtime: {
    title: "Mises à jour en temps réel",
    summary:
      "Pousser les changements vers les utilisateurs dès qu’ils arrivent : polling, long polling, SSE et WebSockets.",
  },
  redundancy: {
    title: "Redondance et basculement",
    summary:
      "Supprimer les points uniques de défaillance avec de la capacité de réserve, des contrôles de santé et un basculement propre.",
  },
  replication: {
    title: "Réplication",
    summary:
      "Garder des copies de vos données sur plusieurs machines pour la vitesse et la survie.",
  },
  "request-lifecycle": {
    title: "Le voyage d’une requête",
    summary:
      "Suivre un chargement de page saut par saut — et découvrir où passe vraiment le temps.",
    goals: [
      "Ce que fait le DNS et pourquoi ses réponses sont mises en cache",
      "Pourquoi une connexion coûte des allers-retours",
      "Le chemin : navigateur → serveur → base de données → retour",
      "Où passe vraiment le temps de chargement d’une page",
      "Cas : une requête lente et un utilisateur éloigné",
    ],
    takeaways: [
      "Le chargement d’une page est une chaîne d’étapes : DNS, connexion, requête, base de données, réponse.",
      "Les poignées de main coûtent des allers-retours, donc la distance et la réutilisation des connexions comptent.",
      "La plupart du temps est passé à attendre. Mesurez où il passe avant d’optimiser quoi que ce soit.",
    ],
    hud: ["Résolution DNS", "Connexion", "Requête + serveur", "Téléchargement", "Total"],
    labels: {
      you: "vous",
      "dns.sub": "résolveur",
      web: "Serveur web",
      db: "Base de données",
    },
    steps: [
      {
        short: "Entrée",
        title: "Les utilisateurs trouvent la boutique lente",
        body: [
          "Avant de rendre quelque chose plus rapide, il faut savoir où passe le temps. Suivons donc un seul chargement de page.",
          "Vous tapez `shop.example` et appuyez sur Entrée. Environ un sixième de seconde plus tard, la page apparaît. Il se passe beaucoup de choses entre les deux.",
        ],
        callout:
          "Chaque requête web est une conversation entre machines. Chaque étape coûte du temps, et les coûts s’additionnent.",
      },
      {
        short: "Trouver l’adresse",
        title: "Trouver l’adresse (DNS)",
        body: [
          "Les réseaux acheminent selon l’adresse IP numérique, pas selon le nom. Le navigateur demande donc d’abord à un résolveur DNS : où est `shop.example` ?",
          "La réponse, `203.0.113.7`, revient en 20 ms environ.",
        ],
        callout:
          "Les réponses sont mises en cache pendant une durée de vie (TTL). Pendant les minutes suivantes, les visites répétées sautent complètement cette étape.",
        labels: {
          "linkLabels.q": "où est shop.example ?",
        },
      },
      {
        short: "Connexion",
        title: "Ouvrir une connexion",
        body: [
          "Le navigateur se connecte maintenant à `203.0.113.7`. Une poignée de main TCP convient de parler ; une poignée de main TLS met en place le chiffrement.",
          "Chaque poignée de main est un aller-retour : un message qui part et une réponse qui revient. Sur une liaison de 30 ms, cela fait déjà 60 ms avant qu’un seul octet de votre page ait bougé.",
        ],
        callout:
          "La distance compte. La lumière dans la fibre parcourt environ 200 km par milliseconde, donc un serveur de l’autre côté d’un océan coûte du temps réel à chaque aller-retour.",
        labels: {
          "linkLabels.q": "en cache · 5 min",
        },
      },
      {
        short: "Requête",
        title: "Envoyer la requête",
        body: [
          "Sur la connexion ouverte, le navigateur envoie `GET /products`. Le serveur web la reçoit et commence à construire la page.",
          "Mais la liste de produits se trouve dans une base de données, le serveur ne peut donc pas répondre seul.",
        ],
        labels: {
          "linkLabels.q": "en cache · 5 min",
        },
      },
      {
        short: "Récupérer les données",
        title: "Le serveur interroge la base de données",
        body: [
          "Le serveur exécute une requête comme `SELECT * FROM products`, attend les lignes et remplit le modèle HTML.",
          "Remarquez ce que le serveur fait le plus souvent : attendre. Une requête lente fait attendre tous les utilisateurs avec elle.",
        ],
        callout:
          "Une seule requête lente est la raison la plus courante d’une page lente. Mesurez-la avant de penser à ajouter des serveurs.",
        labels: {
          "linkLabels.q": "en cache · 5 min",
        },
      },
      {
        short: "Réponse",
        title: "La page revient",
        chapter: "Solution",
        body: [
          "Le serveur envoie la page terminée par la même connexion et le navigateur l’affiche.",
          "Faisons le total : DNS 20 ms, poignées de main 60 ms, requête et base de données 55 ms, téléchargement 20 ms. Environ 155 ms, dont 130 passées à attendre le réseau.",
        ],
        labels: {
          "bubbles.you": "page prête · 155 ms",
          "linkLabels.q": "en cache · 5 min",
        },
      },
      {
        short: "Plus de fichiers",
        title: "Une page, de nombreuses requêtes",
        body: [
          "Le HTML n’est que le début. Il pointe vers une feuille de style, un script et des images, et le navigateur récupère chacun d’eux.",
          "Ils passent par la connexion déjà ouverte, donc pas de nouvelles poignées de main. Mais chaque fichier doit quand même voyager, et la page n’est pas prête avant l’arrivée des plus importants.",
        ],
        callout:
          "Moins de fichiers, plus petits, se chargent plus vite. Les mettre en cache dans le navigateur ou sur un CDN supprime des requêtes entières.",
        labels: {
          "bubbles.you": "40 fichiers · 1 connexion",
          "linkLabels.q": "en cache · 5 min",
          "linkLabels.h": "HTTP/2 · plusieurs requêtes à la fois",
        },
      },
      {
        short: "Requête lente",
        title: "Cas : la requête prend 400 ms",
        chapter: "Problème",
        body: [
          "Supposons maintenant que la table des produits ait grandi et que la requête parcoure chaque ligne. La base de données met 400 ms au lieu de 35.",
          "Rien n’a changé côté réseau, et pourtant la page est quatre fois plus lente, et tous les utilisateurs le voient.",
        ],
        callout:
          "Ajouter des serveurs web n’aiderait pas ici : ils attendraient tous la même requête lente. Corrigez-la avec un index ou un cache.",
        labels: {
          "bubbles.db": "400 ms · analyse",
          "linkLabels.q": "en cache · 5 min",
        },
      },
      {
        short: "Loin",
        title: "Cas : l’utilisateur est sur un autre continent",
        chapter: "Problème",
        body: [
          "Un client à Sydney atteint un serveur en Virginie. La lumière seule met environ 80 ms dans chaque sens, et les vrais trajets sont plus longs, donc un aller-retour approche les 200 ms.",
          "Deux poignées de main et une requête coûtent maintenant plusieurs allers-retours, et la page met bien plus d’une demi-seconde avant qu’aucun travail ne soit fait.",
        ],
        callout:
          "On ne peut pas accélérer la lumière. Rapprochez plutôt le contenu de l’utilisateur (un CDN, ou un serveur dans sa région).",
        labels: {
          "labels.you": "vous · Sydney",
          "linkLabels.q": "en cache · 5 min",
          "linkLabels.h": "≈ 200 ms par aller-retour",
        },
      },
      {
        short: "Bilan",
        title: "Où est passé le temps",
        body: [
          "Un chargement de page normal : DNS 20 ms, poignées de main 60 ms, requête et serveur 55 ms, téléchargement 20 ms. Environ 155 ms au total.",
          "Remarquez la faible part de votre code. La plupart du temps est passé à attendre le réseau, donc les grands gains consistent à supprimer des étapes, à les raccourcir ou à les faire en parallèle.",
        ],
        callout:
          "La plupart des leçons suivantes sont des astuces pour supprimer une étape (cache), en raccourcir une (CDN) ou en faire une en parallèle (montée en charge horizontale).",
        labels: {
          "bubbles.you": "page prête · 155 ms",
          "panels.0.title": "Où est passé le temps",
          "panels.0.line0": "Résolution DNS\t20 ms",
          "panels.0.line1": "Connexion\t60 ms",
          "panels.0.line2": "Requête + serveur\t55 ms",
          "panels.0.line3": "Téléchargement\t20 ms",
          "panels.0.line4": "Total\t155 ms",
          "panels.0.line5": "130 ms d’attente",
        },
      },
    ],
  },
  sagas: {
    title: "Sagas et transactions distribuées",
    summary:
      "Garder cohérente une action métier multi-services sans verrouiller toutes les bases de données à la fois.",
  },
  "service-discovery": {
    title: "Découverte de services et passerelles",
    summary:
      "Comment les appelants trouvent des instances saines qui vont et viennent, et pourquoi une passerelle se tient à l’entrée.",
  },
  sharding: {
    title: "Partitionnement (sharding)",
    summary:
      "Répartir un énorme jeu de données sur des machines pour qu’aucune base n’ait à tout contenir.",
  },
  "sql-nosql": {
    title: "SQL contre NoSQL",
    summary:
      "Accorder la base de données à la forme de vos données et aux garanties dont vos requêtes ont besoin.",
  },
  stateless: {
    title: "Services sans état",
    summary:
      "Garder la mémoire par utilisateur hors des serveurs web pour que n’importe quel serveur réponde à n’importe quelle requête.",
  },
  "storage-engines": {
    title: "Moteurs de stockage",
    summary:
      "Comparer arbres B et arbres LSM selon la façon dont ils transforment les écritures en travail disque, et choisir selon la charge.",
  },
  testing: {
    title: "Tests",
    summary:
      "Gagner en confiance à peu de frais : tests unitaires, d’intégration et de bout en bout, doublures, instabilité, et ce qui tourne en CI.",
  },
  "timeouts-retries": {
    title: "Délais d’attente et nouvelles tentatives",
    summary:
      "Borner le temps d’attente, ne réessayer que ce qui est sûr, et éviter de transformer un à-coup en panne.",
  },
  transactions: {
    title: "Transactions et isolation",
    summary:
      "Garder correctes les écritures concurrentes : validations atomiques, niveaux d’isolation, verrous et versions.",
  },
  "unique-ids": {
    title: "Identifiants uniques à grande échelle",
    summary:
      "Générer des millions d’identifiants uniques, à peu près ordonnés dans le temps, par seconde sans goulot unique.",
  },
  "url-shortener": {
    title: "Concevoir un raccourcisseur d’URL",
    summary:
      "Assembler les pièces : identifiants, stockage, cache et lectures 100 fois plus nombreuses que les écritures.",
  },
  "vertical-horizontal": {
    title: "Passage à l’échelle vertical et horizontal",
    summary:
      "Acheter une plus grosse machine ou ajouter des machines : ce que chacun coûte et où chacun s’arrête.",
  },
};

const fr: LocaleBundle<DesignUi> = { ui, translations: { modules, lessons } };

export default fr;
