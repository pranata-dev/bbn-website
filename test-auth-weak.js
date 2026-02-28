require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuth() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: "test.weak@example.com",
        password: "weak", // less than 6
        email_confirm: true,
    });

    if (error) {
        console.error("Auth creation error:", error);
    } else {
        console.log("Success:", data.user.id);
        await supabase.auth.admin.deleteUser(data.user.id);
    }
}

testAuth();
