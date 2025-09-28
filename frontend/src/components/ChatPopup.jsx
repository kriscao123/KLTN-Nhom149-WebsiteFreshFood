import React, { useState, useRef } from 'react';

const ChatPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' }
    ]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        setIsVisible(!isVisible);
    };

    const sendMessage = () => {
        if (inputText.trim() === '') return;

        // Add user message
        const newMessages = [...messages, { type: 'user', text: inputText }];
        setMessages(newMessages);
        setInputText('');

        // Simulate bot response
        setTimeout(() => {
            setMessages([...newMessages, {
                type: 'bot',
                text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!'
            }]);
            scrollToBottom();
        }, 1000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            {/* Fixed Chat Button */}
            <button
                onClick={toggleChat}
                className="fixed bottom-4 right-4 w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white shadow-lg"
            >
                <i className="fa fa-comment-dots text-2xl"></i>
            </button>

            {/* Chat Popup */}
            {isVisible && (
                <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Hỗ trợ trực tuyến</h3>
                        <button
                            onClick={toggleChat}
                            className="text-gray-600"
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                    <div className="p-4 h-80 overflow-y-auto">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : ''}`}>
                                <div className={`rounded-lg p-3 ${
                                    message.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-black'
                                }`} style={{ maxWidth: '80%' }}>
                                    <p>{message.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t">
                        <div className="flex">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Nhập tin nhắn..."
                                className="flex-grow rounded-l-lg border border-gray-300 bg-gray-100 text-black p-2"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-600 text-white rounded-r-lg p-2"
                            >
                                <i className="fa fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPopup;