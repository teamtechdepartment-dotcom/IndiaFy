import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function LineChartBox({ title, data, xKey, yKey }) {
  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-6">
      <h2 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">{title}</h2>

      <div className="h-[220px] sm:h-[260px] lg:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#86EFAC" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#22C55E"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#lineGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
