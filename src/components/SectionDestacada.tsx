
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

const SectionDestacada: React.FC<SectionDestacadaProps> = ({ seccion }) => {
  const { contenido, loading, error, config } = useBusiness();
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();

  if (loading || !contenido) return null;
  if (error) return <div className="text-red-700">{error}</div>;

  let items: ContenidoItem[] = contenido;
  if (seccion.criterio === "populares") {
    items = contenido.slice(0, seccion.limite);
  }

  return (
    <section
      ref={ref}
      className={`max-w-6xl mx-auto mt-16 mb-10 px-4 md:px-0 transition-all duration-700
        ${revealed ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"}`}
    >
      <h2 className="text-3xl font-bold mb-8 tracking-tight text-zinc-900">{seccion.titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <Link
            to={`/servicios/${item.slug_url}`}
            key={item.id}
            className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition hover:scale-[1.025]
              ${revealed ? "animate-slide-in-right opacity-100" : "opacity-0 translate-x-8"}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <img
              src={item.imagenes[0]?.url}
              alt={item.imagenes[0]?.alt}
              className="rounded-t-2xl mb-0 w-full object-cover h-48 border-b border-zinc-200"
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
              <button className="mt-4 px-4 py-2 rounded-full bg-zinc-900 text-white font-medium text-sm shadow hover:bg-zinc-700 transition">
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
