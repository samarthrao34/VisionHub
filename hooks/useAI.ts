import { useState, useCallback, useRef } from 'react';
import { EventData } from '../types';
import { queryAIAboutEvents, AIResponse } from '../services/geminiService';

// SpeechRecognition type declarations
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface UseAIReturn {
  query: string;
  setQuery: (query: string) => void;
  response: AIResponse | null;
  isLoading: boolean;
  error: string | null;
  search: (customQuery?: string) => Promise<void>;
  clearResponse: () => void;
  suggestedQueries: string[];
  isListening: boolean;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  // Aliases
  startListening: () => void;
  stopListening: () => void;
  speechSupported: boolean;
}

const SUGGESTED_QUERIES = [
  "What exams are scheduled this month?",
  "Show me upcoming workshops",
  "When is the next holiday?",
  "List all lectures this week",
  "Are there any schedule conflicts?",
  "What events are happening today?",
];

export const useAI = (events: EventData[]): UseAIReturn => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    if (!searchQuery.trim()) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await queryAIAboutEvents(searchQuery, events);
      setResponse(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Failed to get AI response. Please try again.');
      console.error('AI Query Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, events]);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const startVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const results: SpeechRecognitionResult[] = [];
      for (let i = 0; i < event.results.length; i++) {
        results.push(event.results[i]);
      }
      const transcript = results
        .map((result: SpeechRecognitionResult) => result[0].transcript)
        .join('');
      setQuery(transcript);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'aborted') {
        setError('Voice recognition failed. Please try again.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, []);

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speechSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  return {
    query,
    setQuery,
    response,
    isLoading,
    error,
    search,
    clearResponse,
    suggestedQueries: SUGGESTED_QUERIES,
    isListening,
    startVoiceInput,
    stopVoiceInput,
    // Aliases for convenience
    startListening: startVoiceInput,
    stopListening: stopVoiceInput,
    speechSupported,
  };
};
