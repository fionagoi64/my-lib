import { useQuery } from '@tanstack/react-query';
import { serverApi } from './axios';

export interface OpenLibraryBook {
  workId: string;
  title: string;
  authors: string[];
  isbn?: string;
  coverUrl?: string;
  firstPublishedYear?: number;
  subjects: string[];
}

interface OpenLibrarySearchResponse {
  results: OpenLibraryBook[];
  cached: boolean;
}

export const useOpenLibrarySearch = (query: string) => {
  const normalizedQuery = query.trim();
  return useQuery<OpenLibrarySearchResponse>({
    queryKey: ['open-library-search', normalizedQuery],
    queryFn: async () => {
      const response = await serverApi.get('/open-library/search', {
        params: { q: normalizedQuery, limit: 6 },
      });
      return response.data;
    },
    enabled: normalizedQuery.length >= 3,
    staleTime: 60_000,
  });
};
