import { apis } from "./lessons/apis";
import { authentication } from "./lessons/authentication";
import { authorization } from "./lessons/authorization";
import { batchStream } from "./lessons/batch-stream";
import { caching } from "./lessons/caching";
import { cap } from "./lessons/cap";
import { cdn } from "./lessons/cdn";
import { cicd } from "./lessons/cicd";
import { consensus } from "./lessons/consensus";
import { consistentHashing } from "./lessons/consistent-hashing";
import { designChat } from "./lessons/design-chat";
import { designNewsFeed } from "./lessons/design-news-feed";
import { encryption } from "./lessons/encryption";
import { files } from "./lessons/files";
import { hldLld } from "./lessons/hld-lld";
import { indexes } from "./lessons/indexes";
import { latencyThroughput } from "./lessons/latency-throughput";
import { loadBalancing } from "./lessons/load-balancing";
import { messageQueues } from "./lessons/message-queues";
import { microservices } from "./lessons/microservices";
import { napkinMath } from "./lessons/napkin-math";
import { observability } from "./lessons/observability";
import { pubsub } from "./lessons/pubsub";
import { rateLimiting } from "./lessons/rate-limiting";
import { realtime } from "./lessons/realtime";
import { redundancy } from "./lessons/redundancy";
import { replication } from "./lessons/replication";
import { requestLifecycle } from "./lessons/request-lifecycle";
import { sagas } from "./lessons/sagas";
import { serviceDiscovery } from "./lessons/service-discovery";
import { sharding } from "./lessons/sharding";
import { sqlNosql } from "./lessons/sql-nosql";
import { stateless } from "./lessons/stateless";
import { storageEngines } from "./lessons/storage-engines";
import { testing } from "./lessons/testing";
import { timeoutsRetries } from "./lessons/timeouts-retries";
import { transactions } from "./lessons/transactions";
import { uniqueIds } from "./lessons/unique-ids";
import { urlShortener } from "./lessons/url-shortener";
import { verticalHorizontal } from "./lessons/vertical-horizontal";
import type { Module } from "./lib/types";

export const COURSE_TITLE = "System Design";

/** The course, in reading order: 9 modules and 40 lessons. Each lesson is plain data in `lessons/`. */
export const MODULES: readonly Module[] = [
  {
    id: "foundations",
    name: "01. Foundations",
    color: "#d5b07a",
    lessons: [requestLifecycle, latencyThroughput, napkinMath],
  },
  {
    id: "scaling",
    name: "02. Scaling",
    color: "#3fa456",
    lessons: [verticalHorizontal, loadBalancing, stateless, caching, cdn],
  },
  {
    id: "data",
    name: "03. Data & Storage",
    color: "#7c63d0",
    lessons: [
      sqlNosql,
      indexes,
      storageEngines,
      replication,
      sharding,
      consistentHashing,
      uniqueIds,
      cap,
      consensus,
      transactions,
      files,
    ],
  },
  {
    id: "communication",
    name: "04. Communication",
    color: "#e8834d",
    lessons: [apis, messageQueues, pubsub, realtime],
  },
  {
    id: "reliability",
    name: "05. Reliability",
    color: "#2f86ce",
    lessons: [redundancy, rateLimiting, timeoutsRetries, observability],
  },
  {
    id: "architecture",
    name: "06. Architecture",
    color: "#2a9d8f",
    lessons: [microservices, serviceDiscovery, sagas, batchStream],
  },
  {
    id: "security",
    name: "07. Security",
    color: "#d9577a",
    lessons: [authentication, authorization, encryption],
  },
  {
    id: "shipping",
    name: "08. Shipping",
    color: "#8c9a3c",
    lessons: [testing, cicd],
  },
  {
    id: "whole-systems",
    name: "09. Whole Systems",
    color: "#64728a",
    lessons: [hldLld, urlShortener, designNewsFeed, designChat],
  },
];
