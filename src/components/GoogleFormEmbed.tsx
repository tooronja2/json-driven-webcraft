
interface GoogleFormEmbedProps {
  formUrl: string;
  height?: number;
}
const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl, height = 800 }) => (
  <div className="flex flex-col items-center justify-center w-full py-8 bg-white rounded-xl shadow-lg">
    <iframe
      title="Reserva tu turno"
      src={formUrl}
      width="100%"
      height={height}
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      className="rounded-xl border shadow w-full max-w-2xl"
      style={{ minHeight: 500, background: "white" }}
      loading="lazy"
    >
      Cargando formulario...
    </iframe>
  </div>
);
export default GoogleFormEmbed;
