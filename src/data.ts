/**
 * Major sticker data and the date helpers shared by every view.
 *
 * Dates are calendar days (YYYY-MM-DD) as recorded from Valve's posts,
 * Liquipedia, CSGOSKINS.GG and HLTV. Where Valve's post time is known, the
 * date is its UTC date (e.g. Cologne 2026 went live 00:40 UTC on 22 May,
 * which was still 21 May in Seattle).
 */

// --- Data model --------------------------------------------------------------
export type CapsuleRow = {
  id: string;
  major: string;
  city: string;
  year: number;
  introduced: string | null;
  saleDate: string | null; // "Sale" wording only in UI
  removed: string | null;
  winner?: string | null; // e.g. "🏆 Team Vitality"
  note?: string | null; // small info tip shown next to the Major name
  noteUrl?: string | null; // optional source for the note
  logo?: string | null; // tournament logo under /public/majors (64px webp)
  /**
   * How the Major's stickers were sold. Omitted = the classic capsule, which
   * gets a discounted "sale" before removal. From Cologne 2026 on, stickers
   * are bought individually in Valve's Major Shop, so there is no sale at all:
   * - "volatile": price moves with demand (Cologne 2026)
   * - "fixed":    fixed price per finish (Singapore 2026)
   * Shop Majors keep saleDate null and are left out of every sale statistic.
   */
  shop?: "volatile" | "fixed";
};

export const SHOP_LABEL: Record<NonNullable<CapsuleRow["shop"]>, string> = {
  volatile: "Major Shop, demand-based prices",
  fixed: "Major Shop, fixed prices",
};

