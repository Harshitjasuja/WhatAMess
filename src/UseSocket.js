import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client"; // Import socket.io-client

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]); // Track orders

  useEffect(() => {
    const socketInstance = io(url);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    });

    socketInstance.on("message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for order updates
    socketInstance.on("order-update", (order) => {
      console.log("Received order update:", order);
      setOrders((prevOrders) => [...prevOrders, order]);
    });

    socketInstance.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  const sendMessage = useCallback(
    (message) => {
      if (socket && isConnected) {
        console.log("Sending message:", message);
        socket.emit("message", message);
      } else {
        console.error("Cannot send message: WebSocket is not connected");
      }
    },
    [socket, isConnected]
  );

  return {
    socket,
    isConnected,
    messages,
    orders, // Return orders for use in components
    sendMessage,
  };
};

export default useWebSocket;
