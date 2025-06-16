
import React from "react";
import { useBusiness } from "@/context/BusinessContext";

const Equipo = () => {
  const { staff } = useBusiness();
  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Nuestro equipo</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {staff?.map((s, i) => (
          <div key={i} className="flex flex-col items-center bg-white rounded-xl shadow-md p-4 gap-2 hover:scale-105 transition">
            <img src={s.foto} alt={s.nombre} className="w-20 h-20 rounded-full object-cover border-2 border-zinc-300" />
            <div className="mt-2 font-semibold text-zinc-900">{s.nombre}</div>
          </div>
        ))}
      </div>
    </main>
  );
};
export default Equipo;
