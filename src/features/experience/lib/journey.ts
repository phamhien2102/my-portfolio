import { accentAt } from "@/config/theme";

import { EXPERIENCE } from "../data";

/**
 * The roles newest first, matching the plain timeline and the resume, each with its accent colour
 * (the same colours the plain timeline uses).
 */
export const JOURNEY = EXPERIENCE.map((role, i) => ({ role, accent: accentAt(i + 2) }));
