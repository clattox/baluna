"use client";

import { useState } from "react";

type Category = "Todos" | "BTL" | "Eventos" | "Retail" | "Staff";
const FILTERS: Category[] = ["Todos", "BTL", "Eventos", "Retail", "Staff"];

/*
  PLACEHOLDER: no existen proyectos reales cargados todavía.
  Estructura lista para recibir fotografía real de activaciones:
  reemplazar este arreglo por los proyectos reales (tipo, ciudad,
  año) y las imágenes correspondientes. No se inventaron clientes,
  ciudades ni años.
*/
const PROJECTS: {
  id: number;
  type: Exclude<Category, "Todos">;
  city: string;
  year: string;
  tall?: boolean;
}[] = [
  { id: 1, type: "BTL", city: "Pendiente", year: "Pendiente", tall: true },
  { id: 2, type: "Eventos", city: "Pendiente", year: "Pendiente" },
  { id: 3, type: "Retail", city: "Pendiente", year: "Pendiente" },
  { id: 4, type: "Staff", city: "Pendiente", year: "Pendiente", tall: true },
  { id: 5, type: "BTL", city: "Pendiente", year: "Pendiente" },
  { id: 6, type: "Eventos", city: "Pendiente", year: "Pendiente" },
];

export default function Portfolio() {
  const [filter, setFilter] = useState<Category>("Todos");
  const visible =
    filter === "Todos" ? PROJECTS : PROJECTS.filter((p) => p.type === filter);

  return (
    <section id="portafolio" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
        <h2 className="balance max-w-lg font-display text-4xl leading-tight text-ink md:text-5xl">
          Experiencias que hablan por sí solas.
        </h2>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "border-brand bg-brand text-paper"
                  : "border-line text-ink-soft hover:border-brand hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/*
        Masonry real con CSS columns: cada figura decide su propia
        altura (via aspect-ratio) y fluye a la columna con más espacio
        libre, así no quedan huecos como con grid + row-span.
      */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visible.map((p) => (
          <figure
            key={p.id}
            className={`group relative mb-5 overflow-hidden rounded-sm break-inside-avoid ${
              p.tall ? "aspect-[3/4]" : "aspect-[4/5]"
            }`}
          >
            <div className="media-placeholder absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink/70 to-transparent p-4 text-paper">
              <span className="text-sm font-medium">{p.type}</span>
              <span className="text-xs text-paper/70">
                {p.city} · {p.year}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
