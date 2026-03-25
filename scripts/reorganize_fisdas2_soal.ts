import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE URL or KEY in env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function formatCategoryTitle(category: string): string {
    if (category.startsWith("WEEK_")) {
        return `Pekan ${category.split("_")[1]}`;
    }
    return category;
}

async function main() {
    console.log("Starting reorganization of FISDAS2 Tryouts via Supabase...");

    try {
        // 1. Clean Slate for FISDAS2 Tryouts
        console.log("\nDeleting all existing FISDAS2 Tryout records...");
        
        // Find existing Tryouts to cascade TryoutQuestions manually or rely on DB cascade
        const { data: existingTryouts, error: fetchErr } = await supabase
            .from("tryouts")
            .select("id")
            .eq("subject", "FISDAS2");

        if (fetchErr) throw new Error("Error fetching existing tryouts: " + fetchErr.message);

        if (existingTryouts && existingTryouts.length > 0) {
            const tIds = existingTryouts.map(t => t.id);
            // Delete tryout_questions manually to be completely safe (cascade usually handles this)
            await supabase.from("tryout_questions").delete().in("tryout_id", tIds);
            const { error: delErr } = await supabase.from("tryouts").delete().in("id", tIds);
            if (delErr) throw new Error("Error deleting TRYOUTS: " + delErr.message);
            console.log(`Deleted ${existingTryouts.length} Tryout records.`);
        } else {
            console.log("No existing FISDAS2 tryouts found to delete.");
        }

        // Fetch all questions for FISDAS2
        const { data: allQuestionsData, error: qErr } = await supabase
            .from("questions")
            .select("id, category")
            .eq("subject", "FISDAS2");

        if (qErr) throw new Error("Error fetching questions: " + qErr.message);
        
        const allQuestions = allQuestionsData || [];
        console.log(`\nFound ${allQuestions.length} total FISDAS2 questions.`);

        if (allQuestions.length < 150) {
            console.error("ERROR: Not enough FISDAS2 questions to form 3 UTS tryouts of 50 questions each. Aborting.");
            return;
        }

        const weeks = ["WEEK_1", "WEEK_2", "WEEK_3", "WEEK_4", "WEEK_5", "WEEK_6", "WEEK_7"];

        // Group questions by category
        const questionsByCategory: Record<string, any[]> = {};
        for (const week of weeks) {
            questionsByCategory[week] = allQuestions.filter(q => q.category === week);
        }

        // 2. Phase 1: Extract & Distribute 150 Questions for UTS Tryouts
        console.log("\n--- Phase 1: Extract 150 Questions for UTS Tryouts ---");
        const utsQuestions: any[] = [];
        let weekIndex = 0;

        // Iteratively pull 1 question per week until we hit 150
        while (utsQuestions.length < 150) {
            const currentWeek = weeks[weekIndex];
            const pool = questionsByCategory[currentWeek];
            
            if (pool && pool.length > 0) {
                const randIndex = Math.floor(Math.random() * pool.length);
                const [selectedQuestion] = pool.splice(randIndex, 1);
                utsQuestions.push(selectedQuestion);
            }

            weekIndex = (weekIndex + 1) % weeks.length;
        }

        console.log(`Successfully extracted ${utsQuestions.length} questions for UTS.`);
        
        // Shuffle the 150 extracted questions
        const shuffledUtsQuestions = shuffle(utsQuestions);

        // Divide and create 3 UTS tryouts
        const utsChunkSize = 50;
        for (let i = 0; i < 3; i++) {
            const chunk = shuffledUtsQuestions.slice(i * utsChunkSize, (i + 1) * utsChunkSize);
            const tryoutTitle = `Simulasi Tryout UTS FISDAS2 - Paket ${i + 1}`;
            
            console.log(`Creating UTS Tryout: "${tryoutTitle}" with ${chunk.length} questions.`);
            
            const newTryoutId = uuidv4();
            const { error: insertTryoutErr } = await supabase.from("tryouts").insert({
                id: newTryoutId,
                title: tryoutTitle,
                subject: "FISDAS2",
                is_practice: false,
                status: "ACTIVE",
                duration: 120,
                max_attempts: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (insertTryoutErr) throw new Error("Failed to create UTS tryout: " + insertTryoutErr.message);

            const tryoutQuestionsData = chunk.map((q, idx) => ({
                id: uuidv4(),
                tryout_id: newTryoutId,
                question_id: q.id,
                order: idx + 1
            }));

            // Insert chunk mapping
            for (let chunkIdx = 0; chunkIdx < tryoutQuestionsData.length; chunkIdx += 50) {
                const tqChunk = tryoutQuestionsData.slice(chunkIdx, chunkIdx + 50);
                await supabase.from("tryout_questions").insert(tqChunk);
            }
            console.log(`  -> Assigned ${tryoutQuestionsData.length} TryoutQuestions.`);
        }

        // 3. Phase 2: Group Remaining Questions as Weekly Practice
        console.log("\n--- Phase 2: Create Weekly Practice Tryouts ---");
        const practiceChunkSize = 20;

        for (const week of weeks) {
            const remainingPool = questionsByCategory[week];
            if (!remainingPool || remainingPool.length === 0) continue;

            const shuffledRemaining = shuffle(remainingPool);
            console.log(`Week ${week}: ${shuffledRemaining.length} questions remaining.`);
            
            const numChunks = Math.ceil(shuffledRemaining.length / practiceChunkSize);
            const formattedWeek = formatCategoryTitle(week);

            for (let i = 0; i < numChunks; i++) {
                const chunk = shuffledRemaining.slice(i * practiceChunkSize, (i + 1) * practiceChunkSize);
                const title = `Latihan Soal ${formattedWeek} - Part ${i + 1}`;

                console.log(`  Creating Practice Tryout: "${title}" with ${chunk.length} questions.`);

                const practiceTryoutId = uuidv4();
                const { error: pErr } = await supabase.from("tryouts").insert({
                    id: practiceTryoutId,
                    title: title,
                    subject: "FISDAS2",
                    is_practice: true,
                    status: "ACTIVE",
                    duration: 60,
                    category: week,
                    practice_part: i + 1,
                    max_attempts: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

                if (pErr) throw new Error("Failed to create practice tryout: " + pErr.message);

                const tqData = chunk.map((q, idx) => ({
                    id: uuidv4(),
                    tryout_id: practiceTryoutId,
                    question_id: q.id,
                    order: idx + 1
                }));

                for (let chunkIdx = 0; chunkIdx < tqData.length; chunkIdx += 50) {
                    const tqChunk = tqData.slice(chunkIdx, chunkIdx + 50);
                    await supabase.from("tryout_questions").insert(tqChunk);
                }
                
                console.log(`    -> Assigned ${chunk.length} questions.`);
            }
        }

        console.log("\nTryouts Reorganization Script completed successfully!");

    } catch (error) {
        console.error("Error during execution:", error);
    }
}

main();
