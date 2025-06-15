import SEOHead from "@/components/SEOHead";
import GoogleFormEmbed from "@/components/GoogleFormEmbed";
import { useBusiness } from "@/context/BusinessContext";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import React, { useEffect, useState } from "react";

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
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [servicio, setServicio] = useState<string | null>(null);
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
              <img src={item.imagenes[0]?.url} alt={item.nombre} className="h-12 w-12 rounded object-cover border" />
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

  // Paso 3: Mostrar botón Google Calendar del staff seleccionado
  if (paso === 3 && staff !== null) {
    const miembro = GOOGLE_CALENDARS[staff];
    return (
      <main className="max-w-sm mx-auto pt-10 text-center">
        <button className="mb-5 text-blue-600 text-sm" onClick={() => setPaso(2)}>← Elegir otro staff</button>
        <h3 className="text-lg font-bold mb-2">Completá tu reserva en Google Calendar</h3>
        <img src={miembro.foto} alt={miembro.nombre} className="h-16 w-16 mx-auto rounded-full border mb-2" />
        <div className="font-medium mb-4">{miembro.nombre}</div>
        <a
          href={miembro.calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg shadow-md"
        >
          Reservar con {miembro.nombre}
        </a>
        <div className="text-sm text-gray-500 mt-5">La reserva se hace en el calendario oficial de {miembro.nombre}. Si no abre correctamente, revisá los permisos de tu navegador.</div>
      </main>
    );
  }

  return null;
};

export default ReservaTurno;
