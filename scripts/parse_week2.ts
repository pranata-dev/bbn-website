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
    // Using regex to split by Headers like ## Soal 1, ## Soal 2 etc
    const sections = raw.split(/## Soal \d+/).map(s => s.trim()).filter(s => s.length > 0);
    
    const questions: Question[] = [];
    
    for (const section of sections) {
        try {
            // Split by separator
            const contentParts = section.split('---');
            if (contentParts.length < 2) continue;
            
            let soalPart = contentParts[0].trim();
            let pembahasanPart = contentParts.slice(1).join('---').trim();

            // Extract Soal text
            // Handle both "**Soal:**" and "Soal:"
            soalPart = soalPart.replace(/\*\*Soal:\s*\*\*/i, '').replace(/Soal:\s*/i, '').trim();
            
            // Extract options
            const optionsRegex = /A\.\s([\s\S]*?)\nB\.\s([\s\S]*?)\nC\.\s([\s\S]*?)\nD\.\s([\s\S]*?)(?:\nE\.\s([\s\S]*?))?$/;
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

            // Clean up explanation (Discussion)
            // Handle both "**Pembahasan:**" and "Pembahasan:"
            let explanation = pembahasanPart.replace(/\*\*Pembahasan:\s*\*\*/i, '').replace(/Pembahasan:\s*/i, '').trim();
            
            // Remove trailing "Soal X" or "## Soal X" references
            explanation = explanation.replace(/Soal\s+\d+$/i, '').trim();
            explanation = explanation.replace(/##\s+Soal\s+\d+$/i, '').trim();

            // Extract Answer from Explanation
            let correctAnswer = '';
            const ansMatch = explanation.match(/Jawaban:\s*([A-E])\./i) || explanation.match(/\*\*Jawaban:\s*([A-E])\./i) || explanation.match(/Jawaban:\s*([A-E])\*/i);
            
            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase();
            }
            
            // Only add if we have text and options
            if (text && optA) {
                questions.push({
                    text: text,
                    category: category,
                    option_a: optA,
                    option_b: optB,
                    option_c: optC,
                    option_d: optD,
                    option_e: optE || undefined,
                    correct_answer: correctAnswer,
                    explanation: '**Pembahasan:**\n\n' + explanation,
                    weight: 1
                });
            }
        } catch(e) {
            console.error("Error parsing a section", e);
        }
    }
    return questions;
}

const w2 = parseTxtFile('C:/Users/p/OneDrive/Dokumen/WEEK 2 QUESTION FIXXX.txt', 'WEEK_2');

// Write as JSON for record
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week2_parsed.json', JSON.stringify(w2, null, 2));

// Write as TS for seeding script compatibility
const tsContent = `export const week2Questions = ${JSON.stringify(w2, null, 4)};\n`;
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week2.ts', tsContent);

console.log(`Parsed ${w2.length} questions for week 2`);
