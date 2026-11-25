/** The words that belong to the Design System course itself, on top of the ones every course page shares. */
export interface DesignUi {
  nav: { learn: string; practice: string; designLab: string; cheatsheets: string };
  searchPlaceholder: string;
  /** The colour key under the diagram. */
  legend: { request: string; response: string; handshake: string; failed: string };
  /** How a change to the diagram is worded in "What changed", given the name of a block. */
  goesDown: (name: string) => string;
  isBack: (name: string) => string;
  traffic: (label: string) => string;
  focusOn: (name: string) => string;
}
