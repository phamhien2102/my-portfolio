/**
 * A six-month plan for a React Native developer going native on both platforms at once:
 * one phase at a time, the same idea learned twice, one Weather app, growing a version at the end of each phase.
 *
 * Every step carries the one link worth reading for it. Accents are picked for a white page,
 * so they are darker than THEME.palette: each one stays legible as small text on white.
 */

export type TrackId = "swift" | "kotlin";

export interface Track {
  id: TrackId;
  /** Shown on the filter and above each column. */
  label: string;
  platform: string;
  stack: string;
  accent: string;
}

export const TRACKS: readonly Track[] = [
  {
    id: "swift",
    label: "iOS",
    platform: "iOS",
    stack: "Swift · SwiftUI · Xcode",
    accent: "#c2410c",
  },
  {
    id: "kotlin",
    label: "Android",
    platform: "Android",
    stack: "Kotlin · Compose · Android Studio",
    accent: "#6d28d9",
  },
];

export interface Step {
  /** Stable id: the checkbox state is stored under it, so never reuse one. */
  id: string;
  title: string;
  detail: string;
  /** The one page to read for this step. Checked with curl; keep it that way. */
  href: string;
  /** Who publishes it, shown on the link. */
  source: string;
}

export interface Phase {
  id: string;
  /** "01", "02"… shown on the rail. */
  number: string;
  title: string;
  weeks: string;
  goal: string;
  accent: string;
  /** Optional: worth doing, but not on the critical path. */
  bonus?: boolean;
  steps: Record<TrackId, readonly Step[]>;
  ship: {
    /** Checkbox id for the app itself; it counts towards progress like a step. */
    id: string;
    name: string;
    blurb: string;
    proves: readonly string[];
    /** The service the app talks to, when the phase needs one. */
    api?: ShipApi;
  };
}

export interface ShipApi {
  name: string;
  note: string;
  /** Verified with curl; no key needed. */
  endpoints: readonly { label: string; url: string }[];
  /** A trimmed real response, so the model can be written before the first request. */
  sample: string;
}

const APPLE = "Apple";
const SWIFT_BOOK = "Swift book";
const KOTLIN = "Kotlin docs";
const ANDROID = "Android";
const RN = "React Native";

