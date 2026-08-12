export default function MapLegend() {
  return (
    <div className="bg-[#121722] border border-[#1e2738] rounded-2xl p-4 sm:p-5 shadow-md">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Map Safety Legend
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <LegendItem
          color="#ef4444"
          label="DANGER (RED)"
          desc="Active Fire — DO NOT ENTER"
        />
        <LegendItem
          color="#f97316"
          label="CAUTION (ORANGE)"
          desc="Fire spread risk — AVOID AREA"
        />
        <LegendItem
          color="#22c55e"
          label="SAFE ZONE (GREEN)"
          desc="Safe monitored factory areas"
        />
        <LegendItem
          color="#22c55e"
          label="GREEN ROUTE"
          desc="Vertical & Central pathways"
          dashed
        />
        <LegendItem
          color="#22c55e"
          label="EMERGENCY EXIT"
          desc="West, East & South Assembly"
          icon="🚪"
        />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  desc,
  dashed = false,
  icon,
}: {
  color: string;
  label: string;
  desc: string;
  dashed?: boolean;
  icon?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">
        {icon ? (
          <span className="text-sm">{icon}</span>
        ) : dashed ? (
          <svg width="22" height="14" viewBox="0 0 22 14">
            <line
              x1="0"
              y1="7"
              x2="22"
              y2="7"
              stroke={color}
              strokeWidth="3.5"
              strokeDasharray="5 3"
            />
          </svg>
        ) : (
          <div
            className="w-3.5 h-3.5 rounded-sm shadow-sm"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
