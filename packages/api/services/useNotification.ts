import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serverApi } from './axios';

export interface Notification {
  id: string;
  userId: string;
  type: string; // e.g. INFO, ALERT, BORROW, RETURN, EXTENSION, RULE_UPDATE, SYSTEM
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface SendNotificationPayload {
  title: string;
  message: string;
  type: string;
  userId?: string;
  broadcast?: boolean;
}

export const useMyNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const response = await serverApi.get('/notification/mine');
      return response.data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });
};

/**
 * Keeps the notification query current without polling. The API persists every
 * notification first, then emits it through SSE so a reconnect can always
 * recover missed events by fetching /notification/mine.
 */
export const useNotificationStream = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const stream = new EventSource(`${baseUrl}/notification/stream?access_token=${encodeURIComponent(token)}`);
    stream.addEventListener('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    });
    stream.onerror = () => {
      // EventSource retries automatically. A later page visit also fetches the
      // persisted inbox, which covers events missed while offline.
    };

    return () => stream.close();
  }, [queryClient]);
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverApi.patch(`/notification/${id}/read`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await serverApi.post('/notification/read-all', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverApi.delete(`/notification/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendNotificationPayload) => {
      const response = await serverApi.post('/notification/send', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};
