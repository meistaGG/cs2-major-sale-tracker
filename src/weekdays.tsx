import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CapsuleRow,
  EVENTS,
  EventKey,
  WEEKDAYS,
  WEEKDAYS_LONG,
  fmt,
  weekdayIndex,
  weekdayStats,
} from "@/data";
import { SEQ, seqInk } from "@/theme";

type Selected = { event: EventKey; day: number } | null;

/** Lightest step a non-zero count may use, so a single Major is still visible. */
const FIRST_STEP = 2;

const stepFor = (count: number, max: number) =>
  max ? FIRST_STEP + Math.round((count / max) * (SEQ.length - 1 - FIRST_STEP)) : 0;

const dayList = (days: number[]) => days.map((d) => WEEKDAYS_LONG[d]).join(" / ");

/** The weekday tab: a heatmap of events per weekday, and the per-Major table it summarises. */
export function WeekdaysPanel({ rows }: { rows: CapsuleRow[] }) {
  const [pick, setPick] = useState<Selected>(null);

  const stats = useMemo(
    () => EVENTS.map((e) => ({ ...e, ...weekdayStats(rows, e.key) })),
    [rows]
  );

  // Oldest first, so the table reads as a timeline next to the heatmap.
  const ordered = useMemo(
    () =>
      [...rows].sort((a, b) =>
        (a.introduced ?? "9999").localeCompare(b.introduced ?? "9999")
      ),
    [rows]
  );
  const shown = pick
    ? ordered.filter((r) => weekdayIndex(r[pick.event]) === pick.day)
    : ordered;

  const toggle = (event: EventKey, day: number) =>
    setPick((p) => (p && p.event === event && p.day === day ? null : { event, day }));

  return (
    <>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-lg font-semibold">Day of the week</h2>
          <p className="mt-1 mb-5 text-sm text-gray-400">
            How many Majors had each event on each weekday. Darker means more.
            Select a cell to list those Majors below.
          </p>

          <div className="grid-scroll overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1.5 text-xs">
              <thead>
                <tr>
                  <th className="w-28" />
                  {WEEKDAYS.map((d) => (
                    <th key={d} className="pb-1 text-center font-medium text-gray-400">
                      {d}
                    </th>
                  ))}
                  <th className="pb-1 pl-3 text-left font-medium text-gray-400">
                    Most common
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.key}>
                    <th scope="row" className="pr-2 text-left align-middle font-medium">
                      <div className="text-white">{s.label}</div>
                      <div className="text-[12px] font-normal text-gray-500">
                        {s.total} Major{s.total === 1 ? "" : "s"}
                      </div>
                    </th>
                    {s.counts.map((c, day) => {
                      const step = stepFor(c, s.max);
                      const active = pick?.event === s.key && pick.day === day;
                      const names = s.majors[day].map((r) => r.major).join("\n");
                      return (
                        <td key={day} className="p-0">
                          <button
                            type="button"
                            disabled={!c}
                            onClick={() => toggle(s.key, day)}
                            aria-pressed={active}
                            aria-label={`${s.label} on ${WEEKDAYS_LONG[day]}: ${c} of ${s.total}`}
                            title={c ? `${s.label} on ${WEEKDAYS_LONG[day]}:\n${names}` : undefined}
                            className={`flex h-14 w-full flex-col items-center justify-center rounded-lg tabular-nums transition
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                          c
                                            ? "cursor-pointer hover:brightness-110"
                                            : "cursor-default border border-white/5 bg-white/[0.02] text-gray-600"
                                        } ${active ? "ring-2 ring-white" : ""}`}
                            style={c ? { background: SEQ[step], color: seqInk(step) } : undefined}
                          >
                            <span className="text-base font-semibold leading-5">{c}</span>
                            {c > 0 && (
                              <span className="text-[11px] leading-4 opacity-75">
                                {Math.round((c / s.total) * 100)}%
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="pl-3 align-middle whitespace-nowrap">
                      {s.top.length ? (
                        <>
                          <div className="font-medium text-white">{dayList(s.top)}</div>
                          <div className="text-[12px] text-gray-500">
                            {s.max} of {s.total}
                            {s.top.length > 1 ? " each" : ""}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Days are the recorded calendar date, in UTC where Valve’s post time is
            known. Valve usually ships in the US afternoon or evening, so an update
            that lands on Thursday in Seattle can already be Friday in UTC and Europe.
            Shop Majors (Cologne 2026 on) have no sale.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Weekday by Major</h2>
            {pick && (
              <button
                type="button"
                onClick={() => setPick(null)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3987e5]"
              >
                Showing {EVENTS.find((e) => e.key === pick.event)!.label.toLowerCase()} on{" "}
                {WEEKDAYS_LONG[pick.day]} · Clear
              </button>
            )}
          </div>
          <p className="mt-1 mb-4 text-sm text-gray-400">
            The weekday of each Major’s release, sale and removal, oldest first.
          </p>

          <div className="grid-scroll overflow-x-auto">
            <table className="row-hover min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th className="pb-2 px-2 text-left font-medium text-gray-400 whitespace-nowrap">
                    Major
                  </th>
                  {EVENTS.map((e) => (
                    <th
                      key={e.key}
                      className="pb-2 px-2 text-left font-medium text-gray-400 whitespace-nowrap"
                    >
                      {e.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr>td]:border-t [&>tr>td]:border-white/5">
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-3">
                        {r.logo ? (
                          <img
                            src={r.logo}
                            alt=""
                            width={24}
                            height={24}
                            loading="lazy"
                            className="h-6 w-6 shrink-0 object-contain"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="h-6 w-6 shrink-0 rounded-full border border-white/10 bg-white/5"
                          />
                        )}
                        <span className="font-semibold text-white whitespace-nowrap">
                          {r.major}
                        </span>
                      </div>
                    </td>
                    {EVENTS.map((e) => {
                      const iso = r[e.key];
                      const d = weekdayIndex(iso);
                      const hit = pick?.event === e.key;
                      return (
                        <td key={e.key} className="px-2 py-2 whitespace-nowrap">
                          {d !== null ? (
                            <span className="inline-flex items-baseline gap-2">
                              <span
                                className={`inline-block w-11 rounded px-1.5 py-0.5 text-center font-medium ${
                                  hit ? "bg-[#3987e5] text-white" : "bg-white/5 text-gray-200"
                                }`}
                              >
                                {WEEKDAYS[d]}
                              </span>
                              <span className="tabular-nums text-gray-500">{fmt(iso)}</span>
                            </span>
                          ) : e.key === "saleDate" && r.shop ? (
                            <span className="text-gray-500">No sale</span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
