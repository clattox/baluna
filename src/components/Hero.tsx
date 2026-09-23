export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[92vh] items-end overflow-hidden bg-brand-deep pt-28"
    >
      {/*
        Reemplazar este bloque por el <video autoPlay muted loop playsInline>
        o la fotografía real de una activación. Se deja como placeholder
        texturizado a propósito: no se debe simular contenido real.
      */}
      <div className="media-placeholder absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/60 to-brand-deep/10" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 md:pb-20">
        <p className="mb-5 max-w-md text-sm font-medium text-blush-soft">
          Agencia BTL — activaciones, eventos y staff promocional
        </p>
        <h1 className="balance max-w-3xl font-display text-[13vw] font-medium leading-[0.95] text-paper sm:text-6xl md:text-7xl">
          Hacemos que las marcas pasen de verse a vivirse.
        </h1>
        <p className="balance mt-6 max-w-lg text-lg text-paper/80">
          Activaciones BTL, eventos, lanzamientos y equipos de staff en todo
          Chile.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#contacto"
            className="rounded-full bg-blush px-7 py-3.5 text-[15px] font-semibold text-brand-deep transition-transform hover:scale-[1.02]"
          >
            Cotizar mi proyecto
          </a>
          <a
            href="#portafolio"
            className="rounded-full border border-paper/30 px-7 py-3.5 text-[15px] font-semibold text-paper transition-colors hover:bg-paper/10"
          >
            Ver experiencias
          </a>
        </div>
      </div>
    </section>
  );
}
