'use client';
import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '@/lib/api-config';

export function useDeliverabilityAnalysis() {
  const [domain, setDomain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState({});
  const [score, setScore] = useState(null);
  const [grade, setGrade] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [completedChecks, setCompletedChecks] = useState([]);
  const esRef = useRef(null);

  const analyze = useCallback((inputDomain) => {
    if (esRef.current) esRef.current.close();
    setResults({});
    setScore(null);
    setGrade(null);
    setProvider(null);
    setError(null);
    setCompletedChecks([]);
    setIsAnalyzing(true);

    const url = `${API_BASE}/api/v1/tools/email-deliverability/analyze?domain=${encodeURIComponent(inputDomain)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.check === 'complete') {
          setScore(data.score);
          setGrade(data.grade);
          setProvider(data.provider);
          setIsAnalyzing(false);
          es.close();
        } else if (data.check !== 'status') {
          setResults(prev => ({ ...prev, [data.check]: data }));
          setCompletedChecks(prev => [...prev, data.check]);
          if (data.provider) setProvider(data.provider);
        }
      } catch {}
    };

    es.onerror = () => {
      setError('Connection error. Please check the domain and try again.');
      setIsAnalyzing(false);
      es.close();
    };
  }, []);

  const reset = useCallback(() => {
    if (esRef.current) esRef.current.close();
    setResults({});
    setScore(null);
    setGrade(null);
    setProvider(null);
    setError(null);
    setCompletedChecks([]);
    setIsAnalyzing(false);
    setDomain('');
  }, []);

  return { domain, setDomain, isAnalyzing, results, score, grade, provider, error, completedChecks, analyze, reset };
}
