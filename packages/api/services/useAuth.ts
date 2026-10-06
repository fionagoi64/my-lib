import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serverApi } from './axios';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: {
    name: string;
  };
  profile?: {
    phone?: string;
    address?: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export interface UpdateProfilePayload {
  phone?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await serverApi.post('/auth/login', payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await serverApi.post('/auth/register', payload);
      return response.data;
    },
  });
};

export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await serverApi.get('/users/profile');
      return response.data;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await serverApi.patch('/users/profile', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
