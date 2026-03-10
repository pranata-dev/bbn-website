import * as fs from 'fs';
import * as path from 'path';

const dataDir = 'C:/Users/p/.gemini/antigravity/scratch/bbn-website/scripts/data';
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && f.startsWith('week'));

function fixLatex(content: string): string {
    let fixed = content;

    // 1. Fix exponents: 10^-7 -> 10^{-7}, q^2 -> q^{2}, R^2 -> R^{2}
    // We look for patterns like [char]^[number/sign+number]
    // Common case: 10^-19, 10^9, etc.
    fixed = fixed.replace(/(\d+)\^([+-]?\d+)/g, '$1^{$2}');
    fixed = fixed.replace(/([a-zA-Z])\^([+-]?\d+)/g, '$1^{$2}');

    // 2. Fix scientific notation: x 10 -> \times 10
    // Example: 1,6 x 10^{-19} -> 1,6 \times 10^{-19}
    // Careful not to break other 'x' usages. Usually it's number space x space 10
    fixed = fixed.replace(/(\d)\s*x\s*(10\^|10\{)/g, '$1 \\times $2');
    
    // 3. Ensure mu (micro) is \mu
    fixed = fixed.replace(/(\d)\s*uC/g, '$1 \\,\\mu\\text{C}');
    fixed = fixed.replace(/(\d)\s*µC/g, '$1 \\,\\mu\\text{C}').replace(/(\d)\s*μC/g, '$1 \\,\\mu\\text{C}');

    // 4. Fix units like N/C to be inside latex if they look like they belong there
    // But this is risky to do globally. Let's focus on the exponents and \times for now as requested.
    
    // 5. Fix double dollar signs if they are broken (optional but good)
    
    return fixed;
}

for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const fixedContent = fixLatex(content);
    
    if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent);
        console.log(`✅ Fixed LaTeX in ${file}`);
    } else {
        console.log(`ℹ️ No changes needed in ${file}`);
    }
}

console.log('--- LaTeX Formatting Fix Complete ---');
