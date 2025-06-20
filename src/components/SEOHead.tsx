
import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { useBusiness } from "@/context/BusinessContext";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  canonical,
}) => {
  const location = useLocation();
  
  // Try to get business config, but handle cases where BusinessProvider is not available
  let config = null;
  try {
    const businessContext = useBusiness();
    config = businessContext.config;
  } catch (error) {
    // Component is being used outside BusinessProvider, use fallback values
    config = null;
  }

  // Use provided props or fallback values when business config is not available
  const resolvedTitle = title || config?.meta_titulo || "Barbería Estilo - Sistema PWA";
  const resolvedDesc = description || config?.meta_descripcion || "Sistema de gestión interno PWA para empleados de Barbería Estilo";
  const resolvedKeywords = keywords || config?.meta_keywords || "barbería, gestión, pwa, empleados";
  const resolvedOG = ogImage || config?.seo_configuracion?.og_image || "/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png";
  const url = canonical || `${window.location.origin}${location.pathname}`.replace(/\/$/, "");

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDesc} />
      <meta name="keywords" content={resolvedKeywords} />
      <link rel="canonical" href={url} />
      {/* OG / Twitter */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta property="og:image" content={resolvedOG} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content={config?.seo_configuracion?.twitter_card || "summary_large_image"} />
      {config?.seo_configuracion?.favicon_url && <link rel="icon" href={config.seo_configuracion.favicon_url} />}
    </Helmet>
  );
};

export default SEOHead;
