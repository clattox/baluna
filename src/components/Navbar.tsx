"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#portafolio", label: "Portafolio" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-paper/95 backdrop-blur border-b border-line"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="#inicio" className="flex items-center gap-2 shrink-0">
          {scrolled || open ? (
            <Image
              src="/baluna-logo.png"
              alt="Baluna"
              width={132}
              height={78}
              priority
              className="h-9 w-auto"
            />
          ) : (
            /*
              Sobre el hero oscuro el isotipo morado se funde con el
              fondo. No tenemos una variante clara del isotipo (pedirla
              al cliente), así que mientras el navbar es transparente
              mostramos el wordmark en texto claro, igual que el footer.
            */
            <span className="font-display text-2xl italic text-paper">
              Baluna
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#contacto"
          className="hidden rounded-full bg-brand px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-brand-deep md:inline-block"
        >
          Cotizar evento
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-4 bg-ink transition-transform ${
                open ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 bottom-0 h-[1.5px] w-4 bg-ink transition-transform ${
                open ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-paper px-6 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink-soft hover:bg-paper-warm hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand px-5 py-3 text-center text-base font-semibold text-paper"
            >
              Cotizar evento
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
