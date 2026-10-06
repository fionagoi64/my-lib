import { Injectable, ServiceUnavailableException } from '@nestjs/common';

const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
const CACHE_TTL_MS = 60_000;
const MAX_RESULTS = 20;

interface OpenLibraryDocument {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryDocument[];
  numFound: number;
}

export interface OpenLibraryBook {
  workId: string;
  title: string;
  authors: string[];
  isbn?: string;
  coverUrl?: string;
  firstPublishedYear?: number;
  subjects: string[];
}

@Injectable()
export class OpenLibraryService {
  private readonly cache = new Map<string, { expiresAt: number; value: OpenLibraryBook[] }>();

  async search(query: string, requestedLimit?: number) {
    const limit = Math.min(Math.max(requestedLimit || 10, 1), MAX_RESULTS);
    const cacheKey = `${query.trim().toLowerCase()}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { results: cached.value, cached: true };
    }

    const url = new URL(OPEN_LIBRARY_SEARCH_URL);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', String(limit));
    url.searchParams.set(
      'fields',
      'key,title,author_name,isbn,cover_i,first_publish_year,subject',
    );

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          // Open Library asks frequent callers to identify their application.
          'User-Agent': process.env.OPEN_LIBRARY_USER_AGENT || 'MyLibrary/1.0 (local development)',
        },
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        throw new Error(`Open Library returned ${response.status}`);
      }

      const payload = (await response.json()) as OpenLibrarySearchResponse;
      const results = payload.docs.map((book) => this.toBook(book));
      this.cache.set(cacheKey, { value: results, expiresAt: Date.now() + CACHE_TTL_MS });
      return { results, cached: false };
    } catch {
      throw new ServiceUnavailableException('Book discovery is temporarily unavailable. Please try again.');
    }
  }

  private toBook(book: OpenLibraryDocument): OpenLibraryBook {
    return {
      workId: book.key,
      title: book.title,
      authors: book.author_name || [],
      isbn: book.isbn?.[0],
      coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : undefined,
      firstPublishedYear: book.first_publish_year,
      subjects: (book.subject || []).slice(0, 5),
    };
  }
}
