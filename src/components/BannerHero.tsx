
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import React, { useMemo } from "react";

const BannerHero = () => {
  const { config, loading, error } = useBusiness();
  const banner = config?.banner_principal;
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  // Placeholder
  if (loading || !config) {
    return (
      <section
        className="relative w-full max-w-7xl mx-auto mt-8 mb-10 overflow-hidden rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-stretch bg-zinc-300 animate-pulse"
        style={{ minHeight: 390 }}
        aria-label="banner loading"
      >
        <div className="flex-1 flex flex-col justify-center px-8 py-16 md:px-16 w-full md:max-w-xl">
          <div className="h-9 w-60 mb-2 bg-zinc-200 rounded animate-pulse" />
          <div className="h-7 w-40 mb-8 bg-zinc-200 rounded animate-pulse" />
          <div className="h-12 w-44 bg-zinc-300 rounded-full animate-pulse" />
        </div>
        <div className="hidden md:block w-[45%]">
          <div className="h-full w-full bg-zinc-200 animate-pulse rounded-r-2xl" />
        </div>
      </section>
    );
  }

  // Si hay error o el banner no está activo, área continua
  if (error || !banner?.activo) {
    return (
      <section
        className="w-full max-w-7xl mx-auto mt-8 mb-10 min-h-[390px] bg-zinc-50"
        aria-label="sin banner"
      ></section>
    );
  }

  // Animación
  const animSection = useMemo(() => (
    revealed ? "animate-fade-in opacity-100" : "opacity-0 translate-y-12"
  ), [revealed]);

  // Corrección de navegación para el botón
  let linkDestino = banner.link_boton;
  let botonTexto = banner.texto_boton?.trim().toLowerCase();
  if (botonTexto === "reservar turno" || botonTexto === "reservá tu turno") {
    linkDestino = "/reservar-turno"; // Si el botón indica reservar, siempre navega correctamente
  }

  return (
    <section
      ref={ref}
      className={`relative w-full max-w-7xl mx-auto mt-8 mb-10 overflow-hidden rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-stretch bg-zinc-900 transition-all duration-700 ${animSection}`}
      style={{ minHeight: 390 }}
      aria-label="banner"
    >
      {/* Fondo de imagen */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img
          src={banner.imagen_url}
          alt={banner.alt_text}
          className="object-cover w-full h-full brightness-85 scale-105 transition-transform duration-700"
          loading="lazy"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-transparent" />
      </div>
      {/* Contenido de texto */}
      <div className="relative z-10 flex flex-col justify-center px-8 py-16 md:px-16 w-full md:max-w-xl">
        <h1
          className={`text-4xl md:text-5xl font-extrabold mb-2 text-white drop-shadow transition-all duration-700 ${
            revealed ? "animate-slide-in-right" : "opacity-0 -translate-x-6"
          }`}
          style={{ transitionDelay: revealed ? "100ms" : "0ms" }}
        >
          {banner.titulo}
        </h1>
        {banner.subtitulo && (
          <p
            className={`text-lg md:text-2xl mb-8 font-medium text-zinc-200 drop-shadow-sm transition-all duration-700 ${
              revealed ? "animate-fade-in" : "opacity-0"
            }`}
            style={{ transitionDelay: revealed ? "250ms" : "0ms" }}
          >
            {banner.subtitulo}
          </p>
        )}
        {banner.texto_boton && linkDestino && (
          <Link to={linkDestino} className="self-start">
            <button
              className="bg-white/95 text-zinc-900 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:scale-105 hover:bg-zinc-200 active:scale-100 border border-white/70 transition-all focus:outline-none focus:ring-4 focus:ring-zinc-300 animate-pulseButton"
              style={{ marginTop: 8, transitionDelay: revealed ? "350ms" : "0ms" }}
            >
              {banner.texto_boton}
            </button>
          </Link>
        )}
      </div>
      {/* Imagen destacada */}
      <div className="hidden md:block relative w-[45%] z-10">
        <img
          src={banner.imagen_url}
          alt={banner.alt_text}
          className={`h-full object-cover w-full rounded-r-2xl shadow-xl transition-all duration-1000 ${
            revealed ? "scale-100 animate-scale-in opacity-100" : "scale-95 opacity-0"
          }`}
          loading="lazy"
          style={{ transitionDelay: revealed ? "400ms" : "0ms" }}
        />
      </div>
    </section>
  );
};

export default BannerHero;
