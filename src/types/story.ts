export interface Section {
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
}

export interface StoryContent {
  title: string;
  subtitle: string;
  introduction: string;
  sections: Section[];
  conclusion: string;
  themes: string[];
  interpretation: string;
}

export interface Story {
  id: string;
  title: string;
  content: string | StoryContent;
  publishedAt: Date | null;
  userId: string;
  dreamId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  dream?: {
    title: string;
    themes: Array<{ name: string }>;
    symbols: Array<{ name: string }>;
  };
  themes: Array<{ id: string; name: string }>;
  symbols: Array<{ id: string; name: string }>;
  likes: Array<{ id: string }>;
  _count?: {
    likes: number;
    comments: number;
  };
}

export function parseStoryContent(story: Story): StoryContent {
  // If content is already an object, return as is
  if (typeof story.content !== 'string') {
    return story.content;
  }

  try {
    // If content is a string but already JSON, parse it
    if (story.content.startsWith('{')) {
      return JSON.parse(story.content);
    }
  } catch (e) {
    console.error('Error parsing story content:', e);
  }

  // If content is a plain string or parsing failed, create a default structure
  return {
    title: story.title,
    subtitle: '',
    introduction: story.content,
    sections: [],
    conclusion: '',
    themes: [],
    interpretation: ''
  };
} 