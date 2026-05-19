import { useCallback, useEffect, useRef, useState } from "react";
import { Check, GitCompareArrows, Plus, ShoppingBag, X } from "lucide-react";
import beforeImg from "@/assets/room-before.jpg";
import afterImg from "@/assets/room-after.jpg";
import pSofa from "@/assets/p-sofa.png";
import pLamp from "@/assets/p-lamp.png";
import pArt from "@/assets/p-art.png";
import pPlant from "@/assets/p-plant.png";
import pTable from "@/assets/p-table.png";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  blurb: string;
  image: string;
  x: number;
  y: number;
};

const PRODUCTS: Product[] = [
  {
    id: "sofa",
    name: "Linen Loft Sectional",
    brand: "Maison Nord",
    price: 1890,
    blurb: "Deep-seat L-shape in oat linen with feather-down cushions.",
    image: pSofa,
    x: 62,
    y: 70,
  },
  {
    id: "lamp",
    name: "Tripod Floor Lamp",
    brand: "Studio Folk",
    price: 245,
    blurb: "Solid oak tripod with hand-stitched linen drum shade.",
    image: pLamp,
    x: 90,
    y: 55,
  },
  {
    id: "art",
    name: "Botanical Study No. 4",
    brand: "Atelier Verde",
    price: 180,
    blurb: "Framed archival print, light oak gallery frame.",
    image: pArt,
    x: 47,
    y: 32,
  },
  {
    id: "plant",
    name: "Fiddle Leaf Fig 1.8m",
    brand: "Greenhaus",
    price: 129,
    blurb: "Hand-selected mature specimen in terracotta pot.",
    image: pPlant,
    x: 25,
    y: 50,
  },
  {
    id: "table",
    name: "Oka Coffee Table",
    brand: "Form & Grain",
    price: 420,
    blurb: "Solid white oak, hand-rubbed natural finish.",
    image: pTable,
    x: 43,
    y: 78,
  },
];

export function RoomCompare() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(true);

  const setFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, setFromClientX]);

  // Subtle auto-sweep on mount / when entering compare mode
  useEffect(() => {
    if (!compareMode) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const dt = t - start;
      if (dt > 1800) return;
      const eased = 0.5 - Math.cos((dt / 1800) * Math.PI) / 2;
      setPos(15 + eased * 70);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [compareMode]);

  const toggleCart = (id: string) =>
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const cartTotal = cart
    .map((id) => PRODUCTS.find((p) => p.id === id)?.price ?? 0)
    .reduce((a, b) => a + b, 0);

  const active = PRODUCTS.find((p) => p.id === activeId);
  const effectivePos = compareMode ? pos : 0;



  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-muted select-none"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {/* AFTER (base layer, full) */}
        <img
          src={afterImg}
          alt="Living room after redesign"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* BEFORE (clipped from left to pos) */}
        <div
          className={`absolute inset-0 overflow-hidden ${dragging ? "" : "transition-[clip-path] duration-300 ease-out"}`}
          style={{ clipPath: `inset(0 ${100 - effectivePos}% 0 0)`, willChange: "clip-path" }}
        >
          <img
            src={beforeImg}
            alt="Living room before redesign"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </div>

        {/* Labels */}
        {compareMode && (
          <span className="absolute left-4 top-4 rounded-full bg-background/85 backdrop-blur px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            Before
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-background/85 backdrop-blur px-3 py-1 text-xs font-medium text-foreground shadow-sm">
          {compareMode ? "After" : "Design view"}
        </span>

        {/* Hotspots — only visible on After side */}
        {PRODUCTS.map((p) => {
          const visible = p.x >= effectivePos;
          return (
            <button
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId((id) => (id === p.id ? null : p.id));
              }}
              aria-label={p.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--hotspot)] opacity-60" />
                <span
                  className="relative h-3.5 w-3.5 rounded-full bg-[var(--hotspot)] ring-4"
                  style={{ boxShadow: "0 0 0 4px var(--hotspot-ring)" }}
                />
              </span>
            </button>
          );
        })}

        {/* Divider + handle */}
        {compareMode && (
          <div
            className={`absolute top-0 bottom-0 w-px bg-background/90 ${dragging ? "" : "transition-[left] duration-300 ease-out"}`}
            style={{ left: `${pos}%`, willChange: "left" }}
          >
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground cursor-ew-resize"
              style={{ boxShadow: "var(--shadow-card)" }}
              aria-label="Drag to compare"
            >
              <GitCompareArrows className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Product popover */}
        {active && (
          <div
            className="absolute z-10 w-72 -translate-x-1/2 rounded-xl border border-border bg-card p-4 text-card-foreground animate-in fade-in zoom-in-95"
            style={{
              left: `${Math.min(Math.max(active.x, 22), 78)}%`,
              top: `${Math.min(active.y + 8, 78)}%`,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {active.brand}
                </p>
                <h3 className="mt-0.5 text-sm font-semibold leading-tight">
                  {active.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveId(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {active.blurb}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-base font-semibold">
                ${active.price.toLocaleString()}
              </span>
              <button
                onClick={() => toggleCart(active.id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-[var(--brand-foreground)] hover:opacity-90 transition"
              >
                {cart.includes(active.id) ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Add to cart
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cart pill */}
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/90 backdrop-blur px-3.5 py-2 text-xs font-medium shadow-sm">
          <ShoppingBag className="h-4 w-4" />
          Shopping cart ({cart.length}) · ${cartTotal.toLocaleString()}
        </div>

        {/* Compare mode toggle */}
        <button
          onClick={() => setCompareMode((v) => !v)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-background/90 backdrop-blur px-3.5 py-2 text-xs font-medium shadow-sm hover:bg-background transition"
          aria-pressed={compareMode}
        >
          {compareMode ? (
            <>
              <X className="h-4 w-4" /> Quit compare view
            </>
          ) : (
            <>
              <GitCompareArrows className="h-4 w-4" /> Compare view
            </>
          )}
        </button>
      </div>

      {/* Material list */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Material list</h2>
          <p className="text-xs text-muted-foreground">
            Tap the green dots on the After view to inspect each item.
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => {
            const inCart = cart.includes(p.id);
            return (
              <li
                key={p.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-[var(--brand)]/40"
                style={{ boxShadow: "var(--shadow-card)" }}
                onMouseEnter={() => setActiveId(p.id)}
              >
                <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-muted">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-1"
                  />
                  <span className="absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-semibold text-[var(--brand-foreground)]">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {p.brand}
                  </p>
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="mt-0.5 text-sm font-semibold">
                    ${p.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleCart(p.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted"
                >
                  {inCart ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  {inCart ? "Added" : "Add"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
