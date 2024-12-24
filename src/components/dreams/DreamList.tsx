"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Dream = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  symbols: { name: string }[];
  emotions: { name: string; intensity: number }[];
};

export default function DreamList() {
  const { data: dreams, isLoading } = useQuery<Dream[]>({
    queryKey: ["dreams"],
    queryFn: async () => {
      const response = await fetch("/api/dreams");
      if (!response.ok) {
        throw new Error("Failed to fetch dreams");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading dreams...</p>
      </div>
    );
  }

  if (!dreams?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No dreams recorded yet.</p>
        <p className="mt-1 text-sm text-gray-500">
          Click the "New Dream" button to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dreams.map((dream) => (
        <Link
          key={dream.id}
          href={`/dreams/${dream.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">
                {dream.title || "Untitled Dream"}
              </h3>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(dream.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="mt-2 text-gray-600 line-clamp-3">{dream.content}</p>
            {(dream.symbols.length > 0 || dream.emotions.length > 0) && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {dream.symbols.slice(0, 3).map((symbol) => (
                    <span
                      key={symbol.name}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {symbol.name}
                    </span>
                  ))}
                  {dream.emotions.slice(0, 2).map((emotion) => (
                    <span
                      key={emotion.name}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {emotion.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
} 