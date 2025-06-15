
import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { useBusiness } from "@/context/BusinessContext";

const CancelTurno = () => {
  const { config } = useBusiness();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    // En producción aquí se podría llamar a un endpoint o instructivo
    setMsg("Si deseas cancelar tu turno, por favor responde el mail de confirmación recibido o gestiona tu evento desde Google Calendar. Tu solicitud será registrada automáticamente en nuestra agenda de Google Sheets.");
  };

  return (
    <>
      <SEOHead title="Cancelar Turno" description="Cancelar una reserva en Barbería Central" />
      <main className="max-w-lg mx-auto mt-16 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Cancelar Turno</h1>
        {msg ? (
          <div className="p-4 bg-green-50 rounded text-green-800 font-medium border border-green-200">{msg}</div>
        ) : (
          <form onSubmit={handleCancel} className="flex flex-col gap-4">
            <label>
              Ingresa el email con el que reservaste:
              <input
                type="email"
                className="mt-2 block border px-3 py-2 rounded w-full"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
              />
            </label>
            <button type="submit"
              className="bg-red-600 text-white rounded px-6 py-2 hover:bg-red-700 transition w-fit">
              Solicitar Cancelación
            </button>
          </form>
        )}
        <p className="mt-3 text-gray-600 text-sm">
          O simplemente cancela el evento desde Google Calendar (en el mismo correo o agenda), y se reflejará automáticamente en nuestra base. Ante dudas, escríbenos a <b>{config?.email_contacto}</b>
        </p>
      </main>
    </>
  );
};
export default CancelTurno;
