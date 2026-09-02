import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
});

async function test() {
    try {
        const { data, error } = await supabaseAdmin
            .from('plots')
            .select(`
                id,
                title,
                city,
                price_pkr,
                size_dimensions,
                category,
                flood_risk,
                noise_level,
                elevation_profile,
                proximity_notes,
                is_verified,
                created_at,
                sellers (
                    id,
                    full_name,
                    phone_number,
                    seller_role,
                    is_identity_verified
                )
            `);
        if (error) {
            console.error('Supabase error:', error);
        } else {
            console.log(`Fetched ${data.length} plots from Supabase!`);
            console.log('Sample plot:', JSON.stringify(data[0], null, 2));
        }
    } catch (err) {
        console.error('Catch error:', err);
    }
}
test();
