// ===== Navbar: fondo al hacer scroll + menú mobile =====
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

function updateNavbar() {
  const scrolled = window.scrollY > 24;
  navbar.classList.toggle("scrolled", scrolled);
}
updateNavbar();
window.addEventListener("scroll", updateNavbar, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = navbar.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMobile.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navbar.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ===== Portafolio: filtro por categoría =====
const filters = document.getElementById("filters");
const masonryItems = document.querySelectorAll("#masonry figure");

filters.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;

  filters.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  const filter = btn.dataset.filter;
  masonryItems.forEach((fig) => {
    const show = filter === "Todos" || fig.dataset.type === filter;
    fig.style.display = show ? "" : "none";
  });
});

// ===== Footer: año dinámico =====
document.getElementById("copyYear").textContent =
  `© ${new Date().getFullYear()} Baluna. Todos los derechos reservados.`;

// =====================================================================
// Formulario de contacto: sin backend todavia, arma un mailto: como
// fallback funcional. Antes de produccion, reemplazar por un endpoint
// real (form-to-email de Hostinger, Formspree, etc.) para no depender
// del cliente de correo del visitante.
// =====================================================================
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  const body = encodeURIComponent(
    `Nombre: ${data.nombre || ""}\n` +
    `Empresa: ${data.empresa || ""}\n` +
    `Email: ${data.email || ""}\n` +
    `Teléfono: ${data.telefono || ""}\n` +
    `Tipo de evento: ${data.tipoEvento || ""}\n` +
    `Ciudad: ${data.ciudad || ""}\n` +
    `Fecha estimada: ${data.fecha || ""}\n\n` +
    `Mensaje:\n${data.mensaje || ""}`
  );
  const subject = encodeURIComponent(
    `Cotización — ${data.empresa || data.nombre || "nuevo proyecto"}`
  );
  window.location.href = `mailto:contacto@agenciabaluna.cl?subject=${subject}&body=${body}`;
});
