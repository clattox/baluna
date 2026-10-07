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

// ── Portafolio carrusel ──────────────────────────────────────────
(function () {
  const track = document.getElementById('portTrack');
  const dotsWrap = document.getElementById('portDots');
  const lightbox = document.getElementById('portLightbox');
  const lbImg = document.getElementById('portLbImg');
  const lbClose = document.getElementById('portLbClose');
  const lbPrev = document.getElementById('portLbPrev');
  const lbNext = document.getElementById('portLbNext');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.port-slide'));
  const imgSlides = slides.filter(s => s.querySelector('img')); // solo fotos para lightbox
  let current = 0;
  let autoTimer;

  // Dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'port-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Ir a foto ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
  });

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.port-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  document.getElementById('portCarousel')
    .querySelector('.port-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('portCarousel')
    .querySelector('.port-next').addEventListener('click', () => goTo(current + 1));

  // Pausa al hover
  const carousel = document.getElementById('portCarousel');
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', resetTimer);

  resetTimer();

  // Lightbox — solo fotos (no video)
  let lbCurrent = 0;

  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    if (!img) return;
    slide.style.cursor = 'pointer';
    slide.addEventListener('click', () => {
      lbCurrent = imgSlides.indexOf(slide);
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    });
  });

  function lbGoTo(n) {
    lbCurrent = (n + imgSlides.length) % imgSlides.length;
    const img = imgSlides[lbCurrent].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }

  function closeLb() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => lbGoTo(lbCurrent - 1));
  lbNext.addEventListener('click', () => lbGoTo(lbCurrent + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLb();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') lbGoTo(lbCurrent - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbCurrent + 1);
  });

  // prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clearInterval(autoTimer);
  }
})();

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
