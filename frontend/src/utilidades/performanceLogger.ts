import { useEffect } from 'react';

declare global {
  interface Window {
    __lastRouteChange?: number;
  }
}

const formatMs = (value: number) => `${(value / 1000).toFixed(2)}s`;

export const markRouteChange = (path: string) => {
  if (typeof performance === 'undefined') return;
  window.__lastRouteChange = performance.now();
  console.info(`[Performance] Cambio de ruta iniciado: ${path} @ ${formatMs(window.__lastRouteChange)}`);
};

export const logViewLoad = (viewName: string, extraData?: Record<string, unknown>) => {
  if (typeof performance === 'undefined') return;

  const now = performance.now();
  const navigationEntries = performance.getEntriesByType('navigation');
  const navigationStart = navigationEntries[0]?.startTime ?? 0;
  const sinceNavigation = now - navigationStart;
  const sinceRouteChange = window.__lastRouteChange ? now - window.__lastRouteChange : undefined;

  console.groupCollapsed(`[Performance] ${viewName} renderizado`);
  console.log('Tiempo desde navigationStart:', formatMs(sinceNavigation));
  if (sinceRouteChange !== undefined) {
    console.log('Tiempo desde último cambio de ruta:', formatMs(sinceRouteChange));
  }
  if (extraData) {
    console.table(extraData);
  }
  console.groupEnd();
};

export const useLogViewPerformance = (viewName: string, extraData?: Record<string, unknown>) => {
  useEffect(() => {
    logViewLoad(viewName, extraData);
  }, [viewName]);
};

