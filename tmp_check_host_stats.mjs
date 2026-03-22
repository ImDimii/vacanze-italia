import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHostBookings() {
  console.log('Checking bookings for hosts...');
  
  // Get a sample host from properties
  const { data: props } = await supabase.from('properties').select('host_id').limit(10);
  const hostIds = [...new Set(props?.map(p => p.host_id))];
  
  console.log('Host IDs found in properties:', hostIds);
  
  for (const hostId of hostIds) {
    const { data: bookings, count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('host_id', hostId);
      
    const { data: propsCount } = await supabase
      .from('properties')
      .select('id', { count: 'exact' })
      .eq('host_id', hostId);
      
    console.log(`Host ${hostId}:`);
    console.log(`  Properties: ${propsCount?.length}`);
    console.log(`  Bookings: ${count}`);
    if (bookings && bookings.length > 0) {
        console.log(`  Sample Booking property_id: ${bookings[0].property_id}`);
        console.log(`  Sample Booking status: ${bookings[0].status}`);
    }
  }
}

checkHostBookings();
