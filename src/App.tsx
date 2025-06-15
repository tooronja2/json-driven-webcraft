
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import DetalleItem from "./pages/DetalleItem";
import ListaContenido from "./pages/ListaContenido";
import Contacto from "./pages/Contacto";
import CancelTurno from "./pages/CancelTurno";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />}>
        <Route index element={<Home />} />
        <Route path="/servicios" element={<ListaContenido />} />
        <Route path="/servicios/:slug" element={<DetalleItem />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/cancelar-turno" element={<CancelTurno />} />
        {/* Puedes sumar más rutas dinámicas aquí con más tipos de contenido */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
