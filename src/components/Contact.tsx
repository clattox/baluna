"use client";

import { useState } from "react";

/*
  IMPORTANTE: este formulario todavía no está conectado a un backend
  real. Al enviar, arma un mailto: con los datos como fallback
  funcional inmediato. Antes de producción, reemplazar por un
  endpoint (API route de Next.js + servicio de email o CRM) para no
  depender del cliente de correo del visitante.

  El número de WhatsApp es un PLACEHOLDER (+56 9 0000 0000):
  reemplazar por el número real de la agencia.
*/
const WHATSAPP_PLACEHOLDER = "56900000000";
const CONTACT_EMAIL = "contacto@agenciabaluna.cl";

export default function Contact() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    tipoEvento: "",
    ciudad: "",
    fecha: "",
    mensaje: "",
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = encodeURIComponent(
      `Nombre: ${form.nombre}\nEmpresa: ${form.empresa}\nEmail: ${form.email}\nTeléfono: ${form.telefono}\nTipo de evento: ${form.tipoEvento}\nCiudad: ${form.ciudad}\nFecha estimada: ${form.fecha}\n\nMensaje:\n${form.mensaje}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Cotización — ${form.empresa || form.nombre || "nuevo proyecto"}`
    )}&body=${body}`;
  };

  return (
    <section id="contacto" className="bg-paper-warm py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div>
          <h2 className="balance font-display text-4xl leading-tight text-ink md:text-5xl">
            ¿Tienes una activación en mente?
          </h2>
          <p className="balance mt-5 max-w-sm text-ink-soft">
            Cuéntanos qué necesitas. Nosotros hacemos que suceda.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-[15px]">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-blush"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_PLACEHOLDER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-blush"
            >
              WhatsApp directo
            </a>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-lg border border-line bg-paper p-6 sm:grid-cols-2 md:p-8"
        >
          <Field label="Nombre" value={form.nombre} onChange={handleChange("nombre")} required />
          <Field label="Empresa" value={form.empresa} onChange={handleChange("empresa")} required />
          <Field label="Email" type="email" value={form.email} onChange={handleChange("email")} required />
          <Field label="Teléfono" type="tel" value={form.telefono} onChange={handleChange("telefono")} />
          <Field label="Tipo de evento" value={form.tipoEvento} onChange={handleChange("tipoEvento")} />
          <Field label="Ciudad" value={form.ciudad} onChange={handleChange("ciudad")} />
          <Field
            label="Fecha estimada"
            type="date"
            value={form.fecha}
            onChange={handleChange("fecha")}
            className="sm:col-span-2"
          />
          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-ink-soft">Mensaje / requerimientos</span>
            <textarea
              rows={4}
              value={form.mensaje}
              onChange={handleChange("mensaje")}
              className="rounded-md border border-line bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-brand"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-paper transition-colors hover:bg-brand-deep sm:col-span-2 sm:w-fit"
          >
            Solicitar cotización
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="font-medium text-ink-soft">
        {label}
        {required && <span className="text-blush"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-md border border-line bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-brand"
      />
    </label>
  );
}
