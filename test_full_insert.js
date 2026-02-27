require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Mocking a backend insert exactly as /api/register does...");

    const registrationId = crypto.randomUUID();
    const { data: registration, error: regError } = await supabase
        .from("registrations")
        .insert({
            id: registrationId,
            type: "REGULAR",
            name: "Pranata Test",
            email: "pranata.unique" + Date.now() + "@test.com",
            nim: "12345",
            subject: "Fisika",
            whatsapp: "08123456789",
            payment_proof_url: "https://example.com/proof.jpg",
            calculated_price: 50000,
            pricing_tier: "A",
            status: "PENDING",
        })
        .select()
        .single();

    if (regError) {
        console.error("Registration Table Insert Error:");
        console.error(regError);
        return;
    }

    console.log("Registration Insert Success! ID:", registration.id);

    const { error: detailError } = await supabase
        .from("regular_class_details")
        .insert({
            id: crypto.randomUUID(),
            registration_id: registration.id,
            group_size: 1,
            session_count: 1,
            scheduled_date: "2023-12-01",
            scheduled_time: "10:00",
            notes: "Test notes",
        });


    if (detailError) {
        console.error("Details Table Insert Error:");
        console.error(detailError);
        return;
    }

    console.log("Details Insert Success!");

    // Cleanup
    await supabase.from('registrations').delete().eq('id', registration.id);
    console.log("Cleanup complete.");
}

main();
