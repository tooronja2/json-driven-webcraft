import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";

const BannerHero = () => {
  const { config } = useBusiness();

  return (
    <div className="relative w-full bg-zinc-900 mb-3 mt-2 rounded-xl overflow-hidden shadow-xl max-w-6xl mx-auto">
      {/* Imagen de fondo NUEVA (foto del local) */}
      <img 
        src="/lovable-uploads/c3696121-578a-4be5-b41c-0c2ba0298c01.png"
        alt="Foto del local"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        loading="eager"
      />

      {/* Overlay semi-transparente */}
      <div className="absolute inset-0 bg-zinc-900 opacity-30"></div>

      {/* Contenido del banner */}
      <div className="relative p-8 md:p-12 lg:p-16 flex flex-col items-start justify-center h-full text-white">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 tracking-tight">
          {config?.banner_principal.titulo}
        </h1>
        <p className="text-lg md:text-xl mb-5 md:mb-7">
          {config?.banner_principal.subtitulo}
        </p>
        <Link to={config?.banner_principal.link_boton || "/"}>
          <button className="bg-white text-zinc-900 px-6 py-3 rounded-full text-base font-semibold shadow-md hover:bg-zinc-100 transition-colors">
            {config?.banner_principal.texto_boton}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BannerHero;
