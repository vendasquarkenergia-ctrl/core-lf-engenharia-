import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-anon-key-aqui';

// Instância única oficial para todo o sistema Front-End
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
