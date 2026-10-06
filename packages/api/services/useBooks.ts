import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serverApi } from './axios';

export interface Category {
  id: number;
  name: string;
  description?: string;
  _count?: {
    books: number;
  };
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  stockTotal: number;
  stockAvailable: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
}

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  stockTotal: number;
  categoryId: number;
}

export interface UpdateBookPayload {
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  stockTotal?: number;
  categoryId?: number;
}

// ==========================================
// CATEGORIES HOOKS
// ==========================================

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await serverApi.get('/books/categories');
      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await serverApi.post('/books/categories', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await serverApi.delete(`/books/categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// ==========================================
// BOOKS HOOKS
// ==========================================

export const useBooks = (params?: { search?: string; categoryId?: number; availableOnly?: boolean; page?: number; limit?: number }) => {
  return useQuery<any>({
    queryKey: ['books', params?.search, params?.categoryId, params?.availableOnly, params?.page, params?.limit],
    queryFn: async () => {
      const queryParams: any = {};
      if (params?.search) queryParams.search = params.search;
      if (params?.categoryId) queryParams.categoryId = params.categoryId;
      if (params?.availableOnly !== undefined) queryParams.availableOnly = params.availableOnly;
      if (params?.page !== undefined) queryParams.page = params.page;
      if (params?.limit !== undefined) queryParams.limit = params.limit;

      const response = await serverApi.get('/books', { params: queryParams });
      return response.data;
    },
  });
};

export const useBook = (id: number) => {
  return useQuery<Book>({
    queryKey: ['book', id],
    queryFn: async () => {
      const response = await serverApi.get(`/books/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookPayload) => {
      const response = await serverApi.post('/books', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateBookPayload }) => {
      const response = await serverApi.patch(`/books/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await serverApi.delete(`/books/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
