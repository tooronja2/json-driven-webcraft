
import { useEffect } from "react";
import { useBusiness } from "@/context/BusinessContext";

declare global {
  interface Window { dataLayer: any[]; gtag: (...args: any[]) => void }
}

const GoogleAnalytics = () => {
  const { config } = useBusiness();

  useEffect(() => {
    if (!config?.google_analytics_id) return;

    // Inyecta GA4
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`;
    document.head.appendChild(script);

    // Config ga4 on window
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.google_analytics_id);
    return () => {
      document.head.removeChild(script);
    };
  }, [config]);

  return null;
};

export const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};
export const trackPurchase = (transactionId: string, value: number) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'ARS'
    });
  }
};

export default GoogleAnalytics;
