import * as fs from 'fs';
import * as path from 'path';

// Read existing TS files to get a baseline
// We will just evaluate them or parse them using regex. Since they are simple TS exports, we can extract the JSON part.
// But to be safe, let's just write a script that reads the TXT files, parses them, and then we will manually compare or let the script compare.

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
    const sections = raw.split('**Soal:**').map(s => s.trim()).filter(s => s.length > 0);
    
    const questions: Question[] = [];
    
    for (const section of sections) {
        // Section contains Soal text, options, and Pembahasan
        try {
            const parts = section.split('---');
            if (parts.length < 2) continue;
            
            let soalPart = parts[0].trim();
            let pembahasanPart = parts.slice(1).join('---').trim();
            
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
            } else {
                // Try alternative matching if options spacing is different
                const lines = soalPart.split('\n');
                const optLines = [];
                const textLines = [];
                for (let line of lines) {
                    if (/^[A-E]\./.test(line.trim())) {
                        optLines.push(line.trim());
                    } else {
                        if (optLines.length === 0) {
                            textLines.push(line);
                        }
                    }
                }
                text = textLines.join('\n').trim();
                
                for (let opt of optLines) {
                    if (opt.startsWith('A.')) optA = opt.substring(2).trim();
                    if (opt.startsWith('B.')) optB = opt.substring(2).trim();
                    if (opt.startsWith('C.')) optC = opt.substring(2).trim();
                    if (opt.startsWith('D.')) optD = opt.substring(2).trim();
                    if (opt.startsWith('E.')) optE = opt.substring(2).trim();
                }
            }

            // Extract Pembahasan and Answer
            // Format: **Pembahasan:** \n\n **Jawaban: C. xx** \n\n detail
            let explanation = pembahasanPart.replace('**Pembahasan:**', '').trim();
            
            // Extract answer
            let correctAnswer = '';
            const ansMatch = explanation.match(/\*\*Jawaban:\s*([A-E])\./i) || explanation.match(/\*\*Jawaban:\s*([A-E])\*\*/i);
            
            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase();
            } else {
                console.warn("Could not find answer in:", explanation.substring(0, 50));
            }
            
            // Clean up text format (remove excessive newlines but keep paragraphs)
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
        } catch(e) {
            console.error("Error parsing a section", e);
        }
    }
    return questions;
}

const w4 = parseTxtFile('C:/Users/p/OneDrive/Dokumen/WEEK 4 QUESTION FIXXX.txt', 'WEEK_4');

// Write as JSON for record
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week4_parsed.json', JSON.stringify(w4, null, 2));

// Write as TS for seeding script compatibility
const tsContent = `export const week4Questions = ${JSON.stringify(w4, null, 4)};\n`;
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week4.ts', tsContent);

console.log(`Parsed ${w4.length} questions for week 4`);
