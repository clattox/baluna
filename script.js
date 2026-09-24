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

  // El botón flotante de WhatsApp (index.html) se aparta cuando el banner
  // está visible: el banner cruza todo el ancho del borde inferior y, sin
  // esto, quedaría encima del botón. Se publica la altura real del banner
  // como variable CSS (--consent-offset), que .whatsapp-float usa en su
  // `bottom`.
  function sincronizarOffset() {
    const raiz = document.documentElement;
    if (!raiz || !raiz.style) return;
    let alto = 0;
    if (banner && !banner.hidden && typeof banner.getBoundingClientRect === "function") {
      alto = Math.round(banner.getBoundingClientRect().height) || 0;
    }
    raiz.style.setProperty("--consent-offset", alto + "px");
  }

  function mostrarBanner() {
    if (banner) banner.hidden = false;
    sincronizarOffset();
  }

  function ocultarBanner() {
    if (banner) banner.hidden = true;
    sincronizarOffset();
  }

  // El alto del banner depende del ancho de pantalla, del largo del texto y
  // de la carga de las fuentes: se recalcula con ResizeObserver y, como
  // respaldo, con resize/load.
  function observarBanner() {
    if (!banner) return;
    if (typeof window.ResizeObserver === "function") {
      new ResizeObserver(sincronizarOffset).observe(banner);
    }
    window.addEventListener("resize", sincronizarOffset, { passive: true });
    window.addEventListener("load", sincronizarOffset);
  }

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

  // Controles del panel a los que se puede tabular. El diálogo
  // (tabindex="-1") queda fuera a propósito: solo existe para recibir el
  // foco al abrir. Los <input> de los switches son opacity:0 sobre su
  // track, así que sí cuentan (los deshabilitados se excluyen solos).
  const SELECTOR_FOCO = 'a[href], button:not([disabled]), input:not([disabled]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function controlesPanel() {
    if (!panel) return [];
    return Array.from(panel.querySelectorAll(SELECTOR_FOCO));
  }

  document.addEventListener("keydown", (e) => {
    if (!banner || !panel) resolverDom();

    if (e.key === "Escape") {
      if (panel && !panel.hidden) cerrarPanel();
      else if (banner && !banner.hidden) ocultarBanner(); // sin eleccion = sin cookies no esenciales
      return;
    }

    if (e.key !== "Tab" || !panel || panel.hidden) return;

    // Trampa de foco: el panel se declara aria-modal="true", así que
    // mientras está abierto Tab circula solo entre sus controles, igual que
    // en el lightbox. Sin esto el foco salía a la página de fondo y llegaba
    // al botón flotante de WhatsApp, que no debería alcanzarse.
    const controles = controlesPanel();
    if (!controles.length) return;
    const primero = controles[0];
    const ultimo = controles[controles.length - 1];
    const activo = document.activeElement;
    if (!panel.contains(activo)) { e.preventDefault(); primero.focus(); return; }
    if (e.shiftKey && activo === primero) { e.preventDefault(); ultimo.focus(); return; }
    if (!e.shiftKey && activo === ultimo) { e.preventDefault(); primero.focus(); }
  });

  function iniciar() {
    resolverDom();
    observarBanner();
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

  // El botón cambia de nombre accesible con el estado del panel: "Abrir menú"
  // fijo describía mal el botón cuando el menú ya estaba desplegado.
  function estadoMenu(abierto) {
    navbar.classList.toggle("open", abierto);
    navToggle.setAttribute("aria-expanded", String(abierto));
    navToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  }

  navToggle.addEventListener("click", () => {
    estadoMenu(!navbar.classList.contains("open"));
  });

  navMobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => estadoMenu(false));
  });

  // ESC cierra el menú y devuelve el foco al botón. Va en un keydown de
  // document (el mismo nivel que usan el panel de cookies y el lightbox),
  // así funciona también con el foco dentro del menú, y comprueba el estado
  // antes de actuar para no pisar otros atajos.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !navbar.classList.contains("open")) return;
    estadoMenu(false);
    navToggle.focus();
  });
}

