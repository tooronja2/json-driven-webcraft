
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const BannerHero = () => {
  const { config } = useBusiness();
  const banner = config?.banner_principal;
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  if (!banner?.activo) return null;

  return (
    <section
      ref={ref}
      className={`relative w-full max-w-7xl mx-auto mt-8 mb-10 overflow-hidden rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-stretch bg-zinc-900 transition-all duration-700
        ${revealed ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"}`}
      style={{ minHeight: 390 }}
    >
      {/* Fondo de imagen con gradiente superpuesto */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={banner.imagen_url}
          alt={banner.alt_text}
          className="object-cover w-full h-full brightness-85"
          loading="lazy"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-transparent" />
      </div>

      {/* Contenido de texto */}
      <div className="relative z-10 flex flex-col justify-center px-8 py-16 md:px-16 w-full md:max-w-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white drop-shadow">
          {banner.titulo}
        </h1>
        {banner.subtitulo && (
          <p className="text-lg md:text-2xl mb-8 font-medium text-zinc-200 drop-shadow-sm">
            {banner.subtitulo}
          </p>
        )}
        {banner.texto_boton && banner.link_boton && (
          <Link to={banner.link_boton} className="self-start">
            <button
              className="bg-white/95 text-zinc-900 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-zinc-200 transition-all border border-white/70"
              style={{ marginTop: 8 }}
            >
              {banner.texto_boton}
            </button>
          </Link>
        )}
      </div>

      {/* Imagen destacada a derecha para desktop, oculta en mobile */}
      <div className="hidden md:block relative w-[45%] z-10">
        <img
          src={banner.imagen_url}
          alt={banner.alt_text}
          className="h-full object-cover w-full rounded-r-2xl shadow-xl"
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default BannerHero;
