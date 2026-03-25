import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    async function acquire() {
      try {
        wakeLock.current = await navigator.wakeLock.request('screen');
      } catch {
        // permission denied or not supported
      }
    }

    acquire();

    const reacquire = () => {
      if (document.visibilityState === 'visible') acquire();
    };
    document.addEventListener('visibilitychange', reacquire);

    return () => {
      document.removeEventListener('visibilitychange', reacquire);
      wakeLock.current?.release();
      wakeLock.current = null;
    };
  }, []);
}
