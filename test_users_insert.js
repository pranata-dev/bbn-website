require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const localUserId = crypto.randomUUID();
    const newAuthId = crypto.randomUUID(); // Dummy auth id

    console.log("Attempting to insert into users table...");
    const { data, error } = await supabase
        .from("users")
        .insert({
            id: localUserId,
            email: "test.profile.insert@example.com",
            name: "Test Profile Insert",
            role: "STUDENT_BASIC",
            is_active: false,
            auth_id: newAuthId,
            updated_at: new Date().toISOString()
        })
        .select();

    if (error) {
        console.error("Insert error:", error);
    } else {
        console.log("Insert successful:", data);

        // Clean up
        await supabase.from("users").delete().eq("id", localUserId);
    }
}

main().catch(console.error);
