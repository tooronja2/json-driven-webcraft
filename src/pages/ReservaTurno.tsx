
import SEOHead from "@/components/SEOHead";
import GoogleFormEmbed from "@/components/GoogleFormEmbed";
import { useBusiness } from "@/context/BusinessContext";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import React, { useEffect, useState } from "react";

const CORTE_BARBA_IMG = "/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png";
const CORTE_PELO_BARBA_IMG = "/lovable-uploads/c749b507-8002-4fd8-9d5d-20b9c3903632.png";

const BARBERIA_IMAGES = [
  CORTE_BARBA_IMG,
  "/lovable-uploads/fc94f399-5202-49cf-8b59-4e5432fc8431.png",
  "/lovable-uploads/a0053cdf-42ff-4f6f-bf69-cd415ed3e773.png",
  "/lovable-uploads/6eb39621-7c2f-44a9-b43b-937dab14bcc2.png",
  "/lovable-uploads/1bbc1778-07ae-4750-ba3c-20216d2b8c60.png",
];

const GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3sGI4BQFEkPUqzsopPtfQ0f3XsWHF1g08G7fqnZC09GqzySxJKFEx_jcpHj-skwEwV0br3bbNX?gv=true&ctz=America/Argentina/Buenos_Aires";

const GOOGLE_CALENDARS = [
  {
    nombre: "Héctor Medina",
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
    calendarUrl:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3sGI4BQFEkPUqzsopPtfQ0f3XsWHF1g08G7fqnZC09GqzySxJKFEx_jcpHj-skwEwV0br3bbNX?gv=true&ctz=America/Argentina/Buenos_Aires",
  },
  {
    nombre: "Lucas Peralta",
    foto: "https://randomuser.me/api/portraits/men/66.jpg",
    calendarUrl:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3sGI4BQFEkPUqzsopPtfQ0f3XsWHF1g08G7fqnZC09GqzySxJKFEx_jcpHj-skwEwV0br3bbNX?gv=true&ctz=America/Argentina/Buenos_Aires",
  },
  {
    nombre: "Camila González",
    foto: "https://randomuser.me/api/portraits/women/68.jpg",
    calendarUrl:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3sGI4BQFEkPUqzsopPtfQ0f3XsWHF1g08G7fqnZC09GqzySxJKFEx_jcpHj-skwEwV0br3bbNX?gv=true&ctz=America/Argentina/Buenos_Aires",
  },
];

const ReservaTurno = () => {
  const { config, contenido } = useBusiness();
  // Leemos la preselección desde localStorage solo UNA vez al arrancar
  const [servicio, setServicio] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const pre = localStorage.getItem("servicioSeleccionado");
      localStorage.removeItem("servicioSeleccionado");
      return pre || null;
    }
    return null;
  });
  // Si hay preseleccion, arrancar paso 2; si no, el 1:
  const [paso, setPaso] = useState<1 | 2 | 3>(servicio ? 2 : 1);
  const [staff, setStaff] = useState<number | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Paso 1: Selección de servicio
  if (paso === 1) {
    return (
      <main className="max-w-sm mx-auto pt-6 pb-12">
        <h1 className="text-2xl font-bold mb-4 text-center">Reservá tu turno</h1>
        <div className="flex flex-col gap-4">
          {contenido?.map((item, idx) => (
            <button
              key={item.id}
              className={`flex items-center gap-4 w-full bg-white px-4 py-3 rounded-xl border shadow hover:bg-gray-100 transition ${servicio === item.id ? "border-blue-400 shadow-lg scale-105" : ""}`}
              onClick={() => { setServicio(item.id); setPaso(2); }}
            >
              <img
                src={
                  item.id === "corte-barba"
                    ? CORTE_BARBA_IMG
                    : item.id === "corte-pelo-barba"
                    ? CORTE_PELO_BARBA_IMG
                    : BARBERIA_IMAGES[idx % BARBERIA_IMAGES.length]
                }
                alt={item.nombre}
                className="h-12 w-12 rounded object-cover border"
              />
              <div>
                <div className="font-semibold">{item.nombre}</div>
                <div className="text-xs text-gray-500">{item.detalles?.duracion || "15min"} · {config?.moneda_simbolo}{item.precio_oferta ?? item.precio}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // Paso 2: Selección de staff
  if (paso === 2 && servicio) {
    const itemSel = contenido?.find((it) => it.id === servicio);
    return (
      <main className="max-w-sm mx-auto pt-6 pb-12">
        <button className="mb-3 text-blue-600 text-sm" onClick={() => setPaso(1)}>← Volver a servicios</button>
        <h2 className="text-xl font-semibold mb-4 text-center">Elegí con quién reservar</h2>
        <div className="flex flex-col gap-4">
          {GOOGLE_CALENDARS.map((s, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-4 w-full bg-white px-4 py-3 rounded-xl border shadow hover:bg-gray-100 transition ${staff === idx ? "border-blue-400 shadow-lg scale-105" : ""}`}
              onClick={() => { setStaff(idx); setPaso(3); }}
            >
              <img src={s.foto} alt={s.nombre} className="h-12 w-12 rounded-full border" />
              <div>
                <div className="font-semibold">{s.nombre}</div>
                <div className="text-xs text-gray-500">Especialista</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // Paso 3: Mostrar Google Calendar embebido del staff seleccionado
  if (paso === 3 && staff !== null) {
    const miembro = GOOGLE_CALENDARS[staff];
    return (
      <main className="max-w-sm mx-auto pt-10 text-center">
        <button className="mb-5 text-blue-600 text-sm" onClick={() => setPaso(2)}>
          ← Elegir otro staff
        </button>
        <h3 className="text-lg font-bold mb-2">Completá tu reserva</h3>
        <img src={miembro.foto} alt={miembro.nombre} className="h-16 w-16 mx-auto rounded-full border mb-2" />
        <div className="font-medium mb-4">{miembro.nombre}</div>
        <div className="flex w-full justify-center">
          <div className="w-full">
            <GoogleFormEmbed formUrl={miembro.calendarUrl} height={650} />
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default ReservaTurno;
