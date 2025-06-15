
import { useBusiness, ContenidoItem } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

interface SectionDestacadaProps {
  seccion: {
    titulo: string;
    criterio: string;
    limite: number;
  };
}

// Simulación: Si el item no trae .reservas, asignar un valor random fijo para ejemplificar.
// En producción, tu backend debe agregar el valo real de “reservas” a cada servicio.
function withReservas(items: ContenidoItem[]): (ContenidoItem & { reservas: number })[] {
  // Asignamos un valor fijo por id para la demo – reproducible
  return items.map((item, i) => ({
    ...item,
    reservas: i === 0 ? 30 : i === 1 ? 25 : 10 + i * 3 // Primeros dos: más populares
  }));
}

const SectionDestacada: React.FC<SectionDestacadaProps> = ({ seccion }) => {
  const { contenido, loading, error, config } = useBusiness();
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  if (loading || !contenido) return null;
  if (error) return <div className="text-red-700">{error}</div>;

  let items: ContenidoItem[] = contenido;

  if (seccion.criterio === "populares") {
    // Simula campo reservas para ejemplo:
    const withR = withReservas(contenido);
    // Ordena por más reservas y toma los primeros N (limite)
    items = withR
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, seccion.limite);
  }

  return (
    <section
      ref={ref}
      className={`max-w-6xl mx-auto mt-16 mb-10 px-4 md:px-0 transition-all duration-700 ${
        revealed ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"
      }`}
    >
      <h2 className="text-3xl font-bold mb-8 tracking-tight text-zinc-900 animate-fade-in" style={{ transitionDelay: "120ms" }}>
        {seccion.titulo}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <Link
            to={`/servicios/${item.slug_url}`}
            key={item.id}
            className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300 animate-slide-in-right ${
              revealed ? "opacity-100" : "opacity-0 translate-x-8"
            }`}
            style={{ animationDelay: `${180 + i * 100}ms` }}
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
                  <span className="line-through text-sm text-zinc-400">{config?.moneda_simbolo}{item.precio}</span>
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
  );
};

export default SectionDestacada;

