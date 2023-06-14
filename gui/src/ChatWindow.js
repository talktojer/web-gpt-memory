import React, { useState, useEffect } from 'react';
import { MessageList, Input } from 'react-chat-elements';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import 'react-chat-elements/dist/main.css';
import './ChatWindow.css';

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState('');
  const [inputValue, setInputValue] = useState('');

useEffect(() => {
  const fetchToken = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get('token');
    if (tokenFromURL) {
      setToken(tokenFromURL);
      await fetchAndLoadChatLog(tokenFromURL);
    } else {
      const response = await fetch('http://localhost:3000/new-session');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const newToken = data.token;
      setToken(newToken);

      // Update the URL in the browser without reloading the page
      const newURL = `${window.location.origin}${window.location.pathname}?token=${newToken}`;
      window.history.replaceState({ path: newURL }, '', newURL);

      await fetchAndLoadChatLog(newToken);
    }
  };

    fetchToken();
  }, []);

const [isLinkCopied, setIsLinkCopied] = useState(false);

const handleCopyLink = () => {
  setIsLinkCopied(true);
  setTimeout(() => {
    setIsLinkCopied(false);
  }, 2000);
};

const fetchAndLoadChatLog = async (token) => {
  try {
    const response = await fetch(`http://localhost:3000/load-session?token=${token}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const loadedChatLog = data.chatLog.map((message) => ({
      position: message.role === 'assistant' ? 'left' : 'right',
      type: 'text',
      text: message.content,
    }));
    setMessages(loadedChatLog);
  } catch (error) {
    console.error('Failed to load session:', error);
  }
};

  const sendMessage = async (message) => {
    const response = await fetch('http://localhost:3000/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, token }),
    });
    const data = await response.json();

    setMessages((prevMessages) => [
      ...prevMessages,
      { position: 'right', type: 'text', text: message },
      { position: 'left', type: 'text', text: data.assistantMessage },
    ]);

    setInputValue(''); // Clear the input value
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      sendMessage(inputValue);
      setInputValue(''); // Clear the input value
    }
  };

  const handleSaveSession = async () => {
    try {
      const response = await fetch('http://localhost:3000/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, chatLog: messages }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Session saved successfully!');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  return (
    <div className="chat-window">
      <div className="rce-container-mlist message-list" style={{ width: '50%' }}>
        <div className="rce-mlist">
          <MessageList className="message-list" lockable={true} dataSource={messages} />
        </div>
      </div>
      <div className="input-container">
  <div className="share-link-container">
    <CopyToClipboard text={`${window.location.origin}${window.location.pathname}?token=${token}`}>
      <button className="share-link-button" onClick={handleCopyLink}>
        Share Link
      </button>
    </CopyToClipboard>
    {isLinkCopied && <div className="link-copied-notice">URL has been copied!</div>}
  </div>
  <div style={{ width: '50%' }}>
    <Input
      className="message-input"
      placeholder="Type your message..."
      multiline={false}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyUp={handleKeyUp}
    />
  </div>
  <button className="save-session-button" onClick={handleSaveSession}>
    Save Session
  </button>
</div>
      <div className="powered-by-bar">
        <span className="powered-by-text">Powered by Another Day Systems</span>
      </div>
    </div>
  );
}

export default ChatWindow;

