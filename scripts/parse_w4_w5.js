const fs = require('fs');
const path = require('path');

function parseQuestions(filePath, category) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = [];
    
    // Split by "**Soal:**"
    const blocks = content.split('**Soal:**').filter(b => b.trim());
    
    for (const block of blocks) {
        let qText = '';
        let options = { A: '', B: '', C: '', D: '', E: '' };
        let answer = '';
        let explanation = '';
        
        // Split by "---" to separate Question+Options from Pembahasan
        const parts = block.split('---');
        if (parts.length < 2) continue;
        
        const qPart = parts[0];
        const aPart = parts[1];
        
        const qLines = qPart.split('\n').filter(l => l.trim() !== '');
        
        // Find options
        let currentOption = null;
        for (const line of qLines) {
            const trimmedLine = line.trim();
            const optMatch = trimmedLine.match(/^([A-E])\.\s+(.*)$/);
            if (optMatch) {
                currentOption = optMatch[1];
                options[currentOption] = optMatch[2].trim();
            } else if (currentOption) {
                options[currentOption] += '\n' + trimmedLine;
            } else {
                qText += (qText ? '\n' : '') + trimmedLine;
            }
        }
        
        // Parse Answer & Explanation
        const aLines = aPart.split('\n').filter(l => l.trim() !== '');
        let inExplanation = false;
        
        for (const line of aLines) {
            if (line.includes('**Jawaban:')) {
                const ansMatch = line.match(/\*\*Jawaban:\s*([A-E])\./);
                if (ansMatch) {
                    answer = ansMatch[1];
                }
                inExplanation = true;
            } else if (inExplanation) {
                explanation += (explanation ? '\n' : '') + line;
            }
        }
        
        // Remove trailing or leading weird spaces
        qText = qText.trim();
        explanation = explanation.trim();
        
        questions.push({
            text: qText,
            category: category,
            option_a: options.A,
            option_b: options.B,
            option_c: options.C,
            option_d: options.D,
            option_e: options.E || null,
            correct_answer: answer,
            explanation: explanation,
            weight: 1
        });
    }
    
    return questions;
}

function writeTsFile(questions, outPath, varName) {
    let tsContent = `export const ${varName} = [\n`;
    for (const q of questions) {
        tsContent += `    {\n`;
        tsContent += `        text: \`${q.text.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        tsContent += `        category: '${q.category}',\n`;
        tsContent += `        option_a: \`${q.option_a.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        tsContent += `        option_b: \`${q.option_b.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        tsContent += `        option_c: \`${q.option_c.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        tsContent += `        option_d: \`${q.option_d.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        if (q.option_e) {
            tsContent += `        option_e: \`${q.option_e.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        } else {
            tsContent += `        option_e: null,\n`;
        }
        tsContent += `        correct_answer: '${q.correct_answer}',\n`;
        tsContent += `        explanation: \`${q.explanation.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`,\n`;
        tsContent += `        weight: 1\n`;
        tsContent += `    },\n`;
    }
    tsContent += `];\n`;
    
    fs.writeFileSync(outPath, tsContent, 'utf-8');
}

const w4Path = "C:\\\\Users\\\\p\\\\OneDrive\\\\Dokumen\\\\WEEK 4 QUESTION.txt";
const w5Path = "C:\\\\Users\\\\p\\\\OneDrive\\\\Dokumen\\\\WEEK 5 QUESTION.txt";

const w4q = parseQuestions(w4Path, 'WEEK_4');
const w5q = parseQuestions(w5Path, 'WEEK_5');

writeTsFile(w4q, path.resolve('src', 'lib', 'data', 'week4.ts'), 'week4Questions');
writeTsFile(w5q, path.resolve('src', 'lib', 'data', 'week5.ts'), 'week5Questions');
console.log('Done parsing W4 and W5');
