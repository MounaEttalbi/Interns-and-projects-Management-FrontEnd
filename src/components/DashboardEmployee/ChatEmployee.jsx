import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import './ChatEmployee.scss';

const ChatEmployee = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [client, setClient] = useState(null);
    const [subscription, setSubscription] = useState(null);

    const userId = parseInt(sessionStorage.getItem('userId') || '0');
    const recipientId = 1; // ID de l'administrateur, fixe dans ce cas

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            onConnect: (frame) => {
                console.log('Connected to WebSocket:', frame);
                setClient(stompClient);

                const newSubscription = stompClient.subscribe(`/topic/messages/${userId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => {
                        const filteredMessages = prevMessages.filter(msg => msg.timestamp !== newMessage.timestamp);
                        return [...filteredMessages, newMessage];
                    });
                });

                setSubscription(newSubscription);
                fetchChatHistory();
            },
            onDisconnect: (frame) => {
                console.log('Disconnected from WebSocket:', frame);
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame);
            },
        });

        stompClient.activate();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [userId]);

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/historyChat?senderId=${userId}&recipientId=${recipientId}`);
            const data = response.data;
            setMessages(data.filter((message, index, self) =>
                index === self.findIndex((m) => m.timestamp === message.timestamp)
            ));
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    };

    const sendMessage = async () => {
        if (client && client.connected && input.trim()) {
            const message = {
                senderId: userId,
                recipientId: recipientId,
                content: input,
                timestamp: new Date().toISOString()
            };

            try {
                await axios.post('http://localhost:8080/api/messages', message);
                
                // Ajouter immédiatement le message à la liste des messages
                setMessages((prevMessages) => [...prevMessages, message]);

                // Publier le message via WebSocket
                client.publish({
                    destination: '/app/chat',
                    body: JSON.stringify(message),
                });
            } catch (error) {
                console.error('Failed to save message', error);
            }

            setInput('');
        }
    };

    return (
        <div className="chat-container">
            {/* Header du chat */}
            <div className="chat-header">
               
                <p className='ChatHeaderEmploye'>Chat</p>
            </div>
            {/* Fin du header */}
            
            <div className="chatbox">
                {Array.isArray(messages) && messages.map((msg, index) => (
                    <div key={index} className={msg.senderId === userId ? 'message sent' : 'message received'}>
                        <p>{msg.content}</p>
                        <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Type a message..." 
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatEmployee;
