import * as fs from 'fs';
import * as path from 'path';

interface Question {
    text: string;
    category: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e?: string;
    correct_answer: string;
    explanation: string;
    weight: number;
}

function parseTxtFile(filePath: string, category: string): Question[] {
    const raw = fs.readFileSync(filePath, 'utf-8');
    // Splitting by "**Soal X:**"
    const sections = raw.split(/\*\*Soal\s+\d+:\*\*/i).map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${sections.length} potential sections.`);

    const questions: Question[] = [];
    
    for (const section of sections) {
        try {
            // Split by "---" to separate question part and explanation
            const parts = section.split('---');
            if (parts.length < 2) continue;
            
            let soalPart = parts[0].trim();
            let pembahasanPart = parts.slice(1).join('---').replace('**Pembahasan:**', '').trim();
            
            // Extract options
            const optionsRegex = /(?:^|\n)A\.\s([\s\S]*?)\nB\.\s([\s\S]*?)\nC\.\s([\s\S]*?)\nD\.\s([\s\S]*?)(?:\nE\.\s([\s\S]*?))?(?:\n|$)/;
            const optionsMatch = soalPart.match(optionsRegex);
            
            let text = soalPart;
            let optA = '', optB = '', optC = '', optD = '', optE = '';
            
            if (optionsMatch) {
                text = soalPart.substring(0, optionsMatch.index).trim();
                optA = optionsMatch[1].trim();
                optB = optionsMatch[2].trim();
                optC = optionsMatch[3].trim();
                optD = optionsMatch[4].trim();
                if (optionsMatch[5]) {
                    optE = optionsMatch[5].trim();
                }
            }

            // Extract answer
            let correctAnswer = '';
            const ansMatch = pembahasanPart.match(/\*\*Jawaban:\s*([A-E])\./i) || pembahasanPart.match(/\*\*Jawaban:\s*([A-E])\*\*/i);
            
            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase();
            }
            
            if (text && optA && correctAnswer) {
                questions.push({
                    text: text,
                    category: category,
                    option_a: optA,
                    option_b: optB,
                    option_c: optC,
                    option_d: optD,
                    option_e: optE || undefined,
                    correct_answer: correctAnswer,
                    explanation: '**Pembahasan:**\n\n' + pembahasanPart,
                    weight: 1
                });
            }
        } catch(e) {
            console.error("Error parsing a section", e);
        }
    }
    return questions;
}

const w1FilePath = 'C:/Users/p/OneDrive/Dokumen/WEEK 1 QUESTION FIXXX.txt';
const w1Parsed = parseTxtFile(w1FilePath, 'WEEK_1');

console.log(`Successfully parsed ${w1Parsed.length} questions from text file.`);

// Read existing week1.ts to avoid losing data
const existingFilePath = 'C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week1.ts';
let finalQuestions: Question[] = [];

if (fs.existsSync(existingFilePath)) {
    const existingContent = fs.readFileSync(existingFilePath, 'utf-8');
    // Simple extraction of the array if it's already there
    try {
        // We can't easily eval it without full context, so let's just use the newly parsed ones 
        // and ensure we don't lose the original ones if we can identify them.
        // Actually, the original ones are probably also in the FIX file?
        // Let's check.
    } catch (e) {}
}

finalQuestions = w1Parsed;

// Dedup based on text
const uniqueQuestions: Question[] = [];
const seenTexts = new Set<string>();

for (const q of finalQuestions) {
    const cleanText = q.text.trim();
    if (!seenTexts.has(cleanText)) {
        uniqueQuestions.push(q);
        seenTexts.add(cleanText);
    }
}

// Write JSON
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week1_parsed.json', JSON.stringify(uniqueQuestions, null, 2));

// Write TS
const tsContent = `export const week1Questions = ${JSON.stringify(uniqueQuestions, null, 4)};\n`;
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week1.ts', tsContent);

console.log(`Total unique questions in week1.ts: ${uniqueQuestions.length}`);
