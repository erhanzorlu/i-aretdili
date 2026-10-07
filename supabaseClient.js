import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL
  : 'https://ygbgxhcjdvnoupbprnbh.supabase.co';

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'sb_publishable_-ZFWpURSmaGe5kPFiuaIMw_4AejNAvc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

