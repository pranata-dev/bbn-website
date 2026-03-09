import fs from 'fs';

function parseTxtFile(filePath, category) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const sections = raw.split('**Soal:**').map(s => s.trim()).filter(s => s.length > 0);
    
    const questions = [];
    
    for (const section of sections) {
        try {
            const parts = section.split('---');
            if (parts.length < 2) continue;
            
            let soalPart = parts[0].trim();
            let pembahasanPart = parts.slice(1).join('---').trim();
            
            const optionsRegex = /A\.\s(.*?)\nB\.\s(.*?)\nC\.\s(.*?)\nD\.\s(.*?)(?:\nE\.\s(.*?))?$/s;
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

            let explanation = pembahasanPart.replace('**Pembahasan:**', '').trim();
            
            let correctAnswer = '';
            const ansMatch = explanation.match(/\*\*Jawaban:\s*([A-E])\./i) || explanation.match(/\*\*Jawaban:\s*([A-E])\*\*/i) || explanation.match(/\*\*Jawaban:\s*([A-E])\s/i);
            
            if (ansMatch) {
                correctAnswer = ansMatch[1].toUpperCase();
            } else {
                console.warn("Could not find answer in:", explanation.substring(0, 50));
            }
            
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

const w6 = parseTxtFile('C:/Users/p/OneDrive/Dokumen/WEEK 6 QUESTION FIXXX.txt', 'WEEK_6');
const w7 = parseTxtFile('C:/Users/p/OneDrive/Dokumen/WEEK 7 QUESTION FIXXX.txt', 'WEEK_7');

fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week6_parsed.json', JSON.stringify(w6, null, 2));
fs.writeFileSync('C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data/week7_parsed.json', JSON.stringify(w7, null, 2));

console.log(`Parsed ${w6.length} questions for week 6`);
console.log(`Parsed ${w7.length} questions for week 7`);
