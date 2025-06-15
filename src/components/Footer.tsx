
import { useBusiness } from "@/context/BusinessContext";

const Footer = () => {
  const { config } = useBusiness();
  if (!config) return null;

  return (
    <footer className="w-full border-t" style={{ borderColor: config.colores_tema.primario, background: config.colores_tema.secundario }}>
      <div className="max-w-5xl mx-auto py-7 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-semibold text-md" style={{ color: config.colores_tema.primario }}>
          {config.nombre_negocio} &copy; {new Date().getFullYear()}
        </span>
        <div className="flex gap-4">
          {config.footer_links.map((l, i) => (
            <a key={i} href={l.url} className="hover:underline text-sm font-semibold" style={{ color: config.colores_tema.primario }}>
              {l.texto}
            </a>
          ))}
        </div>
        <div className="flex gap-3">
          {config.links_redes_sociales.instagram && (
            <a href={config.links_redes_sociales.instagram} target="_blank" rel="noopener noreferrer">
              <img src="/instagram.svg" alt="Instagram" className="h-6 w-6" />
            </a>
          )}
          {config.links_redes_sociales.facebook && (
            <a href={config.links_redes_sociales.facebook} target="_blank" rel="noopener noreferrer">
              <img src="/facebook.svg" alt="Facebook" className="h-6 w-6" />
            </a>
          )}
          {config.links_redes_sociales.tiktok && (
            <a href={config.links_redes_sociales.tiktok} target="_blank" rel="noopener noreferrer">
              <img src="/tiktok.svg" alt="Tiktok" className="h-6 w-6" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
