'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuthStore } from '@/lib/store';

export function AppTour() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Determine if we should show the tour
    const tourKey = pathname === '/profile' ? `tour_profile_seen_${user?.id}` : `tour_main_seen_${user?.id}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    if (hasSeenTour || !user) return;

    const baseSteps: DriveStep[] = [
      { 
        element: '#tour-logo', 
        popover: { 
          title: 'Welcome to JaxMart PRO', 
          description: 'Your high-performance gateway to industrial trade and global sourcing.',
          side: "right", align: 'start'
        } 
      },
      { 
        element: '#tour-switcher', 
        popover: { 
          title: 'Dual-Role Console', 
          description: 'Seamlessly pivot between Procurement (Buyer) and Supply Chain (Seller) command centers.',
          side: "right", align: 'start'
        } 
      },
      { 
        element: '#tour-profile', 
        popover: { 
          title: 'Identity & Signals', 
          description: 'Monitor your trade signals, manage KYC compliance, and control your session here.',
          side: "right", align: 'start'
        } 
      },
    ];

    const profileSteps: DriveStep[] = [
      { 
        element: '#tour-profile-id', 
        popover: { 
          title: 'Core Identity Schema', 
          description: 'This is your verified industrial fingerprint on the JaxMart ledger.',
          side: "bottom", align: 'start'
        } 
      },
      { 
        element: '#tour-kyc', 
        popover: { 
          title: 'KYC Trust Registry', 
          description: 'Your current compliance tier. Higher tiers unlock multi-million INR trade limits.',
          side: "right", align: 'start'
        } 
      },
      { 
        element: '#tour-business', 
        popover: { 
          title: 'Corporate Intelligence', 
          description: 'Maintain your GSTIN and organizational metadata here for tax-compliant invoicing.',
          side: "bottom", align: 'start'
        } 
      },
      { 
        element: '#tour-docs', 
        popover: { 
          title: 'Digital Spec Vault', 
          description: 'Secure storage for your industrial certificates, tax docs, and trade licenses.',
          side: "top", align: 'start'
        } 
      },
      { 
        element: '#tour-edit', 
        popover: { 
          title: 'Synchronize Registry', 
          description: 'Click here to update your contact vectors or corporate standing.',
          side: "left", align: 'center'
        } 
      },
    ];

    const steps = pathname === '/profile' ? profileSteps : baseSteps;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'jaxmart-tour-popover',
      steps: steps,
      onDestroyed: () => {
        localStorage.setItem(tourKey, 'true');
      }
    });

    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, pathname]);

  return null;
}