export const INITIAL_ROWS: CapsuleRow[] = [
  // === Older CS:GO Majors ===
  {
    id: "katowice-2014",
    logo: "/majors/2014-ems-one-katowice.webp",
    major: "EMS One Katowice 2014",
    city: "Katowice",
    year: 2014,
    introduced: "2014-03-06",
    saleDate: "2014-03-15",
    removed: "2014-03-17",
    winner: "🏆 Virtus.pro",
  },
  {
    id: "cologne-2014",
    logo: "/majors/2014-esl-one-cologne.webp",
    major: "ESL One Cologne 2014",
    city: "Cologne",
    year: 2014,
    introduced: "2014-08-04",
    saleDate: "2014-08-17",
    removed: "2014-08-19",
    winner: "🏆 Ninjas in Pyjamas",
  },
  {
    id: "jonkoping-2014",
    logo: "/majors/2014-dreamhack-winter.webp",
    major: "DreamHack Winter 2014",
    city: "Jonkoping",
    year: 2014,
    introduced: "2014-11-21",
    saleDate: "2014-11-29",
    removed: "2014-12-02",
    winner: "🏆 Team LDLC.com",
  },
  {
    id: "katowice-2015",
    logo: "/majors/2015-esl-one-katowice.webp",
    major: "ESL One Katowice 2015",
    city: "Katowice",
    year: 2015,
    introduced: "2015-02-26",
    saleDate: "2015-03-15",
    removed: "2015-03-16",
    winner: "🏆 Fnatic",
  },
  {
    id: "cologne-2015",
    logo: "/majors/2015-esl-one-cologne.webp",
    major: "ESL One Cologne 2015",
    city: "Cologne",
    year: 2015,
    introduced: "2015-08-14",
    saleDate: "2015-08-23",
    removed: "2015-08-24",
    winner: "🏆 Fnatic",
  },
  {
    id: "cluj-2015",
    logo: "/majors/2015-dreamhack-cluj-napoca.webp",
    major: "DreamHack Cluj-Napoca 2015",
    city: "Cluj-Napoca",
    year: 2015,
    introduced: "2015-10-20",
    saleDate: "2015-11-01",
    removed: "2015-11-04",
    winner: "🏆 Team EnVyUs",
  },
  {
    id: "columbus-2016",
    logo: "/majors/2016-mlg-columbus.webp",
    major: "MLG Columbus 2016",
    city: "Columbus",
    year: 2016,
    introduced: "2016-03-17",
    saleDate: "2016-04-03",
    removed: "2016-04-04",
    winner: "🏆 Luminosity",
  },
  {
    id: "cologne-2016",
    logo: "/majors/2016-esl-one-cologne.webp",
    major: "ESL One Cologne 2016",
    city: "Cologne",
    year: 2016,
    introduced: "2016-06-24",
    saleDate: "2016-07-10",
    removed: "2016-07-12",
    winner: "🏆 SK Gaming",
  },
  {
    id: "atlanta-2017",
    logo: "/majors/2017-eleague-atlanta.webp",
    major: "ELEAGUE Atlanta 2017",
    city: "Atlanta",
    year: 2017,
    introduced: "2017-01-12",
    saleDate: "2017-01-29",
    removed: "2017-01-31",
    winner: "🏆 Astralis",
  },
  {
    id: "krakow-2017",
    logo: "/majors/2017-pgl-krakow.webp",
    major: "PGL Krakow 2017",
    city: "Krakow",
    year: 2017,
    introduced: "2017-07-07",
    saleDate: "2017-07-23",
    removed: "2017-07-25",
    winner: "🏆 Gambit Esports",
  },
  {
    id: "boston-2018",
    logo: "/majors/2018-eleague-boston.webp",
    major: "ELEAGUE Boston 2018",
    city: "Boston",
    year: 2018,
    introduced: "2018-01-10",
    saleDate: "2018-01-26",
    removed: "2018-01-30",
    winner: "🏆 Cloud9",
  },
  {
    id: "london-2018",
    logo: "/majors/2018-faceit-london.webp",
    major: "FACEIT London 2018",
    city: "London",
    year: 2018,
    introduced: "2018-09-05",
    saleDate: "2018-09-22",
    removed: "2018-09-26",
    winner: "🏆 Astralis",
  },
  {
    id: "katowice-2019",
    logo: "/majors/2019-iem-katowice.webp",
    major: "IEM Katowice 2019",
    city: "Katowice",
    year: 2019,
    introduced: "2019-02-06",
    saleDate: "2019-03-02",
    removed: "2019-03-11",
    winner: "🏆 Astralis",
  },
  {
    id: "berlin-2019",
    logo: "/majors/2019-starladder-berlin.webp",
    major: "StarLadder Berlin 2019",
    city: "Berlin",
    year: 2019,
    introduced: "2019-08-14",
    saleDate: "2019-09-07",
    removed: "2019-09-26",
    winner: "🏆 Astralis",
  },
  {
    id: "RMR-2020",
    logo: "/majors/2020-rmr.webp",
    major: "Regional Major Rankings 2020",
    city: "N/A",
    year: 2020,
    introduced: "2021-01-27",
    saleDate: "2021-04-06",
    removed: "2021-05-21",
    winner: null,
  },
  // === CS:GO (late) ===
  {
    id: "stockholm-2021",
    logo: "/majors/2021-pgl-stockholm.webp",
    major: "PGL Stockholm 2021",
    city: "Stockholm",
    year: 2021,
    introduced: "2021-10-21",
    saleDate: "2021-11-30",
    removed: "2022-01-18",
    winner: "🏆 Natus Vincere",
  },
  {
    id: "antwerp-2022",
    logo: "/majors/2022-pgl-antwerp.webp",
    major: "PGL Antwerp 2022",
    city: "Antwerp",
    year: 2022,
    introduced: "2022-05-04",
    saleDate: "2022-06-03",
    removed: "2022-08-09",
    winner: "🏆 FaZe Clan",
  },
  {
    id: "rio-2022",
    logo: "/majors/2022-iem-rio.webp",
    major: "IEM Rio 2022",
    city: "Rio de Janeiro",
    year: 2022,
    introduced: "2022-10-21",
    saleDate: "2022-12-14",
    removed: "2023-02-20",
    winner: "🏆 Outsiders",
  },
  {
    id: "paris-2023",
    logo: "/majors/2023-blast-paris.webp",
    major: "BLAST.tv Paris 2023",
    city: "Paris",
    year: 2023,
    introduced: "2023-05-04",
    saleDate: "2023-06-23",
    removed: "2023-10-07",
    winner: "🏆 Team Vitality",
  },
  // === CS2 era ===
  {
    id: "copenhagen-2024",
    logo: "/majors/2024-pgl-copenhagen.webp",
    major: "PGL Copenhagen 2024",
    city: "Copenhagen",
    year: 2024,
    introduced: "2024-03-21",
    saleDate: "2024-04-26",
    removed: "2024-08-15",
    winner: "🏆 Natus Vincere",
  },
  {
    id: "shanghai-2024",
    logo: "/majors/2024-pw-shanghai.webp",
    major: "Perfect World Shanghai 2024",
    city: "Shanghai",
    year: 2024,
    introduced: "2024-11-27",
    saleDate: "2025-01-14",
    removed: "2025-04-21",
    winner: "🏆 Team Spirit",
  },
  {
    id: "austin-2025",
    logo: "/majors/2025-blast-austin.webp",
    major: "BLAST.tv Austin 2025",
    city: "Austin",
    year: 2025,
    introduced: "2025-05-22",
    saleDate: "2025-08-14",
    removed: "2025-10-01",
    winner: "🏆 Team Vitality",
  },
  {
    id: "budapest-2025",
    logo: "/majors/2025-starladder-budapest.webp",
    major: "StarLadder Budapest 2025",
    city: "Budapest",
    year: 2025,
    introduced: "2025-11-13",
    saleDate: "2026-01-22",
    removed: "2026-03-15",
    winner: "🏆 Team Vitality",
  },
  {
    id: "cologne-2026",
    logo: "/majors/2026-iem-cologne.webp",
    major: "IEM Cologne 2026",
    city: "Cologne",
    year: 2026,
    introduced: "2026-05-22",
    saleDate: null,
    removed: "2026-09-29",
    winner: "🏆 Team Falcons",
    shop: "volatile",
    note: "First Major without capsules: stickers were bought individually at demand-based prices, so there was no sale.",
    noteUrl: "https://www.counter-strike.net/newsentry/672869045073084948",
  },
  {
    id: "singapore-2026",
    major: "PGL Singapore 2026",
    city: "Singapore",
    year: 2026,
    introduced: "2026-11-17",
    saleDate: null,
    removed: null,
    winner: null,
    shop: "fixed",
    note: "No capsules: stickers are sold directly at a fixed price in each finish, so no sale is expected.",
    noteUrl:
      "https://steamcommunity.com/games/CSGO/announcements/detail/687522235410285289",
  },
];

