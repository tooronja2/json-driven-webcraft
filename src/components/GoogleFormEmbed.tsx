
interface GoogleFormEmbedProps {
  formUrl: string;
  height?: number;
}
const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl, height = 600 }) => (
  <div className="flex flex-col items-center justify-center w-full py-8 bg-white rounded-xl shadow-lg">
    <iframe
      title="Reserva tu turno - Google Calendar"
      src={formUrl}
      width="800"
      height={height}
      frameBorder="0"
      scrolling="no"
      className="rounded-xl border shadow w-full max-w-4xl"
      style={{ minHeight: 500, background: "white", border: 0 }}
      loading="lazy"
    >
      Cargando calendario...
    </iframe>
  </div>
);
export default GoogleFormEmbed;
