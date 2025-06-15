
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
      <div className="flex flex-col items-center justify-center w-full py-6 bg-white rounded-xl shadow-lg">
        <div className="w-full text-center mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            📱 Versión móvil optimizada
          </h3>
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg shadow-md"
          >
            Abrir calendario para reservar
          </a>
          <p className="text-sm text-gray-600 mt-4 px-4">
            El calendario se abrirá en una nueva ventana optimizada para tu dispositivo móvil
          </p>
        </div>
        
        {/* Vista previa del calendario pero más pequeña */}
        <iframe
          title="Vista previa - Google Calendar"
          src={formUrl}
          className="rounded-xl border shadow w-full h-[300px] opacity-75 pointer-events-none"
          style={{ 
            minHeight: '300px',
            background: 'white', 
            border: 0,
            maxWidth: '100%'
          }}
          frameBorder="0"
          scrolling="no"
          loading="lazy"
        >
          Cargando vista previa...
        </iframe>
        
        <p className="text-xs text-gray-500 mt-2 text-center px-4">
          ⬆️ Vista previa - Para reservar, usa el botón azul de arriba
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
