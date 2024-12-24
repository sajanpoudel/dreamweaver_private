"use client";

import { formatDistanceToNow } from "date-fns";
import { Share2 } from "lucide-react";

type Symbol = {
  name: string;
  description: string;
};

type Emotion = {
  name: string;
  intensity: number;
  description: string;
};

type Theme = {
  name: string;
  description: string;
};

type Dream = {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date;
  symbols: Symbol[];
  emotions: Emotion[];
  themes: Theme[];
  isPublic: boolean;
};

export default function DreamView({ dream }: { dream: Dream }) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: dream.title || "My Dream",
        text: dream.content,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {dream.title || "Untitled Dream"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Recorded {formatDistanceToNow(new Date(dream.createdAt), { addSuffix: true })}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>

        <div className="mt-6 prose max-w-none">
          <p>{dream.content}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Symbols */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Symbols</h4>
            <div className="space-y-4">
              {dream.symbols.map((symbol) => (
                <div
                  key={symbol.name}
                  className="bg-blue-50 p-4 rounded-lg"
                >
                  <h5 className="text-sm font-medium text-blue-800">
                    {symbol.name}
                  </h5>
                  <p className="mt-1 text-sm text-blue-600">
                    {symbol.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Emotions</h4>
            <div className="space-y-4">
              {dream.emotions.map((emotion) => (
                <div
                  key={emotion.name}
                  className="bg-purple-50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="text-sm font-medium text-purple-800">
                      {emotion.name}
                    </h5>
                    <span className="text-xs text-purple-600">
                      {Math.round(emotion.intensity * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 rounded-full h-2"
                      style={{ width: `${emotion.intensity * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-purple-600">
                    {emotion.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Themes */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Themes</h4>
            <div className="space-y-4">
              {dream.themes.map((theme) => (
                <div
                  key={theme.name}
                  className="bg-green-50 p-4 rounded-lg"
                >
                  <h5 className="text-sm font-medium text-green-800">
                    {theme.name}
                  </h5>
                  <p className="mt-1 text-sm text-green-600">
                    {theme.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 