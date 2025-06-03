import { createClient } from '@supabase/supabase-js';
import env from '../setupEnv';

// Use our setupEnv utility to handle both VITE_ and REACT_APP_ environment variables
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
