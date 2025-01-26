'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function NewCommunityForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    guidelines: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create community');
      }

      const data = await response.json();
      toast.success('Community created successfully');
      router.push(`/communities/${data.id}`);
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-purple-100">Community Name</Label>
          <Input
            id="name"
            placeholder="Enter community name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-purple-100">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your community..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[100px] bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guidelines" className="text-purple-100">Community Guidelines</Label>
          <Textarea
            id="guidelines"
            placeholder="Set guidelines for your community..."
            value={formData.guidelines}
            onChange={(e) => setFormData(prev => ({ ...prev, guidelines: e.target.value }))}
            className="min-h-[100px] bg-purple-500/10 border-purple-500/20 text-purple-100 placeholder:text-purple-200/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="isPrivate"
            checked={formData.isPrivate}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
            className="data-[state=checked]:bg-purple-500"
          />
          <Label htmlFor="isPrivate" className="text-purple-100">
            Make this community private
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-purple-200 hover:text-purple-100 hover:bg-purple-500/10"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Community'}
        </Button>
      </div>
    </form>
  );
} 