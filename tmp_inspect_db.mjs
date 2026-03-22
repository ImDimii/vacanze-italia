import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  console.log('Inspecting profiles table...');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  
  if (error) {
    console.error('Error fetching profiles:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns found in profiles:', Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('No data in profiles table.');
    // Fallback: try to get column names via an empty select if possible, or just assume it's empty
  }
}

inspectTable();