export const PHASES: readonly Phase[] = [
  {
    id: "languages",
    number: "01",
    title: "Languages first",
    weeks: "2 weeks",
    goal: "Read and write both languages well enough that the UI framework is the only new thing in the next phase.",
    accent: "#0369a1",
    steps: {
      swift: [
        {
          id: "swift-tour",
          title: "The Swift tour",
          detail:
            "let and var, structs against classes, value semantics, enums with associated values.",
          href: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/guidedtour",
          source: SWIFT_BOOK,
        },
        {
          id: "swift-optionals",
          title: "Optionals, properly",
          detail:
            "if let, guard let, ??, optional chaining — and why a force unwrap is a crash with a delay.",
          href: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/optionalchaining",
          source: SWIFT_BOOK,
        },
        {
          id: "swift-protocols",
          title: "Protocols and generics",
          detail: "Protocol-oriented design, extensions, where clauses, some against any.",
          href: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols",
          source: SWIFT_BOOK,
        },
        {
          id: "swift-concurrency",
          title: "async/await and actors",
          detail:
            "Structured concurrency, Task, @MainActor, and what Sendable is protecting you from.",
          href: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency",
          source: SWIFT_BOOK,
        },
      ],
      kotlin: [
        {
          id: "kotlin-tour",
          title: "The Kotlin tour",
          detail: "val and var, data classes, sealed interfaces, when as an expression.",
          href: "https://kotlinlang.org/docs/kotlin-tour-welcome.html",
          source: KOTLIN,
        },
        {
          id: "kotlin-null",
          title: "Null safety",
          detail:
            "Safe calls, elvis, let and run — and why !! is the same crash as a force unwrap.",
          href: "https://kotlinlang.org/docs/null-safety.html",
          source: KOTLIN,
        },
        {
          id: "kotlin-lambdas",
          title: "Extensions, lambdas, scope functions",
          detail: "Higher-order functions, trailing lambda syntax, the idiomatic shape of Kotlin.",
          href: "https://kotlinlang.org/docs/scope-functions.html",
          source: KOTLIN,
        },
        {
          id: "kotlin-coroutines",
          title: "Coroutines and Flow",
          detail: "suspend, scopes, dispatchers, cold Flow against hot StateFlow.",
          href: "https://kotlinlang.org/docs/coroutines-guide.html",
          source: KOTLIN,
        },
      ],
    },
    ship: {
      id: "ship-weather-v01",
      name: "Weather v0.1 — the core, no UI",
      blurb:
        "Temperature in °C, °F and K, and a WeatherCondition that carries its own data, parsed from a hard-coded JSON sample. Build it twice, one language each, with unit tests.",
      proves: [
        "Both toolchains run",
        "Enums with associated values and sealed types",
        "Tests run on both sides",
      ],
    },
  },
  {
    id: "declarative-ui",
    number: "02",
    title: "Declarative UI",
    weeks: "3 weeks",
    goal: "Learn the two view layers side by side. You already think in components; find out where they disagree.",
    accent: "#4d7c0f",
    steps: {
      swift: [
        {
          id: "swiftui-views",
          title: "Views and modifiers",
          detail:
            "A View is a struct; every modifier returns a new view and the order changes the result.",
          href: "https://developer.apple.com/documentation/swiftui/view",
          source: APPLE,
        },
        {
          id: "swiftui-layout",
          title: "Stacks, spacers, frames",
          detail: "VStack, HStack, ZStack, alignment guides, and GeometryReader as a last resort.",
          href: "https://developer.apple.com/documentation/swiftui/layout-fundamentals",
          source: APPLE,
        },
        {
          id: "swiftui-state",
          title: "@State and @Binding",
          detail: "Local state, two-way bindings, and the view identity rules that decide redraws.",
          href: "https://developer.apple.com/documentation/swiftui/state",
          source: APPLE,
        },
        {
          id: "swiftui-lists",
          title: "List and NavigationStack",
          detail:
            "Sections, swipe actions, value-based navigation paths instead of pushing screens.",
          href: "https://developer.apple.com/documentation/swiftui/navigationstack",
          source: APPLE,
        },
      ],
      kotlin: [
        {
          id: "compose-functions",
          title: "Composables and Modifier",
          detail:
            "A @Composable is a function; the Modifier chain is ordered exactly like SwiftUI modifiers.",
          href: "https://developer.android.com/develop/ui/compose/mental-model",
          source: ANDROID,
        },
        {
          id: "compose-layout",
          title: "Column, Row, Box",
          detail:
            "Arrangement and alignment, weights, and what a single measure pass means for you.",
          href: "https://developer.android.com/develop/ui/compose/layouts/basics",
          source: ANDROID,
        },
        {
          id: "compose-state",
          title: "remember and mutableStateOf",
          detail:
            "Recomposition, state hoisting, rememberSaveable across rotation and process death.",
          href: "https://developer.android.com/develop/ui/compose/state",
          source: ANDROID,
        },
        {
          id: "compose-lists",
          title: "LazyColumn and keys",
          detail: "Stable keys, item scopes, and why a missing key costs you a frame.",
          href: "https://developer.android.com/develop/ui/compose/lists",
          source: ANDROID,
        },
      ],
    },
    ship: {
      id: "ship-weather-v02",
      name: "Weather v0.2 — the screens, fake data",
      blurb:
        "Current conditions card, a horizontal hourly strip and a 7-day list from hard-coded data, plus a °C/°F toggle. No network yet — the point is the view layer.",
      proves: [
        "Lists and horizontal scrolling",
        "Local state and the unit toggle",
        "Each platform looking native",
      ],
    },
  },
  {
    id: "state",
    number: "03",
    title: "State and architecture",
    weeks: "3 weeks",
    goal: "Stop fighting the framework: one direction of data, one source of truth, state you can draw on paper.",
    accent: "#0f766e",
    steps: {
      swift: [
        {
          id: "swift-observable",
          title: "@Observable and Observation",
          detail: "The Observation macro, what replaced ObservableObject, and when a view redraws.",
          href: "https://developer.apple.com/documentation/observation",
          source: APPLE,
        },
        {
          id: "swift-model",
          title: "Model data in one place",
          detail:
            "Logic out of the view; one state enum instead of five booleans that can disagree.",
          href: "https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app",
          source: APPLE,
        },
        {
          id: "swift-navigation",
          title: "Navigation as data",
          detail: "NavigationPath you can store, restore and deep link into later.",
          href: "https://developer.apple.com/documentation/swiftui/navigationpath",
          source: APPLE,
        },
        {
          id: "swift-previews",
          title: "Previews as the dev loop",
          detail: "#Preview with fake data: design every state before the network exists.",
          href: "https://developer.apple.com/documentation/swiftui/previews-in-xcode",
          source: APPLE,
        },
      ],
      kotlin: [
        {
          id: "compose-viewmodel",
          title: "ViewModel and StateFlow",
          detail:
            "Lifecycle-aware state, collectAsStateWithLifecycle, one UI state class per screen.",
          href: "https://developer.android.com/topic/libraries/architecture/viewmodel",
          source: ANDROID,
        },
        {
          id: "compose-udf",
          title: "Unidirectional data flow",
          detail: "Events up, state down — the Redux contract you know, without the boilerplate.",
          href: "https://developer.android.com/topic/architecture/ui-layer",
          source: ANDROID,
        },
        {
          id: "compose-savedstate",
          title: "Navigation and saved state",
          detail: "Type-safe routes, SavedStateHandle, surviving the system killing your process.",
          href: "https://developer.android.com/develop/ui/compose/navigation",
          source: ANDROID,
        },
        {
          id: "compose-previews",
          title: "@Preview and preview parameters",
          detail: "Every state previewed: light and dark, small and huge font, empty and full.",
          href: "https://developer.android.com/develop/ui/compose/tooling/previews",
          source: ANDROID,
        },
      ],
    },
    ship: {
      id: "ship-weather-v03",
      name: "Weather v0.3 — many cities, real architecture",
      blurb:
        "Add and remove cities, open a detail screen, keep the unit setting. A fake repository feeds one ViewModel per screen, drawn as a UI-state diagram before any code.",
      proves: ["UDF in both frameworks", "Logic testable without a view", "Navigation as data"],
    },
  },
  {
    id: "network",
    number: "04",
    title: "Network and async",
    weeks: "3 weeks",
    goal: "Talk to an API the native way: typed models, structured concurrency, honest loading and error states.",
    accent: "#1d4ed8",
    steps: {
      swift: [
        {
          id: "swift-urlsession",
          title: "URLSession with async/await",
          detail: "Requests, headers, retries, and cancelling the call when the view goes away.",
          href: "https://developer.apple.com/documentation/foundation/urlsession",
          source: APPLE,
        },
        {
          id: "swift-codable",
          title: "Codable",
          detail: "Decoding strategies, nested keys, dates, and failing loudly in debug builds.",
          href: "https://developer.apple.com/documentation/swift/encoding-decoding-and-serialization",
          source: APPLE,
        },
        {
          id: "swift-task",
          title: "Task lifecycle",
          detail: "The .task modifier, cancellation, .refreshable, a debounced search field.",
          href: "https://developer.apple.com/documentation/swift/task",
          source: APPLE,
        },
        {
          id: "swift-errors",
          title: "Error states that read well",
          detail: "Typed errors, a retry that works, and telling empty apart from failed.",
          href: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling",
          source: SWIFT_BOOK,
        },
      ],
      kotlin: [
        {
          id: "kotlin-http",
          title: "Retrofit or Ktor",
          detail: "Interceptors, auth headers, timeouts. Pick one and be able to say why.",
          href: "https://github.com/square/retrofit",
          source: "Square",
        },
        {
          id: "kotlin-serialization",
          title: "kotlinx.serialization",
          detail: "@Serializable models, defaults, unknown keys, the same strictness as Codable.",
          href: "https://kotlinlang.org/docs/serialization.html",
          source: KOTLIN,
        },
        {
          id: "kotlin-flow-ui",
          title: "Flow in the UI layer",
          detail: "flow plus stateIn, debounce for search, cancellation when the scope dies.",
          href: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow",
          source: ANDROID,
        },
        {
          id: "kotlin-result",
          title: "The data layer",
          detail:
            "A repository per domain, a result type per call, the same three UI states as iOS.",
          href: "https://developer.android.com/topic/architecture/data-layer",
          source: ANDROID,
        },
      ],
    },
    ship: {
      id: "ship-weather-v04",
      name: "Weather v0.4 — live data",
      blurb:
        "Search a city with Open-Meteo geocoding and load its forecast. The API is free and needs no key. Survive a slow connection, an unknown city and no signal.",
      proves: [
        "Typed networking",
        "Cancellation when the user types again",
        "Loading, empty and error discipline",
      ],
      api: {
        name: "Open-Meteo",
        note: "Free, no key, no sign-up. Non-commercial use; credit “Weather data by Open-Meteo.com” on an About screen. Check the limits before the release in phase 07.",
        endpoints: [
          {
            label: "Search a city",
            url: "https://geocoding-api.open-meteo.com/v1/search?name=Hanoi&count=5&language=en",
          },
          {
            label: "Forecast",
            url: "https://api.open-meteo.com/v1/forecast?latitude=21.0245&longitude=105.8412&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7&forecast_hours=6",
          },
        ],
        sample: `{
  "current": { "temperature_2m": 25.8, "apparent_temperature": 30.9,
               "relative_humidity_2m": 92, "wind_speed_10m": 8.7,
               "weather_code": 0, "is_day": 0 },
  "hourly":  { "time": ["2026-11-04T23:00", "2026-11-05T00:00"],
               "temperature_2m": [25.9, 25.6], "weather_code": [0, 0] },
  "daily":   { "time": ["2026-11-04", "2026-11-05"],
               "weather_code": [51, 80],
               "temperature_2m_max": [31.7, 29.8],
               "temperature_2m_min": [23.9, 24.7] }
}
// Parallel arrays: hourly.time[i] belongs with hourly.temperature_2m[i].
// Map them into your own model once, at the edge. Store the geocoding id, not the
// coordinates: the forecast snaps them to a grid cell.`,
      },
    },
  },
  {
    id: "persistence",
    number: "05",
    title: "Persistence and offline",
    weeks: "3 weeks",
    goal: "Work on the underground. Cache first, sync later, never lose something the user typed.",
    accent: "#b45309",
    steps: {
      swift: [
        {
          id: "swift-swiftdata",
          title: "SwiftData",
          detail:
            "@Model, @Query, the model container, and a migration written before you need it.",
          href: "https://developer.apple.com/documentation/swiftdata",
          source: APPLE,
        },
        {
          id: "swift-appstorage",
          title: "UserDefaults and @AppStorage",
          detail: "Settings only, and how little belongs here.",
          href: "https://developer.apple.com/documentation/swiftui/appstorage",
          source: APPLE,
        },
        {
          id: "swift-keychain",
          title: "Keychain",
          detail: "Where tokens actually live, and what happens on restore to a new device.",
          href: "https://developer.apple.com/documentation/security/keychain-services",
          source: APPLE,
        },
        {
          id: "swift-cache",
          title: "Caching and revalidation",
          detail: "URLCache, then your own store: show the cache, revalidate, reconcile.",
          href: "https://developer.apple.com/documentation/foundation/urlcache",
          source: APPLE,
        },
      ],
      kotlin: [
        {
          id: "kotlin-room",
          title: "Room",
          detail: "Entities, DAOs, Flow-returning queries, migrations with a test.",
          href: "https://developer.android.com/training/data-storage/room",
          source: ANDROID,
        },
        {
          id: "kotlin-datastore",
          title: "DataStore",
          detail: "Preferences and Proto DataStore in place of SharedPreferences.",
          href: "https://developer.android.com/topic/libraries/architecture/datastore",
          source: ANDROID,
        },
        {
          id: "kotlin-keystore",
          title: "Keystore",
          detail: "Where tokens belong on Android, and what backup does to them.",
          href: "https://developer.android.com/privacy-and-security/keystore",
          source: ANDROID,
        },
        {
          id: "kotlin-sot",
          title: "Single source of truth",
          detail: "The database feeds the UI; the network only ever writes into the database.",
          href: "https://developer.android.com/topic/architecture/data-layer",
          source: ANDROID,
        },
      ],
    },
    ship: {
      id: "ship-weather-v05",
      name: "Weather v0.5 — offline",
      blurb:
        "Saved cities and the last forecast live in a local database, units in settings. With flight mode on it shows “updated 2 hours ago” instead of an error.",
      proves: [
        "A local database on both platforms",
        "Offline-first reads",
        "Single source of truth",
      ],
    },
  },
  {
    id: "platform",
    number: "06",
    title: "Platform power",
    weeks: "4 weeks",
    goal: "Do the things that needed a third-party library and a prayer from JavaScript.",
    accent: "#be185d",
    steps: {
      swift: [
        {
          id: "swift-animation",
          title: "Animation and gestures",
          detail: "withAnimation, transitions, matchedGeometryEffect, a drag you can interrupt.",
          href: "https://developer.apple.com/documentation/swiftui/animations",
          source: APPLE,
        },
        {
          id: "swift-permissions",
          title: "Camera, photos, location",
          detail:
            "Permission prompts, Info.plist strings, and a denial path that is not a dead end.",
          href: "https://developer.apple.com/design/human-interface-guidelines/privacy",
          source: "Apple HIG",
        },
        {
          id: "swift-notifications",
          title: "Notifications",
          detail: "Local and push, categories, actions, and the deep link when one is tapped.",
          href: "https://developer.apple.com/documentation/usernotifications",
          source: APPLE,
        },
        {
          id: "swift-widgets",
          title: "WidgetKit and App Intents",
          detail: "A home screen widget, plus a Shortcuts action into your app.",
          href: "https://developer.apple.com/documentation/widgetkit",
          source: APPLE,
        },
      ],
      kotlin: [
        {
          id: "compose-animation",
          title: "Animation and gestures",
          detail: "animate*AsState, Transition, shared element transitions, pointerInput.",
          href: "https://developer.android.com/develop/ui/compose/animation/introduction",
          source: ANDROID,
        },
        {
          id: "kotlin-permissions",
          title: "Runtime permissions",
          detail: "The request flow, the rationale dialog, and life after a permanent denial.",
          href: "https://developer.android.com/training/permissions/requesting",
          source: ANDROID,
        },
        {
          id: "kotlin-notifications",
          title: "Notifications",
          detail: "Channels, the Android 13 permission, and the deep link when one is tapped.",
          href: "https://developer.android.com/develop/ui/views/notifications",
          source: ANDROID,
        },
        {
          id: "kotlin-widgets",
          title: "Glance widgets",
          detail: "A home screen widget written in Compose, updated by a background worker.",
          href: "https://developer.android.com/develop/ui/compose/glance",
          source: ANDROID,
        },
      ],
    },
    ship: {
      id: "ship-weather-v06",
      name: "Weather v0.6 — platform features",
      blurb:
        "A widget for the current city, “use my location” with a polite permission prompt, a background refresh and a rain alert.",
      proves: ["Permissions asked politely", "Background work", "A widget on both platforms"],
    },
  },
  {
    id: "ship-quality",
    number: "07",
    title: "Ship quality",
    weeks: "4 weeks",
    goal: "Everything between it runs on my simulator and strangers are using it.",
    accent: "#15803d",
    steps: {
      swift: [
        {
          id: "swift-testing",
          title: "Swift Testing",
          detail: "Unit tests for logic, one UI test for the happy path, fakes instead of network.",
          href: "https://developer.apple.com/documentation/testing",
          source: APPLE,
        },
        {
          id: "swift-di",
          title: "Dependency injection",
          detail: "Environment values as the injection point, so tests can swap anything out.",
          href: "https://developer.apple.com/documentation/swiftui/environmentvalues",
          source: APPLE,
        },
        {
          id: "swift-instruments",
          title: "Instruments",
          detail: "Time Profiler, hangs, the memory graph. Measure before you optimise anything.",
          href: "https://developer.apple.com/documentation/xcode/improving-your-app-s-performance",
          source: APPLE,
        },
        {
          id: "swift-release",
          title: "Archive to TestFlight",
          detail: "Signing, App Store Connect, privacy details, review notes that get you through.",
          href: "https://developer.apple.com/testflight/",
          source: APPLE,
        },
      ],
      kotlin: [
        {
          id: "kotlin-testing",
          title: "Compose UI tests",
          detail: "Semantics-based assertions, Flow tests with Turbine, one end-to-end path.",
          href: "https://developer.android.com/develop/ui/compose/testing",
          source: ANDROID,
        },
        {
          id: "kotlin-di",
          title: "Hilt",
          detail: "Scopes, test doubles, and the module boundary that makes both possible.",
          href: "https://developer.android.com/training/dependency-injection/hilt-android",
          source: ANDROID,
        },
        {
          id: "kotlin-perf",
          title: "Baseline profiles",
          detail: "Startup time, jank, R8. Measure before you optimise anything.",
          href: "https://developer.android.com/topic/performance/baselineprofiles/overview",
          source: ANDROID,
        },
        {
          id: "kotlin-release",
          title: "Signed bundle to Play",
          detail: "An AAB on the internal testing track, the data safety form, a staged rollout.",
          href: "https://developer.android.com/studio/publish",
          source: ANDROID,
        },
      ],
    },
    ship: {
      id: "ship-weather-v10",
      name: "Weather v1.0 — really released",
      blurb:
        "Polish the app from phases 01–06, cover the repository and ViewModels with tests, and put it on TestFlight and the Play internal track.",
      proves: ["Signing and store flows", "A suite that catches regressions", "A link for the CV"],
    },
  },
  {
    id: "bridge-back",
    number: "08",
    title: "Bring it back to React Native",
    weeks: "2 weeks",
    goal: "Native knowledge pays twice: the React Native apps you already maintain get better modules.",
    accent: "#a21caf",
    bonus: true,
    steps: {
      swift: [
        {
          id: "rn-turbo-swift",
          title: "A Turbo Native Module in Swift",
          detail: "One spec, codegen types, no legacy bridge — a Swift implementation behind it.",
          href: "https://reactnative.dev/docs/turbo-native-modules-introduction",
          source: RN,
        },
        {
          id: "rn-fabric-swift",
          title: "A Fabric view from SwiftUI",
          detail: "Host a SwiftUI view in a UIView and hand it to React Native as a component.",
          href: "https://reactnative.dev/docs/fabric-native-components-introduction",
          source: RN,
        },
      ],
      kotlin: [
        {
          id: "rn-turbo-kotlin",
          title: "The same module in Kotlin",
          detail: "Same spec, Android side. Compare the two implementations line by line.",
          href: "https://reactnative.dev/docs/turbo-native-modules-introduction",
          source: RN,
        },
        {
          id: "rn-fabric-kotlin",
          title: "A Fabric view from Compose",
          detail: "A ComposeView inside a view manager, with measurement that behaves.",
          href: "https://reactnative.dev/docs/fabric-native-components-introduction",
          source: RN,
        },
      ],
    },
    ship: {
      id: "ship-module",
      name: "One module, two native implementations",
      blurb: "Publish it as a small library with a README, a demo app and a typed API.",
      proves: ["New Architecture fluency", "The exact reason to hire you for both"],
    },
  },
];

