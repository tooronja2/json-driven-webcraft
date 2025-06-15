
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { config } = useBusiness();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!config) return null;

  if (isMobile) {
    return (
      <header
        className="w-full border-b bg-white sticky top-0 z-50"
        style={{ borderColor: config.colores_tema.primario }}
      >
        <nav className="flex justify-between items-center max-w-5xl mx-auto py-3 px-4">
          <div className="flex items-center gap-2 font-bold text-lg" style={{ color: config.colores_tema.primario }}>
            {config.nombre_negocio}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2" style={{ color: config.colores_tema.primario }}>
                <Menu size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {config.menu_navegacion.map((item, i) => {
                const url =
                  item.texto.trim().toLowerCase() === "reserva tu turno"
                    ? "/reservar-turno"
                    : item.url;
                return (
                  <DropdownMenuItem key={i} asChild>
                    <Link
                      to={url}
                      className="w-full cursor-pointer"
                      style={{ color: config.colores_tema.primario }}
                    >
                      {item.texto === "Reserva tu Turno" ? "Reservar" : item.texto}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>
    );
  }

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
          {config.menu_navegacion.map((item, i) => {
            const url =
              item.texto.trim().toLowerCase() === "reserva tu turno"
                ? "/reservar-turno"
                : item.url;
            return (
              <li key={i}>
                <Link
                  to={url}
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
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
