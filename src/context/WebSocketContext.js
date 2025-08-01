import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import API_BASE_URL from '../config/api';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket debe ser usado dentro de WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`${API_BASE_URL.replace('http://', 'ws://')}/ws`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.onerror = () => {
        // Silenciar errores de WebSocket
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
          setTimeout(connectWebSocket, 2000);
        }
      };

      setSocket(ws);
    } catch (error) {
      // Silenciar errores de conexión
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close(1000);
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 