
import React, { useState, useEffect } from 'react';

interface GoogleFormEmbedProps {
  formUrl: string;
  height?: number;
}

const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl, height = 600 }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-8 bg-white rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">
          📱 Reservá tu turno desde el calendario oficial:
        </h3>
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg shadow-md mb-2"
        >
          Abrir calendario para reservar
        </a>
        <p className="text-sm text-gray-600 mt-4 px-6 text-center">
          El calendario se abrirá en una nueva ventana optimizada para tu dispositivo móvil. <br />
          Si no ves correctamente la pantalla de reserva, asegurate de que tu navegador permite ventanas emergentes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 md:py-8 bg-white rounded-xl shadow-lg">
      <iframe
        title="Reserva tu turno - Google Calendar"
        src={formUrl}
        className="rounded-xl border shadow w-full h-[600px] lg:h-[700px]"
        style={{ 
          minHeight: '600px',
          background: 'white', 
          border: 0,
          maxWidth: '100%'
        }}
        frameBorder="0"
        scrolling="yes"
        loading="lazy"
      >
        Cargando calendario...
      </iframe>
    </div>
  );
};

export default GoogleFormEmbed;
