import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CalendarDays, Search, Filter, Info } from "lucide-react";
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
    saleDate: "2018-02-08",
    removed: "2018-04-09",
    winner: "🏆 Cloud9",
    logo: "/logos/boston-2018.png",
  },
  {
    id: "london-2018",
    major: "FACEIT London 2018",
    city: "London",
    year: 2018,
    introduced: "2018-09-05",
    saleDate: "2018-10-02",
    removed: "2018-12-03",
    winner: "🏆 Astralis",
    logo: "/logos/london-2018.png",
  },
  {
    id: "katowice-2019",
    major: "IEM Katowice 2019",
    city: "Katowice",
    year: 2019,
    introduced: "2019-02-06",
    saleDate: "2019-03-12",
    removed: "2019-05-06",
    winner: "🏆 Astralis",
    logo: "/logos/katowice-2019.png",
  },
  {
    id: "berlin-2019",
    major: "StarLadder Berlin 2019",
    city: "Berlin",
    year: 2019,
    introduced: "2019-08-14",
    saleDate: "2019-09-05",
    removed: "2019-12-09",
    winner: "🏆 Astralis",
    logo: "/logos/berlin-2019.png",
  },
  // === CS:GO (late) ===
  {
    id: "stockholm-2021",
    major: "PGL Stockholm 2021",
    city: "Stockholm",
    year: 2021,
    introduced: "2021-10-21",
    saleDate: "2021-11-11",
    removed: "2022-05-09",
    winner: "🏆 NAVI",
    logo: "/logos/stockholm-2021.png",
  },
  {
    id: "antwerp-2022",
    major: "PGL Antwerp 2022",
    city: "Antwerp",
    year: 2022,
    introduced: "2022-05-04",
    saleDate: "2022-05-23",
    removed: "2022-08-08",
    winner: "🏆 FaZe Clan",
    logo: "/logos/antwerp-2022.png",
  },
  {
    id: "rio-2022",
    major: "IEM Rio 2022",
    city: "Rio de Janeiro",
    year: 2022,
    introduced: "2022-10-21",
    saleDate: "2022-11-15",
    removed: "2023-02-07",
    winner: "🏆 Outsiders",
    logo: "/logos/rio-2022.png",
  },
  {
    id: "paris-2023",
    major: "BLAST.tv Paris 2023",
    city: "Paris",
    year: 2023,
    introduced: "2023-05-04",
    saleDate: "2023-06-22",
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
    winner: "🏆 Team Spirit",
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
    winner: "🏆 MOUZ",
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
    winner: null,
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

// Renders a right-side, multi-line label for ReferenceLine
const RightMultiLineLabel: React.FC<{
  viewBox?: { x: number; y: number; width: number; height: number };
  lines: string[];
  color?: string;
}> = ({ viewBox, lines, color = "#111827" }) => {
  if (!viewBox) return null as any;
  const x = viewBox.x + viewBox.width + 8; // a bit to the right of the chart area
  const y = viewBox.y;
  return (
    <text x={x} y={y} fill={color} fontSize={12} fontWeight={700}>
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-stone-50 to-stone-100 text-stone-900">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-10">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-stone-800"
        >
          🎯 CS Major Capsule Tracking
        </motion.h1>
        <p className="mt-3 text-stone-600 max-w-3xl text-lg">
          Follow the journey of each Major’s{" "}
          <span className="font-semibold">sticker capsule</span>: when it
          <span className="text-green-700"> released</span>, when the{" "}
          <span className="text-blue-700">sale</span> began, and when it was
          finally
          <span className="text-red-700"> removed</span> from the in‑game store.
        </p>

        <Card className="mt-8 border-stone-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Search className="w-4 h-4 text-stone-500" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="🔍 Search a Major or city"
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

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-stone-500">
                    <th className="py-2 pr-4">Major / City</th>
                    <th
                      className="py-2 pr-4 cursor-pointer"
                      onClick={() => toggleSort("introduced")}
                    >
                      <div className="inline-flex items-center gap-1">
                        Introduced <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-2 pr-4 cursor-pointer"
                      onClick={() => toggleSort("saleDate")}
                    >
                      <div className="inline-flex items-center gap-1">
                        Sale <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-2 pr-4 cursor-pointer"
                      onClick={() => toggleSort("removed")}
                    >
                      <div className="inline-flex items-center gap-1 text-red-600">
                        Removed <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-2 pr-4">
                      Availability (intro → removal)
                    </th>
                    <th className="py-2 pr-4">Duration (sale → removal)</th>
                    <th className="py-2 pr-4">Winner</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const status = statusFor(row);
                    return (
                      <tr
                        key={row.id}
                        className="border-t border-stone-200 hover:bg-stone-50"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {row.logo ? (
                              <img
                                src={row.logo}
                                alt={row.major ?? "logo"}
                                className="w-6 h-6 rounded-sm object-contain ring-1 ring-stone-200 bg-white"
                                loading="lazy"
                                onError={(e) => {
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).style.visibility = "hidden";
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-sm bg-stone-200" />
                            )}
                            <div>
                              <div className="font-semibold text-stone-800">
                                {row.major}
                              </div>
                              <div className="text-stone-500">
                                {row.city} · {row.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{fmt(row.introduced)}</td>
                        <td className="py-3 pr-4">{fmt(row.saleDate)}</td>
                        <td className="py-3 pr-4">
                          {row.removed ? (
                            <span className="text-red-700 font-medium">
                              {fmt(row.removed)}
                            </span>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {availabilityDays(row)
                            ? `${availabilityDays(row)} days${
                                row.removed ? "" : " (so far)"
                              }`
                            : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {diffDays(row.saleDate, row.removed)
                            ? `${diffDays(row.saleDate, row.removed)} days`
                            : "—"}
                        </td>
                        <td className="py-3 pr-4">{row.winner ?? "—"}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${status.tone}`}
                          >
                            <CalendarDays className="w-3 h-3" /> {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-stone-500 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <p>
                Data is curated from developer posts and community reporting.
                Data may be inaccurate. Please contact @.meista on Discord to
                report any inaccuracies.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            📊 Duration Overview
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={chartData}
              margin={{ top: 50, right: 200, left: 0, bottom: 20 }} // more space on the right for labels
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="major"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60} // more room for long names
              />
              <YAxis />
              <Tooltip />
              <Legend
                verticalAlign="top"
                align="left"
                height={32} // reserves space so it won't overlap
                wrapperStyle={{ paddingBottom: 8 }}
              />

              {/* Availability first, then Sale Duration */}
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

              {/* Multi-line, high-contrast average labels on the right */}
              <ReferenceLine
                ifOverflow="extendDomain"
                y={avgAvail}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={
                  <RightMultiLineLabel
                    lines={["Average", `avail: ${avgAvail.toFixed(0)}d`]}
                    color="#111827"
                  />
                }
              />
              <ReferenceLine
                ifOverflow="extendDomain"
                y={avgSale}
                stroke="#6366f1"
                strokeDasharray="5 5"
                label={
                  <RightMultiLineLabel
                    lines={["Average", `sale: ${avgSale.toFixed(0)}d`]}
                    color="#111827"
                  />
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
