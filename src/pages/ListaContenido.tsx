
import { useParams } from "react-router-dom";
import SectionDestacada from "@/components/SectionDestacada";
import SEOHead from "@/components/SEOHead";
import { useBusiness } from "@/context/BusinessContext";

const ListaContenido = () => {
  const { contenido, config } = useBusiness();
  // Remueve el filtro por “tipo”, ya que queremos siempre mostrar TODOS los servicios:
  // const { tipo } = useParams<{ tipo: string }>();
  if (!contenido || !config) return null;

  // Mostrar todos los servicios/productos disponibles (sin filtro de populares)
  const items = contenido; 

  return (
    <>
      <SEOHead
        title={`Servicios | ${config.nombre_negocio}`}
        description={config.meta_descripcion}
      />
      <main className="max-w-5xl mx-auto pt-12">
        <h1 className="text-3xl font-bold mb-6">
          Nuestros Servicios
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded shadow p-6">
              <img
                src={item.imagenes[0]?.url}
                alt={item.imagenes[0]?.alt}
                className="rounded mb-3 object-cover h-40 w-full"
                loading="lazy"
              />
              <h2 className="text-lg font-bold mb-2">{item.nombre}</h2>
              <p className="mb-2">{item.descripcion_breve}</p>
              <div className="font-semibold text-blue-900">
                {config.moneda_simbolo}
                {item.precio_oferta ?? item.precio}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default ListaContenido;
