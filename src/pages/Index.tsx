
import { BusinessProvider } from "@/context/BusinessContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Outlet } from "react-router-dom";

const Index = () => (
  <BusinessProvider>
    <GoogleAnalytics />
    <Header />
    <Outlet />
    <Footer />
  </BusinessProvider>
);

export default Index;
