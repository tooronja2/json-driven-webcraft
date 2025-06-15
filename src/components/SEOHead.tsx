
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
  const { config } = useBusiness();
  const location = useLocation();
  if (!config) return null;

  const seo = config.seo_configuracion;
  const resolvedTitle = title || config.meta_titulo;
  const resolvedDesc = description || config.meta_descripcion;
  const resolvedKeywords = keywords || config.meta_keywords;
  const resolvedOG = ogImage || seo.og_image;
  const url =
    canonical ||
    `${window.location.origin}${location.pathname}`.replace(/\/$/, "");

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
      <meta name="twitter:card" content={seo.twitter_card || "summary_large_image"} />
      {seo.favicon_url && <link rel="icon" href={seo.favicon_url} />}
    </Helmet>
  );
};

export default SEOHead;
