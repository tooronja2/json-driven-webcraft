
import { BusinessProvider, useBusiness } from "@/context/BusinessContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Outlet } from "react-router-dom";
import React from "react";

function BusinessErrorBoundary() {
  const { error, loading } = useBusiness();

  // Si está cargando, placeholder
  if (loading)
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="animate-pulse text-lg text-zinc-500 mb-4">Cargando configuración...</div>
        <div className="rounded-xl bg-zinc-200 h-8 w-56 mb-2 animate-pulse"></div>
        <div className="rounded-xl bg-zinc-100 h-8 w-32 animate-pulse"></div>
      </div>
    );

  // Si hay error, SIEMPRE feedback visible
  if (error)
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-red-50">
        <div className="text-3xl font-bold text-red-700 mb-2">¡Ups!</div>
        <div className="text-lg text-red-600 mb-4">Error al cargar configuración del sitio.</div>
        <code className="bg-red-100 rounded px-6 py-2 font-mono text-red-700">{error}</code>
        <div className="mt-10 text-sm text-zinc-500">Contactá al administrador para verificar que los archivos <b>/public/data/config_general.json</b> y <b>/public/data/servicios.json</b> existen y son accesibles.</div>
      </div>
    );

  // Caso normal
  return (
    <>
      <GoogleAnalytics />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

const Index = () => (
  <BusinessProvider>
    <BusinessErrorBoundary />
  </BusinessProvider>
);

export default Index;

