
import React from "react";

const reseñas = [
  {
    autor: "Juan Pérez",
    comentario: "¡Excelente atención! Muy buenos cortes.",
    puntuacion: 5,
  },
  {
    autor: "Roxana Díaz",
    comentario: "Siempre puntuales y profesionales.",
    puntuacion: 4,
  },
  {
    autor: "Martín Gonzalez",
    comentario: "Recomiendo el combo corte y barba, quedó genial.",
    puntuacion: 5,
  },
];

const Estrellas = ({ cantidad }: { cantidad: number }) => (
  <span>{'★'.repeat(cantidad)}{'☆'.repeat(5 - cantidad)}</span>
);

const Resenas = () => (
  <main className="max-w-xl mx-auto py-10 px-4">
    <h1 className="text-2xl font-bold mb-6">Reseñas</h1>
    <div className="space-y-5">
      {reseñas.map((r, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-5">
          <div className="font-semibold text-zinc-700 mb-1">{r.autor}</div>
          <div className="text-yellow-500 mb-2"><Estrellas cantidad={r.puntuacion} /></div>
          <p className="text-zinc-600">{r.comentario}</p>
        </div>
      ))}
    </div>
  </main>
);

export default Resenas;
