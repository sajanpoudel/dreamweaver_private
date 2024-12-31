'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

async function generateStory(dreamId: string) {
  try {
    const response = await fetch('/api/dreams/story/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dreamId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

async function publishStory(dreamId: string) {
  try {
    const response = await fetch(`/api/dreams/story/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dreamId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error publishing story:', error);
    throw error;
  }
}

interface Section {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
}

interface Story {
  id: string;
  title: string;
  subtitle: string;
  introduction: string;
  sections: Section[];
  conclusion: string;
  themes: string[];
  interpretation: string;
}

export default function DreamStory({ dreamId }: { dreamId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStory(dreamId);
      // Parse the story content if it's a string
      const storyData = typeof result.story.content === 'string' 
        ? { ...result.story, ...JSON.parse(result.story.content) }
        : result.story;
      setStory(storyData);
    } catch (err) {
      console.error('Story generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishStory = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      await publishStory(dreamId);
      // You could update the UI to show the story is published
    } catch (err) {
      console.error('Story publishing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish story');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {!story && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateStory}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Crafting your story...' : 'Craft Story from Dream'}
        </motion.button>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {story && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 p-8">
            {/* Header */}
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
                {story.title}
              </h1>
              <p className="text-xl text-purple-200/80 italic">{story.subtitle}</p>
            </header>

            {/* Introduction */}
            <div className="mb-12">
              <p className="text-xl leading-relaxed text-purple-100">{story.introduction}</p>
            </div>

            {/* Themes */}
            <div className="flex flex-wrap gap-2 mb-8">
              {story.themes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-500/20"
                >
                  {theme}
                </span>
              ))}
            </div>

            {/* Main Content */}
            <div className="space-y-16">
              {story.sections.map((section, index) => (
                <motion.section
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <h2 className="text-2xl font-bold text-purple-100 mb-6">{section.title}</h2>
                  
                  {section.imageUrl && (
                    <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={section.imageUrl}
                        alt={`Illustration for ${section.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-purple-200/90 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Conclusion */}
            <div className="mt-12 mb-8">
              <h2 className="text-2xl font-bold text-purple-100 mb-6">Conclusion</h2>
              <p className="text-purple-200/90 leading-relaxed">{story.conclusion}</p>
            </div>

            {/* Interpretation */}
            <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-100 mb-4">Dream Interpretation</h3>
              <p className="text-purple-200/90">{story.interpretation}</p>
            </div>

            {/* Actions */}
            <div className="mt-12 flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-indigo-500/20 text-indigo-200 rounded-lg shadow hover:bg-indigo-500/30 transition-colors border border-indigo-500/20"
                onClick={() => window.print()}
              >
                Save Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-purple-500/20 text-purple-200 rounded-lg shadow hover:bg-purple-500/30 transition-colors border border-purple-500/20"
                onClick={handleGenerateStory}
              >
                Generate New Version
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-pink-500/20 text-pink-200 rounded-lg shadow hover:bg-pink-500/30 transition-colors border border-pink-500/20"
                onClick={handlePublishStory}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish Story'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 