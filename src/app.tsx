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
  winner?: string | null; // e.g. "🏆 Vitality"
  logo?: string | null; // optional tournament logo url (24px-ish)
};

const INITIAL_ROWS: CapsuleRow[] = [
  // === Older CS:GO Majors ===
  {
    id: "boston-2018",
    major: "ELEAGUE Boston 2018",
    city: "Boston",
    year: 2018,
    introduced: "2018-01-10",
    saleDate: "2018-01-26",
    removed: "2018-01-30",
    winner: "🏆 Cloud9",
    logo: "/logos/boston-2018.png",
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
    logo: "/logos/london-2018.png",
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
    logo: "/logos/katowice-2019.png",
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
    logo: "/logos/berlin-2019.png",
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
    logo: "/logos/RMR-2020.png",
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
    winner: "🏆 NAVI",
    logo: "/logos/stockholm-2021.png",
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
    logo: "/logos/antwerp-2022.png",
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
    logo: "/logos/rio-2022.png",
  },
  {
    id: "paris-2023",
    major: "BLAST.tv Paris 2023",
    city: "Paris",
    year: 2023,
    introduced: "2023-05-04",
    saleDate: "2023-06-23",
    removed: "2023-10-07",
    winner: "🏆 Vitality",
    logo: "/logos/paris-2023.png",
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
    winner: "🏆 NAVI",
    logo: "/logos/copenhagen-2024.png",
  },
  {
    id: "shanghai-2024",
    major: "Perfect World Shanghai 2024",
    city: "Shanghai",
    year: 2024,
    introduced: "2024-11-27",
    saleDate: "2025-01-14",
    removed: "2025-04-21",
    winner: "🏆 Spirit",
    logo: "/logos/shanghai-2024.png",
  },
  {
    id: "austin-2025",
    major: "PGL Austin 2025",
    city: "Austin",
    year: 2025,
    introduced: "2025-05-22",
    saleDate: "2025-08-14",
    removed: null,
    winner: "🏆 Vitality",
    logo: "/logos/austin-2025.png",
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
    return { label: "Removed", tone: "bg-red-100 text-red-800" };
  if (intro && today >= intro && (!removed || today <= removed))
    return { label: "Active", tone: "bg-green-100 text-green-800" };
  return { label: "Planned", tone: "bg-blue-100 text-blue-900" };
};

// (Optional) label component retained if you want to switch back to inline labels later
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

const sortBy = (rows: CapsuleRow[], { key, dir }: SortState) => {
  const r = [...rows].sort((a, b) => {
    const av = (a[key] ?? "") as string | number;
    const bv = (b[key] ?? "") as string | number;
    if (av === bv) return 0;
    return av > bv ? 1 : -1;
  });
  return dir === "asc" ? r : r.reverse();
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
  const chartData = useMemo(
    () =>
      INITIAL_ROWS.map((r) => ({
        major: r.major,
        availability: availabilityDays(r) ?? 0,
        saleDuration: diffDays(r.saleDate, r.removed) ?? 0,
      })),
    []
  );

  const avgSale = useMemo(
    () =>
      chartData.length
        ? chartData.reduce((acc, cur) => acc + cur.saleDuration, 0) /
          chartData.length
        : 0,
    [chartData]
  );
  const avgAvail = useMemo(
    () =>
      chartData.length
        ? chartData.reduce((acc, cur) => acc + cur.availability, 0) /
          chartData.length
        : 0,
    [chartData]
  );

  // --- Averages for the last 5 majors (by Introduced date, most recent first) ---
  const last5Averages = useMemo(() => {
    const parse = (d: string | null) =>
      d ? new Date(d + "T00:00:00").getTime() : 0;
    const recent = INITIAL_ROWS.filter((r) => !!r.introduced)
      .sort((a, b) => parse(b.introduced) - parse(a.introduced))
      .slice(0, 5);
    const points = recent.map((r) => ({
      availability: availabilityDays(r) ?? 0,
      saleDuration: diffDays(r.saleDate, r.removed) ?? 0,
    }));
    const denom = points.length || 1;
    const avgAvail5 = points.reduce((s, p) => s + p.availability, 0) / denom;
    const avgSale5 = points.reduce((s, p) => s + p.saleDuration, 0) / denom;
    return { avgAvail5, avgSale5 };
  }, []);
  const { avgAvail5, avgSale5 } = last5Averages;

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

  // --- Local Chart component --------------------------------------------------
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
                    formatter={(v: any, n: string) => [v, n]}
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

  // --- Table component --------------------------------------------------------
  function TableSection({
    rows,
    onSort,
  }: {
    rows: CapsuleRow[];
    onSort: (k: SortKey) => void;
  }) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">
          🗂️ Capsule Timeline
        </h2>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="text-left py-3 pl-4 pr-4">Tournament</th>
                    <th
                      className="py-3 pr-4 cursor-pointer"
                      onClick={() => onSort("introduced")}
                    >
                      <div className="inline-flex items-center gap-1">
                        Introduced <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 pr-4 cursor-pointer"
                      onClick={() => onSort("saleDate")}
                    >
                      <div className="inline-flex items-center gap-1">
                        Sale <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 pr-4 cursor-pointer"
                      onClick={() => onSort("removed")}
                    >
                      <div className="inline-flex items-center gap-1">
                        Removed <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 pr-4">Avail. (days)</th>
                    <th className="py-3 pr-4">Sale → Removal (days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((r) => {
                    const avail = availabilityDays(r);
                    const saleDur = diffDays(r.saleDate, r.removed);
                    return (
                      <tr key={r.id} className="align-top">
                        {/* Tournament cell with logo + name + winner */}
                        <td className="py-3 pl-4 pr-4">
                          <div className="flex items-start gap-3">
                            {r.logo ? (
                              <img
                                src={r.logo}
                                alt={r.major}
                                className="w-6 h-6 rounded-sm object-contain mt-[2px]"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-sm bg-stone-200 mt-[2px]" />
                            )}
                            <div>
                              <div className="font-semibold text-stone-800 leading-5">
                                {r.major}
                              </div>
                              <div className="text-stone-500 text-xs leading-4 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" /> {r.city} ·{" "}
                                {r.year}
                                {r.winner ? (
                                  <span className="ml-2">{r.winner}</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {fmt(r.introduced)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {fmt(r.saleDate)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-red-600 font-semibold">
                          {fmt(r.removed)}
                        </td>

                        {/* Durations */}
                        <td className="py-3 pr-4 font-medium text-stone-800">
                          {avail ?? "—"}
                        </td>
                        <td className="py-3 pr-4 font-medium text-stone-800">
                          {saleDur ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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
          🎯 CS Major Capsule Chronicle
        </motion.h1>
        <p className="mt-3 text-stone-600 max-w-3xl text-lg">
          Follow each Major’s{" "}
          <span className="font-semibold">sticker capsule</span>: when it
          arrived, when the sale began, and when it was removed.
        </p>

        {/* Simple search/filter header preserved */}
        <Card className="mt-6 border-stone-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
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
          </CardContent>
        </Card>

        {/* Chart section */}
        <ChartSection
          chartData={chartData}
          avgAvail={avgAvail}
          avgSale={avgSale}
          avgAvail5={avgAvail5}
          avgSale5={avgSale5}
        />

        {/* Table section */}
        <TableSection rows={filtered} onSort={toggleSort} />
      </div>
    </div>
  );
}
