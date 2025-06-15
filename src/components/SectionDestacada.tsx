
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
      className={`max-w-5xl mx-auto mt-12 mb-6 transition-all duration-700 ${
        revealed ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"
      }`}
    >
      <h2 className="text-2xl font-bold mb-5 tracking-tight">{seccion.titulo}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, i) => (
          <Link
            to={`/servicios/${item.slug_url}`}
            key={item.id}
            className={`group bg-white rounded-lg shadow p-6 hover:shadow-lg transition 
              ${revealed ? "animate-slide-in-right opacity-100" : "opacity-0 translate-x-8"}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <img
              src={item.imagenes[0]?.url}
              alt={item.imagenes[0]?.alt}
              className="rounded-md mb-4 w-full object-cover h-44"
              loading="lazy"
            />
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">
                {item.nombre}
                {item.en_oferta && (
                  <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 rounded-full font-semibold">
                    Oferta!
                  </span>
                )}
              </h3>
              <div className="text-md text-gray-700">{item.descripcion_breve}</div>
              <div className="mt-1 flex gap-2 items-center text-base">
                <span className="font-bold" style={{ color: config?.colores_tema.primario }}>
                  {config?.moneda_simbolo}
                  {item.precio_oferta ?? item.precio}
                </span>
                {item.precio_oferta && (
                  <span className="line-through text-sm text-gray-400">{config?.moneda_simbolo}{item.precio}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SectionDestacada;
