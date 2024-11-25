import React, { useEffect, useState } from "react";

interface Message {
  channel: string;
  datum: string;
  action: string;
}

console.log(`WebSocketURL: ${process.env.REACT_APP_WEB_SOCKET_URL}`);
let socket: WebSocket | null = null; // Singleton WebSocket connection
const WebSocketChannelSubscriber: React.FC = () => {
  const [channel, setChannel] = useState<string>("test-channel"); // Default channel
  const [messages, setMessages] = useState<Message[]>([]); // Store incoming messages

  useEffect(() => {
    if (!socket) {
      // Create WebSocket connection only if it doesn't already exist
      socket = new WebSocket(`${process.env.REACT_APP_WEB_SOCKET_URL!}`); // Replace with your WebSocket server URL

      socket.onopen = () => {
        console.log("WebSocket connection established");
        // Send initial subscription message
        socket?.send(JSON.stringify({ action: "subscribe", channel }));
        console.log(`WebSocket Channel: ${channel} subscribed successfully`);
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          try {
            // Attempt to parse as JSON
            const message = JSON.parse(event.data) as Message;
            console.log("Received a JSON string:", event.data);

            // Append to messages if it matches the current channel
            if (message.channel === channel) {
              setMessages((prev) => [...prev, message]);
            }
          } catch (error) {
            // If parsing fails, it's a flat string
            console.log("Received a flat string:", event.data);
          }
        } else {
          console.log("Received non-string data:", event.data);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        socket = null; // Reset the singleton on close
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }

    // Send a new subscription message when the channel changes
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "subscribe", channel }));
      console.log(`Subscribed to channel: ${channel}`);
    }

    // Cleanup on component unmount
    return () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
        socket = null;
      }
    };
  }, [channel]); // Re-run effect only when the channel changes

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChannel = e.target.value;
    setChannel(newChannel);
  };

  return (
    <div>
      <h1>WebSocket Channel Subscriber</h1>
      <div>
        <label htmlFor="channel">Channel:</label>
        <input
          id="channel"
          type="text"
          value={channel}
          onChange={handleChannelChange}
        />
      </div>
      <h2>Messages from {channel}</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>Channel:</strong> {msg.channel} - <strong>Data:</strong> {msg.datum}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebSocketChannelSubscriber;
