/**
 * Theme tokens, shared with cases.csmarket.forum (csmf-case-tracking/web/src/theme.ts)
 * so the CSMF sites read as one product. Change them there first, then here.
 */

/** Card surface — tables and charts are drawn against this. */
export const SURFACE = "#24272f";
/** Page plane, also used for inset controls. */
export const PAGE = "#1b1d24";
/** Hover / tooltip box. */
export const RAISED = "#2b2f39";

/** Brand accent (focus rings, active controls). */
export const ACCENT = "#3987e5";

/**
 * Categorical slots, in fixed order, validated on the #24272f surface on the
 * sibling site. Here: blue = availability, orange = sale duration, teal and
 * mauve = their last-5-Majors averages.
 */
export const SERIES = ["#3987e5", "#d95926", "#14a89e", "#9f61ad", "#c69e07"] as const;

/** Axis and label ink. */
export const MUTED = "#898781";
export const GRID = "rgba(255,255,255,0.06)";
export const AXIS = "rgba(255,255,255,0.1)";

/** Recharts tooltip box, matching the sibling site's hover box. */
export const TOOLTIP_STYLE = {
  backgroundColor: RAISED,
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#d1d5db",
  fontSize: 13,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
} as const;

/**
 * Sequential blue ramp, light→dark, copied from the sibling site's supply grid
 * so heatmaps shade identically on both. Steps up to SEQ_INK_FLIP take dark ink.
 */
export const SEQ = [
  "#cde2fb", "#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec",
  "#5598e7", "#3987e5", "#2a78d6", "#256abf", "#1c5cab",
  "#184f95", "#104281", "#0d366b",
] as const;
export const SEQ_INK_FLIP = 7;
export const seqInk = (step: number) => (step <= SEQ_INK_FLIP ? "#0b0b0b" : "#ffffff");
