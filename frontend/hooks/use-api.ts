import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export const useApi = <T = any>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { token, logout, loading: authLoading } = useAuth();

  const request = useCallback(
    async (endpoint: string, config: RequestConfig = {}) => {
      if (authLoading) return;
      setLoading(true);
      setError(null);
      setData(null);

      const { method = 'GET', body, headers = {}, signal } = config;

      const finalHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      try {
        const response = await fetch(endpoint, {
          method,
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : null,
          signal,
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error, logging out:', response.statusText)
            logout()
            return // Stop further execution
          }
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          console.error('Error from API:', errorData); // Log the full error
          throw new Error(errorData.message || 'An error occurred');
        }

        if (response.status === 204) {
          setData(null);
          return null;
        }
        // Handle empty responses
        const text = await response.text();
        if (!text) {
          setData(null as T);
          return null as T;
        }

        const result = JSON.parse(text);
        setData(result);
        return result as T;

      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          setError(err.message || 'An unknown error occurred.');
          throw err;
        }
      } finally {
        setLoading(false);
      }
    },
    [token, logout]
  );


  return { data, error, loading, request };
};
