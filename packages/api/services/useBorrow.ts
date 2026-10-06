import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serverApi } from './axios';

export interface BorrowRecord {
  id: number;
  userId: string;
  bookId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED';
  extendedCount: number;
  book?: {
    id: number;
    title: string;
    author: string;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
  };
}

export const useBorrowBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await serverApi.post(`/borrow/${bookId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: number) => {
      const response = await serverApi.post(`/borrow/return/${recordId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
    },
  });
};

export const useExtendLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: number) => {
      const response = await serverApi.post(`/borrow/extend/${recordId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      queryClient.invalidateQueries({ queryKey: ['all-loans'] });
    },
  });
};

export const useMyLoans = () => {
  return useQuery<BorrowRecord[]>({
    queryKey: ['my-loans'],
    queryFn: async () => {
      const response = await serverApi.get('/borrow/mine');
      return response.data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });
};

export const useAllLoans = () => {
  return useQuery<BorrowRecord[]>({
    queryKey: ['all-loans'],
    queryFn: async () => {
      const response = await serverApi.get('/borrow/all');
      return response.data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });
};
