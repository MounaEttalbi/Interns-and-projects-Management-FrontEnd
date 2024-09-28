import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './Chat.scss';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [client, setClient] = useState(null);
    const [recipientId, setRecipientId] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
                console.log(str);
            },
            onConnect: (frame) => {
                console.log('Connected to WebSocket:', frame);
                setClient(stompClient);
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
    }, []);

    useEffect(() => {
        if (recipientId !== null && client) {
            if (client.connected) {
                // Clean up previous subscription if it exists
                if (subscription) {
                    subscription.unsubscribe();
                }
                
                const newSubscription = client.subscribe(`/topic/messages/${recipientId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => {
                        // Filter out duplicate messages
                        const filteredMessages = prevMessages.filter(msg => msg.timestamp !== newMessage.timestamp);
                        return [...filteredMessages, newMessage];
                    });
                });
                setSubscription(newSubscription);
                fetchChatHistory(recipientId);
            }
        }
    }, [recipientId, client]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/employee/listEmployee');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const fetchChatHistory = async (recipientId) => {
        try {
            const senderId = parseInt(sessionStorage.getItem('userId') || '0');
            const response = await fetch(`http://localhost:8080/historyChat?senderId=${senderId}&recipientId=${recipientId}`);
            const data = await response.json();
            // Ensure no duplicates
            setMessages(data.filter((message, index, self) =>
                index === self.findIndex((m) => m.timestamp === message.timestamp)
            ));
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const sendMessage = async () => {
        if (client && client.connected && input.trim() && recipientId !== null) {
            const message = {
                senderId: parseInt(sessionStorage.getItem('userId') || '0'),
                recipientId: recipientId,
                content: input,
                timestamp: new Date().toISOString()
            };

            try {
                await fetch('http://localhost:8080/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
                });
            } catch (error) {
                console.error('Failed to save message', error);
            }

            client.publish({
                destination: '/app/chat',
                body: JSON.stringify(message),
            });
            setInput('');
        }
    };

    return (
        <div className="chatcontainer">
            <div className="employee-list">
                <h3>Employees</h3>
                <ul>
                    {employees.map((emp) => (
                        <li 
                            key={emp.id} 
                            className={emp.id === recipientId ? 'selected' : ''} 
                            onClick={() => {
                                if (emp.id !== recipientId) {
                                    setRecipientId(emp.id);
                                    setSelectedEmployee(emp.id);
                                    setMessages([]);
                                }
                            }}
                        >
                            {emp.full_name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="chat-content">
                <div className="chatAdminbox">
                    {Array.isArray(messages) && messages.map((msg, index) => (
                        <div key={index} className={msg.senderId === parseInt(sessionStorage.getItem('userId') || '0') ? 'message sent' : 'message received'}>
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
        </div>
    );
};

export default Chat;
