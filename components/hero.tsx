export default function Hero() {
  return (
    <section className="pt-28 pb-10 text-center">
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
        Ask your data. <span className="text-cyan-400">See it.</span>
      </h1>

      <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
        Natural-language analytics powered by Mistral: the model plans an{" "}
        <span className="font-semibold text-slate-200">SQL</span> query and a{" "}
        <span className="font-semibold text-slate-200">chart spec</span>. We
        verify, execute, and render.
      </p>
    </section>
  );
}
