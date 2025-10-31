// Socket.IO hook for real-time connections
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// SAFEST: Use a static string for URL
const URL = 'ws://localhost:4001';

export function useSocket(userId: string, handler?: (e: any) => void) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(URL, { query: { userId }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      // Auto-join all channels when connected
      socket.emit('auto_join_channels');
    });
    socket.on('disconnect', () => setConnected(false));
    if (handler) socket.onAny((event, ...args) => handler({ type: event, ...args[0] }));
    return () => { socket.disconnect(); };
  }, [userId, handler]);

  const joinRoom = (room: string) => { socketRef.current?.emit('join_channel', room); };
  const leaveRoom = (room: string) => { socketRef.current?.emit('leave_channel', room); };

  return { socket: socketRef.current, connected, joinRoom, leaveRoom };
}

