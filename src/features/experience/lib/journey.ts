import { accentAt } from "@/config/theme";

import { EXPERIENCE } from "../data";

/**
 * The roles in the order they were held, oldest first, each with its accent colour (the same
 * colours the plain timeline uses, which lists newest first).
 */
export const JOURNEY = EXPERIENCE.map((role, i) => ({ role, accent: accentAt(i + 2) })).reverse();
