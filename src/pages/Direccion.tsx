
import React from "react";
import { useBusiness } from "@/context/BusinessContext";

const Direccion = () => {
  const { config } = useBusiness();
  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">¿Dónde estamos?</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="font-semibold">{config?.direccion_fisica}</div>
        <div className="text-zinc-700 mt-2">{config?.telefono_contacto}</div>
        <div className="text-zinc-700">{config?.email_contacto}</div>
      </div>
    </main>
  );
};

export default Direccion;
