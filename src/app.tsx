import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CalendarDays, Search, Filter, Info } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { SERIES, MUTED, GRID, AXIS, TOOLTIP_STYLE } from "@/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

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

const SHOP_LABEL: Record<NonNullable<CapsuleRow["shop"]>, string> = {
  volatile: "Major Shop, demand-based prices",
  fixed: "Major Shop, fixed prices",
};

const INITIAL_ROWS: CapsuleRow[] = [
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
const fmt = (iso: string | null) =>
  iso
    ? new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";

const diffDays = (a: string | null, b: string | null) => {
  if (!a) return null;
  const endIso = b ?? new Date().toISOString().slice(0, 10);
  const ms =
    new Date(endIso + "T00:00:00").getTime() -
    new Date(a + "T00:00:00").getTime();
  return ms >= 0 ? Math.round(ms / 86400000) : null;
};

// Introduced → Removed (or today if still active)
const availabilityDays = (row: CapsuleRow) => {
  if (!row.introduced) return null;
  const endIso = row.removed ?? new Date().toISOString().slice(0, 10);
  return diffDays(row.introduced, endIso);
};

const statusFor = (row: CapsuleRow) => {
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

const statusRank = (row: CapsuleRow) => {
  const today = new Date();
  const intro = row.introduced ? new Date(row.introduced + "T00:00:00") : null;
  const removed = row.removed ? new Date(row.removed + "T00:00:00") : null;

  if (intro && today < intro) return 0; // Planned
  if (intro && (!removed || today <= removed)) return 1; // Active
  return 2; // Removed
};

// (Optional) label component (kept if you switch back to inline labels later)
const RightMultiLineLabel: React.FC<{
  viewBox?: { x: number; y: number; width: number; height: number };
  lines: string[];
  color?: string;
  dy?: number;
  inside?: boolean;
}> = ({ viewBox, lines, color = "#111827", dy = 0, inside = true }) => {
  if (!viewBox) return null as any;
  const padding = 8;
  const x = inside
    ? viewBox.x + viewBox.width - padding
    : viewBox.x + viewBox.width + padding;
  const y = viewBox.y + dy;
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontSize={12}
      fontWeight={700}
      textAnchor={inside ? "end" : "start"}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

// Small info tip attached to a Major (e.g. a rules change that affects its dates).
const NoteTip: React.FC<{ note: string; url?: string | null }> = ({
  note,
  url,
}) => {
  const body = (
    <>
      <Info className="w-3 h-3 shrink-0" />
      <span>{note}</span>
    </>
  );
  const tone =
    "mt-1.5 inline-flex items-start gap-1.5 max-w-[22rem] rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[11px] leading-4 text-amber-300/90 whitespace-normal";

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${tone} hover:bg-amber-500/20 hover:text-amber-200`}
      title="Read Valve's announcement"
    >
      {body}
    </a>
  ) : (
    <div className={tone}>{body}</div>
  );
};

// --- UI ----------------------------------------------------------------------

type SortKey = keyof Pick<
  CapsuleRow,
  "major" | "year" | "introduced" | "saleDate" | "removed"
>;
type SortState = { key: SortKey; dir: "asc" | "desc" };

// Keep: Planned (0) above Active (1) above Removed (2) — always.
// Apply dir only to the secondary (column) comparison.
const sortBy = (rows: CapsuleRow[], { key, dir }: SortState) => {
  const toKey = (v: any) => (v == null ? "" : v); // null-safe

  return [...rows].sort((a, b) => {
    // 1) Status bucket first (fixed ascending so Planned is always on top)
    const sa = statusRank(a);
    const sb = statusRank(b);
    if (sa !== sb) return sa - sb;

    // 2) Within the same status, compare selected column with dir
    const av = toKey(a[key] as any);
    const bv = toKey(b[key] as any);

    // ISO dates compare correctly as strings; numbers do too; others lexicographically
    let cmp = 0;
    if (av < bv) cmp = -1;
    else if (av > bv) cmp = 1;

    return dir === "asc" ? cmp : -cmp;
  });
};

export default function CS2CapsuleTracker() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({
    key: "introduced",
    dir: "desc",
  });
  const [yearFilter, setYearFilter] = useState<string>("");

  const years = useMemo(
    () =>
      Array.from(new Set(INITIAL_ROWS.map((r) => r.year))).sort(
        (a, b) => b - a
      ),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = INITIAL_ROWS.filter(
      (r) =>
        (!yearFilter || String(r.year) === yearFilter) &&
        (!q ||
          r.major.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q))
    );
    return sortBy(rows, sort);
  }, [query, yearFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));

  // Graph data (use full set so averages are consistent)
  // Graph data (use filtered set so it follows the table)
  const chartData = useMemo(() => {
    const parse = (d: string | null) =>
      d ? new Date(d + "T00:00:00").getTime() : 0;

    return [...filtered]
      .sort((a, b) => parse(a.introduced) - parse(b.introduced)) // always ascending
      .map((r) => ({
        major: r.major,
        availability: availabilityDays(r) ?? 0,
        // Shop Majors never had a sale: leave a gap rather than a zero bar.
        saleDuration: r.shop ? null : diffDays(r.saleDate, r.removed) ?? 0,
      }));
  }, [filtered]);

  const isNum = (v: number | null): v is number => v !== null;

  const isCompleted = (r: CapsuleRow) =>
    !!r.removed && new Date(r.removed + "T00:00:00") < new Date();

  const avgSale = useMemo(() => {
    const vals = filtered
      .filter((r) => isCompleted(r) && !r.shop)
      .map((r) => diffDays(r.saleDate, r.removed))
      .filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [filtered]);

  const avgAvail = useMemo(() => {
    const vals = filtered
      .filter(isCompleted)
      .map((r) => availabilityDays(r))
      .filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [filtered]);

  // --- Averages for the last 5 majors (by Introduced date, most recent first) ---
  const { avgAvail5, avgSale5 } = useMemo(() => {
    const parse = (d: string | null) =>
      d ? new Date(d + "T00:00:00").getTime() : 0;
    const done = filtered
      .filter((r) => !!r.introduced && isCompleted(r))
      .sort((a, b) => parse(b.introduced) - parse(a.introduced));
    // Availability counts every Major; the sale average uses the last 5 that
    // actually had a sale, so a Shop Major doesn't shrink it to 4.
    const recent = done.slice(0, 5);
    const recentSales = done.filter((r) => !r.shop).slice(0, 5);

    const availVals = recent
      .map((r) => availabilityDays(r))
      .filter((v): v is number => v !== null);
    const saleVals = recentSales
      .map((r) => diffDays(r.saleDate, r.removed))
      .filter((v): v is number => v !== null);

    const avgAvail5 = availVals.length
      ? availVals.reduce((a, b) => a + b, 0) / availVals.length
      : 0;
    const avgSale5 = saleVals.length
      ? saleVals.reduce((a, b) => a + b, 0) / saleVals.length
      : 0;

    return { avgAvail5, avgSale5 };
  }, [filtered]);

  // --- Lightweight tests (console) ------------------------------------------
  useEffect(() => {
    const t = (name: string, ok: boolean) =>
      console.assert(ok, `Test failed: ${name}`);
    // Helper sanity
    t("diffDays basic", diffDays("2024-01-01", "2024-01-11") === 10);
    // Known row checks
    const paris = INITIAL_ROWS.find((r) => r.id === "paris-2023");
    if (paris) {
      const sale = diffDays(paris.saleDate, paris.removed);
      const avail = availabilityDays(paris);
      t("paris sale >= 0", (sale ?? 0) >= 0);
      t("paris availability >= sale", (avail ?? 0) >= (sale ?? 0));
    }
    const austin = INITIAL_ROWS.find((r) => r.id === "austin-2025");
    if (austin) {
      t("austin removed null", austin.removed === null);
      t(
        "austin sale duration null",
        diffDays(austin.saleDate, austin.removed) === null
      );
      t("austin availability running", (availabilityDays(austin) ?? 0) > 0);
    }
  }, []);

  // --- Table component (inside same card as controls) ------------------------
  function TableSection({
    rows,
    onSort,
  }: {
    rows: CapsuleRow[];
    onSort: (k: SortKey) => void;
  }) {
    const th = "text-left font-medium text-gray-400 pb-2 px-2 whitespace-nowrap";
    const sortTh = (key: SortKey, label: string) => (
      <th
        className={`${th} cursor-pointer transition-colors hover:text-white`}
        onClick={() => onSort(key)}
        aria-sort={
          sort.key === key
            ? sort.dir === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown
            className={`w-3 h-3 ${sort.key === key ? "text-[#3987e5]" : "text-gray-600"}`}
          />
        </span>
      </th>
    );
    const td = "px-2 py-2";

    return (
      <table className="row-hover min-w-full border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            <th className={th}>Major / City</th>
            {sortTh("introduced", "Introduced")}
            {sortTh("saleDate", "Sale")}
            {sortTh("removed", "Removed")}
            <th className={th}>Availability (intro → removal)</th>
            <th className={th}>Sale Duration (sale → removal)</th>
            <th className={th}>Champion</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="[&>tr>td]:border-t [&>tr>td]:border-white/5">
          {rows.map((r) => {
            const avail = availabilityDays(r);
            const saleDur = diffDays(r.saleDate, r.removed);
            const status = statusFor(r);
            return (
              <tr key={r.id} className="align-top">
                {/* Tournament cell: name + city/year + optional tip */}
                <td className={td}>
                  <div className="flex items-start gap-3">
                    {r.logo ? (
                      <img
                        src={r.logo}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        className="h-8 w-8 shrink-0 object-contain"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="h-8 w-8 shrink-0 rounded-full border border-white/10 bg-white/5"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-white leading-5">
                        {r.major}
                      </div>
                      <div className="text-gray-500 text-[13px] leading-4 mt-0.5">
                        {r.city} · {r.year}
                      </div>
                      {r.note && <NoteTip note={r.note} url={r.noteUrl} />}
                    </div>
                  </div>
                </td>

                {/* Dates */}
                <td className={`${td} whitespace-nowrap tabular-nums text-gray-300`}>
                  {fmt(r.introduced)}
                </td>
                <td className={`${td} whitespace-nowrap tabular-nums text-gray-300`}>
                  {r.shop ? (
                    <span
                      title={SHOP_LABEL[r.shop]}
                      className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-gray-400"
                    >
                      No sale
                    </span>
                  ) : (
                    fmt(r.saleDate)
                  )}
                </td>
                <td className={`${td} whitespace-nowrap tabular-nums text-red-400 font-medium`}>
                  {fmt(r.removed)}
                </td>

                {/* Durations */}
                <td className={`${td} tabular-nums text-gray-300`}>
                  {avail !== null
                    ? `${avail} days${r.removed ? "" : " (so far)"}`
                    : "—"}
                </td>
                <td className={`${td} tabular-nums text-gray-300`}>
                  {r.shop
                    ? <span className="text-gray-500">n/a</span>
                    : saleDur !== null
                    ? `${saleDur} days${r.removed ? "" : " (so far)"}`
                    : "—"}
                </td>

                {/* Winner */}
                <td className={`${td} whitespace-nowrap text-gray-300`}>
                  {r.winner || "—"}
                </td>

                {/* Status pill */}
                <td className={td}>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${status.tone}`}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  // --- Shared chart pieces ----------------------------------------------------
  type ChartRow = { major: string; availability: number; saleDuration: number | null };
  type AvgLine = { label: string; value: number; color: string; dash: string };

  const AVAIL_COLOR = SERIES[0];
  const SALE_COLOR = SERIES[1];
  const AVAIL5_COLOR = SERIES[2];
  const SALE5_COLOR = SERIES[3];

  // Averages legend, top-right of each chart
  const AvgOverlay = ({ lines }: { lines: AvgLine[] }) => (
    <div className="absolute right-2 top-2 z-10 pointer-events-none rounded-lg border border-white/10 bg-[#1b1d24]/90 backdrop-blur px-2.5 py-1.5 text-[12px] leading-5 shadow-soft">
      {lines.map((l) => (
        <div key={l.label} className="flex items-center gap-2 text-gray-300">
          <svg width="16" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="16"
              y2="2"
              stroke={l.color}
              strokeWidth="2"
              strokeDasharray={l.dash}
            />
          </svg>
          <span>{l.label}</span>
          <span className="ml-auto pl-2 tabular-nums font-medium text-white">
            {l.value.toFixed(0)} days
          </span>
        </div>
      ))}
    </div>
  );

  const xAxis = (
    <XAxis
      dataKey="major"
      tick={{ fontSize: 12, fill: MUTED }}
      tickLine={false}
      axisLine={{ stroke: AXIS }}
      interval={0}
      angle={-20}
      textAnchor="end"
      height={60}
    />
  );
  const yAxis = (
    <YAxis tick={{ fontSize: 13, fill: MUTED }} tickLine={false} axisLine={false} />
  );
  const grid = <CartesianGrid stroke={GRID} vertical={false} />;
  const tooltip = (cursor: object) => (
    <Tooltip
      formatter={(v: any, n: string) => [v ?? "—", n]}
      contentStyle={TOOLTIP_STYLE}
      labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: 2 }}
      itemStyle={{ padding: 0 }}
      cursor={cursor}
      wrapperStyle={{ zIndex: 50, outline: "none" }}
    />
  );
  const legend = (
    <Legend
      verticalAlign="top"
      align="left"
      height={32}
      iconType="circle"
      iconSize={8}
      wrapperStyle={{ paddingBottom: 8 }}
      formatter={(v) => <span className="text-[13px] text-gray-300">{v}</span>}
    />
  );
  const avgLines = (lines: AvgLine[]) =>
    lines.map((l) => (
      <ReferenceLine
        key={l.label}
        ifOverflow="extendDomain"
        y={l.value}
        stroke={l.color}
        strokeDasharray={l.dash}
      />
    ));

  function ChartCard({
    title,
    subtitle,
    lines,
    height,
    children,
  }: {
    title: string;
    subtitle: string;
    lines: AvgLine[];
    height: number;
    children: React.ReactElement;
  }) {
    return (
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 mb-4 text-sm text-gray-400">{subtitle}</p>
          <div className="relative">
            <AvgOverlay lines={lines} />
            <div className="grid-scroll overflow-x-auto">
              <div className="w-full min-w-[900px] lg:min-w-0">
                <ResponsiveContainer width="100%" height={height}>
                  {children}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Page -------------------------------------------------------------------
  const availLines: AvgLine[] = [
    { label: "Avg availability", value: avgAvail, color: AVAIL_COLOR, dash: "5 5" },
    { label: "Availability, last 5 Majors", value: avgAvail5, color: AVAIL5_COLOR, dash: "3 3" },
  ];
  const saleLines: AvgLine[] = [
    { label: "Avg sale duration", value: avgSale, color: SALE_COLOR, dash: "5 5" },
    { label: "Sale, last 5 Majors", value: avgSale5, color: SALE5_COLOR, dash: "3 3" },
  ];
  const data: ChartRow[] = chartData;

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#1b1d24] text-white">
      {/* Same mark, same place, as the other CS Market Forum sites. */}
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 flex items-center justify-center rounded-full shadow-inner">
          <img src="/logo.png" alt="CS Market Forum" className="h-12 w-12 object-contain" />
        </div>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl sm:text-4xl font-bold text-center mb-2"
      >
        Major Capsule Tracker
      </motion.h1>
      <p className="text-center mb-6 text-xs text-gray-500 max-w-2xl mx-auto">
        When each Major’s sticker capsule was{" "}
        <span className="text-emerald-400 font-medium">released</span>, when
        its <span className="text-amber-300 font-medium">sale</span> began, and
        when it was <span className="text-red-400 font-medium">removed</span>{" "}
        from the in-game store.
      </p>

      <div className="mx-auto max-w-screen-2xl">
        {/* Search + filters + table in one card */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative w-full md:w-80">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a Major or city…"
                  aria-label="Search a Major or city"
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  aria-label="Filter by year"
                  className="rounded-lg border border-white/10 bg-[#1b1d24] px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#3987e5]"
                >
                  <option value="">All years</option>
                  {years.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                {(query || yearFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setYearFilter("");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 grid-scroll overflow-x-auto">
              <TableSection rows={filtered} onSort={toggleSort} />
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Data is curated from Liquipedia, CSGOSKINS.GG, HLTV and Valve’s
              announcements. Some dates may be inaccurate.
            </p>
          </CardContent>
        </Card>

        <ChartCard
          title="Overview"
          subtitle="Days from introduction and from sale start to removal, per Major."
          lines={[...availLines, ...saleLines]}
          height={360}
        >
          <BarChart data={data} margin={{ top: 50, right: 24, left: 0, bottom: 20 }}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip({ fill: "rgba(255,255,255,0.04)" })}
            {legend}
            <Bar dataKey="availability" name="Intro → Removal" fill={AVAIL_COLOR} radius={[6, 6, 0, 0]} />
            <Bar dataKey="saleDuration" name="Sale → Removal" fill={SALE_COLOR} radius={[6, 6, 0, 0]} />
            {avgLines([...availLines, ...saleLines])}
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Availability over time"
          subtitle="Days each capsule stayed in the store, introduction to removal."
          lines={availLines}
          height={320}
        >
          <LineChart data={data} margin={{ top: 44, right: 24, left: 0, bottom: 20 }}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip({ stroke: "rgba(255,255,255,0.25)" })}
            {legend}
            {avgLines(availLines)}
            <Line
              type="monotone"
              dataKey="availability"
              name="Intro → Removal"
              stroke={AVAIL_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: AVAIL_COLOR }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard
          title="Sale duration over time"
          subtitle="Days from the sale starting to the capsule being removed."
          lines={saleLines}
          height={320}
        >
          <LineChart data={data} margin={{ top: 44, right: 24, left: 0, bottom: 20 }}>
            {grid}
            {xAxis}
            {yAxis}
            {tooltip({ stroke: "rgba(255,255,255,0.25)" })}
            {legend}
            {avgLines(saleLines)}
            <Line
              type="monotone"
              dataKey="saleDuration"
              name="Sale → Removal"
              stroke={SALE_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: SALE_COLOR }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartCard>
      </div>

      <footer className="text-center text-xs text-gray-500 mt-8 pb-4 max-w-2xl mx-auto">
        made with <span className="text-red-500">♥</span> for{" "}
        <a
          href="https://discord.gg/csgomarket"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          CS Market Forum
        </a>{" "}
        by{" "}
        <a
          href="https://steamcommunity.com/profiles/76561198070775836"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          meista
        </a>
      </footer>
      {import.meta.env.PROD && <Analytics />}
    </div>
  );
}
