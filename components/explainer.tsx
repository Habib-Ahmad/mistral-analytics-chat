export default function Explainer() {
  return (
    <div className="card">
      <h3 className="font-semibold mb-2">How it works</h3>

      <ol className="list-decimal ml-4 space-y-1 text-slate-300">
        <li>You ask a question in plain English.</li>
        <li>
          Mistral returns a <b>JSON plan</b>: a SELECT query + a chart spec.
        </li>
        <li>
          We validate, execute it on Postgres (Neon), and render the chart.
        </li>
      </ol>

      <p className="mt-3 text-sm text-slate-400">
        Data model: <b>users</b>, <b>vendors</b>, <b>categories</b>,{" "}
        <b>products</b>, <b>orders</b>, <b>order_items</b>, <b>shipments</b>,{" "}
        <b>warehouses</b>, <b>countries</b>.
      </p>
    </div>
  );
}
