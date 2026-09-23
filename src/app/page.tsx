import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Credibility from "@/components/Credibility";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Coverage from "@/components/Coverage";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

/*
  Secciones omitidas a propósito, tal como pide el brief cuando no
  hay contenido real confirmado:
  - "Marcas que han confiado en nosotros" (sin logos reales/autorizados)
  - "Testimonios" (sin testimonios reales)
  Agregarlas cuando el cliente entregue ese material.
*/

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Credibility />
      <Services />
      <Process />
      <Coverage />
      <Portfolio />
      <Contact />
      <FinalCta />
      <Footer />
    </main>
  );
}
