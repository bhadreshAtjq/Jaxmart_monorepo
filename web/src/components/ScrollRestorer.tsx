'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pathname]);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    window.history.scrollRestoration = 'manual';
    const savedPos = sessionStorage.getItem(`scroll_${pathname}`);
    if (savedPos) {
      const y = parseInt(savedPos, 10);
      window.scrollTo(0, y);
      // Small timeout to catch Next.js layout shifts
      setTimeout(() => window.scrollTo(0, y), 10);
    }
  }, [pathname]);

  return null;
}
