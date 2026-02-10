import Form from "./Form.jsx";

const App = () => {
  return (
    <div className="min-h-screen text-slate-900">
      <div className="page-bg">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              SA
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Shopping Assistant</p>
              <p className="text-lg font-semibold text-slate-900">Psychology-Powered Styling</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <span>Intent Analysis</span>
            <span>Multi-Agent Scout</span>
            <span>Style Manual</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 pb-16">
          <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm">
                Personalized Shopping
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                Build a wardrobe that respects your budget and reflects your mood.
              </h1>
              <p className="max-w-xl text-base text-slate-600 md:text-lg">
                Tell us how you want to feel. The assistant validates your intent, finds confident picks,
                and cross-checks your personal style manual before recommending anything.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Persona Lens",
                    detail: "Understands intent, mood, and budget anxiety.",
                  },
                  {
                    title: "Comparison Scout",
                    detail: "Pulls options from multiple marketplaces.",
                  },
                  {
                    title: "Closet Memory",
                    detail: "Explains how new items pair with past buys.",
                  },
                ].map((card) => (
                  <div key={card.title} className="glass-panel">
                    <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                    <p className="mt-2 text-xs text-slate-600">{card.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 shadow-xl">
              <Form />
            </div>
          </section>

          <section className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="feature-tile">
              <p className="text-sm font-semibold">Trend-Aware Style Manual</p>
              <p className="mt-2 text-sm text-slate-600">
                Upload your fashion guide or seasonal trend PDF. We match every suggestion to it.
              </p>
            </div>
            <div className="feature-tile">
              <p className="text-sm font-semibold">Visual Search That Feels Human</p>
              <p className="mt-2 text-sm text-slate-600">
                Snap a photo of a look you love. The assistant finds the closest matches online.
              </p>
            </div>
            <div className="feature-tile">
              <p className="text-sm font-semibold">Transparent Confidence Scores</p>
              <p className="mt-2 text-sm text-slate-600">
                See budget fit, review risk, and why each choice supports your vibe.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
