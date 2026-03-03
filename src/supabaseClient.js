import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://piaemjwubiwviisbyokb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_eAKzdtINEiNIvqkW-TlQ7Q_wPiX7O1L';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
