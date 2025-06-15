
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";

const BannerHero = () => {
  const { config } = useBusiness();
  const banner = config?.banner_principal;
  if (!banner?.activo) return null;

  return (
    <section
      className="relative w-full max-w-7xl mx-auto mt-6 overflow-hidden rounded-xl shadow"
      style={{ background: "#fafbfc", minHeight: 320 }}
    >
      <img
        src={banner.imagen_url}
        alt={banner.alt_text}
        className="absolute object-cover w-full h-full top-0 left-0 opacity-30"
        style={{ zIndex: 0 }}
        loading="lazy"
      />
      <div className="px-8 py-14 relative z-10 max-w-lg" style={{ color: "#222" }}>
        <h1 className="text-4xl font-black mb-2">{banner.titulo}</h1>
        {banner.subtitulo && (
          <p className="text-lg mb-6 font-semibold text-gray-700">{banner.subtitulo}</p>
        )}
        {banner.texto_boton && banner.link_boton && (
          <Link to={banner.link_boton}>
            <button
              className="bg-black text-white px-6 py-2 rounded-full font-semibold text-base shadow hover:scale-105 transition"
              style={{ background: "#222", marginTop: 8 }}
            >
              {banner.texto_boton}
            </button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default BannerHero;
