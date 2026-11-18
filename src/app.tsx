import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, Info } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion";
import { SERIES, MUTED, GRID, AXIS, TOOLTIP_STYLE } from "@/theme";
import {
  CapsuleRow,
  INITIAL_ROWS,
  SHOP_LABEL,
  WEEKDAYS_LONG,
  availabilityDays,
  diffDays,
  fmt,
  statusFor,
  statusRank,
  weekdayStats,
} from "@/data";
import { WeekdaysPanel } from "@/weekdays";
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

// --- Small pieces ------------------------------------------------------------

// Info tip attached to a Major (e.g. a rules change that affects its dates).
const NoteTip: React.FC<{ note: string; url?: string | null }> = ({ note, url }) => {
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

const Logo = ({ row, size }: { row: CapsuleRow; size: number }) =>
  row.logo ? (
    <img
      src={row.logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-full border border-white/10 bg-white/5"
      style={{ width: size, height: size }}
    />
  );

const mean = (vals: number[]) =>
  vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

const isCompleted = (r: CapsuleRow) =>
  !!r.removed && new Date(r.removed + "T00:00:00") < new Date();

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// --- Sorting -----------------------------------------------------------------

type SortKey = keyof Pick<CapsuleRow, "major" | "year" | "introduced" | "saleDate" | "removed">;
type SortState = { key: SortKey; dir: "asc" | "desc" };

// Planned (0) above Active (1) above Removed (2), always; dir only applies
// to the column comparison within a status.
const sortBy = (rows: CapsuleRow[], { key, dir }: SortState) => {
  const toKey = (v: any) => (v == null ? "" : v);
  return [...rows].sort((a, b) => {
    const sa = statusRank(a);
    const sb = statusRank(b);
    if (sa !== sb) return sa - sb;
    const av = toKey(a[key]);
    const bv = toKey(b[key]);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === "asc" ? cmp : -cmp;
  });
};

// --- Tabs --------------------------------------------------------------------

const TABS = [
  { key: "majors", label: "Majors" },
  { key: "durations", label: "Durations" },
  { key: "weekdays", label: "Weekdays" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const tabFromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return (TABS.find((t) => t.key === h)?.key ?? "majors") as Tab;
};

/** The open tab lives in the URL hash, so a link opens the same view. */
function useHashTab(): [Tab, (t: Tab) => void] {
  const [tab, setTab] = useState<Tab>(tabFromHash);
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (t: Tab) => {
    history.replaceState(null, "", t === "majors" ? window.location.pathname : `#${t}`);
    setTab(t);
  };
  return [tab, go];
}

function TabBar({
  tab,
  onTab,
  count,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  count: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="Views"
      className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((t, i) => {
        const active = t.key === tab;
        return (
          <a
            key={t.key}
            role="tab"
            href={t.key === "majors" ? "#" : `#${t.key}`}
            id={`tab-${t.key}`}
            aria-selected={active}
            aria-controls={`panel-${t.key}`}
            tabIndex={active ? 0 : -1}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              onTab(t.key);
            }}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const next = TABS[(i + d + TABS.length) % TABS.length];
              onTab(next.key);
              document.getElementById(`tab-${next.key}`)?.focus();
            }}
            className={`relative flex items-center gap-2 whitespace-nowrap rounded-t-lg px-3 sm:px-4 py-2.5
                        text-sm font-medium transition-colors focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-[#3987e5] ${
                          active ? "text-white" : "text-gray-400 hover:text-gray-200"
                        }`}
          >
            {t.label}
            {t.key === "majors" && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] tabular-nums text-gray-500">
                {count}
              </span>
            )}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#3987e5]"
              />
            )}
          </a>
        );
      })}
    </div>
  );
}

// --- Summary tiles -----------------------------------------------------------

type TileData = { label: string; value: string; sub: string; color?: string };

const Tiles = ({ tiles }: { tiles: TileData[] }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-6">
    {tiles.map((t) => (
      <div
        key={t.label}
        className="p-4 rounded-2xl bg-[#24272f] border border-white/5 shadow-soft"
      >
        <div className="text-sm text-gray-300">{t.label}</div>
        <div
          className="mt-1 text-2xl font-semibold tabular-nums truncate"
          style={t.color ? { color: t.color } : undefined}
        >
          {t.value}
        </div>
        <div className="mt-2 text-[13px] text-gray-400 leading-relaxed">{t.sub}</div>
      </div>
    ))}
  </div>
);

// --- Majors table ------------------------------------------------------------

