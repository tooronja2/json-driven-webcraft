
import { useState, useCallback } from 'react';

// Hook global para manejar recargas de disponibilidad
export const useGlobalReload = () => {
  const [reloadCounter, setReloadCounter] = useState(0);

  const triggerReload = useCallback(() => {
    console.log('🔄 Trigger global reload solicitado');
    setReloadCounter(prev => prev + 1);
  }, []);

  return {
    reloadCounter,
    triggerReload
  };
};

// Instancia global compartida
let globalReloadInstance: { triggerReload: () => void } | null = null;

export const setGlobalReloadInstance = (instance: { triggerReload: () => void }) => {
  globalReloadInstance = instance;
};

export const triggerGlobalReload = () => {
  if (globalReloadInstance) {
    console.log('🔄 Ejecutando trigger global reload');
    globalReloadInstance.triggerReload();
  } else {
    console.log('⚠️ No hay instancia global de reload disponible');
  }
};
