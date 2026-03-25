import { useEffect } from 'react';

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function useFullscreen() {
  useEffect(() => {
    if (!isMobile()) return;

    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };

    function requestFullscreen() {
      if (document.fullscreenElement) return;
      const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
      req?.()?.catch(() => {});
    }

    document.addEventListener('click', requestFullscreen, { once: true });
    return () => document.removeEventListener('click', requestFullscreen);
  }, []);
}
