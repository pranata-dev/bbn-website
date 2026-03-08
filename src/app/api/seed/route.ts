import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { week1Questions } from "@/lib/data/week1";
import { week2Questions } from "@/lib/data/week2";
import { week3Questions } from "@/lib/data/week3";
import { week4Questions } from "@/lib/data/week4";
import { week5Questions } from "@/lib/data/week5";
import { week6Questions } from "@/lib/data/week6";
import { week7Questions } from "@/lib/data/week7";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");

        // Basic protection
        if (secret !== "BBNS_SEED_2026") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("🏁 Starting Server-Side Seeding...");
        const supabase = createServiceClient();

        // 1. Fetch Existing
        const { data: existing } = await supabase.from("questions").select("id, text, category");
        const existingMap = new Map(existing?.map(q => [q.text.trim(), q]) || []);

        const weeks = [
            { id: "WEEK_1", name: "Week 1", data: week1Questions },
            { id: "WEEK_2", name: "Week 2", data: week2Questions },
            { id: "WEEK_3", name: "Week 3", data: week3Questions },
            { id: "WEEK_4", name: "Week 4", data: week4Questions },
            { id: "WEEK_5", name: "Week 5", data: week5Questions },
            { id: "WEEK_6", name: "Week 6", data: week6Questions },
            { id: "WEEK_7", name: "Week 7", data: week7Questions }
        ];

        const results: any = {};

        for (const week of weeks) {
            console.log(`Processing ${week.name}...`);
            let inserted = 0;
            let updated = 0;
            let skipped = 0;

            // a. Process Questions
            for (const q of week.data) {
                const text = q.text.trim();
                const qAny = q as any;
                const normalized = {
                    text,
                    category: week.id,
                    option_a: (qAny.option_a || qAny.optionA || "").trim(),
                    option_b: (qAny.option_b || qAny.optionB || "").trim(),
                    option_c: (qAny.option_c || qAny.optionC || "").trim(),
                    option_d: (qAny.option_d || qAny.optionD || "").trim(),
                    option_e: (qAny.option_e || qAny.optionE || "").trim() || null,
                    correct_answer: (qAny.correct_answer || qAny.correctAnswer || "").trim().toUpperCase(),
                    explanation: qAny.explanation?.trim() || null,
                    weight: qAny.weight || 1
                };

                if (existingMap.has(text)) {
                    const match = existingMap.get(text)!;
                    if (match.category !== week.id) {
                        await supabase.from("questions").update(normalized).eq("id", match.id);
                        updated++;
                    } else {
                        skipped++;
                    }
                } else {
                    const newId = crypto.randomUUID();
                    const { error } = await supabase.from("questions").insert({
                        ...normalized,
                        id: newId
                    });
                    if (!error) {
                        inserted++;
                        existingMap.set(text, { id: newId, text, category: week.id });
                    }
                }
            }

            // b. Ensure Tryout
            let { data: tryout } = await supabase
                .from("tryouts")
                .select("id")
                .eq("category", week.id)
                .eq("is_practice", true)
                .single();
            
            if (!tryout) {
                const { data: newTryout } = await supabase.from("tryouts").insert({
                    id: crypto.randomUUID(),
                    title: `Latihan Soal ${week.name}`,
                    category: week.id,
                    is_practice: true,
                    status: "ACTIVE",
                    duration: 60,
                    max_attempts: 999
                }).select().single();
                tryout = newTryout;
            }

            // c. Link Questions
            if (tryout) {
                const { data: allQ } = await supabase.from("questions").select("id").eq("category", week.id);
                for (const q of allQ || []) {
                    await supabase.from("tryout_questions").insert({
                        id: crypto.randomUUID(),
                        tryout_id: tryout.id,
                        question_id: q.id
                    }).maybeSingle(); // ON CONFLICT is handled by RLS or just ignoring error
                }
            }

            results[week.id] = { inserted, updated, skipped };
        }

        return NextResponse.json({ message: "Seeding completed", results });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
