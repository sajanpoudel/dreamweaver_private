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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Dream Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
        />
        <div className="relative">
          <textarea
            placeholder="Describe your dream..."
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full min-h-[400px] bg-transparent border-none text-lg text-purple-100 placeholder:text-white/20 focus:outline-none focus:ring-0 resize-none pr-12"
          />
          <div className="absolute bottom-4 right-4">
            <SpeechInput onTranscript={handleSpeechInput} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            className="data-[state=checked]:bg-purple-500"
          />
          <Label htmlFor="isPublic" className="text-purple-200">
            Share publicly
          </Label>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="ghost" 
            className="text-purple-200 hover:text-purple-100 hover:bg-purple-500/10"
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Publishing...' : 'Publish Dream'}
          </Button>
        </div>
      </div>
    </form>
  );
} 