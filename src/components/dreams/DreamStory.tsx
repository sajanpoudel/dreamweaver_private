'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Edit2, Save, RefreshCw, ImagePlus } from 'lucide-react';
import { RichTextEditor } from '../editor/RichTextEditor';
import { Story, StoryContent, Section, parseStoryContent } from '@/types/story';

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

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url;
}

async function regenerateImage(prompt: string): Promise<string> {
  const response = await fetch('/api/images/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to regenerate image');
  }

  const data = await response.json();
  return data.url;
}

async function fetchExistingStory(dreamId: string) {
  try {
    const response = await fetch(`/api/dreams/${dreamId}/story`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch story');
    }
    const data = await response.json();
    return data.story;
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
}

export default function DreamStory({ dreamId }: { dreamId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [editedStory, setEditedStory] = useState<StoryContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingStory = async () => {
      try {
        const existingStory = await fetchExistingStory(dreamId);
        if (existingStory) {
          setStory(existingStory);
        }
      } catch (err) {
        console.error('Error loading story:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
      }
    };

    loadExistingStory();
  }, [dreamId]);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateStory(dreamId);
      setStory(result.story);
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
      const result = await publishStory(dreamId);
      toast.success('Story published successfully! 🎉');
      setStory(result.story);
    } catch (err) {
      console.error('Story publishing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish story');
      toast.error('Failed to publish story');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = () => {
    if (!story) return;
    
    const storyContent = parseStoryContent(story);
    
    // Parse HTML content for rich text editor
    const parseHtmlContent = (html: string) => {
      // If the content is already wrapped in <p> tags, extract the inner content
      if (html.startsWith('<p>') && html.endsWith('</p>')) {
        return html.slice(3, -4); // Remove <p> and </p>
      }
      return html;
    };

    setEditedStory({
      ...storyContent,
      introduction: parseHtmlContent(storyContent.introduction),
      sections: storyContent.sections.map(section => ({
        ...section,
        content: parseHtmlContent(section.content)
      })),
      conclusion: parseHtmlContent(storyContent.conclusion),
      interpretation: parseHtmlContent(storyContent.interpretation)
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedStory || !story) return;
    
    try {
      const response = await fetch(`/api/dreams/story/${story.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedStory }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save story');
      }

      const updatedStory = await response.json();
      setStory(updatedStory);
      setIsEditing(false);
      toast.success('Story saved successfully');
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save story');
    }
  };

  const handleCancel = () => {
    setEditedStory(null);
    setIsEditing(false);
  };

  if (!story) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 p-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Transform Your Dream
              </h2>
              <p className="text-purple-200/80">
                Let AI craft a beautiful narrative from your dream, complete with imagery and interpretation
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateStory}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 hover:from-purple-500/30 hover:via-fuchsia-500/30 hover:to-pink-500/30 text-purple-100 rounded-xl px-8 py-4 shadow-lg border border-purple-500/20 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg font-semibold">
                  {isLoading ? 'Crafting your story...' : 'Craft Story from Dream'}
                </span>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-purple-200 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-purple-200">✨</span>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  const storyContent = parseStoryContent(story);

  if (isEditing && editedStory) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 p-8">
            <Input
              value={editedStory.title}
              onChange={(e) => setEditedStory({ ...editedStory, title: e.target.value })}
              className="text-2xl font-bold mb-4 bg-purple-500/10 border-purple-500/20 text-purple-100"
              placeholder="Story Title"
            />
            
            <Input
              value={editedStory.subtitle}
              onChange={(e) => setEditedStory({ ...editedStory, subtitle: e.target.value })}
              className="text-xl mb-6 bg-purple-500/10 border-purple-500/20 text-purple-100"
              placeholder="Subtitle"
            />

            <div className="mb-8">
              <label className="text-sm text-purple-200/80 mb-2 block">Introduction</label>
              <RichTextEditor
                content={editedStory.introduction}
                onChange={(content) => setEditedStory({ ...editedStory, introduction: content })}
                placeholder="Write your introduction..."
              />
            </div>

            {editedStory.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <Input
                    value={section.title}
                    onChange={(e) => {
                      const newSections = [...editedStory.sections];
                      newSections[index] = { ...section, title: e.target.value };
                      setEditedStory({ ...editedStory, sections: newSections });
                    }}
                    className="text-lg font-semibold bg-purple-500/10 border-purple-500/20 text-purple-100"
                    placeholder={`Section ${index + 1} Title`}
                  />
                </div>

                <div className="space-y-4">
                  <RichTextEditor
                    content={section.content}
                    onChange={(content) => {
                      const newSections = [...editedStory.sections];
                      newSections[index] = { ...section, content };
                      setEditedStory({ ...editedStory, sections: newSections });
                    }}
                    placeholder={`Write section ${index + 1} content...`}
                  />

                  {section.imageUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={section.imageUrl}
                        alt={section.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {section.imagePrompt && (
                    <div className="flex items-center gap-4">
                      <Input
                        value={section.imagePrompt}
                        onChange={(e) => {
                          const newSections = [...editedStory.sections];
                          newSections[index] = { ...section, imagePrompt: e.target.value };
                          setEditedStory({ ...editedStory, sections: newSections });
                        }}
                        className="flex-1 bg-purple-500/10 border-purple-500/20 text-purple-100"
                        placeholder="Image prompt..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const url = await regenerateImage(section.imagePrompt);
                            const newSections = [...editedStory.sections];
                            newSections[index] = { ...section, imageUrl: url };
                            setEditedStory({ ...editedStory, sections: newSections });
                          } catch (error) {
                            toast.error('Failed to generate image');
                          }
                        }}
                        className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="mb-8">
              <label className="text-sm text-purple-200/80 mb-2 block">Conclusion</label>
              <RichTextEditor
                content={editedStory.conclusion}
                onChange={(content) => setEditedStory({ ...editedStory, conclusion: content })}
                placeholder="Write your conclusion..."
              />
            </div>

            <div className="mb-8">
              <label className="text-sm text-purple-200/80 mb-2 block">Interpretation</label>
              <RichTextEditor
                content={editedStory.interpretation}
                onChange={(content) => setEditedStory({ ...editedStory, interpretation: content })}
                placeholder="Write your interpretation..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-purple-500/20 text-purple-100 hover:bg-purple-500/30"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-3xl"></div>
        <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-purple-500/20 p-8">
          <div className="flex justify-end mb-6">
            <Button
              variant="ghost"
              onClick={handleEdit}
              className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Story
            </Button>
          </div>

          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
              {storyContent.title}
            </h1>
            <p className="text-xl text-purple-200/80 italic">{storyContent.subtitle}</p>
          </header>

          <div className="mb-12">
            <div 
              className="text-xl leading-relaxed text-purple-100 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: storyContent.introduction }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {storyContent.themes.map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm border border-purple-500/20"
              >
                {theme}
              </span>
            ))}
          </div>

          <div className="space-y-16">
            {storyContent.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-sm"></div>
                <div className="relative space-y-6">
                  <h2 className="text-2xl font-semibold text-purple-100">
                    {section.title}
                  </h2>

                  {section.imageUrl && (
                    <div className="aspect-[16/9] relative overflow-hidden rounded-xl">
                      <Image
                        src={section.imageUrl}
                        alt={section.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-purple-200/90"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {storyContent.conclusion && (
            <div className="mt-16 space-y-4">
              <h2 className="text-2xl font-semibold text-purple-100">
                Conclusion
              </h2>
              <div
                className="text-purple-200/90 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: storyContent.conclusion }}
              />
            </div>
          )}

          {storyContent.interpretation && (
            <div className="mt-8 p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h2 className="text-xl font-semibold text-purple-100 mb-4">
                Dream Interpretation
              </h2>
              <div
                className="text-purple-200/90 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: storyContent.interpretation }}
              />
            </div>
          )}

          {!story.publishedAt && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={handlePublishStory}
                disabled={isPublishing}
                className="bg-purple-500/20 text-purple-100 hover:bg-purple-500/30"
              >
                {isPublishing ? 'Publishing...' : 'Publish Story'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 