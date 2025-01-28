'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  sender: {
    name: string | null;
    image: string | null;
  };
}

interface ChatWindowProps {
  chatId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  onClose: () => void;
  style?: React.CSSProperties;
}

export function ChatWindow({ chatId, user, onClose, style }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  const markMessagesAsRead = async () => {
    try {
      await fetch(`/api/chat/${chatId}/messages/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      id={`chat-${chatId}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 w-80"
      style={style}
      tabIndex={-1}
    >
      <Card className="flex flex-col h-96 bg-black/40 backdrop-blur-xl border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Avatar className="border border-purple-500/20">
                <img
                  src={user.image || '/images/default-avatar.png'}
                  alt={user.name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
            </div>
            <span className="text-sm font-medium text-purple-100">{user.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 hover:bg-purple-500/20 text-purple-200/60 hover:text-purple-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-purple-500/5">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-2 animate-pulse"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-500/20" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-purple-500/20 rounded" />
                    <div className="h-4 w-48 bg-purple-500/20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-2 group">
                <Avatar className="h-8 w-8 border border-purple-500/20">
                  <img
                    src={message.sender.image || '/images/default-avatar.png'}
                    alt={message.sender.name || 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-sm font-medium text-purple-100">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-purple-200/40">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-purple-100/80 break-words">{message.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-sm text-purple-200/40">
              <p>No messages yet</p>
              <p>Start a conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-purple-500/20 bg-purple-500/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex space-x-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/40 focus:ring-purple-500/40"
            />
            <Button 
              type="submit" 
              size="icon"
              className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-100"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}
