
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { config } = useBusiness();
  if (!config) return null;

  return (
    <header
      className="w-full border-b bg-white sticky top-0 z-50"
      style={{ borderColor: config.colores_tema.primario }}
    >
      <nav className="flex justify-between max-w-5xl mx-auto py-3 px-4">
        <div className="flex items-center gap-2 font-bold text-xl" style={{ color: config.colores_tema.primario }}>
          {config.nombre_negocio}
        </div>
        <ul className="flex items-center gap-6">
          {config.menu_navegacion.map((item, i) => (
            <li key={i}>
              <Link
                to={item.url}
                className="hover:underline transition-all text-base"
                style={{ color: config.colores_tema.primario }}
              >
                {item.texto}
              </Link>
              {item.subcategorias && (
                <ul className="ml-2">
                  {item.subcategorias.map((sub, j) => (
                    <li key={j}>
                      <Link to={sub.url} className="text-sm hover:underline" style={{ color: config.colores_tema.secundario }}>
                        {sub.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
