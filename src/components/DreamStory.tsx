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

interface Section {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
}

interface Story {
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
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStory(dreamId);
      const storyData = typeof result.story.content === 'string' 
        ? { ...result.story, ...JSON.parse(result.story.content) }
        : result.story;
      setStory(storyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsLoading(false);
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
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {story && (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{story.title}</h1>
            <p className="text-xl text-gray-600 italic">{story.subtitle}</p>
          </header>

          {/* Introduction */}
          <div className="mb-12">
            <p className="text-xl leading-relaxed text-gray-700">{story.introduction}</p>
          </div>

          {/* Themes */}
          <div className="flex flex-wrap gap-2 mb-8">
            {story.themes.map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{section.title}</h2>
                
                {section.imageUrl && (
                  <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden">
                    <Image
                      src={section.imageUrl}
                      alt={`Illustration for ${section.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                <div className="prose prose-lg">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Conclusion */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Conclusion</h2>
            <p className="text-gray-700 leading-relaxed">{story.conclusion}</p>
          </div>

          {/* Interpretation */}
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">Dream Interpretation</h3>
            <p className="text-purple-900">{story.interpretation}</p>
          </div>

          {/* Actions */}
          <div className="mt-12 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
              onClick={() => window.print()}
            >
              Save Story
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
              onClick={handleGenerateStory}
            >
              Generate New Version
            </motion.button>
          </div>
        </motion.article>
      )}
    </div>
  );
} 