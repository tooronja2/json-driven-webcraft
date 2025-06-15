
import SEOHead from "@/components/SEOHead";
import BannerHero from "@/components/BannerHero";
import SectionDestacada from "@/components/SectionDestacada";
import { Link } from "react-router-dom";
import { useBusiness } from "@/context/BusinessContext";

const Home = () => {
  const { config } = useBusiness();

  return (
    <>
      <SEOHead />
      <main className="bg-zinc-50 min-h-screen pt-2">
        <BannerHero />
        {config?.secciones_destacadas.map((sec, i) => (
          <SectionDestacada seccion={sec} key={i} />
        ))}
        <section className="max-w-4xl mx-auto my-20 flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 text-center text-zinc-900">¿Querés reservar un turno?</h2>
          <Link to="/reservar-turno">
            <button
              className="bg-zinc-900 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-zinc-800 hover:scale-105 transition-all animate-pulseButton"
              style={{ minWidth: 230 }}
            >
              Reservá tu turno
            </button>
          </Link>
        </section>
      </main>
    </>
  );
};

export default Home;
