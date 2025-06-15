
import SEOHead from "@/components/SEOHead";
import BannerHero from "@/components/BannerHero";
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const Home = () => {
  const { config, contenido, loading, error } = useBusiness();
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  return (
    <>
      <SEOHead />
      <main className="bg-zinc-50 min-h-screen pt-2 flex flex-col gap-4">
        <BannerHero />
        {/* Mostrar todos los servicios */}
        <section
          ref={ref}
          className={`max-w-6xl mx-auto mt-10 mb-10 px-4 md:px-0 transition-all duration-700
          ${revealed ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"}
        `}
        >
          <h2 className="text-3xl font-bold mb-8 tracking-tight text-center text-zinc-900 animate-fade-in" style={{ transitionDelay: "120ms" }}>
            Nuestros Servicios
          </h2>
          {loading && <div className="text-center py-6 text-zinc-500">Cargando servicios...</div>}
          {error && <div className="text-center text-red-700">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {contenido &&
              contenido.map((item, i) => (
                <Link
                  to={`/servicios/${item.slug_url}`}
                  key={item.id}
                  className={`
                    group bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300
                    ${revealed ? "animate-fade-in animate-slide-in-right animate-scale-in opacity-100" : "opacity-0 translate-x-8"}
                  `}
                  style={{ animationDelay: `${180 + i * 120}ms` }}
                >
                  <img
                    src={item.imagenes[0]?.url}
                    alt={item.imagenes[0]?.alt}
                    className="rounded-t-2xl mb-0 w-full object-cover h-48 border-b border-zinc-200 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="text-xl font-semibold text-zinc-800 flex items-center gap-2">
                      {item.nombre}
                      {item.en_oferta && (
                        <span className="ml-1 px-2 py-0.5 text-xs text-green-700 bg-green-100 rounded-full font-semibold">
                          Oferta!
                        </span>
                      )}
                    </h3>
                    <div className="text-zinc-600 text-base mb-2 min-h-[40px]">{item.descripcion_breve}</div>
                    <div className="mt-2 flex gap-2 items-center text-lg">
                      <span className="font-bold" style={{ color: config?.colores_tema.primario }}>
                        {config?.moneda_simbolo}
                        {item.precio_oferta ?? item.precio}
                      </span>
                      {item.precio_oferta && (
                        <span className="line-through text-sm text-zinc-400">
                          {config?.moneda_simbolo}
                          {item.precio}
                        </span>
                      )}
                    </div>
                    <button className="mt-4 px-4 py-2 rounded-full bg-zinc-900 text-white font-medium text-sm shadow hover:bg-zinc-700 transition focus:ring-2 focus:ring-primary animate-pulseButton">
                      Reservar
                    </button>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Banner de Reservar Turno */}
        <section className="max-w-4xl mx-auto my-14 flex flex-col items-center justify-center py-10">
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

        {/* Dirección abajo de todo */}
        {config && (
          <section className="max-w-xl mx-auto mb-8 px-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-2 text-zinc-800">¿Dónde estamos?</h3>
              <div className="font-semibold">{config?.direccion_fisica}</div>
              <div className="text-zinc-700 mt-2">{config?.telefono_contacto}</div>
              <div className="text-zinc-700">{config?.email_contacto}</div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default Home;
