// Tiny dependency-free bar charts using divs. Sufficient for an
// enterprise-style dashboard without pulling a heavyweight chart lib.

export function StatusBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const colors: Record<string, string> = {
    Compliant: "bg-emerald-500",
    "Partially Compliant": "bg-amber-500",
    "Not Compliant": "bg-red-500",
    "Under Review": "bg-brand-500",
    Pending: "bg-slate-400",
  };
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-40 text-xs text-slate-600">{d.label}</div>
          <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
            <div
              className={`h-full ${colors[d.label] ?? "bg-slate-500"}`}
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <div className="w-8 text-right text-xs text-slate-700 tabular-nums">
            {d.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OwnerBarChart({
  data,
}: {
  data: { owner: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0)
    return (
      <p className="text-sm text-slate-500">
        Every requirement has linked evidence. 🎉
      </p>
    );
  return (
    <div className="space-y-2.5">
      {data
        .sort((a, b) => b.count - a.count)
        .map((d) => (
          <div key={d.owner} className="flex items-center gap-3">
            <div className="w-40 text-xs text-slate-600 truncate">{d.owner}</div>
            <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-red-400"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <div className="w-8 text-right text-xs text-slate-700 tabular-nums">
              {d.count}
            </div>
          </div>
        ))}
    </div>
  );
}

export function DueDateBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const colors: Record<string, string> = {
    Overdue: "bg-red-500",
    "Next 7d": "bg-amber-500",
    "Next 30d": "bg-brand-500",
    Later: "bg-slate-400",
  };
  return (
    <div className="grid grid-cols-4 gap-3 items-end h-40">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 h-full">
          <div className="text-xs text-slate-600 tabular-nums">{d.count}</div>
          <div className="flex-1 w-full flex items-end">
            <div
              className={`w-full rounded-t ${colors[d.label]}`}
              style={{ height: `${(d.count / max) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
