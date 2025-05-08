import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getToken } from './auth';
import { API_URL } from './constants';

type WebSocketContextType = {
  connected: boolean;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  
  useEffect(() => {
    //console.log('WebSocketProvider mounted');
    const connectWebSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        if (wsRef.current) {
          wsRef.current.close();
        }
        
        // Create WebSocket connection with token for authentication
        const wsUrl = `ws://${API_URL.replace(/^https?:\/\//, '')}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { type, data } = message;
            
            if (listenersRef.current.has(type)) {
              listenersRef.current.get(type)?.forEach(callback => {
                callback(data);
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message24:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:11', error);
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected2');
          setConnected(false);
          
          setTimeout(connectWebSocket, 3000);
        };
        
        wsRef.current = ws;
      } catch (error) {
        console.error('Error connecting to WebSocket:3', error);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  const subscribe = (eventType: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    
    listenersRef.current.get(eventType)?.add(callback);
    
    return () => {
      listenersRef.current.get(eventType)?.delete(callback);
    };
  };
  
  return (
    <WebSocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
