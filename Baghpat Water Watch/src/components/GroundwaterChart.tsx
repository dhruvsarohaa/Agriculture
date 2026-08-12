import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./EmptyState";

export interface SeriesPoint {
  date: string;
  [key: string]: string | number | null;
}

const LINE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function GroundwaterChart({
  data,
  seriesKeys,
  forecastPoint,
}: {
  data: SeriesPoint[];
  seriesKeys: { key: string; label: string }[];
  forecastPoint?: { date: string; value: number } | null;
}) {
  if (data.length === 0 || seriesKeys.length === 0) {
    return (
      <EmptyState
        title="Insufficient data"
        description="No groundwater observations match the current filters. Adjust the block, station, season or date range."
      />
    );
  }

  const chartData = forecastPoint
    ? [...data, { date: forecastPoint.date, forecast: forecastPoint.value } as SeriesPoint]
    : data;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
          />
          <YAxis
            reversed
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            stroke="var(--border)"
            width={54}
            label={{
              value: "m below ground level",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "var(--muted-foreground)" },
            }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(l) => formatDate(String(l))}
            formatter={(value, name) => [
              value === null ? "Insufficient data" : `${value} m bgl`,
              String(name),
            ]}
          />
          {forecastPoint ? (
            <ReferenceLine
              x={data.at(-1)?.date ?? ""}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: "forecast →",
                fontSize: 10,
                fill: "var(--muted-foreground)",
                position: "insideTopRight",
              }}
            />
          ) : null}
          {seriesKeys.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
          {forecastPoint ? (
            <Line
              type="monotone"
              dataKey="forecast"
              name="Demo forecast"
              stroke="var(--critical)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 4 }}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
