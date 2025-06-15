import SEOHead from "@/components/SEOHead";
import BannerHero from "@/components/BannerHero";
import SectionDestacada from "@/components/SectionDestacada";
import GoogleFormEmbed from "@/components/GoogleFormEmbed";
import { useBusiness } from "@/context/BusinessContext";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfWgTOpruebaFormularioEmbed/viewform?embedded=true";

const Home = () => {
  const { config } = useBusiness();
  const { ref: formRef, revealed: formVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <>
      <SEOHead />
      <main className="bg-zinc-50 min-h-screen pt-2">
        <BannerHero />
        {config?.secciones_destacadas.map((sec, i) => (
          <SectionDestacada seccion={sec} key={i} />
        ))}
        <section
          ref={formRef}
          id="turnos"
          className={`max-w-4xl mx-auto my-16 transition-all duration-700 ${
            formVisible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-zinc-900">Reservá tu turno</h2>
          <GoogleFormEmbed formUrl={GOOGLE_FORM_URL} />
          <p className="mx-auto mt-3 max-w-lg text-center text-gray-600 text-md">
            Al reservar, tus datos serán gestionados por la cuenta Google <b>{config?.google_workspace_account}</b> en el proyecto <b>{config?.google_project_id}</b>.
          </p>
        </section>
      </main>
    </>
  );
};

export default Home;
