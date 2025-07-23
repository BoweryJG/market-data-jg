import { supabase } from './supabaseClient';

export const apiClient = {
  async get(endpoint: string) {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      method: 'GET'
    });
    if (error) throw error;
    return data;
  },

  async post(endpoint: string, body: unknown) {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      method: 'POST',
      body
    });
    if (error) throw error;
    return data;
  },

  async put(endpoint: string, body: unknown) {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      method: 'PUT',
      body
    });
    if (error) throw error;
    return data;
  },

  async delete(endpoint: string) {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      method: 'DELETE'
    });
    if (error) throw error;
    return data;
  }
};