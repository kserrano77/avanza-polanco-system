import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const WhatsAppSection = () => {
    const [qrCode, setQrCode] = useState('');
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('Connecting...');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:8085');

        socketRef.current.on('qr', (url) => {
            setQrCode(url);
            setStatus('QR Code received. Please scan.');
        });

        socketRef.current.on('ready', (message) => {
            setQrCode('');
            setStatus(message);
        });

        socketRef.current.on('message', (message) => {
            setStatus(message);
        });

        socketRef.current.on('new_message', (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        socketRef.current.on('disconnect', () => {
            setStatus('Disconnected from server.');
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const addMessage = (message) => {
        const messageText = typeof message === 'object' ? JSON.stringify(message) : message;
        setMessages(prev => [...prev, { id: prev.length, content: messageText, sender: 'system' }]);
    };


    return (
        <div className="p-4 bg-gray-100 h-full">
            <h2 className="text-2xl font-bold mb-4">WhatsApp Integration</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2">Connection Status</h3>
                <p className="text-gray-700 mb-4">{status}</p>
                {qrCode && (
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">Scan QR Code</h4>
                        <img src={qrCode} alt="WhatsApp QR Code" className="border" />
                    </div>
                )}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Logs & Messages</h4>
                    <div className="h-64 overflow-y-auto border p-2 bg-gray-50 rounded">
                        {messages.map((msg, index) => (
                            <div key={index} className="p-2 border-b">
                                <p className="text-sm text-gray-800">{msg.body || JSON.stringify(msg)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppSection;
