
interface GoogleFormEmbedProps {
  formUrl: string;
  height?: number;
}

const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl, height = 600 }) => {
  // Detectar si es móvil para ajustar la URL
  const isMobile = window.innerWidth < 768;
  
  // Construir URL optimizada para móvil
  const optimizedUrl = isMobile 
    ? formUrl.replace('?gv=true', '?gv=true&mode=WEEK&hl=es') 
    : formUrl;

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 md:py-8 bg-white rounded-xl shadow-lg">
      {/* Botón para abrir en nueva ventana en móvil */}
      <div className="md:hidden w-full mb-4 text-center">
        <a
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Abrir calendario en nueva ventana
        </a>
        <p className="text-sm text-gray-600 mt-2">
          Para una mejor experiencia en móvil, recomendamos abrir el calendario en una nueva ventana
        </p>
      </div>
      
      <iframe
        title="Reserva tu turno - Google Calendar"
        src={optimizedUrl}
        className="rounded-xl border shadow w-full h-[400px] md:h-[600px] lg:h-[700px]"
        style={{ 
          minHeight: '400px',
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
      
      {/* Mensaje adicional para móvil */}
      <div className="md:hidden w-full mt-4 text-center">
        <p className="text-xs text-gray-500">
          Si tienes problemas para seleccionar horarios, usa el botón de arriba para abrir en nueva ventana
        </p>
      </div>
    </div>
  );
};

export default GoogleFormEmbed;
