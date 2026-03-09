import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON parsed files
const w6New = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'week6_parsed.json'), 'utf-8'));
const w7New = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'week7_parsed.json'), 'utf-8'));

// We need to read the existing week6.ts and week7.ts, but they are ES modules in TS.
// To avoid compilation issues, we'll extract the JSON array strings directly from them using regex
// since they follow a simple format: `export const weekXQuestions = [ ... ];`

function extractExisting(filePath) {
    if (!fs.existsSync(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/export const \w+ = (\[.*\]);/s);
    if (!match) return [];
    
    try {
        // Evaluate the array safely (in case it contains unquoted keys or comments)
        // Since it's a JS object literal, we can use Function to return it.
        const arr = new Function('return ' + match[1])();
        return arr;
    } catch(e) {
        console.error("Failed to parse existing", filePath, e);
        return [];
    }
}

const w6Old = extractExisting(join(__dirname, 'data', 'week6.ts'));
const w7Old = extractExisting(join(__dirname, 'data', 'week7.ts'));

function mergeQuestions(oldArr, newArr) {
    const map = new Map();
    // Insert old
    for (const q of oldArr) {
        // normalize text for comparison
        const key = q.text.replace(/\s+/g, ' ').trim();
        map.set(key, q);
    }
    // Insert new
    let added = 0;
    for (const q of newArr) {
        const key = q.text.replace(/\s+/g, ' ').trim();
        if (!map.has(key)) {
            map.set(key, q);
            added++;
        }
    }
    console.log(`Added ${added} new questions`);
    return Array.from(map.values());
}

const merged6 = mergeQuestions(w6Old, w6New);
const merged7 = mergeQuestions(w7Old, w7New);

// Write them back to TS files
function toTSRendering(arr, varName) {
    let tsCode = `export const ${varName} = [\n`;
    const jsonStr = JSON.stringify(arr, null, 4);
    // Strip the outer brackets []
    tsCode += jsonStr.substring(1, jsonStr.length - 1);
    tsCode += `\n];\n`;
    return tsCode;
}

fs.writeFileSync(join(__dirname, 'data', 'week6.ts'), toTSRendering(merged6, 'week6Questions'));
fs.writeFileSync(join(__dirname, 'data', 'week7.ts'), toTSRendering(merged7, 'week7Questions'));

console.log(`Saved week6.ts with ${merged6.length} total questions.`);
console.log(`Saved week7.ts with ${merged7.length} total questions.`);
