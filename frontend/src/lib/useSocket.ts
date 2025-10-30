// Socket.IO hook for real-time connections
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// SAFEST: Use a static string for URL
const URL = 'ws://localhost:4001';

export function useSocket(userId: string, handler?: (e: any) => void) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(URL, { query: { userId }, transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    if (handler) socket.onAny((event, ...args) => handler({ type: event, ...args[0] }));
    return () => { socket.disconnect(); };
  }, [userId, handler]);

  const joinRoom = (room: string) => { socketRef.current?.emit('join', { room }); };
  const leaveRoom = (room: string) => { socketRef.current?.emit('leave', { room }); };

  return { socket: socketRef.current, connected, joinRoom, leaveRoom };
}

