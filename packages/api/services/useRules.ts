import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serverApi } from './axios';

export interface LibraryRule {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRulePayload {
  title: string;
  content: string;
}

export const useRules = () => {
  return useQuery<LibraryRule[]>({
    queryKey: ['rules'],
    queryFn: async () => {
      const response = await serverApi.get('/rules');
      return response.data;
    },
  });
};

export const useCreateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRulePayload) => {
      const response = await serverApi.post('/rules', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CreateRulePayload }) => {
      const response = await serverApi.put(`/rules/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await serverApi.delete(`/rules/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
};
