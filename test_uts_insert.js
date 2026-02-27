require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Mocking a UTS backend insert...");

    const registrationId = crypto.randomUUID();
    const { data: registration, error: regError } = await supabase
        .from("registrations")
        .insert({
            id: registrationId,
            type: "UTS",
            name: "Pranata UTS Test",
            email: "uts.unique" + Date.now() + "@test.com",
            nim: "67890",
            subject: "Fisika",
            whatsapp: "08987654321",
            payment_proof_url: "https://example.com/uts-proof.jpg",
            calculated_price: 75000,
            pricing_tier: "UTS_PREMIUM",
            status: "PENDING",
        })
        .select()
        .single();

    if (regError) {
        console.error("Registration Table Insert Error:", regError);
        return;
    }

    console.log("Registration Insert Success! ID:", registration.id);

    const { error: detailError } = await supabase
        .from("uts_package_details")
        .insert({
            id: crypto.randomUUID(),
            registration_id: registration.id,
            package_type: "uts_premium",
        });

    if (detailError) {
        console.error("UTS Details Table Insert Error:", detailError);
        return;
    }

    console.log("UTS Details Insert Success!");

    // Cleanup
    await supabase.from('registrations').delete().eq('id', registration.id);
    console.log("Cleanup complete.");
}

main();
