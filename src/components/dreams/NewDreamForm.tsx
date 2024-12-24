'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { SpeechInput } from './SpeechInput';

const dreamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Dream content is required'),
  isPublic: z.boolean().default(false),
});

type DreamFormData = z.infer<typeof dreamSchema>;

export function NewDreamForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DreamFormData>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      isPublic: false,
    },
  });

  const content = watch('content');

  const handleTranscript = (text: string) => {
    const newContent = content ? `${content} ${text}` : text;
    setValue('content', newContent, { shouldValidate: true });
  };

  const onSubmit = async (data: DreamFormData) => {
    try {
      setError(null);
      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create dream');
      }

      const dream = await response.json();
      router.push(`/dreams/${dream.id}`);
    } catch (err) {
      console.error('Error creating dream:', err);
      setError('Failed to create dream. Please try again.');
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Title
          </label>
          <input
            {...register('title')}
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Give your dream a title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="content"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Dream Description
            </label>
            <SpeechInput onTranscript={handleTranscript} />
          </div>
          <textarea
            {...register('content')}
            rows={10}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe your dream in detail... You can also use the microphone button to record your dream"
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            {...register('isPublic')}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="isPublic"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Make this dream public
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Dream'}
          </Button>
        </div>
      </form>
    </Card>
  );
} 