function MajorsTable({
  rows,
  sort,
  onSort,
}: {
  rows: CapsuleRow[];
  sort: SortState;
  onSort: (k: SortKey) => void;
}) {
  const th = "text-left font-medium text-gray-400 pb-2 px-2 whitespace-nowrap";
  const sortTh = (key: SortKey, label: string) => (
    <th
      className={`${th} cursor-pointer transition-colors hover:text-white`}
      onClick={() => onSort(key)}
      aria-sort={sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
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
              <td className={td}>
                <div className="flex items-start gap-3">
                  <Logo row={r} size={32} />
                  <div>
                    <div className="font-semibold text-white leading-5">{r.major}</div>
                    <div className="text-gray-500 text-[13px] leading-4 mt-0.5">
                      {r.city} · {r.year}
                    </div>
                    {r.note && <NoteTip note={r.note} url={r.noteUrl} />}
                  </div>
                </div>
              </td>

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

              <td className={`${td} tabular-nums text-gray-300`}>
                {avail !== null ? `${plural(avail, "day")}${r.removed ? "" : " (so far)"}` : "—"}
              </td>
              <td className={`${td} tabular-nums text-gray-300`}>
                {r.shop ? (
                  <span className="text-gray-500">n/a</span>
                ) : saleDur !== null ? (
                  `${plural(saleDur, "day")}${r.removed ? "" : " (so far)"}`
                ) : (
                  "—"
                )}
              </td>

              <td className={`${td} whitespace-nowrap text-gray-300`}>{r.winner || "—"}</td>

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

// --- Duration charts ---------------------------------------------------------

type ChartRow = { major: string; availability: number; saleDuration: number | null };
type AvgLine = { label: string; value: number; color: string; dash: string };

const AVAIL_COLOR = SERIES[0];
const SALE_COLOR = SERIES[1];
const AVAIL5_COLOR = SERIES[2];
const SALE5_COLOR = SERIES[3];

// Averages key, top-right of each chart.
const AvgOverlay = ({ lines }: { lines: AvgLine[] }) => (
  <div className="absolute right-2 top-2 z-10 pointer-events-none rounded-lg border border-white/10 bg-[#1b1d24]/90 backdrop-blur px-2.5 py-1.5 text-[12px] leading-5 shadow-soft">
    {lines.map((l) => (
      <div key={l.label} className="flex items-center gap-2 text-gray-300">
        <svg width="16" height="4" aria-hidden="true">
          <line x1="0" y1="2" x2="16" y2="2" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash} />
        </svg>
        <span>{l.label}</span>
        <span className="ml-auto pl-2 tabular-nums font-medium text-white">
          {l.value.toFixed(0)} days
        </span>
      </div>
    ))}
  </div>
);

const chartParts = (cursor: object) => [
  <CartesianGrid key="grid" stroke={GRID} vertical={false} />,
  <XAxis
    key="x"
    dataKey="major"
    tick={{ fontSize: 12, fill: MUTED }}
    tickLine={false}
    axisLine={{ stroke: AXIS }}
    interval={0}
    angle={-20}
    textAnchor="end"
    height={60}
  />,
  <YAxis key="y" tick={{ fontSize: 13, fill: MUTED }} tickLine={false} axisLine={false} />,
  <Tooltip
    key="tip"
    formatter={(v: any, n: string) => [v ?? "—", n]}
    contentStyle={TOOLTIP_STYLE}
    labelStyle={{ color: "#ffffff", fontWeight: 600, marginBottom: 2 }}
    itemStyle={{ padding: 0 }}
    cursor={cursor}
    wrapperStyle={{ zIndex: 50, outline: "none" }}
  />,
  <Legend
    key="legend"
    verticalAlign="top"
    align="left"
    height={32}
    iconType="circle"
    iconSize={8}
    wrapperStyle={{ paddingBottom: 8 }}
    formatter={(v) => <span className="text-[13px] text-gray-300">{v}</span>}
  />,
];

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

function DurationCharts({
  data,
  availLines,
  saleLines,
}: {
  data: ChartRow[];
  availLines: AvgLine[];
  saleLines: AvgLine[];
}) {
  return (
    <>
      <ChartCard
        title="Overview"
        subtitle="Days from introduction and from sale start to removal, per Major."
        lines={[...availLines, ...saleLines]}
        height={360}
      >
        <BarChart data={data} margin={{ top: 50, right: 24, left: 0, bottom: 20 }}>
          {chartParts({ fill: "rgba(255,255,255,0.04)" })}
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
          {chartParts({ stroke: "rgba(255,255,255,0.25)" })}
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
        subtitle="Days from the sale starting to the capsule being removed. Shop Majors had no sale."
        lines={saleLines}
        height={320}
      >
        <LineChart data={data} margin={{ top: 44, right: 24, left: 0, bottom: 20 }}>
          {chartParts({ stroke: "rgba(255,255,255,0.25)" })}
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
    </>
  );
}

// --- Page --------------------------------------------------------------------

export default function CS2CapsuleTracker() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "introduced", dir: "desc" });
  const [yearFilter, setYearFilter] = useState<string>("");
  const [tab, setTab] = useHashTab();

  const years = useMemo(
    () => Array.from(new Set(INITIAL_ROWS.map((r) => r.year))).sort((a, b) => b - a),
    []
  );

  // Every view follows the search and year filter.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = INITIAL_ROWS.filter(
      (r) =>
        (!yearFilter || String(r.year) === yearFilter) &&
        (!q || r.major.toLowerCase().includes(q) || r.city.toLowerCase().includes(q))
    );
    return sortBy(rows, sort);
  }, [query, yearFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));

  const chartData = useMemo<ChartRow[]>(
    () =>
      [...filtered]
        .sort((a, b) => (a.introduced ?? "").localeCompare(b.introduced ?? ""))
        .map((r) => ({
          major: r.major,
          availability: availabilityDays(r) ?? 0,
          // Shop Majors never had a sale: leave a gap rather than a zero bar.
          saleDuration: r.shop ? null : diffDays(r.saleDate, r.removed) ?? 0,
        })),
    [filtered]
  );

  // Averages use completed Majors only. Availability counts every Major; sale
  // figures skip Shop Majors, and "last 5" for sales means the last 5 that had one.
  const avg = useMemo(() => {
    const done = filtered
      .filter((r) => !!r.introduced && isCompleted(r))
      .sort((a, b) => (b.introduced ?? "").localeCompare(a.introduced ?? ""));
    const withSale = done.filter((r) => !r.shop);
    const avail = (rs: CapsuleRow[]) =>
      mean(rs.map(availabilityDays).filter((v): v is number => v !== null));
    const sale = (rs: CapsuleRow[]) =>
      mean(rs.map((r) => diffDays(r.saleDate, r.removed)).filter((v): v is number => v !== null));
    return {
      avail: avail(done),
      avail5: avail(done.slice(0, 5)),
      sale: sale(withSale),
      sale5: sale(withSale.slice(0, 5)),
    };
  }, [filtered]);

  const availLines: AvgLine[] = [
    { label: "Avg availability", value: avg.avail, color: AVAIL_COLOR, dash: "5 5" },
    { label: "Availability, last 5 Majors", value: avg.avail5, color: AVAIL5_COLOR, dash: "3 3" },
  ];
  const saleLines: AvgLine[] = [
    { label: "Avg sale duration", value: avg.sale, color: SALE_COLOR, dash: "5 5" },
    { label: "Sale, last 5 Majors", value: avg.sale5, color: SALE5_COLOR, dash: "3 3" },
  ];

  const tiles = useMemo<TileData[]>(() => {
    const release = weekdayStats(filtered, "introduced");
    const active = filtered.filter((r) => statusRank(r) === 1);
    const now = active[0];
    const nowDays = now ? availabilityDays(now) : null;
    return [
      {
        label: "Average availability",
        value: `${avg.avail.toFixed(0)} days`,
        sub: `Last 5 Majors: ${avg.avail5.toFixed(0)} days`,
        color: AVAIL_COLOR,
      },
      {
        label: "Average sale → removal",
        value: `${avg.sale.toFixed(0)} days`,
        sub: `Last 5 with a sale: ${avg.sale5.toFixed(0)} days`,
        color: SALE_COLOR,
      },
      {
        label: "Usual release day",
        value: release.top.length ? release.top.map((d) => WEEKDAYS_LONG[d]).join(" / ") : "—",
        sub: release.total
          ? `${release.max} of ${release.total} Majors (UTC date)`
          : "No release dates in view",
      },
      {
        label: "In the store now",
        value: now ? now.major : "Nothing",
        sub: now
          ? `Since ${fmt(now.introduced)} · ${plural(nowDays ?? 0, "day")}` +
            (active.length > 1 ? ` · +${active.length - 1} more` : "")
          : "No Major’s stickers are on sale",
      },
    ];
  }, [filtered, avg]);

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
        <span className="text-emerald-400 font-medium">released</span>, when its{" "}
        <span className="text-amber-300 font-medium">sale</span> began, and when it was{" "}
        <span className="text-red-400 font-medium">removed</span> from the in-game store.
      </p>

      <div className="mx-auto max-w-screen-2xl">
        <Tiles tiles={tiles} />

        {/* Tabs and filters share one sticky strip: the filters sit outside every
            panel because they apply to all of them. */}
        <div
          className="sticky top-0 z-30 -mx-4 sm:-mx-6 mb-6 px-4 sm:px-6
                     bg-[#1b1d24]/95 backdrop-blur border-b border-white/5
                     flex flex-col-reverse gap-2 pt-2 md:flex-row md:items-end md:justify-between"
        >
          <TabBar tab={tab} onTab={setTab} count={filtered.length} />
          <div className="flex items-center gap-2 md:pb-2">
            <div className="relative flex-1 md:w-64 md:flex-none">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a Major or city…"
                aria-label="Search a Major or city"
                className="w-full rounded-lg border border-white/10 bg-[#1b1d24] py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#3987e5]"
              />
            </div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              aria-label="Filter by year"
              className="rounded-lg border border-white/10 bg-[#1b1d24] px-3 py-1.5 text-sm text-white focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#3987e5]"
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

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "majors" && (
            <Card className="mb-6">
              <CardContent>
                <div className="grid-scroll overflow-x-auto">
                  <MajorsTable rows={filtered} sort={sort} onSort={toggleSort} />
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Data is curated from Liquipedia, CSGOSKINS.GG, HLTV and Valve’s
                  announcements. Some dates may be inaccurate.
                </p>
              </CardContent>
            </Card>
          )}

          {tab === "durations" && (
            <DurationCharts data={chartData} availLines={availLines} saleLines={saleLines} />
          )}

          {tab === "weekdays" && <WeekdaysPanel rows={filtered} />}
        </div>
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
