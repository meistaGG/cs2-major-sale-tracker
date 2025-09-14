import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CalendarDays, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
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
};

const INITIAL_ROWS: CapsuleRow[] = [
  // === Older CS:GO Majors ===
  {
    id: "katowice-2014",
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
    major: "PGL Copenhagen 2024",
    city: "Copenhagen",
    year: 2024,
    introduced: "2024-03-21",
    saleDate: "2024-04-26",
    removed: "2024-08-20",
    winner: "🏆 Natus Vincere",
  },
  {
    id: "shanghai-2024",
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
    major: "PGL Austin 2025",
    city: "Austin",
    year: 2025,
    introduced: "2025-05-22",
    saleDate: "2025-08-14",
    removed: null,
    winner: "🏆 Team Vitality",
  },
  {
    id: "budapest-2025",
    major: "StarLadder Budapest 2025",
    city: "Budapest",
    year: 2025,
    introduced: null,
    saleDate: null,
    removed: null,
    winner: null,
  },
  {
    id: "cologne-2026",
    major: "IEM Cologne 2026",
    city: "Cologne",
    year: 2026,
    introduced: null,
    saleDate: null,
    removed: null,
    winner: null,
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
  if (!a || !b) return null;
  const ms = Math.abs(
    new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()
  );
  return Math.round(ms / 86400000);
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
    return { label: "Removed", tone: "bg-red-100 text-red-700" };
  if (intro && today >= intro && (!removed || today <= removed))
    return {
      label: "Active",
      tone: "bg-green-100 text-green-700 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse",
    };
  return { label: "Planned", tone: "bg-blue-100 text-blue-700" };
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
        saleDuration: diffDays(r.saleDate, r.removed) ?? 0,
      }));
  }, [filtered]);

  const isNum = (v: number | null): v is number => v !== null;

  const avgSale = useMemo(() => {
    const vals = filtered
      .map((r) => diffDays(r.saleDate, r.removed))
      .filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [filtered]);

  const avgAvail = useMemo(() => {
    const vals = filtered
      .map((r) => availabilityDays(r))
      .filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [filtered]);

  // --- Averages for the last 5 majors (by Introduced date, most recent first) ---
  const { avgAvail5, avgSale5 } = useMemo(() => {
    const parse = (d: string | null) =>
      d ? new Date(d + "T00:00:00").getTime() : 0;
    const recent = filtered
      .filter((r) => !!r.introduced)
      .sort((a, b) => parse(b.introduced) - parse(a.introduced))
      .slice(0, 5);

    const availVals = recent
      .map((r) => availabilityDays(r))
      .filter((v): v is number => v !== null);
    const saleVals = recent
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
    return (
      <table className="min-w-full text-sm">
        <thead className="bg-stone-50 text-stone-600">
          <tr>
            <th className="text-left py-3 pl-4 pr-4">Major / City</th>
            <th
              className="text-left py-3 pl-4 pr-4 cursor-pointer"
              onClick={() => onSort("introduced")}
            >
              <div className="inline-flex items-center gap-1">
                Introduced <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="text-left py-3 pl-4 pr-4 cursor-pointer"
              onClick={() => onSort("saleDate")}
            >
              <div className="inline-flex items-center gap-1">
                Sale <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="text-left py-3 pl-4 pr-4 cursor-pointer"
              onClick={() => onSort("removed")}
            >
              <div className="inline-flex items-center gap-1">
                Removed <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="text-left py-3 pl-4 pr-4">
              Availability (intro → removal)
            </th>
            <th className="text-left py-3 pl-4 pr-4">
              Sale Duration (sale → removal)
            </th>
            <th className="text-left py-3 pl-4 pr-4">Champion</th>
            <th className="text-left py-3 pl-4 pr-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r) => {
            const avail = availabilityDays(r);
            const saleDur = diffDays(r.saleDate, r.removed);
            const status = statusFor(r);
            return (
              <tr key={r.id} className="align-top">
                {/* Tournament cell with logo + name + city/year */}
                <td className="py-3 pl-4 pr-4">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="font-semibold text-stone-800 leading-5">
                        {r.major}
                      </div>
                      <div className="text-stone-500 text-xs leading-4">
                        {r.city} · {r.year}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Dates */}
                <td className="py-3 pl-4 pr-4 whitespace-nowrap">
                  {fmt(r.introduced)}
                </td>
                <td className="py-3 pl-4 pr-4 whitespace-nowrap">
                  {fmt(r.saleDate)}
                </td>
                <td className="py-3 pl-4 pr-4 whitespace-nowrap text-red-600 font-semibold">
                  {fmt(r.removed)}
                </td>

                {/* Durations */}
                <td className="py-3 pl-4 pr-4 font-medium text-stone-800">
                  {avail !== null
                    ? `${avail} days${r.removed ? "" : " (so far)"}`
                    : "—"}
                </td>
                <td className="py-3 pl-4 pr-4 font-medium text-stone-800">
                  {saleDur !== null ? `${saleDur} days` : "—"}
                </td>

                {/* Winner */}
                <td className="py-3 pl-4 pr-4">{r.winner || "—"}</td>

                {/* Status pill */}
                <td className="py-3 pl-4 pr-4">
                  <span
                    className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${status.tone}`}
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

  // --- Chart component (after table) -----------------------------------------
  function ChartSection({
    chartData,
    avgAvail,
    avgSale,
    avgAvail5,
    avgSale5,
  }: {
    chartData: Array<{
      major: string;
      availability: number;
      saleDuration: number;
    }>;
    avgAvail: number;
    avgSale: number;
    avgAvail5: number;
    avgSale5: number;
  }) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">
          📊 Duration Overview
        </h2>

        <div className="relative">
          {/* Overlay with the 4 averages (never clipped, never overlaps) */}
          <div className="absolute right-2 top-2 z-10 text-xs leading-5 bg-white/85 backdrop-blur rounded-md px-2 py-1 shadow-sm">
            <div style={{ color: "#10b981", fontWeight: 700 }}>Average</div>
            <div style={{ color: "#10b981" }}>
              avail: {avgAvail.toFixed(0)} days
            </div>

            <div style={{ color: "#6366f1", fontWeight: 700, marginTop: 4 }}>
              Average
            </div>
            <div style={{ color: "#6366f1" }}>
              sale: {avgSale.toFixed(0)} days
            </div>

            <div style={{ color: "#0ea5e9", fontWeight: 700, marginTop: 4 }}>
              Avg (last 5 Majors)
            </div>
            <div style={{ color: "#0ea5e9" }}>
              avail: {avgAvail5.toFixed(0)} days
            </div>

            <div style={{ color: "#7c3aed", fontWeight: 700, marginTop: 4 }}>
              Avg (last 5 Majors)
            </div>
            <div style={{ color: "#7c3aed" }}>
              sale: {avgSale5.toFixed(0)} days
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="w-full min-w-[900px] lg:min-w-0">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={chartData}
                  margin={{ top: 50, right: 24, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="major"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(v: any, n: string) => [v ?? "—", n]}
                    labelFormatter={(l) => `${l}`}
                  />
                  <Legend
                    verticalAlign="top"
                    align="left"
                    height={32}
                    wrapperStyle={{ paddingBottom: 8 }}
                  />
                  <Bar
                    dataKey="availability"
                    name="Intro → Removal"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="saleDuration"
                    name="Sale → Removal"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                  {/* Lines only; text lives in overlay to avoid clipping/overlap */}
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    y={avgAvail}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                  />
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    y={avgSale}
                    stroke="#6366f1"
                    strokeDasharray="5 5"
                  />
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    y={avgAvail5}
                    stroke="#0ea5e9"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    y={avgSale5}
                    stroke="#7c3aed"
                    strokeDasharray="3 3"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Page -------------------------------------------------------------------
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 text-stone-900">
      <div className="mx-auto max-w-screen-2xl">
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-stone-800"
        >
          🎯 CS Major Capsule Tracking
        </motion.h1>
        <p className="mt-3 text-stone-600 max-w-3xl text-lg">
          Follow the journey of each Major’s{" "}
          <span className="font-semibold">sticker capsule</span>: when it{" "}
          <span className="text-green-600 font-medium">released</span>, when the{" "}
          <span className="text-indigo-600 font-medium">sale</span> began, and{" "}
          when it was finally{" "}
          <span className="text-red-600 font-medium">removed</span> from the
          in-game store.
        </p>

        {/* Search + filters + TABLE together in one card (like your screenshot) */}
        <Card className="mt-6 border-stone-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Search className="w-4 h-4 text-stone-500" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a Major or city"
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-500" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="border rounded-xl px-3 py-2 bg-white shadow-sm"
                >
                  <option value="">All years</option>
                  {years.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setYearFilter("");
                  }}
                  className="rounded-2xl"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-stone-200 my-4" />

            {/* Table inside the same card */}
            <div className="overflow-x-auto">
              <TableSection rows={filtered} onSort={toggleSort} />
            </div>

            <p className="mt-3 text-xs text-stone-500">
              ⓘ Data is curated from Liquipedia, CSGOSKINS.GG and HLTV. Some
              dates may be inaccurate.
            </p>
          </CardContent>
        </Card>

        {/* Chart section (after table) */}
        <ChartSection
          chartData={chartData}
          avgAvail={avgAvail}
          avgSale={avgSale}
          avgAvail5={avgAvail5}
          avgSale5={avgSale5}
        />
      </div>
      <footer className="mt-12 py-6 text-center text-sm text-stone-500">
        made with <span className="text-red-500">♥</span> for{" "}
        <a
          href="https://discord.gg/csgomarket"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          CS Market Forum
        </a>{" "}
        by{" "}
        <a
          href="https://steamcommunity.com/profiles/76561198070775836"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          meista
        </a>
      </footer>
    </div>
  );
}
