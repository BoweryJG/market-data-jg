import axios from 'axios';
import env from '../setupEnv';
import { supabase } from '../auth/supabase';

const API_URL = env.VITE_API_URL || 'https://osbackend-zl1h.onrender.com';

// Create axios instance with default config
const backendClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CORS
});

// Add auth token to requests
backendClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    // Error getting auth token
  }
  return config;
});

// Handle responses and errors
backendClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, refresh the session
      supabase.auth.refreshSession();
    }
    return Promise.reject(error);
  }
);

export const backendApiClient = {
  async get(endpoint: string, params?: Record<string, unknown>) {
    try {
      const response = await backendClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post(endpoint: string, data?: unknown) {
    try {
      const response = await backendClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put(endpoint: string, data?: unknown) {
    try {
      const response = await backendClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await backendClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default backendApiClient;