import { useState, useCallback } from 'react';
import axios from 'axios';
import { AIAnalysisRequest, AIAnalysisResponse, AttackTree } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface UseAIReturn {
  isAnalyzing: boolean;
  error: string | null;
  analyze: (request: AIAnalysisRequest) => Promise<AIAnalysisResponse | null>;
  generateAttackTree: (request: AIAnalysisRequest) => Promise<AttackTree | null>;
}

export function useAI(): UseAIReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (request: AIAnalysisRequest): Promise<AIAnalysisResponse | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post<AIAnalysisResponse>(
        `${API_URL}/api/analyze`,
        request,
        { timeout: 60000 }
      );
      return response.data;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('AI Analysis error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateAttackTree = useCallback(async (request: AIAnalysisRequest): Promise<AttackTree | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post<AttackTree>(
        `${API_URL}/api/generate-attack-tree`,
        request,
        { timeout: 60000 }
      );
      return response.data;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Attack tree generation error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    error,
    analyze,
    generateAttackTree,
  };
}
