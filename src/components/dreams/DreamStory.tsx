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
  const [isEditing, setIsEditing] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [editedStory, setEditedStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingStory = async () => {
      try {
        const existingStory = await fetchExistingStory(dreamId);
        if (existingStory) {
          const storyData = typeof existingStory.content === 'string'
            ? { ...existingStory, ...JSON.parse(existingStory.content) }
            : existingStory;
          setStory(storyData);
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

  const handleEdit = () => {
    if (!story) return;
    
    // Parse HTML content for rich text editor
    const parseHtmlContent = (html: string) => {
      // If the content is already wrapped in <p> tags, extract the inner content
      if (html.startsWith('<p>') && html.endsWith('</p>')) {
        return html.slice(3, -4); // Remove <p> and </p>
      }
      return html;
    };

    setEditedStory({
      ...story,
      introduction: parseHtmlContent(story.introduction),
      sections: story.sections.map(section => ({
        ...section,
        content: parseHtmlContent(section.content)
      })),
      conclusion: parseHtmlContent(story.conclusion),
      interpretation: parseHtmlContent(story.interpretation)
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedStory) return;
    
    try {
      // Format the content to match the expected structure
      const formattedContent = {
        title: editedStory.title,
        subtitle: editedStory.subtitle,
        introduction: editedStory.introduction,
        sections: editedStory.sections.map(section => ({
          title: section.title,
          content: section.content,
          imageUrl: section.imageUrl,
          imagePrompt: section.imagePrompt
        })),
        conclusion: editedStory.conclusion,
        themes: editedStory.themes,
        interpretation: editedStory.interpretation
      };

      // Use the story ID instead of dreamId for the PUT request
      const response = await fetch(`/api/dreams/story/${editedStory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: formattedContent }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save story');
      }

      const updatedStory = await response.json();
      // Parse the content if it's a string
      const storyData = typeof updatedStory.content === 'string'
        ? { ...updatedStory, ...JSON.parse(updatedStory.content) }
        : updatedStory;

      setStory(storyData);
      setIsEditing(false);
      toast.success('Story saved successfully');
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save story');
    }
  };

  const handleCancel = () => {
    setEditedStory(story);
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
                placeholder="Write your story introduction..."
              />
            </div>

            {editedStory.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <Input
                  value={section.title}
                  onChange={(e) => {
                    const newSections = [...editedStory.sections];
                    newSections[index] = { ...section, title: e.target.value };
                    setEditedStory({ ...editedStory, sections: newSections });
                  }}
                  className="text-xl font-bold mb-4 bg-purple-500/10 border-purple-500/20 text-purple-100"
                  placeholder="Section Title"
                />

                <div className="mb-6">
                  <RichTextEditor
                    content={section.content}
                    onChange={(content) => {
                      const newSections = [...editedStory.sections];
                      newSections[index] = { ...section, content };
                      setEditedStory({ ...editedStory, sections: newSections });
                    }}
                    placeholder="Write your section content..."
                  />
                </div>

                <div className="relative">
                  {section.imageUrl ? (
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
                      <Image
                        src={section.imageUrl}
                        alt={section.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
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
                              toast.error('Failed to regenerate image');
                            }
                          }}
                          className="bg-black/50 text-white hover:bg-black/70"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;
                              try {
                                const url = await uploadImage(e.target.files[0]);
                                const newSections = [...editedStory.sections];
                                newSections[index] = { ...section, imageUrl: url };
                                setEditedStory({ ...editedStory, sections: newSections });
                              } catch (error) {
                                toast.error('Failed to upload image');
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black/50 text-white hover:bg-black/70"
                          >
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Replace
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-4">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            try {
                              const url = await uploadImage(e.target.files[0]);
                              const newSections = [...editedStory.sections];
                              newSections[index] = { ...section, imageUrl: url };
                              setEditedStory({ ...editedStory, sections: newSections });
                            } catch (error) {
                              toast.error('Failed to upload image');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
                        >
                          <ImagePlus className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
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
              <label className="text-sm text-purple-200/80 mb-2 block">Dream Interpretation</label>
              <RichTextEditor
                content={editedStory.interpretation}
                onChange={(content) => setEditedStory({ ...editedStory, interpretation: content })}
                placeholder="Write your dream interpretation..."
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
                className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-500/20"
              >
                <Save className="w-4 h-4 mr-2" />
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
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
              {story.title}
            </h1>
            <p className="text-xl text-purple-200/80 italic">{story.subtitle}</p>
          </header>

          {/* Introduction */}
          <div className="mb-12">
            <div 
              className="text-xl leading-relaxed text-purple-100 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: story.introduction }}
            />
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                    />
                  </div>
                )}

                <div 
                  className="prose prose-invert max-w-none text-purple-200/90"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </motion.section>
            ))}
          </div>

          {/* Conclusion */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-purple-100 mb-6">Conclusion</h2>
            <div 
              className="text-purple-200/90 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: story.conclusion }}
            />
          </div>

          {/* Interpretation */}
          <div className="bg-purple-500/10 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-xl font-semibold text-purple-100 mb-4">Dream Interpretation</h3>
            <div 
              className="text-purple-200/90 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: story.interpretation }}
            />
          </div>

          {/* Actions */}
          <div className="mt-12 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-indigo-500/20 text-indigo-200 rounded-lg shadow hover:bg-indigo-500/30 transition-colors border border-indigo-500/20 flex items-center gap-2"
              onClick={handleEdit}
            >
              <Edit2 className="w-4 h-4" />
              Edit Story
            </motion.button>
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
    </div>
  );
} 