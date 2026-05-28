import { AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";

export function MissingItemsPanel({
  items,
}: {
  items: { label: string; level: "red" | "yellow" }[];
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold text-slate-800">Missing Items</h3>
        <span className="text-xs text-slate-500">
          {items.length === 0 ? "All clear" : `${items.length} gap${items.length === 1 ? "" : "s"}`}
        </span>
      </div>
      <div className="card-body">
        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            No missing artefacts detected.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((i) => (
              <li
                key={i.label}
                className={`flex items-center gap-2 text-sm rounded-md border px-3 py-2 ${
                  i.level === "red"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                {i.level === "red" ? (
                  <AlertOctagon className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {i.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
