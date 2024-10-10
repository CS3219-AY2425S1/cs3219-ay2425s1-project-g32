import { 
    type PropsWithChildren,
    type FC, 
    createContext, 
    useContext, 
    useEffect, 
    useState 
} from 'react';

// Defines the types of data stored in the context
type WebSocketContextType = {
    socket: WebSocket | null;
    messages: string[];
    loading: boolean;
    sendMessage: (message: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: FC<PropsWithChildren> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<string[]>([]);
    

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080') // Change if needed
        setSocket(ws);

        ws.onopen = () => {
            setLoading(false);
        }

        ws.onmessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = (message: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
    };

    return <WebSocketContext.Provider value={{ socket, loading, messages, sendMessage }}>{children}</WebSocketContext.Provider>;

}

export const useWebSocket = () => useContext(WebSocketContext);