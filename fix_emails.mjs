import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmails() {
  console.log('Starting DB fix for emails...');
  
  // 1. Add column if NOT EXISTS
  // Since we cannot run arbitrary SQL via the client easily, 
  // we'll try to update profiles with data from auth.users via an RPC if it exists,
  // or we can iterate through users and update one by one as a fallback.
  
  console.log('Fetching users from auth...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }
  
  console.log(`Found ${users.length} users. Backfilling emails to profiles...`);
  
  for (const user of users) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email: user.email })
      .eq('id', user.id);
      
    if (updateError) {
      if (updateError.message.includes('column "email" of relation "profiles" does not exist')) {
        console.error('CRITICAL: The "email" column is missing in "profiles" table. Please run this SQL in Supabase Dashboard:');
        console.log('ALTER TABLE profiles ADD COLUMN email TEXT;');
        break;
      }
      console.error(`Error updating user ${user.id}:`, updateError.message);
    } else {
      console.log(`Updated ${user.email}`);
    }
  }
  
  console.log('Backfill attempt finished.');
}

fixEmails();
