require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuth() {
    const { error } = await supabase.auth.admin.createUser({
        email: "pranata@example.com", // dummy duplicate
        password: "password123",
        email_confirm: true,
    });

    // ignore first error if it's new

    const { error: err2 } = await supabase.auth.admin.createUser({
        email: "pranata@example.com", // dummy duplicate
        password: "password123",
        email_confirm: true,
    });

    if (err2) {
        console.error("Duplicate message exactly:", err2.message);
    }
}

testAuth();
