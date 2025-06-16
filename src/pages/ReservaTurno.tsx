import React, { useState, useEffect } from 'react';
import { useBusiness } from '@/context/BusinessContext';
import SEOHead from '@/components/SEOHead';

const ReservaTurno = () => {
  const { contenido, staff, config } = useBusiness();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [servicio, setServicio] = useState<string>('');
  const [staffIdx, setStaffIdx] = useState<number | null>(null);
  const [start, setStart] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const servicioSel = contenido?.find(it => it.id === servicio);
  const miembro = staffIdx !== null ? staff?.[staffIdx] : null;

  if (enviado) {
    return (
      <main className="max-w-md mx-auto py-10 text-center">
        <SEOHead title="Reserva confirmada" description="Turno registrado" />
        <h2 className="text-xl font-semibold">¡Reserva realizada!</h2>
        <p className="mt-4">Hemos enviado un correo de confirmación a {email}.</p>
      </main>
    );
  }

  if (paso === 1) {
    return (
      <main className="max-w-sm mx-auto pt-6 pb-12">
        <SEOHead title="Reservar turno" description="Elegí un servicio" />
        <h1 className="text-2xl font-bold mb-4 text-center">Reservá tu turno</h1>
        <div className="flex flex-col gap-4">
          {contenido?.map((item, idx) => (
            <button
              key={item.id}
              className="flex items-center gap-4 w-full bg-white px-4 py-3 rounded-xl border shadow hover:bg-gray-100 transition"
              onClick={() => { setServicio(item.id); setPaso(2); }}
            >
              <img src={item.imagenes[0]?.url} alt={item.nombre} className="h-12 w-12 rounded object-cover border" />
              <div>
                <div className="font-semibold">{item.nombre}</div>
                <div className="text-xs text-gray-500">{item.detalles?.duracion} · {config?.moneda_simbolo}{item.precio}</div>
              </div>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (paso === 2 && servicioSel) {
    return (
      <main className="max-w-sm mx-auto pt-6 pb-12">
        <SEOHead title="Elegí profesional" description="Selecciona quién te atenderá" />
        <button className="mb-3 text-blue-600 text-sm" onClick={() => setPaso(1)}>← Volver a servicios</button>
        <h2 className="text-xl font-semibold mb-4 text-center">Elegí con quién reservar</h2>
        <div className="flex flex-col gap-4">
          {staff?.map((s, idx) => (
            <button
              key={idx}
              className="flex items-center gap-4 w-full bg-white px-4 py-3 rounded-xl border shadow hover:bg-gray-100 transition"
              onClick={() => { setStaffIdx(idx); setPaso(3); }}
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

  if (paso === 3 && servicioSel && miembro) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const resp = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: servicioSel.nombre,
          staffName: miembro.nombre,
          staffEmail: miembro.email,
          start,
          price: servicioSel.precio,
          customerName: nombre,
          customerEmail: email,
        })
      });
      if (resp.ok) setEnviado(true);
    };

    return (
      <main className="max-w-sm mx-auto pt-6 pb-12">
        <SEOHead title="Completar reserva" description="Ingresa tus datos" />
        <button className="mb-3 text-blue-600 text-sm" onClick={() => setPaso(2)}>← Elegir otro staff</button>
        <h2 className="text-xl font-semibold mb-4 text-center">Completar datos</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label>
            Fecha y hora:
            <input type="datetime-local" className="mt-1 block w-full border px-3 py-2 rounded" value={start} onChange={e => setStart(e.target.value)} required />
          </label>
          <label>
            Tu nombre:
            <input type="text" className="mt-1 block w-full border px-3 py-2 rounded" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </label>
          <label>
            Tu email:
            <input type="email" className="mt-1 block w-full border px-3 py-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="bg-blue-600 text-white rounded px-6 py-2 hover:bg-blue-700 transition">Reservar</button>
        </form>
      </main>
    );
  }

  return null;
};

export default ReservaTurno;