// --- Helpers -----------------------------------------------------------------
export const fmt = (iso: string | null) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";

export const diffDays = (a: string | null, b: string | null) => {
  if (!a) return null;
  const endIso = b ?? new Date().toISOString().slice(0, 10);
  const ms =
    new Date(endIso + "T00:00:00").getTime() -
    new Date(a + "T00:00:00").getTime();
  return ms >= 0 ? Math.round(ms / 86400000) : null;
};

// Introduced → Removed (or today if still active)
export const availabilityDays = (row: CapsuleRow) => {
  if (!row.introduced) return null;
  const endIso = row.removed ?? new Date().toISOString().slice(0, 10);
  return diffDays(row.introduced, endIso);
};

export const statusFor = (row: CapsuleRow) => {
  const today = new Date();
  const intro = row.introduced ? new Date(row.introduced + "T00:00:00") : null;
  const removed = row.removed ? new Date(row.removed + "T00:00:00") : null;
  if (removed && today > removed)
    return { label: "Removed", tone: "bg-red-400/10 text-red-400 border border-red-400/25" };
  if (intro && today >= intro && (!removed || today <= removed))
    return {
      label: "Active",
      tone: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/25 motion-safe:animate-pulse",
    };
  return { label: "Planned", tone: "bg-[#3987e5]/10 text-[#86b6ef] border border-[#3987e5]/30" };
};

export const statusRank = (row: CapsuleRow) => {
  const today = new Date();
  const intro = row.introduced ? new Date(row.introduced + "T00:00:00") : null;
  const removed = row.removed ? new Date(row.removed + "T00:00:00") : null;

  if (intro && today < intro) return 0; // Planned
  if (intro && (!removed || today <= removed)) return 1; // Active
  return 2; // Removed
};

// --- Weekdays ----------------------------------------------------------------
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEKDAYS_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** 0 = Monday … 6 = Sunday. Read in UTC so the viewer's timezone can't shift it. */
export const weekdayIndex = (iso: string | null): number | null =>
  iso ? (new Date(iso + "T00:00:00Z").getUTCDay() + 6) % 7 : null;

/** The three dated events, in the order they happen. */
export const EVENTS = [
  { key: "introduced", label: "Released" },
  { key: "saleDate", label: "Sale" },
  { key: "removed", label: "Removed" },
] as const;
export type EventKey = (typeof EVENTS)[number]["key"];

export type WeekdayStats = {
  /** Majors per weekday, Monday first. */
  counts: number[];
  /** The Majors behind each count. */
  majors: CapsuleRow[][];
  total: number;
  max: number;
  /** Most common weekday(s); several when tied, empty with no data. */
  top: number[];
};

export function weekdayStats(rows: CapsuleRow[], key: EventKey): WeekdayStats {
  const majors: CapsuleRow[][] = WEEKDAYS.map(() => []);
  for (const r of rows) {
    const d = weekdayIndex(r[key]);
    if (d !== null) majors[d].push(r);
  }
  const counts = majors.map((m) => m.length);
  const total = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...counts);
  const top = max ? counts.flatMap((c, i) => (c === max ? [i] : [])) : [];
  return { counts, majors, total, max, top };
}
