import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const getBaseURL = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Fallback to our running api dev server (monorepo api is running on port 4000)
  return "http://localhost:4000";
};

const serverAxiosParams = {
  baseURL: getBaseURL(),
};

export const serverAxiosInstance = axios.create(serverAxiosParams);

serverAxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically inject bearer token on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

serverAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // If unauthorized, we can optionally clear token
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  },
);

const api = (axiosInstance: AxiosInstance) => {
  return {
    get: (url: string, config?: AxiosRequestConfig | undefined) =>
      axiosInstance.get(url, config),
    delete: (url: string, config?: AxiosRequestConfig | undefined) =>
      axiosInstance.delete(url, config),
    post: <T>(url: string, body?: T, config?: AxiosRequestConfig | undefined) =>
      axiosInstance.post(url, body, config),
    put: <T>(url: string, body: T, config?: AxiosRequestConfig | undefined) =>
      axiosInstance.put(url, body, config),
    patch: <T>(url: string, body: T, config?: AxiosRequestConfig | undefined) =>
      axiosInstance.patch(url, body, config),
  };
};

export const serverApi = api(serverAxiosInstance);
