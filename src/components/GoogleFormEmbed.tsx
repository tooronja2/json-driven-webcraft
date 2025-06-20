
import React from 'react';

interface GoogleFormEmbedProps {
  formUrl: string;
  height?: number;
}

const GoogleFormEmbed: React.FC<GoogleFormEmbedProps> = ({ formUrl, height = 650 }) => (
  <div className="flex flex-col items-center justify-center w-full bg-white rounded-xl shadow-lg h-full">
    <iframe
      title="Reserva tu turno - Google Calendar"
      src={formUrl}
      className="rounded-xl border shadow w-full"
      style={{
        minHeight: height,
        height: height,
        background: 'white',
        border: 0,
        maxWidth: '100%',
        display: 'block',
      }}
      frameBorder="0"
      scrolling="yes"
      loading="lazy"
      allowFullScreen
    >
      Cargando calendario...
    </iframe>
  </div>
);

export default GoogleFormEmbed;