/** What you already know, and what it is called on each side. */
export const BRIDGE: ReadonlyArray<{ rn: string; swift: string; kotlin: string }> = [
  { rn: "Function component", swift: "struct View", kotlin: "@Composable fun" },
  { rn: "useState", swift: "@State", kotlin: "remember { mutableStateOf() }" },
  { rn: "useEffect", swift: ".task / .onChange", kotlin: "LaunchedEffect / DisposableEffect" },
  { rn: "useMemo", swift: "computed or stored property", kotlin: "remember(key) { }" },
  { rn: "Context", swift: "@Environment", kotlin: "CompositionLocal" },
  { rn: "FlatList", swift: "List / LazyVStack", kotlin: "LazyColumn" },
  { rn: "StyleSheet", swift: "View modifiers", kotlin: "Modifier chain" },
  { rn: "React Navigation", swift: "NavigationStack", kotlin: "Navigation Compose" },
  { rn: "Redux / Zustand", swift: "@Observable store", kotlin: "ViewModel + StateFlow" },
  { rn: "AsyncStorage", swift: "UserDefaults / SwiftData", kotlin: "DataStore / Room" },
  { rn: "fetch + React Query", swift: "URLSession + your own cache", kotlin: "Retrofit + Room" },
  { rn: "Reanimated", swift: "withAnimation, transitions", kotlin: "animate*AsState, Transition" },
  { rn: "Metro", swift: "Xcode build system", kotlin: "Gradle" },
  { rn: "Jest + RTL", swift: "Swift Testing", kotlin: "JUnit + Compose UI test" },
  { rn: "Detox", swift: "XCUITest", kotlin: "Espresso" },
  { rn: "CodePush", swift: "TestFlight, no OTA", kotlin: "Play internal track, no OTA" },
];

