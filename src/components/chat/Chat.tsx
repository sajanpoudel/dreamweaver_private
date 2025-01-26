'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatList } from './ChatList';
import { toast } from 'sonner';

interface ActiveChat {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function Chat() {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);

  useEffect(() => {
    const handleChatOpen = (event: CustomEvent<{ chatId: string; userId: string; user: any }>) => {
      const { chatId, userId, user } = event.detail;
      
      // Check if chat is already open
      const existingChat = activeChats.find(chat => chat.id === chatId);
      if (existingChat) {
        // Focus the existing chat window
        const chatWindow = document.getElementById(`chat-${existingChat.id}`);
        chatWindow?.focus();
        return;
      }

      // Add new chat to active chats
      setActiveChats(prev => [...prev, { id: chatId, userId, user }]);

      // Focus the new chat window after a short delay to allow it to render
      setTimeout(() => {
        const chatWindow = document.getElementById(`chat-${chatId}`);
        chatWindow?.focus();
      }, 100);
    };

    // Add event listener
    window.addEventListener('chat:open' as any, handleChatOpen);

    // Cleanup
    return () => {
      window.removeEventListener('chat:open' as any, handleChatOpen);
    };
  }, [activeChats]);

  const handleCloseChat = (chatId: string) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  return (
    <div className="fixed bottom-0 right-4 z-50">
      <div className="relative">
        {activeChats.map((chat, index) => (
          <ChatWindow
            key={chat.id}
            chatId={chat.id}
            user={chat.user}
            onClose={() => handleCloseChat(chat.id)}
            style={{ right: `${index * 320}px` }}
          />
        ))}
        <ChatList onChatSelect={handleStartChat} />
      </div>
    </div>
  );

  async function handleStartChat(userId: string) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantIds: [userId],
          isGroup: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create chat');
      }

      const chat = await response.json();
      
      // Add new chat to active chats
      setActiveChats(prev => [...prev, { id: chat.id, userId, user: { id: chat.id, name: null, image: null } }]);

      // Focus the new chat window after a short delay to allow it to render
      setTimeout(() => {
        const chatWindow = document.getElementById(`chat-${chat.id}`);
        chatWindow?.focus();
      }, 100);

    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  }
}
