import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ogkxbsybdtgfixesjlpu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'AIzaSy...'; // Mock key to prevent crashing if not set properly

export const supabase = createClient(supabaseUrl, supabaseKey);
