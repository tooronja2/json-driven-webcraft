
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Tipos principales
interface Banner {
  activo: boolean;
  imagen_url: string;
  alt_text: string;
  titulo: string;
  subtitulo?: string;
  texto_boton?: string;
  link_boton?: string;
}
interface SeccionDestacada { titulo: string; criterio: string; limite: number }
interface MenuNav { texto: string; url: string; subcategorias?: { texto: string; url: string }[] }
interface FooterLink { texto: string; url: string }
interface RedesSociales { instagram?: string; facebook?: string; tiktok?: string }

export interface StaffMember {
  nombre: string;
  foto: string;
  email: string;
  calendarUrl: string;
}

export interface ConfigGeneral {
  nombre_negocio: string;
  meta_titulo: string;
  meta_descripcion: string;
  meta_keywords: string;
  telefono_contacto: string;
  email_contacto: string;
  direccion_fisica: string;
  whatsapp_numero: string;
  google_analytics_id: string;
  banner_principal: Banner;
  seo_configuracion: {
    favicon_url: string;
    og_image: string;
    twitter_card?: string;
    sitemap_activo: boolean;
    robots_txt_personalizado?: string;
  };
  secciones_destacadas: SeccionDestacada[];
  links_redes_sociales: RedesSociales;
  menu_navegacion: MenuNav[];
  footer_links: FooterLink[];
  moneda_simbolo: string;
  colores_tema: { primario: string; secundario: string };
  google_workspace_account: string;
  google_project_id: string;
}

// Servicio/Producto
export interface ContenidoItem {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  precio_oferta?: number | null;
  en_oferta: boolean;
  descripcion_breve: string;
  descripcion_larga?: string;
  seo_titulo: string;
  seo_descripcion: string;
  imagenes: { url: string; alt: string }[];
  disponible: boolean;
  detalles?: {
    duracion?: string;
    incluye?: string[];
    requisitos?: string;
  };
  etiquetas?: string[];
  slug_url: string;
}

// Contexto / Hook
interface BusinessContextType {
  config: ConfigGeneral | null;
  contenido: ContenidoItem[] | null;
  staff: StaffMember[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ConfigGeneral | null>(null);
  const [contenido, setContenido] = useState<ContenidoItem[] | null>(null);
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Carga y validación
  const fetchJSON = async (url: string) => {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error al cargar: ${url}`);
    return await resp.json();
  };

  const validateConfig = (json: any): ConfigGeneral => {
    // Validación básica (podrías hacer más profunda usando zod en versiones futuras)
    if (!json.nombre_negocio || !json.meta_titulo) throw new Error("config_general.json incompleto.");
    return json as ConfigGeneral;
  };

  const validateContenido = (data: any): ContenidoItem[] => {
    if (!Array.isArray(data)) throw new Error("Contenido no es array");
    return data as ContenidoItem[];
  };

  const validateStaff = (data: any): StaffMember[] => {
    if (!Array.isArray(data)) throw new Error('Staff no es array');
    return data as StaffMember[];
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [configData, contenidoData, staffData] = await Promise.all([
        fetchJSON('/data/config_general.json'),
        fetchJSON('/data/servicios.json'),
        fetchJSON('/data/staff.json')
      ]);
      setConfig(validateConfig(configData));
      setContenido(validateContenido(contenidoData));
      setStaff(validateStaff(staffData));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const value: BusinessContextType = {
    config,
    contenido,
    staff,
    loading,
    error,
    reload: loadAll,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness debe usarse dentro de BusinessProvider");
  return ctx;
}
