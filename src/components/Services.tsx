const SERVICES = [
  {
    number: "01",
    title: "BTL & activaciones",
    body: "Experiencias que conectan marcas con personas.",
    tags: ["Sampling", "Roadshows", "Retail", "Brand experience", "Activaciones"],
  },
  {
    number: "02",
    title: "Eventos & lanzamientos",
    body: "Planificación y ejecución de experiencias corporativas.",
    tags: ["Lanzamientos", "Eventos corporativos", "Ferias", "Producción", "Experiencias"],
  },
  {
    number: "03",
    title: "Staff & capital humano",
    body: "Equipos preparados para representar y activar marcas.",
    tags: ["Promotores", "Anfitriones", "Staff promocional", "Supervisión", "Operación en terreno"],
  },
];

export default function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="mb-14 max-w-xl md:mb-20">
        <h2 className="font-display text-4xl leading-tight text-ink md:text-5xl">
          Lo que hacemos
        </h2>
      </div>

      <div className="divide-y divide-line border-y border-line">
        {SERVICES.map((s) => (
          <div
            key={s.number}
            className="grid gap-6 py-10 md:grid-cols-[100px_1fr_1fr] md:gap-10 md:py-14"
          >
            <span className="font-display text-lg text-blush">{s.number}</span>

            <h3 className="font-display text-2xl leading-snug text-ink md:text-3xl">
              {s.title}
            </h3>

            <div>
              <p className="max-w-sm text-ink-soft">{s.body}</p>
              <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm text-ink-soft">
                {s.tags.map((tag, i) => (
                  <li key={tag} className="flex items-center gap-3">
                    {tag}
                    {i < s.tags.length - 1 && (
                      <span className="text-line" aria-hidden="true">
                        /
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
