'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Dream {
  id: string;
  title: string | null;
  content: string;
  isPublic: boolean;
}

interface DreamActionsProps {
  dream: Dream;
}

export function DreamActions({ dream }: DreamActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: dream.title || '',
    content: dream.content,
    isPublic: dream.isPublic,
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dream?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/dreams/${dream.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dream');
      }

      toast.success('Dream deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting dream:', error);
      toast.error('Failed to delete dream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dreams/${dream.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update dream');
      }

      toast.success('Dream updated successfully');
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating dream:', error);
      toast.error('Failed to update dream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1c2e] border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-3xl"></div>
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Edit Dream
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-purple-200">
                  Dream Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Give your dream a title"
                  className="bg-white/5 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-purple-200">
                  Dream Description
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Describe your dream in detail..."
                  className="min-h-[200px] bg-white/5 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                  }
                  className="data-[state=checked]:bg-purple-500"
                />
                <Label htmlFor="isPublic" className="text-purple-200">
                  Share this dream publicly
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                >
                  Cancel
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isLoading}
          className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
} 