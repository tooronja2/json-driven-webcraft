
import { useBusiness } from "@/context/BusinessContext";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Nuevo menú principal en el orden correcto (Inicio primero) ---
const orderedMenu = [
  { texto: "Inicio", url: "/" },
  { texto: "Equipo", url: "/equipo" },
  { texto: "Reseñas", url: "/resenas" },
  { texto: "Reserva tu Turno", url: "/reservar-turno" },
  { texto: "Contacto", url: "/contacto" },
];

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
            <DropdownMenuContent align="end" className="w-48 z-50 bg-white">
              {orderedMenu.map((item, i) => (
                <DropdownMenuItem key={i} asChild>
                  <Link
                    to={item.url}
                    className="w-full cursor-pointer"
                    style={{ color: config.colores_tema.primario }}
                  >
                    {/* Para UX: Mostrar "Reservar" en vez de "Reserva tu Turno" en el menú mobile */}
                    {item.texto === "Reserva tu Turno" ? "Reservar" : item.texto}
                  </Link>
                </DropdownMenuItem>
              ))}
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
        <ul className="flex items-center gap-12">
          {orderedMenu.map((item, i) => (
            <li key={i}>
              <Link
                to={item.url}
                className="hover:underline transition-all text-xl"
                style={{ color: config.colores_tema.primario }}
              >
                {item.texto}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
