const STEPS = [
  { number: "01", title: "Diseñamos", body: "Conceptualización y planificación." },
  { number: "02", title: "Coordinamos", body: "Logística, producción y equipos." },
  { number: "03", title: "Activamos", body: "Staff, montaje y experiencia en terreno." },
  { number: "04", title: "Ejecutamos", body: "Supervisión y seguimiento de la operación." },
];

export default function Process() {
  return (
    <section className="bg-brand-deep py-24 text-paper md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="balance max-w-lg font-display text-4xl leading-tight md:text-5xl">
          De la idea a la ejecución.
        </h2>

        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step) => (
            <li key={step.number} className="border-t border-line-dark pt-6">
              <span className="font-display text-sm text-blush">{step.number}</span>
              <p className="mt-3 font-display text-2xl">{step.title}</p>
              <p className="mt-2 text-[15px] text-paper/70">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="balance mt-16 max-w-md text-sm text-paper/60">
          No solamente aportamos creatividad: también capacidad de ejecución.
        </p>
      </div>
    </section>
  );
}
