import { useEffect, useState, useRef, useCallback } from 'react';

interface WebSocketMessage {
  content: string;
}

export const useWebSocket = (url: string) => {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    webSocketRef.current = new WebSocket(url);

    webSocketRef.current.onopen = () => {
      console.log(`Connected to WebSocket: ${url}`);
      setIsConnected(true);
    };

    webSocketRef.current.onmessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        const newMessage: WebSocketMessage = JSON.parse(event.data) as WebSocketMessage; // Parse JSON message
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        console.error('Unexpected data type received:', typeof event.data);
      }
    };

    webSocketRef.current.onerror = (error: Event) => {
      console.error('WebSocket Error:', error);
    };

    webSocketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    return () => {
      webSocketRef.current?.close();
    };
  }, [url]);

  const sendMessage = useCallback(
    (message: string) => {
      if (isConnected && webSocketRef.current) {
        webSocketRef.current.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is not connected');
      }
    },
    [isConnected]
  );

  return { isConnected, messages, sendMessage };
};

export default useWebSocket;
