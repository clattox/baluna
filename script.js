// =====================================================================
// Consentimiento de cookies y privacidad — Ley N°21.719
// ---------------------------------------------------------------------
// Estructura lista para cuando se agregue cualquier script de analitica
// o marketing. Hoy el sitio no carga cookies de terceros: el unico
// envio de datos es el formulario de contacto, que arma un mailto:.
//
// API publica (window.balunaConsent):
//   get()              -> objeto guardado, o null si aun no hay eleccion
//   onChange(callback) -> registra un callback; se ejecuta de inmediato
//                         con el estado actual y de nuevo en cada cambio
//   open()             -> abre el panel de preferencias
//   reset()            -> borra la eleccion guardada (util para probar)
//
// Ejemplo de uso futuro (cargar Google Analytics solo con permiso):
//   balunaConsent.onChange((consent) => {
//     const cargado = document.getElementById("ga4");
//     if (consent.analytics && !cargado) { /* inyectar el script */ }
//     if (!consent.analytics && cargado) { /* desactivar la medicion */ }
//   });
// El callback recibe siempre { necessary, analytics, marketing, timestamp }
// (timestamp es null mientras no exista una eleccion guardada).
//
// Requiere el markup de #cookieBanner y #cookiePanel, presente en
// index.html y privacidad.html.
// =====================================================================
window.balunaConsent = (function () {
  const STORAGE_KEY = "baluna_cookie_consent";
  const SIN_ELECCION = { necessary: true, analytics: false, marketing: false, timestamp: null };
  const listeners = [];
  let memoria = null; // respaldo si localStorage esta bloqueado

  function construir(analytics, marketing, timestamp) {
    return {
      necessary: true,
      analytics: analytics === true,
      marketing: marketing === true,
      timestamp: timestamp || null,
    };
  }

  function leer() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return memoria; // modo privado / storage bloqueado por el navegador
    }
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return construir(parsed.analytics, parsed.marketing, parsed.timestamp);
    } catch (e) {
      return null; // dato corrupto: se trata como "sin eleccion"
    }
  }

  function escribir(consent) {
    memoria = consent;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
      // Sin persistencia disponible: la eleccion vale para esta pagina.
    }
  }

  function notificar() {
    const estado = leer() || SIN_ELECCION;
    listeners.forEach((cb) => {
      try {
        cb(estado);
      } catch (e) {
        // Un callback con error no debe romper al resto.
      }
    });
  }

  // --- Banner y panel --------------------------------------------------
  // Los elementos se resuelven al iniciar, no al evaluar el archivo, para
  // que el módulo siga funcionando si algún día script.js se carga con
  // defer desde el <head> (ahí el DOM todavía no existe).
  let banner = null;
  let panel = null;
  let toggleAnalytics = null;
  let toggleMarketing = null;
  let focoPrevio = null;

  function resolverDom() {
    banner = document.getElementById("cookieBanner");
    panel = document.getElementById("cookiePanel");
    toggleAnalytics = document.getElementById("consentAnalytics");
    toggleMarketing = document.getElementById("consentMarketing");
  }

  function mostrarBanner() { if (banner) banner.hidden = false; }
  function ocultarBanner() { if (banner) banner.hidden = true; }

  function abrirPanel() {
    if (!panel) return;
    const estado = leer() || SIN_ELECCION;
    if (toggleAnalytics) toggleAnalytics.checked = estado.analytics;
    if (toggleMarketing) toggleMarketing.checked = estado.marketing;
    focoPrevio = document.activeElement;
    ocultarBanner();
    panel.hidden = false;
    document.body.classList.add("consent-open");
    const dialog = panel.querySelector(".consent-panel__dialog");
    if (dialog) dialog.focus();
  }

  function cerrarPanel() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    document.body.classList.remove("consent-open");
    if (focoPrevio && typeof focoPrevio.focus === "function") focoPrevio.focus();
    focoPrevio = null;
    // Si todavia no hay eleccion guardada, el banner vuelve a mostrarse.
    if (!leer()) mostrarBanner();
  }

  // --- Guardado de la eleccion ----------------------------------------
  function guardar(analytics, marketing) {
    const previo = leer();
    const nuevo = construir(analytics, marketing, new Date().toISOString());
    escribir(nuevo);
    ocultarBanner();
    cerrarPanel();
    // Se avisa en la primera eleccion y cada vez que cambia una categoria.
    // Guardar los mismos valores no vuelve a avisar: asi un gate no
    // recarga dos veces el script de terceros.
    const cambio = !previo ||
      previo.analytics !== nuevo.analytics ||
      previo.marketing !== nuevo.marketing;
    if (cambio) notificar();
  }

  // Delegacion de eventos: sirve para el banner, el panel y el boton
  // "Gestionar cookies" del footer, presente en todas las paginas.
  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-consent]") : null;
    if (!el) return;
    if (!banner || !panel) resolverDom();
    switch (el.dataset.consent) {
      case "accept":
        guardar(true, true);
        break;
      case "reject":
        guardar(false, false);
        break;
      case "customize":
        abrirPanel();
        break;
      case "save":
        guardar(
          toggleAnalytics ? toggleAnalytics.checked : false,
          toggleMarketing ? toggleMarketing.checked : false
        );
        break;
      case "close":
        cerrarPanel();
        break;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!banner || !panel) resolverDom();
    if (panel && !panel.hidden) cerrarPanel();
    else if (banner && !banner.hidden) ocultarBanner(); // sin eleccion = sin cookies no esenciales
  });

  function iniciar() {
    resolverDom();
    if (!leer()) mostrarBanner();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

  return {
    get: function () { return leer(); },
    onChange: function (callback) {
      if (typeof callback !== "function") return;
      listeners.push(callback);
      callback(leer() || SIN_ELECCION);
    },
    open: abrirPanel,
    reset: function () {
      resolverDom();
      memoria = null;
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // sin persistencia: nada que borrar
      }
      mostrarBanner();
      notificar();
    },
  };
})();

// ===== Navbar: fondo al hacer scroll + menú mobile =====
// El navbar se repite en index.html y privacidad.html, así que este bloque
// se salta solo si la página no tiene los tres elementos.
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

if (navbar && navToggle && navMobile) {
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
}

// ===== Portafolio: filtro por categoría (solo index.html) =====
const filters = document.getElementById("filters");
const masonryItems = document.querySelectorAll("#masonry figure");

if (filters) {
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
}

// ===== Footer: año dinámico =====
const copyYear = document.getElementById("copyYear");
if (copyYear) {
  copyYear.textContent =
    `© ${new Date().getFullYear()} Baluna. Todos los derechos reservados.`;
}

// =====================================================================
// Formulario de contacto (solo index.html): sin backend todavia, arma un
// mailto: como fallback funcional. Antes de produccion, reemplazar por un
// endpoint real (form-to-email de Hostinger, Formspree, etc.) para no
// depender del cliente de correo del visitante.
// =====================================================================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
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
}
