/*
  Se optó deliberadamente por una pieza gráfica abstracta en vez de un
  mapa técnico de Chile: no tenemos un trazado geográfico verificado
  para reproducir con precisión, y el brief pide "editorial y premium",
  no cartográfico. No se listan ciudades ni cifras de cobertura por
  regiones: el brief prohíbe inventarlas. Si el cliente confirma
  ciudades reales donde operan, se pueden reemplazar las etiquetas
  "Zona norte / centro / sur" por nombres concretos.
*/
const ZONES = ["Zona norte", "Zona centro", "Zona sur"];

export default function Coverage() {
  return (
    <section id="cobertura" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-16 md:grid-cols-2 md:items-center md:gap-12">
        <div>
          <h2 className="balance font-display text-4xl leading-tight text-ink md:text-5xl">
            Una operación. Todo Chile.
          </h2>
          <p className="balance mt-6 max-w-md text-ink-soft">
            Coordinamos equipos y operaciones en distintas ciudades del país,
            manteniendo un estándar de ejecución y supervisión.
          </p>
        </div>

        <div className="relative mx-auto flex h-72 w-full max-w-[220px] items-stretch justify-center md:h-96">
          <div className="relative w-[3px] rounded-full bg-gradient-to-b from-brand via-blush to-brand" />
          {ZONES.map((zone, i) => (
            <div
              key={zone}
              className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
              style={{ top: `${i * 42 + 6}%` }}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blush" />
              <span className="whitespace-nowrap text-sm font-medium text-ink-soft">
                {zone}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
