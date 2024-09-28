import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import './ChatTeam.scss';

let stompClient = null;

const ChatTeam = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messageEndRef = useRef(null);
  const [teamId, setTeamId] = useState(null);
  const currentUserId = sessionStorage.getItem('userId');
  const currentUserEmail = sessionStorage.getItem('email');

  useEffect(() => {
    const storedTeamId = sessionStorage.getItem('teamId');
    setTeamId(storedTeamId);

    if (storedTeamId) {
      fetchChatHistory(storedTeamId);

      const socket = new SockJS('http://localhost:8080/ws');
      stompClient = over(socket);

      stompClient.connect({}, onConnected, onError);

      return () => {
        if (stompClient && isConnected) {
          stompClient.disconnect(() => {
            console.log('Disconnected');
            setIsConnected(false);
          });
        }
      };
    }
  }, [teamId]);

  const onConnected = () => {
    if (teamId) {
      stompClient.subscribe(`/topic/team-messages/${teamId}`, onMessageReceived);
      setIsConnected(true);
    }
  };

  const onError = (error) => {
    console.error('Error connecting to WebSocket:', error);
    setIsConnected(false);
  };

  const fetchChatHistory = async (teamId) => {
    try {
      const response = await axios.get('http://localhost:8080/teamChatHistory', {
        params: { teamId }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    console.log('Message reçu:', message);
    setMessages((prevMessages) => [...prevMessages, message]);
    scrollToBottom();
  };

  // Function to generate a color based on the sender's email
  const getColorFromEmail = (email) => {
    if (!email) return '#ccc'; // Default color if email is undefined or null
    const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    if (!isConnected || !stompClient) {
      console.error('WebSocket connection is not established.');
      return;
    }

    const message = {
      senderId: currentUserId,
      senderEmail: currentUserEmail,
      content: newMessage,
      teamId,
      timestamp: new Date().toISOString()  // Ajout de l'horodatage
    };

    try {
      // Mettre à jour l'état des messages immédiatement
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
      stompClient.send('/app/team-chat', {}, JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
    }
    scrollToBottom();
  };

  // Scroll automatique à chaque mise à jour de la liste des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chatTeamcontainer">
      <div className="chatTeamheader">
        <p className='titreTeam'>Team Chat</p>
      </div>
      <div className="chatTeambody">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chatTeammessage ${msg.senderEmail === currentUserEmail ? 'own-message' : 'other-message'}`}
          >
            <div className="message-header">
              <div 
                className="user-icon" 
                style={{ backgroundColor: getColorFromEmail(msg.senderEmail) }}
              >
                <FaUser />
              </div>
              <div className="message-email">{msg.senderEmail || 'Unknown'}</div>
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
              {msg.timestamp && (
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="chatTeamfooter">
        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatTeam;
