'use client';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

interface SpeechInputProps {
  onTranscript: (text: string) => void;
}

export function SpeechInput({ onTranscript }: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const startListening = useCallback(() => {
    try {
      if (!('webkitSpeechRecognition' in window)) {
        toast.error('Speech recognition is not supported in your browser');
        return;
      }

      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Listening...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        onTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Failed to recognize speech');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      toast.success('Stopped listening');
    }
  }, [recognition]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={isListening ? stopListening : startListening}
      className="text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10"
    >
      {isListening ? (
        <MicOff className="h-5 w-5 text-pink-500" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
} 