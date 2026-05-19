import { createFileRoute } from "@tanstack/react-router";
import { RoomCompare } from "@/components/RoomCompare";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "RoomSketch — Before & After Interior Designer" },
      {
        name: "description",
        content:
          "Drag to compare before and after interior designs. Tap the dots to shop the material list.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand)] text-[var(--brand-foreground)] text-sm font-bold">
            R
          </span>
          <span className="text-sm font-semibold tracking-tight">RoomSketch</span>
        </div>
        <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
          <a className="hover:text-foreground" href="#">Projects</a>
          <a className="hover:text-foreground" href="#">Library</a>
          <a className="hover:text-foreground" href="#">Pricing</a>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)]">
          Compare view
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Industrial loft, reimagined.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Drag the handle to slide between the original space and the new design.
          Every piece in the After view is tagged — open a dot to add it to your cart.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <RoomCompare />
      </section>
    </main>
  );
}
