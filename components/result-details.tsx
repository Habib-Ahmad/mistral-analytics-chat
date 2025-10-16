export default function ResultDetails({
  sql,
  explanation,
  meta,
}: {
  sql?: string;
  explanation?: string;
  meta?: string;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card">
        <h4 className="font-semibold mb-2 text-sm">SQL</h4>
        <pre className="text-xs overflow-x-auto">{sql ?? "—"}</pre>
      </div>
      <div className="card">
        <h4 className="font-semibold mb-2 text-sm">What you&apos;re seeing</h4>
        <p className="text-slate-300 text-sm">{explanation ?? "—"}</p>
        {meta && <p className="text-xs text-slate-500 mt-2">{meta}</p>}
      </div>
    </div>
  );
}
