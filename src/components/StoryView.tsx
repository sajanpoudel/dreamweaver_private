import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { parseAnalysis, type DreamAnalysis } from '@/lib/dream-analysis';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface StoryViewProps {
  story: any;
  onLike?: () => void;
  onComment?: (comment: string) => void;
  showActions?: boolean;
}

export function StoryView({ story, onLike, onComment, showActions = true }: StoryViewProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('story');
  const analysis = story.dream?.analysis ? parseAnalysis(story.dream.analysis) : null;

  const handleLike = async () => {
    if (!session?.user) return;
    if (onLike) onLike();
  };

  const handleComment = async () => {
    if (!session?.user || !comment.trim()) return;
    if (onComment) {
      onComment(comment);
      setComment('');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-lg border-none shadow-xl">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="story">
            <h2 className="text-2xl font-bold mb-4">{story.title}</h2>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: story.content }} />
          </TabsContent>

          <TabsContent value="analysis">
            {analysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Symbols</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.symbols.map((symbol, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {symbol.name}: {symbol.meaning}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.themes.map((theme, index) => (
                      <Badge key={index} variant="outline">{theme}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Emotions</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.emotions.map((emotion, index) => (
                      <Badge key={index} variant="default" className="text-sm">
                        {emotion.name} ({emotion.intensity}/10)
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Insights</h3>
                  <div className="space-y-4">
                    {analysis.insights.map((insight, index) => (
                      <div key={index} className="bg-white/5 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg mb-2">{insight.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                        {insight.actionable && (
                          <p className="text-sm text-emerald-400">
                            Recommendation: {insight.recommendation}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{insight.category}</Badge>
                          <Badge variant="outline">{Math.round(insight.confidence * 100)}% confidence</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No analysis available for this dream story.</p>
            )}
          </TabsContent>
        </Tabs>

        {showActions && (
          <div className="mt-6 flex items-center gap-4 border-t border-gray-700 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLike}
            >
              <ThumbsUp className={story.isLiked ? 'fill-current' : ''} size={18} />
              <span>{story._count?.likes || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle size={18} />
              <span>{story._count?.comments || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share2 size={18} />
            </Button>
          </div>
        )}

        {showActions && story.comments && (
          <div className="mt-6 space-y-4">
            <div className="space-y-4">
              {story.comments.map((comment: any) => (
                <div key={comment.id} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-300">{comment.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {comment.user?.name} • {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleComment}
                disabled={!comment.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 