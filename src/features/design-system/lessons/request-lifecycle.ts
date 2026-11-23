import type { Lesson } from "../lib/types";

export const requestLifecycle: Lesson = {
  id: "request-lifecycle",
  title: "How a Request Travels",
  summary: "Follow one page load hop by hop — and find out where the time really goes.",
  minutes: 10,
  level: "beginner",
  goals: [
    "What DNS does and why its answers are cached",
    "Why a connection costs round trips",
    "The path: browser → server → database → back",
    "Where page-load time actually goes",
    "Cases: a slow query and a distant user",
  ],
  takeaways: [
    "A page load is a chain of hops: DNS, connection, request, database, reply.",
    "Handshakes cost round trips, so distance and connection reuse matter.",
    "Most of the time is spent waiting. Measure where it goes before you optimise anything.",
  ],
  hud: [
    { label: "DNS lookup", icon: "globe" },
    { label: "Connect", icon: "link" },
    { label: "Request + server", icon: "server" },
    { label: "Download", icon: "download" },
    { label: "Total", icon: "timer" },
  ],
  nodes: [
    { id: "you", kind: "user", label: "you", x: 60, y: 150 },
    { id: "dns", kind: "dns", label: "DNS", sub: "resolver", x: 252, y: 14 },
    { id: "web", kind: "server", label: "Web Server", x: 364, y: 140 },
    { id: "db", kind: "db", label: "Database", x: 530, y: 270 },
  ],
  links: [
    { id: "q", from: "you", to: "dns" },
    { id: "h", from: "you", to: "web" },
    { id: "s", from: "web", to: "db" },
  ],
  steps: [
    {
      short: "Hit Enter",
      title: "Users say the shop feels slow",
      body: [
        "Before you can make something faster, you need to know where the time goes. So let's follow a single page load.",
        "You type `shop.example` and press Enter. About a sixth of a second later the page appears. A lot happens in between.",
      ],
      callout: {
        kind: "insight",
        text: "Every web request is a conversation between machines. Each step costs time, and the costs add up.",
      },
      scene: {
        show: ["you"],
        bubbles: { you: { text: "https://shop.example", icon: "globe" } },
      },
    },
    {
      short: "Find address",
      title: "Find the address (DNS)",
      body: [
        "Networks route by numeric IP address, not by name. So the browser first asks a DNS resolver: where is `shop.example`?",
        "The answer, `203.0.113.7`, comes back in about 20 ms.",
      ],
      callout: {
        kind: "tip",
        text: "Answers are cached for a time-to-live (TTL). For the next few minutes, repeat visits skip this step entirely.",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Total", value: "20 ms", level: "good" },
      ],
      scene: {
        show: ["you", "dns"],
        hot: ["dns"],
        bubbles: {
          you: { text: "https://shop.example", icon: "globe" },
          dns: { text: "→ 203.0.113.7", tone: "amber" },
        },
        linkLabels: { q: "where is shop.example?" },
        flows: [{ link: "q" }, { link: "q", reverse: true, tone: "res", delay: 0.8 }],
      },
    },
    {
      short: "Connect",
      title: "Open a connection",
      body: [
        "Now the browser connects to `203.0.113.7`. A TCP handshake agrees to talk; a TLS handshake sets up encryption.",
        "Each handshake is a round trip: a message out and a reply back. On a 30 ms link, that is already 60 ms before a single byte of your page has moved.",
      ],
      callout: {
        kind: "insight",
        text: "Distance matters. Light in fibre covers about 200 km per millisecond, so a server across an ocean costs real time on every round trip.",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Total", value: "80 ms", level: "warn" },
      ],
      scene: {
        show: ["you", "dns", "web"],
        hot: ["web"],
        dim: ["q"],
        linkLabels: { q: "cached · 5 min", h: "TCP + TLS handshake" },
        flows: [
          { link: "h", tone: "hand" },
          { link: "h", reverse: true, tone: "hand", delay: 0.8 },
        ],
      },
    },
    {
      short: "Request",
      title: "Send the request",
      body: [
        "Over the open connection the browser sends `GET /products`. The web server receives it and starts to build the page.",
        "But the product list lives in a database, so the server cannot answer on its own.",
      ],
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Request + server", value: "40 ms", level: "warn" },
        { label: "Total", value: "120 ms", level: "warn" },
      ],
      scene: {
        show: ["you", "dns", "web"],
        hot: ["web"],
        dim: ["q"],
        linkLabels: { q: "cached · 5 min", h: "GET /products" },
        flows: [{ link: "h" }, { link: "h", reverse: true, tone: "res", delay: 0.8 }],
      },
    },
    {
      short: "Fetch data",
      title: "The server asks the database",
      body: [
        "The server runs a query such as `SELECT * FROM products`, waits for the rows, and fills in the HTML template.",
        "Notice what the server is doing most of the time: waiting. A slow query makes every user wait with it.",
      ],
      callout: {
        kind: "warn",
        text: "A single slow query is the most common reason a page is slow. Measure it before you reach for more servers.",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Request + server", value: "55 ms", level: "warn" },
        { label: "Total", value: "135 ms", level: "warn" },
      ],
      scene: {
        show: ["you", "dns", "web", "db"],
        hot: ["db"],
        dim: ["q"],
        linkLabels: { q: "cached · 5 min", h: "GET /products" },
        flows: [
          { link: "h" },
          { link: "s", delay: 0.4 },
          { link: "s", reverse: true, tone: "res", delay: 0.9 },
          { link: "h", reverse: true, tone: "res", delay: 1.3 },
        ],
      },
    },
    {
      short: "Response",
      title: "The page comes back",
      chapter: { label: "Solution", tone: "green" },
      body: [
        "The server sends the finished page down the same connection and the browser draws it.",
        "Add it up: DNS 20 ms, handshakes 60 ms, request and database 55 ms, download 20 ms. Roughly 155 ms, and 130 of it was waiting on the network.",
      ],
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Request + server", value: "55 ms", level: "warn" },
        { label: "Download", value: "20 ms", level: "good" },
        { label: "Total", value: "155 ms", level: "warn" },
      ],
      scene: {
        show: ["you", "dns", "web", "db"],
        hot: ["you"],
        dim: ["q"],
        bubbles: { you: { text: "page ready · 155 ms", tone: "green", icon: "check" } },
        linkLabels: { q: "cached · 5 min", h: "HTML · 120 KB" },
        flows: [
          { link: "s", reverse: true, tone: "res" },
          { link: "h", reverse: true, tone: "res", delay: 0.6 },
        ],
      },
    },
    {
      short: "More files",
      title: "One page, many requests",
      body: [
        "The HTML is only the start. It points at a stylesheet, a script and images, and the browser fetches each of them.",
        "They go over the connection that is already open, so there are no new handshakes. But every file still has to travel, and the page is not ready until the important ones arrive.",
      ],
      callout: {
        kind: "tip",
        text: "Fewer, smaller files load faster. Caching them in the browser or on a CDN removes whole requests.",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Request + server", value: "55 ms", level: "warn" },
        { label: "Download", value: "140 ms", level: "bad" },
        { label: "Total", value: "275 ms", level: "bad" },
      ],
      scene: {
        show: ["you", "dns", "web", "db"],
        hot: ["web"],
        dim: ["q"],
        bubbles: { you: { text: "40 files · 1 connection", tone: "violet", icon: "layers" } },
        linkLabels: { q: "cached · 5 min", h: "HTTP/2 · many requests at once" },
        flows: [
          { link: "h", reverse: true, tone: "res" },
          { link: "h", reverse: true, tone: "res", delay: 0.35 },
          { link: "h", reverse: true, tone: "res", delay: 0.7 },
          { link: "h", delay: 0.2 },
        ],
      },
    },
    {
      short: "Slow query",
      title: "Case: the query takes 400 ms",
      chapter: { label: "Problem", tone: "red" },
      body: [
        "Now suppose the products table has grown and the query scans every row. The database takes 400 ms instead of 35.",
        "Nothing about the network changed, yet the page is four times slower, and every user sees it.",
      ],
      callout: {
        kind: "warn",
        text: "Adding web servers would not help here: they would all be waiting on the same slow query. Fix it with an index or a cache.",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Request + server", value: "440 ms", level: "bad" },
        { label: "Download", value: "20 ms", level: "good" },
        { label: "Total", value: "540 ms", level: "bad" },
      ],
      scene: {
        show: ["you", "dns", "web", "db"],
        hot: ["db"],
        dim: ["q"],
        bubbles: { db: { text: "400 ms · scanning", tone: "red", icon: "hourglass" } },
        linkLabels: {
          q: "cached · 5 min",
          h: "GET /products",
          s: { text: "ORDER BY score · 400 ms", tone: "red" },
        },
        flows: [
          { link: "h" },
          { link: "s", tone: "warn", delay: 0.4 },
          { link: "s", reverse: true, tone: "res", delay: 1.2 },
        ],
      },
    },
    {
      short: "Far away",
      title: "Case: the user is on another continent",
      chapter: { label: "Problem", tone: "red" },
      body: [
        "A shopper in Sydney reaches a server in Virginia. Light alone needs about 80 ms each way, and real routes are longer, so a round trip is closer to 200 ms.",
        "Two handshakes and one request now cost several round trips, and the page takes well over half a second before any work is done.",
      ],
      callout: {
        kind: "tip",
        text: "You cannot make light faster. Put content nearer to the user (a CDN, or a server in their region) instead.",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "400 ms", level: "bad" },
        { label: "Request + server", value: "225 ms", level: "bad" },
        { label: "Download", value: "60 ms", level: "warn" },
        { label: "Total", value: "705 ms", level: "bad" },
      ],
      scene: {
        show: ["you", "dns", "web", "db"],
        hot: ["you", "web"],
        dim: ["q"],
        labels: { you: "you · Sydney" },
        bubbles: {
          you: { text: "https://shop.example", icon: "globe" },
          web: { text: "Virginia", icon: "globe" },
        },
        linkLabels: { q: "cached · 5 min", h: { text: "≈ 200 ms per round trip", tone: "amber" } },
        flows: [
          { link: "h", tone: "warn" },
          { link: "h", reverse: true, tone: "res", delay: 0.9 },
        ],
      },
    },
    {
      short: "Recap",
      title: "Where the time went",
      body: [
        "A normal page load: DNS 20 ms, handshakes 60 ms, request and server 55 ms, download 20 ms. About 155 ms in total.",
        "Notice how little of it was your code. Most of the time was spent waiting on the network, so the big wins are removing hops, shortening them, or doing them in parallel.",
      ],
      callout: {
        kind: "tip",
        text: "Most of the later lessons are tricks for removing a hop (caching), shortening one (CDNs), or doing one in parallel (scaling out).",
      },
      metrics: [
        { label: "DNS lookup", value: "20 ms", level: "good" },
        { label: "Connect", value: "60 ms", level: "warn" },
        { label: "Request + server", value: "55 ms", level: "warn" },
        { label: "Download", value: "20 ms", level: "good" },
        { label: "Total", value: "155 ms", level: "warn" },
      ],
      scene: {
        show: ["you", "dns", "web", "db"],
        dim: ["q"],
        bubbles: { you: { text: "page ready · 155 ms", tone: "green", icon: "check" } },
        linkLabels: { q: "20 ms", h: "60 + 55 + 20 ms", s: "15 ms" },
        panels: [
          {
            x: -80,
            y: -82,
            title: "Where the time went",
            icon: "timer",
            lines: [
              "DNS lookup\t20 ms",
              "Connect\t60 ms",
              "Request + server\t55 ms",
              "Download\t20 ms",
              "Total\t155 ms",
              "130 ms of it is waiting",
            ],
          },
        ],
        flows: [{ link: "h" }, { link: "h", reverse: true, tone: "res", delay: 0.8 }],
      },
    },
  ],
};
