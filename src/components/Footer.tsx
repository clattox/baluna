export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink px-6 py-12 text-paper/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        {/*
          Wordmark en texto, no el isotipo: el archivo entregado es
          morado sobre fondo claro y no hay una variante clara para
          fondo oscuro. Pedir al cliente el isotipo en versión clara
          y reemplazar esto por <Image src="/baluna-logo-light.png" />.
        */}
        <span className="font-display text-2xl italic text-paper">Baluna</span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="#servicios" className="hover:text-paper">Servicios</a>
          <a href="#cobertura" className="hover:text-paper">Cobertura</a>
          <a href="#portafolio" className="hover:text-paper">Portafolio</a>
          <a href="#contacto" className="hover:text-paper">Contacto</a>
        </nav>
        <p className="text-sm text-paper/50">© {year} Baluna. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
