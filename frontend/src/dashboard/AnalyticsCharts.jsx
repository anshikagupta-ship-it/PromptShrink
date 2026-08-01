import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const data = [
  { run: 1, compression: 62 },
  { run: 2, compression: 68 },
  { run: 3, compression: 71 },
  { run: 4, compression: 74 },
  { run: 5, compression: 78 },
  { run: 6, compression: 82 },
];

export default function AnalyticsCharts() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">

      <div className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

        <h2 className="text-3xl font-bold text-white mb-8">
          Compression Analytics
        </h2>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#334155" />

              <XAxis dataKey="run" stroke="#94A3B8" />

              <YAxis stroke="#94A3B8" />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="compression"
                stroke="#6366F1"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </section>
  );
}