'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileAttachment {
  name: string;
  type: string;
  data: string; // base64
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  model: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
}

const AI_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Multimodal Puissant)' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude Haiku (Rapide)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 3.5 (Documents + Texte)' },
  { id: 'microsoft/phi-4', name: 'Microsoft Phi-4 (Vision + Texte efficace)' },
  { id: 'qwen/qwen-2.5-vl-7b-instruct:free', name: 'Qwen2.5 VL 7B Instruct (Multimodal réel (texte + images)' },
];

export default function ChatbotModal({ isOpen, onClose, userName, userId }: ChatbotModalProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les chats depuis l'API
  useEffect(() => {
    if (isOpen && userId) {
      loadChats();
    }
  }, [isOpen, userId]);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat-conversations', {
        headers: {
          'x-user-id': userId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convertir les dates string en objets Date
        const chatsWithDates = data.map((chat: Chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(chatsWithDates);
        
        // Sélectionner le dernier chat ou créer un nouveau
        if (chatsWithDates.length > 0) {
          setCurrentChatId(chatsWithDates[chatsWithDates.length - 1].id);
        } else {
          createNewChat();
        }
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error('Erreur chargement chats:', error);
      createNewChat();
    }
  };



  const createNewChat = async () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Nouveau chat',
      createdAt: new Date(),
      model: selectedModel,
      messages: [
        {
          role: 'assistant',
          content: `Bonjour ${userName} ! 👋 Je suis votre assistant IA. Posez-moi vos questions et je vous aiderai avec plaisir !`,
          timestamp: new Date()
        }
      ]
    };
    
    try {
      const response = await fetch('/api/chat-conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          title: newChat.title,
          model: newChat.model,
          messages: newChat.messages
        })
      });
      
      if (response.ok) {
        const savedChat = await response.json();
        const chatWithDates = {
          ...savedChat,
          createdAt: new Date(savedChat.createdAt),
          messages: savedChat.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        };
        setChats(prev => [...prev, chatWithDates]);
        setCurrentChatId(chatWithDates.id);
      } else {
        // Fallback local si l'API échoue
        setChats(prev => [...prev, newChat]);
        setCurrentChatId(newChat.id);
      }
    } catch (error) {
      console.error('Erreur création chat:', error);
      // Fallback local
      setChats(prev => [...prev, newChat]);
      setCurrentChatId(newChat.id);
    }
    
    setShowHistory(false);
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      return (isImage || isPDF) && isUnder10MB;
    });
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Convertir les fichiers en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Sauvegarder le chat dans l'API
  const saveChatToAPI = async (chat: Chat) => {
    try {
      await fetch('/api/chat-conversations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          id: chat.id,
          title: chat.title,
          model: chat.model,
          messages: chat.messages
        })
      });
    } catch (error) {
      console.error('Erreur sauvegarde chat:', error);
    }
  };

  const updateChatTitle = async (chatId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId && chat.title === 'Nouveau chat') {
        const updatedChat = { ...chat, title };
        saveChatToAPI(updatedChat);
        return updatedChat;
      }
      return chat;
    }));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isLoading || !currentChatId) return;

    // Convertir les fichiers en base64
    const fileData: FileAttachment[] = await Promise.all(
      attachedFiles.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await fileToBase64(file)
      }))
    );

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: fileData.length > 0 ? fileData : undefined
    };

    // Mettre à jour les messages du chat actuel et sauvegarder
    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const updatedChat = { ...chat, messages: [...chat.messages, userMessage] };
        saveChatToAPI(updatedChat);
        return updatedChat;
      }
      return chat;
    }));

    // Mettre à jour le titre si c'est le premier message utilisateur
    if (messages.length === 1 && inputMessage.trim()) {
      updateChatTitle(currentChatId, inputMessage);
    }

    setInputMessage('');
    setAttachedFiles([]);
    setIsLoading(true);

    // Créer un message assistant vide pour le streaming
    const assistantMessageId = Date.now().toString();
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        const updatedChat = { ...chat, messages: [...chat.messages, assistantMessage] };
        saveChatToAPI(updatedChat);
        return updatedChat;
      }
      return chat;
    }));

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          model: currentChat?.model || selectedModel,
          files: fileData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Lire le stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedContent += parsed.content;
                  
                  // Mettre à jour le message en temps réel
                  setChats(prev => prev.map(chat => {
                    if (chat.id === currentChatId) {
                      const messages = [...chat.messages];
                      const lastIndex = messages.length - 1;
                      
                      if (messages[lastIndex].role === 'assistant') {
                        // Créer un nouveau objet message au lieu de modifier l'existant
                        messages[lastIndex] = {
                          ...messages[lastIndex],
                          content: accumulatedContent
                        };
                      }
                      const updatedChat = { ...chat, messages };
                      return updatedChat;
                    }
                    return chat;
                  }));
                }
              } catch (e) {
                // Ignorer les erreurs de parsing
              }
            }
          }
        }
      }

      if (!accumulatedContent) {
        throw new Error('Pas de réponse de l\'IA');
      }

      // Sauvegarder le chat après la réponse complète
      setChats(prev => {
        const updatedChat = prev.find(chat => chat.id === currentChatId);
        if (updatedChat) {
          saveChatToAPI(updatedChat);
        }
        return prev;
      });
    } catch (error) {
      console.error('Erreur chatbot:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date()
      };
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const messages = [...chat.messages];
          // Remplacer le dernier message (vide) par le message d'erreur
          messages[messages.length - 1] = errorMessage;
          const updatedChat = { ...chat, messages };
          saveChatToAPI(updatedChat);
          return updatedChat;
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat-conversations?id=${chatId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      });
      
      if (response.ok) {
        setChats(prev => {
          const updated = prev.filter(chat => chat.id !== chatId);
          if (currentChatId === chatId) {
            setCurrentChatId(updated.length > 0 ? updated[updated.length - 1].id : null);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Erreur suppression chat:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="chatbot-modal">
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h2>Assistant IA</h2>
              <p className="chatbot-status">
                {AI_MODELS.find(m => m.id === (currentChat?.model || selectedModel))?.name}
              </p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="btn-header-action"
              aria-label="Historique"
              title="Historique des chats"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button 
              onClick={createNewChat} 
              className="btn-header-action"
              aria-label="Nouveau chat"
              title="Nouveau chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button onClick={onClose} className="modal-close" aria-label="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panneau historique */}
        {showHistory && (
          <div className="chatbot-history-panel">
            <div className="history-header">
              <h3>Historique des chats ({chats.length})</h3>
            </div>
            <div className="history-list">
              {chats.map(chat => (
                <div 
                  key={chat.id} 
                  className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
                >
                  <button
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setShowHistory(false);
                    }}
                    className="history-item-btn"
                  >
                    <div className="history-item-title">{chat.title}</div>
                    <div className="history-item-info">
                      {chat.messages.length} messages · {chat.createdAt.toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteChat(chat.id)}
                    className="btn-delete-chat"
                    aria-label="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sélecteur de modèle */}
        <div className="chatbot-model-selector">
          <label htmlFor="model-select">Modèle IA :</label>
          <select 
            id="model-select"
            value={currentChat?.model || selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              if (currentChatId) {
                setChats(prev => prev.map(chat =>
                  chat.id === currentChatId
                    ? { ...chat, model: e.target.value }
                    : chat
                ));
              }
            }}
            disabled={isLoading}
          >
            {AI_MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? userName.charAt(0).toUpperCase() : '🤖'}
              </div>
              <div className="message-content">
                {/* Afficher les fichiers attachés */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map((file, fileIndex) => (
                      <div key={fileIndex} className="message-attachment">
                        {file && file.type && file.type.startsWith('image/') ? (
                          <img 
                            src={file.data} 
                            alt={file.name}
                            className="attachment-image"
                          />
                        ) : file && file.name ? (
                          <div className="attachment-file">
                            <span className="attachment-icon">📄</span>
                            <span className="attachment-name">{file.name}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                <div className="message-text">
                  {message.role === 'assistant' && !message.content && isLoading ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : message.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content || ''}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area">
          {/* Fichiers attachés */}
          {attachedFiles.length > 0 && (
            <div className="attached-files">
              {attachedFiles.map((file, index) => (
                <div key={index} className="attached-file">
                  <span className="file-icon">
                    {file.type.startsWith('image/') ? '🖼️' : '📄'}
                  </span>
                  <span className="file-name">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="btn-remove-file"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="input-row">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              multiple
              className="file-input-hidden"
              aria-label="Sélectionner des fichiers"
            />
            <button
              onClick={handleFileAttach}
              className="btn-attach"
              disabled={isLoading}
              aria-label="Joindre fichier"
              title="Joindre image ou PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              disabled={isLoading}
              rows={1}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isLoading}
              className="btn-send"
              aria-label="Envoyer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
