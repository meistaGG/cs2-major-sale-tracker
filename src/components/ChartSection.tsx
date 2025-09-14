import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ReferenceLine } from "recharts";

type Point = { major: string; availability: number; saleDuration: number };

export default function ChartSection({
  chartData,
  avgAvail,
  avgSale,
  avgAvail5,
  avgSale5,
}: {
  chartData: Point[];
  avgAvail: number;
  avgSale: number;
  avgAvail5: number;
  avgSale5: number;
}) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-stone-800 mb-4">📊 Duration Overview</h2>

      <div className="relative">
        {/* Overlay with the 4 averages (never clipped, never overlaps) */}
        <div className="absolute right-2 top-2 z-10 text-xs leading-5 bg-white/85 backdrop-blur rounded-md px-2 py-1 shadow-sm">
          <div style={{ color: "#10b981", fontWeight: 700 }}>Average</div>
          <div style={{ color: "#10b981" }}>avail: {avgAvail.toFixed(0)} days</div>

          <div style={{ color: "#6366f1", fontWeight: 700, marginTop: 4 }}>Average</div>
          <div style={{ color: "#6366f1" }}>sale: {avgSale.toFixed(0)} days</div>

          <div style={{ color: "#0ea5e9", fontWeight: 700, marginTop: 4 }}>Avg (last 5 Majors)</div>
          <div style={{ color: "#0ea5e9" }}>avail: {avgAvail5.toFixed(0)} days</div>

          <div style={{ color: "#7c3aed", fontWeight: 700, marginTop: 4 }}>Avg (last 5 Majors)</div>
          <div style={{ color: "#7c3aed" }}>sale: {avgSale5.toFixed(0)} days</div>
        </div>

        <div className="overflow-x-auto">
          {/* On mobile: enforce min width for swipe; on large screens: expand fully */}
          <div className="w-full min-w-[900px] lg:min-w-0">
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={chartData} margin={{ top: 50, right: 24, left: 0, bottom: 20 }}>
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
                <Tooltip formatter={(v: any, n: string) => [v, n]} labelFormatter={(l) => `${l}`} />
                <Legend verticalAlign="top" align="left" height={32} wrapperStyle={{ paddingBottom: 8 }} />

                {/* Bars */}
                <Bar dataKey="availability" name="Intro → Removal" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="saleDuration" name="Sale → Removal" fill="#6366f1" radius={[6, 6, 0, 0]} />

                {/* Reference lines WITHOUT labels (overlay handles the text) */}
                <ReferenceLine ifOverflow="extendDomain" y={avgAvail} stroke="#10b981" strokeDasharray="5 5" />
                <ReferenceLine ifOverflow="extendDomain" y={avgSale} stroke="#6366f1" strokeDasharray="5 5" />
                <ReferenceLine ifOverflow="extendDomain" y={avgAvail5} stroke="#0ea5e9" strokeDasharray="3 3" />
                <ReferenceLine ifOverflow="extendDomain" y={avgSale5} stroke="#7c3aed" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}