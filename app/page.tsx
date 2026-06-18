import { LandingActions } from "@/components/LandingActions";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ink-muted">
            A one-night game
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            The Incident
          </h1>
          <p className="max-w-xs text-sm leading-6 text-ink-secondary">
            Sixteen people. One evening. Everything is true until someone
            decides to hide it.
          </p>
        </div>

        <LandingActions />
      </div>

      <footer className="absolute bottom-6 text-[11px] text-ink-muted">
        Best played in person, after dark.
      </footer>
    </main>
  );
}
