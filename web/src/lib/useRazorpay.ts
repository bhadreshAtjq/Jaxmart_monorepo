'use client';
import { useState, useCallback } from 'react';
import api from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OpenCheckoutOptions {
  orderId?: string;
  amount: number; // in Rupees (e.g. 1000)
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess?: (data: { paymentId: string; orderId: string; signature: string }) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads the Razorpay checkout.js script dynamically if not already loaded
   */
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        setError('Failed to load Razorpay SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  /**
   * Initiates order creation on backend and opens Razorpay Test Checkout modal
   */
  const openCheckout = useCallback(
    async (options: OpenCheckoutOptions) => {
      setLoading(true);
      setError(null);

      try {
        // 1. Ensure Razorpay SDK script is loaded
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay Checkout SDK failed to load');
        }

        // 2. Call Backend Order API to create Razorpay order server-side
        let rzpOrderData;
        if (options.orderId) {
          const res = await api.post('/payments/create-order', { orderId: options.orderId });
          rzpOrderData = res.data;
        } else {
          const res = await api.post('/payments/razorpay/order', {
            amount: options.amount,
            currency: options.currency || 'INR',
            description: options.description,
            notes: options.notes,
          });
          rzpOrderData = res.data;
        }

        const { razorpayOrderId, razorpayKeyId, amount, currency } = rzpOrderData;
        const keyId = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        // 3. Configure Razorpay Checkout options
        const checkoutOptions = {
          key: keyId,
          amount: Math.round((amount || options.amount) * 100),
          currency: currency || options.currency || 'INR',
          name: options.name || 'JaxMart B2B Marketplace',
          description: options.description || 'Order Payment',
          order_id: razorpayOrderId,
          prefill: {
            name: options.prefill?.name || '',
            email: options.prefill?.email || '',
            contact: options.prefill?.contact || '',
          },
          notes: options.notes || {},
          theme: {
            color: '#1E293B',
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 4. Send response to backend for HMAC verification
              const verifyRes = await api.post('/payments/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: options.orderId,
              });

              if (verifyRes.data?.success) {
                options.onSuccess?.({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                });
              } else {
                throw new Error(verifyRes.data?.error || 'Payment signature verification failed');
              }
            } catch (err: any) {
              const errMsg = err?.response?.data?.error || err.message || 'Payment verification failed';
              setError(errMsg);
              options.onError?.(err);
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              options.onDismiss?.();
            },
          },
        };

        const razorpayInstance = new window.Razorpay(checkoutOptions);
        razorpayInstance.on('payment.failed', (response: any) => {
          setLoading(false);
          const failureMsg = response.error?.description || 'Payment processing failed';
          setError(failureMsg);
          options.onError?.(response.error);
        });

        razorpayInstance.open();
      } catch (err: any) {
        setLoading(false);
        const errMsg = err?.response?.data?.error || err.message || 'Failed to initiate Razorpay checkout';
        setError(errMsg);
        options.onError?.(err);
      }
    },
    [loadRazorpayScript]
  );

  return {
    openCheckout,
    loading,
    error,
  };
}
