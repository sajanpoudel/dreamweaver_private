export interface Story {
  id: string;
  title: string;
  content: string;
  publishedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  themes: Array<{ id: string; name: string }>;
  symbols: Array<{ id: string; name: string }>;
  likes: Array<{ id: string }>;
  _count: {
    likes: number;
    comments: number;
  };
} 