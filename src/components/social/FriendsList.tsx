'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Search } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface Friend {
  id: string;
  name: string | null;
  image: string | null;
  friendshipId: string;
  isOnline?: boolean;
}

interface PendingRequest {
  id: string;
  requester: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchFriends();
  }, [debouncedSearch]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendshipId,
          status: 'accepted',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }

      toast.success('Friend request accepted');
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendshipId,
          status: 'rejected',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject friend request');
      }

      toast.success('Friend request rejected');
      fetchFriends();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendshipId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      toast.success('Friend removed');
      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (userId: string, friend: Friend) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantIds: [userId]
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create chat');
      }

      const chat = await response.json();
      
      // Dispatch a custom event to notify the Chat component
      const event = new CustomEvent('chat:open', { 
        detail: { 
          chatId: chat.id,
          userId: userId,
          user: {
            id: friend.id,
            name: friend.name,
            image: friend.image
          }
        }
      });
      window.dispatchEvent(event);
      
      toast.success('Chat opened');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-100" />
              <h2 className="text-lg font-semibold text-purple-100">Friends</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
              asChild
            >
              <Link href="/friends/suggestions">Find Friends</Link>
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-200/60" />
            <Input
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/60"
            />
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-purple-200/80 mb-2">
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between group p-2 rounded-lg hover:bg-purple-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-purple-500/20">
                        <AvatarImage src={getImageUrl(request.requester.image)} />
                        <AvatarFallback>{request.requester.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-purple-100 group-hover:text-purple-200 transition-colors">
                          {request.requester.name}
                        </div>
                        <div className="text-xs text-purple-200/60">
                          Wants to be friends
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-200"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="space-y-1">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between group p-2 rounded-lg hover:bg-purple-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8 border border-purple-500/20">
                      <AvatarImage src={getImageUrl(friend.image)} />
                      <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {friend.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-purple-900" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-purple-100 group-hover:text-purple-200 transition-colors">
                    {friend.name}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
                    onClick={() => handleStartChat(friend.id, friend)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isLoading}
                    onClick={() => handleRemoveFriend(friend.friendshipId)}
                    className="h-8 w-8 bg-red-500/10 hover:bg-red-500/20 text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}

            {friends.length === 0 && !pendingRequests.length && (
              <div className="text-center py-4">
                <p className="text-sm text-purple-200/60">No friends yet</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100"
                  asChild
                >
                  <Link href="/friends/suggestions">Find your first friend</Link>
                </Button>
              </div>
            )}

            {friends.length > 0 && filteredFriends.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-purple-200/60">No friends found</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 