// ===== Portafolio: filtro por categoría y contador (solo index.html) =====
// El bloque se salta solo en las páginas que no tienen la sección.
const filters = document.getElementById("filters");
const portfolioFigures = Array.from(document.querySelectorAll("#portfolioGrid figure"));
const portfolioCount = document.getElementById("portfolioCount");

if (filters && portfolioFigures.length) {
  const pintarContador = (visibles) => {
    if (portfolioCount) {
      portfolioCount.textContent = `01 — ${String(visibles).padStart(2, "0")}`;
    }
  };
  pintarContador(portfolioFigures.length);

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;

    // .active es el estado visual; aria-pressed el que anuncia el lector de
    // pantalla. Los dos se actualizan juntos, y el botón que se pulsa es
    // siempre el único activo (el filtro no se deselecciona).
    filters.querySelectorAll("button").forEach((b) => {
      const activo = b === btn;
      b.classList.toggle("active", activo);
      b.setAttribute("aria-pressed", String(activo));
    });

    const filtro = btn.dataset.filter;
    let visibles = 0;
    portfolioFigures.forEach((fig) => {
      const mostrar = filtro === "Todos" || fig.dataset.type === filtro;
      // hidden (y no display:none en línea) para que la grilla se recomponga sola.
      fig.hidden = !mostrar;
      if (mostrar) visibles += 1;
    });
    pintarContador(visibles);
  });
}

// ===== Portafolio: lightbox propio, sin librerías =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCount = document.getElementById("lightboxCount");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

if (lightbox && lightboxImg && portfolioFigures.length) {
  const fotos = portfolioFigures.map((fig) => {
    const img = fig.querySelector("img");
    return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
  });

  const controles = [lightboxClose, lightboxPrev, lightboxNext].filter(Boolean);
  let abierto = false;
  let indice = 0;
  let focoPrevio = null;

  function mostrarFoto(n) {
    indice = (n + fotos.length) % fotos.length; // navegación circular
    lightboxImg.src = fotos[indice].src;
    lightboxImg.alt = fotos[indice].alt;
    if (lightboxCount) {
      lightboxCount.textContent =
        `${String(indice + 1).padStart(2, "0")} / ${String(fotos.length).padStart(2, "0")}`;
    }
  }

  function abrirLightbox(n, disparador) {
    focoPrevio = disparador || document.activeElement;
    abierto = true;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    mostrarFoto(n);
    (lightboxClose || lightbox).focus();
  }

  function cerrarLightbox() {
    abierto = false;
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    if (focoPrevio && typeof focoPrevio.focus === "function") focoPrevio.focus();
  }

  // El lightbox recorre las 13 fotos en el orden del DOM, aunque haya un
  // filtro activo: es la galería completa, no solo lo visible.
  portfolioFigures.forEach((fig, i) => {
    const btn = fig.querySelector(".pf__btn");
    if (btn) btn.addEventListener("click", () => abrirLightbox(i, btn));
  });
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => mostrarFoto(indice - 1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => mostrarFoto(indice + 1));
  if (lightboxClose) lightboxClose.addEventListener("click", cerrarLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) cerrarLightbox(); // clic en el fondo oscuro
  });

  document.addEventListener("keydown", (e) => {
    if (!abierto) return;
    if (e.key === "Escape") { e.preventDefault(); cerrarLightbox(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); mostrarFoto(indice + 1); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); mostrarFoto(indice - 1); return; }
    if (e.key !== "Tab" || !controles.length) return;

    // Trampa de foco: Tab circula solo entre los controles del lightbox.
    const primero = controles[0];
    const ultimo = controles[controles.length - 1];
    const activo = document.activeElement;
    if (!lightbox.contains(activo)) { e.preventDefault(); primero.focus(); return; }
    if (e.shiftKey && activo === primero) { e.preventDefault(); ultimo.focus(); return; }
    if (!e.shiftKey && activo === ultimo) { e.preventDefault(); primero.focus(); }
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
