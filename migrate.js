const { spawn } = require('child_process');
const child = spawn('cmd.exe', ['/c', 'npx prisma migrate dev --name add_practice_part'], { stdio: ['pipe', 'inherit', 'inherit'] });
setTimeout(() => {
    child.stdin.write('y\n');
}, 3000);
child.on('close', (code) => {
    process.exit(code);
});