export interface Capstone {
  id: string;
  name: string;
  blurb: string;
  hard: string;
  accent: string;
}

/** After the phases: one app big enough to be the portfolio piece. */
export const CAPSTONES: readonly Capstone[] = [
  {
    id: "capstone-trip",
    name: "Trip wallet",
    blurb:
      "An offline-first expense splitter for a group trip: shared currencies, settle-up maths, a widget with what you owe today.",
    hard: "Conflict resolution when two phones edit the same trip offline.",
    accent: "#b45309",
  },
  {
    id: "capstone-transit",
    name: "Departure board",
    blurb:
      "Live departures for the stop you are standing at: location, background refresh, a widget and a Live Activity.",
    hard: "Battery-honest background updates on two very different schedulers.",
    accent: "#0369a1",
  },
  {
    id: "capstone-notes",
    name: "Field notes",
    blurb:
      "Camera, voice memo and text in one entry, searchable offline, synced to your own small backend.",
    hard: "Adaptive layout: the same app on a phone, an iPad and a folded or unfolded Android.",
    accent: "#be185d",
  },
];

/** How to run the plan, learned the hard way on every previous plan. */
export const RULES: readonly string[] = [
  "Build the feature twice, once per platform, in the same week. The comparison is where the learning is.",
  "Draw the UI state as one type before you open a view file. Both frameworks reward it, both punish you without it.",
  "One app per phase, finished and ugly, beats a beautiful app that stops at phase three.",
  "Read the two sample apps — Apple's tutorials and Now in Android — instead of ten blog posts.",
  "Sixty minutes on weekdays, one long block at the weekend. The ship date matters more than the hours.",
];

