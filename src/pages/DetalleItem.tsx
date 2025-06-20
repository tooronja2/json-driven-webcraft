
import { useParams } from "react-router-dom";
import { useBusiness } from "@/context/BusinessContext";
import SEOHead from "@/components/SEOHead";

const DetalleItem = () => {
  const { contenido, config } = useBusiness();
  const { slug } = useParams<{ slug: string }>();
  if (!contenido || !config) return null;

  const item = contenido.find(i => i.slug_url === slug);
  if (!item) return <div className="max-w-xl mx-auto text-red-600 font-semibold mt-6">Recurso no encontrado.</div>;

  return (
    <>
      <SEOHead
        title={item.seo_titulo}
        description={item.seo_descripcion}
        ogImage={item.imagenes[0]?.url}
        canonical={`${window.location.origin}/servicios/${item.slug_url}`}
      />
      <main className="max-w-4xl mx-auto py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <img
            src={item.imagenes[0]?.url}
            alt={item.imagenes[0]?.alt}
            className="w-full max-w-xs object-cover rounded-xl shadow mb-4"
            loading="lazy"
          />
          <div>
            <h1 className="text-3xl font-bold mb-3">{item.nombre}</h1>
            <p className="text-md mb-2 text-gray-700">{item.descripcion_larga}</p>
            <div className="mt-2 mb-6">
              <span className="text-lg font-bold" style={{ color: config.colores_tema.primario }}>
                {config.moneda_simbolo}{item.precio_oferta ?? item.precio}
              </span>
              {item.precio_oferta && (
                <span className="ml-2 line-through text-gray-500 text-sm">{config.moneda_simbolo}{item.precio}</span>
              )}
            </div>
            <ul className="mb-2">
              <li><b>Duración:</b> {item.detalles?.duracion}</li>
              <li><b>Incluye:</b> {item.detalles?.incluye?.join(", ")}</li>
              {item.detalles?.requisitos && (
                <li><b>Requisitos:</b> {item.detalles.requisitos}</li>
              )}
            </ul>
            <div className="mt-2">
            {item.etiquetas && item.etiquetas.map(tag => (
              <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 mr-2 mb-2 rounded text-sm" key={tag}>
                #{tag}
              </span>
            ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DetalleItem;
