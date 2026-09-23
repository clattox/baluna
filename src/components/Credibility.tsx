/*
  Ojo: los tres puntos de abajo (incluido "< 24 h") vienen tal cual del
  brief como EJEMPLOS de credibilidad verificable, no de una métrica
  medida. Antes de publicar, confirmar con el cliente que "Cotizaciones
  < 24 h" es un compromiso real y no una cifra a validar.
*/
const ITEMS = [
  {
    title: "Operación nacional",
    body: "Cobertura en todo Chile.",
  },
  {
    title: "Cotizaciones < 24 h",
    body: "Respuesta rápida a proyectos.",
  },
  {
    title: "Staff capacitado",
    body: "Equipos preparados y supervisados.",
  },
];

export default function Credibility() {
  return (
    <section className="border-y border-line bg-paper-warm">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3 sm:gap-6 sm:py-12">
        {ITEMS.map((item) => (
          <div key={item.title}>
            <p className="font-display text-xl text-ink">{item.title}</p>
            <p className="mt-1 text-[15px] text-ink-soft">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
