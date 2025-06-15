import SEOHead from "@/components/SEOHead";
import GoogleFormEmbed from "@/components/GoogleFormEmbed";
import { useBusiness } from "@/context/BusinessContext";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import React, { useEffect } from "react";

const GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3sGI4BQFEkPUqzsopPtfQ0f3XsWHF1g08G7fqnZC09GqzySxJKFEx_jcpHj-skwEwV0br3bbNX?gv=true";

const ReservaTurno = () => {
  const { config } = useBusiness();
  const { ref: formRef, revealed: formVisible } = useRevealOnScroll<HTMLDivElement>();

  // Forzar scroll al tope cuando se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead title="Reservar turno" description="Reserva tu turno online de manera fácil y rápida." />
      <main className="bg-zinc-50 min-h-screen pt-2">
        <section
          ref={formRef}
          className={`max-w-4xl mx-auto my-16 transition-all duration-700 ${
            formVisible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-zinc-900">Reservá tu turno</h1>
          <GoogleFormEmbed formUrl={GOOGLE_CALENDAR_URL} />
          <p className="mx-auto mt-3 max-w-lg text-center text-gray-600 text-md">
            Al reservar, tus datos serán gestionados por la cuenta Google <b>{config?.google_workspace_account}</b> en el proyecto <b>{config?.google_project_id}</b>.
          </p>
        </section>
      </main>
    </>
  );
};

export default ReservaTurno;
