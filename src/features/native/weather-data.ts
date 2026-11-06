/**
 * Copy and tokens for the Weather app design at /native/weather-design.
 * The numbers are made up: they only have to look like a real forecast.
 */

export type GlyphName = "sun" | "cloud" | "rain" | "moon" | "snow";

export interface Sky {
  id: string;
  label: string;
  /** Top and bottom of the card gradient. */
  from: string;
  to: string;
  /** Text colour that holds 4.5:1 on both ends of the gradient. */
  ink: string;
  /** Which Open-Meteo weather codes pick this sky. */
  codes: string;
}

/** The background follows the weather, so the palette is the app's main design decision. */
export const SKIES: readonly Sky[] = [
  { id: "clear", label: "Clear", from: "#0369a1", to: "#38bdf8", ink: "#ffffff", codes: "0–1" },
  {
    id: "cloudy",
    label: "Cloudy",
    from: "#334155",
    to: "#94a3b8",
    ink: "#ffffff",
    codes: "2–3, 45–48",
  },
  {
    id: "rain",
    label: "Rain",
    from: "#1e3a8a",
    to: "#3b82f6",
    ink: "#ffffff",
    codes: "51–67, 80–82",
  },
  {
    id: "snow",
    label: "Snow",
    from: "#cbd5e1",
    to: "#f1f5f9",
    ink: "#0f172a",
    codes: "71–77, 85–86",
  },
  { id: "storm", label: "Storm", from: "#3b0764", to: "#7c3aed", ink: "#ffffff", codes: "95–99" },
  {
    id: "night",
    label: "Night",
    from: "#0f172a",
    to: "#4338ca",
    ink: "#ffffff",
    codes: "any, after sunset",
  },
];

export const HOURLY: readonly { time: string; icon: GlyphName; deg: number }[] = [
  { time: "Now", icon: "sun", deg: 21 },
  { time: "14", icon: "sun", deg: 23 },
  { time: "15", icon: "cloud", deg: 24 },
  { time: "16", icon: "cloud", deg: 22 },
  { time: "17", icon: "rain", deg: 19 },
  { time: "18", icon: "rain", deg: 17 },
];

export const DAILY: readonly { day: string; icon: GlyphName; low: number; high: number }[] = [
  { day: "Today", icon: "sun", low: 15, high: 24 },
  { day: "Thu", icon: "cloud", low: 14, high: 21 },
  { day: "Fri", icon: "rain", low: 12, high: 18 },
  { day: "Sat", icon: "rain", low: 11, high: 16 },
  { day: "Sun", icon: "cloud", low: 12, high: 19 },
  { day: "Mon", icon: "sun", low: 14, high: 23 },
];

export const CITIES: readonly {
  name: string;
  local: string;
  condition: string;
  deg: number;
  sky: string;
}[] = [
  { name: "Ho Chi Minh City", local: "14:05", condition: "Partly cloudy", deg: 31, sky: "clear" },
  { name: "Hanoi", local: "14:05", condition: "Light rain", deg: 26, sky: "rain" },
  { name: "Singapore", local: "15:05", condition: "Thunderstorm", deg: 29, sky: "storm" },
  { name: "Oslo", local: "08:05", condition: "Overcast", deg: 4, sky: "cloudy" },
];

export const METRICS: readonly { label: string; value: string }[] = [
  { label: "FEELS LIKE", value: "23°" },
  { label: "HUMIDITY", value: "62%" },
  { label: "WIND", value: "14 km/h" },
  { label: "UV INDEX", value: "6" },
];

export interface TypeStyle {
  name: string;
  sample: string;
  spec: string;
  swift: string;
  kotlin: string;
  className: string;
}

export const TYPE_SCALE: readonly TypeStyle[] = [
  {
    name: "Display",
    sample: "21°",
    spec: "96 / 96 · Thin",
    swift: ".system(size: 96, weight: .thin)",
    kotlin: "displayLarge, FontWeight.Thin",
    className: "text-7xl font-thin",
  },
  {
    name: "Title",
    sample: "Ho Chi Minh City",
    spec: "28 / 34 · Semibold",
    swift: ".title.weight(.semibold)",
    kotlin: "headlineMedium",
    className: "text-2xl font-semibold",
  },
  {
    name: "Body",
    sample: "Partly cloudy · H 24° L 15°",
    spec: "17 / 22 · Regular",
    swift: ".body",
    kotlin: "bodyLarge",
    className: "text-base",
  },
  {
    name: "Label",
    sample: "FEELS LIKE",
    spec: "11 / 14 · Medium, +8% tracking",
    swift: ".caption2, .tracking(0.9)",
    kotlin: "labelSmall, letterSpacing 0.08em",
    className: "text-[11px] font-medium tracking-[0.08em]",
  },
];

export const SPACING: readonly { token: string; px: number; use: string }[] = [
  { token: "xs", px: 4, use: "icon to label" },
  { token: "s", px: 8, use: "inside a row" },
  { token: "m", px: 16, use: "screen edge, card padding" },
  { token: "l", px: 24, use: "between cards" },
  { token: "xl", px: 40, use: "above the display number" },
];

export interface DesignComponent {
  name: string;
  from: string;
  detail: string;
  swift: string;
  kotlin: string;
}

export const COMPONENTS: readonly DesignComponent[] = [
  {
    name: "SkyBackground",
    from: "v0.2",
    detail: "Full-bleed gradient chosen by condition; the only place colour changes.",
    swift: "LinearGradient + .ignoresSafeArea()",
    kotlin: "Box(Modifier.background(Brush.verticalGradient))",
  },
  {
    name: "HourlyStrip",
    from: "v0.2",
    detail: "Six to twenty-four hours, scrolls sideways, current hour pinned first.",
    swift: "ScrollView(.horizontal) { LazyHStack }",
    kotlin: "LazyRow",
  },
  {
    name: "DailyRow",
    from: "v0.2",
    detail: "Day, icon, and a low–high bar scaled to the week's range.",
    swift: "List row or VStack of HStacks",
    kotlin: "LazyColumn item / Column of Rows",
  },
  {
    name: "UnitToggle",
    from: "v0.2",
    detail: "Two-segment °C / °F control, top right. Converts every number on screen.",
    swift: "Picker(.segmented)",
    kotlin: "SingleChoiceSegmentedButtonRow",
  },
  {
    name: "CityRow",
    from: "v0.3",
    detail: "A small sky card per saved city; swipe to delete.",
    swift: ".swipeActions in a List",
    kotlin: "SwipeToDismissBox",
  },
  {
    name: "MetricTile",
    from: "v0.3",
    detail: "Label plus value in a two-column grid on the detail screen.",
    swift: "LazyVGrid(columns: 2)",
    kotlin: "LazyVerticalGrid(GridCells.Fixed(2))",
  },
  {
    name: "StateBanner",
    from: "v0.4",
    detail: "Loading skeleton, error with a retry button, and the offline notice from v0.5.",
    swift: "switch on a ViewState enum",
    kotlin: "when on a sealed UiState",
  },
];
