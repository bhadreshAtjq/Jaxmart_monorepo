'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { useNotifications, revalidate } from '@/lib/hooks';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { mutate: mutateNotifications } = useNotifications();

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    
    const newSocket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Real-time signal connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('notification', (data: any) => {
      // Show high-impact trade alert
      toast.success(data.title || 'Inbound Trade Signal', {
        icon: '🔔',
        duration: 5000,
      });

      // Synchronize caches across the console
      mutateNotifications();

      if (data.type?.includes('ORDER')) {
        revalidate.orders();
      }
      if (data.type?.includes('RFQ')) {
        revalidate.rfqs();
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Real-time signal detached');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Signal connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
