
import React from "react";
import { useBusiness } from "@/context/BusinessContext";

const Servicios = () => {
  const { contenido, config } = useBusiness();
  if (!contenido || !config) return null;

  return (
    <main className="max-w-2xl mx-auto pt-10 px-4 mb-12">
      <h1 className="text-2xl font-bold mb-6">Servicios</h1>
      <div className="flex flex-col gap-3">
        {contenido.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-4 rounded-xl border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50 shadow transition cursor-pointer">
            <img src={item.imagenes[0]?.url} alt={item.nombre} className="h-14 w-14 rounded object-cover" />
            <div className="flex-1">
              <div className="font-semibold">{item.nombre}</div>
              <div className="text-xs text-gray-500">{item.detalles?.duracion || "15min"}</div>
            </div>
            <div className="font-bold text-zinc-700">{config.moneda_simbolo}{item.precio_oferta ?? item.precio}</div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Servicios;
