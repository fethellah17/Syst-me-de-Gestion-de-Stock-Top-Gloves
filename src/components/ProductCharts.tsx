import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SeriesPoint } from "@/lib/product-series";

interface ProductChartsProps {
  points: SeriesPoint[];
  granularity: "day" | "week";
  unite: string;
  seuil: number;
}

export function ProductCharts({ points, granularity, unite, seuil }: ProductChartsProps) {
  const periodLabel = granularity === "day" ? "Par jour" : "Par semaine";

  // Shared chart config
  const tickFormatter = (value: number) => value.toLocaleString("fr-FR");
  const valueFormatter = (value: number) => `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${unite}`;

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = points.find((p) => p.label === label);
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "4px", color: "#111827" }}>
            {point?.fullLabel || label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} style={{ color: entry.color, marginTop: "2px" }}>
              {entry.name}: {valueFormatter(entry.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const intervalConfig = points.length > 14 ? "preserveStartEnd" : undefined;

  if (points.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1 - Flux */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
          <div className="text-base font-semibold text-gray-900">Flux Entrées / Sorties</div>
          <div className="text-xs text-gray-500 mt-1">{periodLabel} · {unite}</div>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Aucune donnée sur la période</p>
          </div>
        </div>

        {/* Card 2 - Stock */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
          <div className="text-base font-semibold text-gray-900">Évolution du stock</div>
          <div className="text-xs text-gray-500 mt-1">Reconstitué à partir du stock actuel et des mouvements validés</div>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Aucune donnée sur la période</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Card 1 - Flux Entrées / Sorties */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
        <div className="text-base font-semibold text-gray-900">Flux Entrées / Sorties</div>
        <div className="text-xs text-gray-500 mt-1">{periodLabel} · {unite}</div>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                interval={intervalConfig}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={48}
                tickFormatter={tickFormatter}
              />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="entrees"
                name="Entrées"
                stroke="hsl(210 70% 35%)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sorties"
                name="Sorties"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2 - Évolution du stock */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
        <div className="text-base font-semibold text-gray-900">Évolution du stock</div>
        <div className="text-xs text-gray-500 mt-1">Reconstitué à partir du stock actuel et des mouvements validés</div>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                interval={intervalConfig}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                width={48}
                domain={[0, "auto"]}
                tickFormatter={tickFormatter}
              />
              <Tooltip content={customTooltip} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <ReferenceLine
                y={seuil}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                label={{
                  value: "Seuil",
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: "#6b7280",
                }}
              />
              <Line
                type="monotone"
                dataKey="stock"
                name="Stock"
                stroke="hsl(210 70% 35%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
