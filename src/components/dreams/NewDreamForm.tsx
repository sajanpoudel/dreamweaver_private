'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { SpeechInput } from '../dreams/SpeechInput';
import { toast } from 'sonner'
import { motion } from 'framer-motion';
import React from 'react';

export function NewDreamForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: false,
  });

  const handleSpeechInput = useCallback((text: string) => {
    setFormData(prev => ({
      ...prev,
      content: (prev.content + ' ' + text).trim(),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create dream');
      }

      const dream = await response.json();
      toast.success('Dream recorded successfully');
      router.push(`/dreams/${dream.id}`);
    } catch (error) {
      console.error('Error creating dream:', error);
      toast.error('Failed to record dream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
      <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-8 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2">
            Record Your Dream
          </h1>
          <p className="text-purple-200/80">
            Capture the essence of your dreams and unlock their hidden meanings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-purple-200">
              Dream Description
            </Label>
            <div className="relative">
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Describe your dream in detail..."
                className="min-h-[200px] bg-white/5 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50"
                required
              />
              <div className="absolute bottom-4 right-4">
                <SpeechInput onTranscript={handleSpeechInput} />
              </div>
            </div>
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

          <div className="pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <Button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 h-12 text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                {isLoading ? 'Recording Dream...' : 'Record Dream'}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 