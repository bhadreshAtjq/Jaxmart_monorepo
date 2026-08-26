'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollRestorer() {
  const pathname = usePathname();

  // Continuously track & save user's scroll stop position
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      // Debounce scroll save so we capture the exact stop point when scrolling pauses
      timeoutId = setTimeout(() => {
        if (window.scrollY > 0) {
          sessionStorage.setItem(`scroll_pos_${pathname}`, window.scrollY.toString());
        }
      }, 150);
    };

    const handleBeforeUnload = () => {
      if (window.scrollY > 0) {
        sessionStorage.setItem(`scroll_pos_${pathname}`, window.scrollY.toString());
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  // Restore scroll position at exact stop point on mount / refresh / navigation
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force pages like /new-products to always open from the very top
    if (pathname === '/new-products' || pathname.startsWith('/new-products')) {
      sessionStorage.removeItem(`scroll_pos_${pathname}`);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
      return;
    }

    const savedPos = sessionStorage.getItem(`scroll_pos_${pathname}`);
    if (savedPos) {
      const targetY = parseInt(savedPos, 10);
      if (!isNaN(targetY) && targetY > 0) {
        // Immediate scroll to stop point
        window.scrollTo(0, targetY);

        // Multiple RAF & timeout checks to ensure position remains at the stop point even after async content finishes rendering
        requestAnimationFrame(() => window.scrollTo(0, targetY));
        setTimeout(() => window.scrollTo(0, targetY), 50);
        setTimeout(() => window.scrollTo(0, targetY), 200);
        setTimeout(() => window.scrollTo(0, targetY), 500);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
