
import React from "react";
import { useBusiness } from "@/context/BusinessContext";
import { useNavigate } from "react-router-dom";

const CORTE_BARBA_IMG = "/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png";
const CORTE_PELO_BARBA_IMG = "/lovable-uploads/c749b507-8002-4fd8-9d5d-20b9c3903632.png";
const BARBERIA_IMAGES = [
  CORTE_BARBA_IMG,
  "/lovable-uploads/fc94f399-5202-49cf-8b59-4e5432fc8431.png",
  "/lovable-uploads/a0053cdf-42ff-4f6f-bf69-cd415ed3e773.png",
  "/lovable-uploads/6eb39621-7c2f-44a9-b43b-937dab14bcc2.png",
  "/lovable-uploads/1bbc1778-07ae-4750-ba3c-20216d2b8c60.png",
];

const Servicios = () => {
  const { contenido, config } = useBusiness();
  const navigate = useNavigate();
  if (!contenido || !config) return null;

  const handleSeleccionarServicio = (servicioId: string) => {
    localStorage.setItem("servicioSeleccionado", servicioId);
    navigate("/reservar-turno");
  };

  return (
    <main className="max-w-2xl mx-auto pt-10 px-4 mb-12">
      <h1 className="text-2xl font-bold mb-6">Servicios</h1>
      <div className="flex flex-col gap-3">
        {contenido.map((item, idx) => {
          // Lógica de imagen igual a ReservaTurno
          const imgSrc =
            item.id === "corte-barba"
              ? CORTE_BARBA_IMG
              : item.id === "corte-pelo-barba"
              ? CORTE_PELO_BARBA_IMG
              : BARBERIA_IMAGES[idx % BARBERIA_IMAGES.length];

          return (
            <button
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50 shadow cursor-pointer transition"
              onClick={() => handleSeleccionarServicio(item.id)}
              style={{ textAlign: "left" }}
            >
              <img src={imgSrc} alt={item.nombre} className="h-14 w-14 rounded object-cover" />
              <div className="flex-1">
                <div className="font-semibold">{item.nombre}</div>
                <div className="text-xs text-gray-500">{item.detalles?.duracion || "15min"}</div>
              </div>
              <div className="font-bold text-zinc-700">
                {config.moneda_simbolo}
                {item.precio_oferta ?? item.precio}
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
};

export default Servicios;
