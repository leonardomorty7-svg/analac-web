// src/lib/analytics.ts

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
  }
}

export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...eventData
  };

  window.dataLayer.push(payload);

  // Fallback opcional para debug en consola si estamos en desarrollo
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Evento disparado: ${eventName}`, payload);
  }
}