export interface Course {
  track: TrackId | "both";
  label: string;
  href: string;
  note: string;
}

/** Long-form courses to run underneath the phases, as opposed to the per-step reference links. */
export const COURSES: readonly Course[] = [
  {
    track: "swift",
    label: "Apple — SwiftUI tutorials",
    href: "https://developer.apple.com/tutorials/swiftui",
    note: "The official build-along. Start here, finish it.",
  },
  {
    track: "swift",
    label: "100 Days of SwiftUI",
    href: "https://www.hackingwithswift.com/100/swiftui",
    note: "Free, structured, project-led. The best spine for phases 1 to 3.",
  },
  {
    track: "swift",
    label: "Swift concurrency documentation",
    href: "https://developer.apple.com/documentation/swift/concurrency",
    note: "Read it once properly; it explains most compiler errors.",
  },
  {
    track: "kotlin",
    label: "Android Basics with Compose",
    href: "https://developer.android.com/courses/android-basics-compose/course",
    note: "The official course. Phases 1 to 3 in one place.",
  },
  {
    track: "kotlin",
    label: "Kotlin Koans",
    href: "https://kotlinlang.org/docs/koans.html",
    note: "Two evenings, and the language stops feeling foreign.",
  },
  {
    track: "kotlin",
    label: "Now in Android",
    href: "https://github.com/android/nowinandroid",
    note: "Google's own full app. Read it in phase 3 and again in phase 7.",
  },
];

/** Every checkbox on the page, so the progress bar knows the denominator. */
export function stepIds(tracks: readonly TrackId[]): string[] {
  return PHASES.flatMap((phase) => [
    ...tracks.flatMap((track) => phase.steps[track].map((step) => step.id)),
    phase.ship.id,
  ]);
}

export const TOTAL_WEEKS = 24;
