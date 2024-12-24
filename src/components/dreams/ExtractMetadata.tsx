'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ExtractMetadataProps {
  dreamId: string;
}

export function ExtractMetadata({ dreamId }: ExtractMetadataProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = async () => {
    try {
      setIsExtracting(true);
      setError(null);

      await axios.post(`/api/dreams/extract`, {
        dreamId,
      });

      // Refresh the page to show the extracted metadata
      window.location.reload();
    } catch (err) {
      console.error('Error extracting metadata:', err);
      setError('Failed to extract metadata. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={extractMetadata}
        disabled={isExtracting}
        className="flex items-center gap-2"
      >
        {isExtracting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isExtracting ? 'Extracting...' : 'Extract Metadata'}
      </Button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 