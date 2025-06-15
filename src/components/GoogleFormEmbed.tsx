
interface GoogleFormEmbedProps {
  formUrl: string;
  height?: number;
}

const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl, height = 600 }) => (
  <div className="flex flex-col items-center justify-center w-full py-4 md:py-8 bg-white rounded-xl shadow-lg">
    <iframe
      title="Reserva tu turno - Google Calendar"
      src={formUrl}
      className="rounded-xl border shadow w-full h-[500px] md:h-[600px] lg:h-[700px]"
      style={{ 
        minHeight: '500px',
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

export default GoogleFormEmbed;
